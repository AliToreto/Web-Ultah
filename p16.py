import pandas as pd
import streamlit as st
import mysql.connector
from mysql.connector import Error
import matplotlib.pyplot as plt
import seaborn as sns

# ============================================================
# KONFIGURASI & KONEKSI DATABASE
# ============================================================
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '', # Sesuaikan jika XAMPP-mu pakai password
    'database': 'uaspksiang'
}

# Gunakan cache_resource agar koneksi tidak berulang kali dibuka-tutup
@st.cache_resource
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        st.error(f"Error saat koneksi ke MySQL: {e}")
        return None

# ============================================================
# LOAD & PRE-PROCESSING DATA (SOAL P3 & P4)
# ============================================================
@st.cache_data(ttl=60)
def load_data():
    conn = get_db_connection()
    if conn is None:
        return pd.DataFrame() # Return DF kosong jika gagal
        
    query = "SELECT * FROM retail_store_inventory" # Pastikan tabel ada kolom record_id
    
    # Baca pakai Pandas
    df = pd.read_sql(query, conn)
    
    if df.empty:
        return df

    # Soal P4: Ubah Date jadi Datetime
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    elif 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')

    # Sesuaikan penamaan kolom (anggap dataset pakai spasi/huruf besar sesuai soal P3)
    # Jika tabelmu pakai underscore (units_sold), ganti string di bawah ini sesuai kolom aslimu
    col_forecast = 'Demand Forecast' if 'Demand Forecast' in df.columns else 'demand_forecast'
    col_sold = 'Units Sold' if 'Units Sold' in df.columns else 'units_sold'
    col_inventory = 'Inventory Level' if 'Inventory Level' in df.columns else 'inventory_level'
    
    # Soal P4: Buat kolom Demand_Gap (Demand Forecast - Units Sold)
    df['Demand_Gap'] = df[col_forecast] - df[col_sold]
    
    # Soal P4: Buat kolom Stock_Category
    def categorize_stock(val):
        if pd.isna(val): return "Tidak Diketahui"
        if val < 100: return "Kritis"
        elif 100 <= val <= 300: return "Sedang"
        else: return "Aman"
        
    df['Stock_Category'] = df[col_inventory].apply(categorize_stock)
    
    return df

# ============================================================
# FUNGSI PERCABANGAN (SOAL P1)
# ============================================================
def evaluasi_persediaan(inventory, forecast, ordered):
    if inventory < 100:
        return "Stok Kritis"
    elif inventory < forecast:
        return "Risiko Kekurangan Stok"
    elif ordered < forecast:
        return "Pesanan Perlu Ditambah"
    else:
        return "Stok Aman"

# ============================================================
# TAMPILAN AWAL STREAMLIT
# ============================================================
st.set_page_config(page_title="DSS Retail Inventory", layout="wide")
st.title("Sistem Informasi Persediaan Toko Ritel (ERP)")

# Tarik data
df = load_data()

if df.empty:
    st.error("Data tidak ditemukan atau gagal koneksi ke Database.")
    st.stop()

# ============================================================
# TABS MENU
# ============================================================
tab_dashboard, tab_evaluasi, tab_visual, tab_update = st.tabs([
    "Dashboard & Filter (P4 & P7)", 
    "Evaluasi Persediaan (P1)", 
    "Visualisasi (P5)", 
    "Update Pesanan (P7)"
])

# ----------------- TAB 1: DASHBOARD & FILTER -----------------
with tab_dashboard:
    st.header("Ringkasan Data (Soal P7)")
    
    # Kolom KPI
    c1, c2, c3, c4 = st.columns(4)
    # Sesuaikan string dengan nama kolom aslimu ('store_id' vs 'Store ID')
    col_store = 'Store ID' if 'Store ID' in df.columns else 'store_id'
    col_prod = 'Product ID' if 'Product ID' in df.columns else 'product_id'
    col_sold = 'Units Sold' if 'Units Sold' in df.columns else 'units_sold'
    col_inv = 'Inventory Level' if 'Inventory Level' in df.columns else 'inventory_level'
    col_fc = 'Demand Forecast' if 'Demand Forecast' in df.columns else 'demand_forecast'
    
    c1.metric("Total Data", len(df))
    c2.metric("Jumlah Toko", df[col_store].nunique())
    c3.metric("Total Units Sold", f"{df[col_sold].sum():,.0f}")
    c4.metric("Rata-rata Inventory", f"{df[col_inv].mean():.1f}")
    
    st.subheader("Data Persediaan")
    st.dataframe(df)

# ----------------- TAB 2: EVALUASI (SOAL P1) -----------------
with tab_evaluasi:
    st.header("Evaluasi Kondisi Persediaan (Soal P1)")
    
    with st.form("form_evaluasi"):
        col1, col2, col3 = st.columns(3)
        with col1:
            inp_inv = st.number_input("Inventory Level", min_value=0, value=80)
        with col2:
            inp_fc = st.number_input("Demand Forecast", min_value=0, value=150)
        with col3:
            inp_ord = st.number_input("Units Ordered", min_value=0, value=50)
            
        btn_eval = st.form_submit_button("Proses Evaluasi")
        
    if btn_eval:
        hasil = evaluasi_persediaan(inp_inv, inp_fc, inp_ord)
        if hasil == "Stok Kritis":
            st.error(f"Hasil Evaluasi: {hasil}")
        elif hasil == "Stok Aman":
            st.success(f"Hasil Evaluasi: {hasil}")
        else:
            st.warning(f"Hasil Evaluasi: {hasil}")

# ----------------- TAB 3: VISUALISASI MATPLOTLIB (SOAL P5) -----------------
with tab_visual:
    st.header("Visualisasi Data (Matplotlib/Seaborn)")
    
    col_cat = 'Category' if 'Category' in df.columns else 'category'
    col_seas = 'Seasonality' if 'Seasonality' in df.columns else 'seasonality'
    
    v1, v2 = st.columns(2)
    
    with v1:
        st.subheader("1. Jumlah Data per Kategori")
        fig1, ax1 = plt.subplots(figsize=(6,4))
        sns.countplot(y=col_cat, data=df, ax=ax1, palette="viridis")
        ax1.set_xlabel("Jumlah")
        ax1.set_ylabel("Kategori")
        st.pyplot(fig1)
        st.caption("Interpretasi: Grafik ini menunjukkan kategori produk mana yang memiliki varian atau jumlah pendataan terbanyak di gudang.")
        
    with v2:
        st.subheader("2. Persentase Data Musim (Seasonality)")
        fig2, ax2 = plt.subplots(figsize=(6,4))
        season_counts = df[col_seas].value_counts()
        ax2.pie(season_counts, labels=season_counts.index, autopct='%1.1f%%', startangle=90)
        ax2.axis('equal')
        st.pyplot(fig2)
        st.caption("Interpretasi: Grafik pie ini memperlihatkan proporsi pendataan barang berdasarkan musim operasionalnya.")

# ----------------- TAB 4: UPDATE DATABASE (SOAL P7) -----------------
with tab_update:
    st.header("Update Pemesanan (Units Ordered)")
    st.info("Pembaruan ini membutuhkan kolom 'record_id' di database MySQL kamu sebagai Primary Key.")
    
    col_id = 'record_id' # Wajib ada di MySQL-mu
    
    with st.form("form_update"):
        inp_id = st.text_input("Masukkan Record ID yang ingin diubah:")
        inp_new_ordered = st.number_input("Jumlah Units Ordered Baru", min_value=0, value=0)
        
        btn_update = st.form_submit_button("Update Data")
        
    if btn_update:
        if inp_id == "":
            st.warning("Record ID tidak boleh kosong.")
        else:
            # Eksekusi UPDATE Query dengan Parameter (Mencegah SQL Injection)
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                # Anggap nama kolom DB-nya units_ordered
                update_query = "UPDATE retail_store_inventory SET units_ordered = %s WHERE record_id = %s"
                cursor.execute(update_query, (inp_new_ordered, inp_id))
                conn.commit()
                
                if cursor.rowcount > 0:
                    st.success(f"Berhasil! Data dengan Record ID {inp_id} telah diperbarui.")
                    st.cache_data.clear() # Clear cache agar data dashboard berubah
                else:
                    st.error(f"Gagal. Record ID {inp_id} tidak ditemukan di database.")
                    
                cursor.close()
            except Error as e:
                st.error(f"Gagal memperbarui database: {e}")

