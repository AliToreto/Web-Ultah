import { useEffect, useState, useRef } from "react";

export default function App() {
  const [view, setView] = useState("envelope");
  const [timeLeft, setTimeLeft] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [candleBlown, setCandleBlown] = useState(false);
  const audioRef = useRef(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [letterInput, setLetterInput] = useState("");
  const [savedLetters, setSavedLetters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedLetters")) || [];
    } catch { return []; }
  });

  useEffect(() => {
    const targetDate = new Date("2026-06-13T00:00:00");
    const tick = () => {
      const now = new Date();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          Hari: Math.floor(difference / (1000 * 60 * 60 * 24)),
          Jam: Math.floor((difference / (1000 * 60 * 60)) % 24),
          Menit: Math.floor((difference / 1000 / 60) % 60),
          Detik: Math.floor((difference / 1000) % 60),
        });
        setIsUnlocked(false);
      } else {
        setTimeLeft({ Hari: 0, Jam: 0, Menit: 0, Detik: 0 });
        setIsUnlocked(true);
        setJustUnlocked(prev => { if (!prev) return true; return prev; });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenEnvelope = () => {
    setView("menu");
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const closeDetail = () => {
    setView("menu");
    setCandleBlown(false);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmitLetter = () => {
    if (!letterInput.trim()) return;
    const newEntry = {
      id: Date.now(),
      text: letterInput.trim(),
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      }),
    };
    const updated = [newEntry, ...savedLetters];
    setSavedLetters(updated);
    localStorage.setItem("savedLetters", JSON.stringify(updated));
    setLetterInput("");
  };

  const photos = [
    "/foto1.jpg",
    "/foto2.jpg",
    "/foto3.jpg",
    "/foto4.jpg",
    "/foto5.jpg",
    "/foto6.jpg",
  ];

  const menuItems = [
    { id: "message", icon: "💌", label: "Pesan" },
    { id: "gallery", icon: "📸", label: "Kolase" },
    { id: "cake", icon: "🎂", label: "Kue" },
    { id: "piringan", icon: "🎵", label: "Musik" },
    { id: "gift", icon: "🎁", label: "Kado" },
    { id: "letter", icon: "✉️", label: "Surat" },
  ];

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .app-root {
          width: 100vw;
          height: 100vh;
          background: #0d0a12;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Starfield + Meteor background */
        .stars {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        /* Static tiny stars */
        .star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: twinkle var(--dur) ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          from { opacity: 0.08; transform: scale(0.7); }
          to { opacity: var(--maxop); transform: scale(1.2); }
        }

        /* Meteor */
        .meteor {
          position: absolute;
          top: var(--top);
          left: var(--left);
          width: var(--len);
          height: 1.5px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(220,200,255,0.7) 60%, rgba(255,255,255,1) 100%);
          border-radius: 999px;
          transform: rotate(-35deg);
          transform-origin: right center;
          animation: meteorFall var(--speed) ease-in var(--delay) infinite;
          opacity: 0;
          filter: drop-shadow(0 0 4px rgba(200, 170, 255, 0.9));
        }
        /* Head glow dot */
        .meteor::after {
          content: '';
          position: absolute;
          right: -2px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 6px 3px rgba(200,170,255,0.8), 0 0 12px 6px rgba(183,110,255,0.4);
        }
        @keyframes meteorFall {
          0%   { opacity: 0; transform: rotate(-35deg) translateX(0); }
          3%   { opacity: 1; }
          70%  { opacity: 0.8; }
          100% { opacity: 0; transform: rotate(-35deg) translateX(calc(var(--travel) * 1px)); }
        }

        /* Aurora glow */
        .aurora {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(183, 110, 255, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(255, 100, 180, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 50% 50%, rgba(100, 160, 255, 0.10) 0%, transparent 70%);
        }

        /* Main card */
        .card {
          position: relative;
          width: 95%;
          max-width: 960px;
          height: 90vh;
          background: rgba(20, 15, 30, 0.85);
          backdrop-filter: blur(24px);
          border-radius: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 0 0 1px rgba(183, 110, 255, 0.12),
            0 40px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Corner ornaments */
        .card::before, .card::after {
          content: '';
          position: absolute;
          width: 120px;
          height: 120px;
          border: 1px solid rgba(183, 110, 255, 0.25);
          pointer-events: none;
        }
        .card::before {
          top: 20px; left: 20px;
          border-right: none; border-bottom: none;
          border-radius: 1rem 0 0 0;
        }
        .card::after {
          bottom: 20px; right: 20px;
          border-left: none; border-top: none;
          border-radius: 0 0 1rem 0;
        }

        /* ENVELOPE VIEW */
        .envelope-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          animation: fadeUp 0.6s ease-out forwards;
        }

        .title-script {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(3rem, 7vw, 5.5rem);
          background: linear-gradient(135deg, #e8c5ff 0%, #ffb3d9 50%, #c5d5ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .subtitle-small {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: rgba(255, 255, 255, 0.45);
          font-size: 1rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 3rem;
        }

        .envelope-wrap {
          cursor: pointer;
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .envelope-wrap:hover {
          transform: translateY(-6px) scale(1.03);
          filter: drop-shadow(0 20px 40px rgba(183, 110, 255, 0.4));
        }

        .envelope-svg-wrap {
          position: relative;
          width: 220px;
          height: 160px;
          filter: drop-shadow(0 10px 30px rgba(183, 110, 255, 0.3));
        }

        .envelope-hint {
          margin-top: 2.5rem;
          font-size: 0.75rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          animation: breathe 2s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        /* MENU VIEW */
        .menu-view {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 2rem 2rem;
          animation: fadeUp 0.5s ease-out forwards;
          overflow-y: auto;
        }

        .menu-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
        }

        .menu-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          background: linear-gradient(135deg, #e8c5ff, #ffb3d9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* countdown moved to envelope hero */

        .menu-subtitle {
          font-family: 'Cormorant Garamond', serif;
          color: rgba(255,255,255,0.4);
          font-size: 1rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          width: 100%;
          max-width: 700px;
        }

        .menu-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 1.5rem;
          padding: 1.8rem 1rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .menu-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(183, 110, 255, 0.08), rgba(255, 100, 180, 0.06));
          opacity: 0;
          transition: opacity 0.25s;
        }
        .menu-btn:hover::before { opacity: 1; }
        .menu-btn:hover {
          border-color: rgba(183, 110, 255, 0.3);
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(183, 110, 255, 0.15);
        }
        .menu-icon { font-size: 2.8rem; line-height: 1; }
        .menu-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 0.75rem;
          width: 100%;
          text-align: center;
          transition: color 0.2s;
        }
        .menu-btn:hover .menu-label { color: rgba(255,255,255,0.9); }

        /* CLOSE BUTTON */
        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          padding: 0.5rem 1.1rem;
          border-radius: 2rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 50;
        }
        .close-btn:hover {
          background: rgba(255,255,255,0.12);
          color: white;
        }

        /* DETAIL VIEWS shared */
        .detail-view {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeUp 0.4s ease-out forwards;
          overflow-y: auto;
        }

        /* MESSAGE VIEW */
        .message-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2rem;
          padding: 3rem 3.5rem;
          max-width: 600px;
          width: 100%;
          text-align: center;
          position: relative;
        }
        .message-card::before {
          content: '✦';
          position: absolute;
          top: -1rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.5rem;
          color: #c5a3ff;
          background: #0d0a12;
          padding: 0 0.5rem;
        }
        .message-heading {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 2.2rem;
          background: linear-gradient(135deg, #e8c5ff, #ffb3d9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
        }
        .message-divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(183,110,255,0.5), transparent);
          margin: 0 auto 1.5rem;
        }
        .message-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          line-height: 1.9;
          color: rgba(255,255,255,0.65);
          font-style: italic;
        }
        .message-hearts {
          display: flex;
          justify-content: center;
          gap: 0.8rem;
          margin-top: 2rem;
          font-size: 1.3rem;
        }

        /* GALLERY VIEW */
        .gallery-view {
          width: 100%;
          height: 100%;
          position: relative;
          padding: 5rem 2rem 2rem;
          overflow-y: auto;
          animation: fadeUp 0.4s ease-out forwards;
        }
        .gallery-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 2rem;
          background: linear-gradient(135deg, #e8c5ff, #ffb3d9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          max-width: 700px;
          margin: 0 auto;
        }
        .photo-frame {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .photo-frame:hover {
          transform: translateY(-4px) rotate(1deg);
          border-color: rgba(183,110,255,0.3);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .photo-frame img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
        }
        .photo-caption {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          text-align: center;
          padding: 0.5rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.35);
        }

        /* CAKE VIEW */
        .cake-view {
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, #1a0d2e 0%, #0d0a12 70%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: fadeUp 0.4s ease-out forwards;
        }
        .cake-heading {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          background: linear-gradient(135deg, #e8c5ff, #c5d5ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .cake-hint {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: rgba(255,255,255,0.4);
          margin-bottom: 2.5rem;
          font-size: 1rem;
          animation: breathe 2s ease-in-out infinite;
        }
        .cake-interactive {
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .cake-interactive:hover { transform: scale(1.03); }

        /* CONFETTI */
        .confetti-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 16px;
          border-radius: 2px;
          animation: confettiFall linear forwards;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }

        /* FLAME */
        @keyframes flicker {
          0%, 100% { transform: scale(1) rotate(-1deg); opacity: 1; }
          25% { transform: scale(1.08) rotate(1deg); opacity: 0.9; }
          50% { transform: scale(0.92) rotate(-2deg); opacity: 0.8; }
          75% { transform: scale(1.12) rotate(2deg); opacity: 1; }
        }
        .flame { animation: flicker 0.18s infinite alternate; }

        /* GIFT VIEW */
        .gift-view {
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, #1a0e2e 0%, #0d0a12 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: fadeUp 0.4s ease-out forwards;
        }
        .gift-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(183,110,255,0.2);
          border-radius: 2.5rem;
          padding: 3.5rem;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 0 60px rgba(183,110,255,0.1);
        }
        .gift-icon { font-size: 5rem; margin-bottom: 1.5rem; display: block; animation: float 3s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .gift-heading {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: white;
          margin-bottom: 1rem;
        }
        .gift-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 1.2rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
        }

        /* MUSIC VIEW */
        .music-view {
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, #1a0d1a 0%, #0d0a12 70%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: fadeUp 0.4s ease-out forwards;
          gap: 2rem;
        }
        .music-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1.8rem;
          background: linear-gradient(135deg, #e8c5ff, #ffb3d9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .vinyl-wrap {
          position: relative;
          width: 240px;
          height: 240px;
        }
        .vinyl-wrap img {
          width: 100%;
          height: 100%;
          animation: spinSlow 6s linear infinite;
          border-radius: 50%;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .vinyl-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          z-index: 2;
        }
        .vinyl-link {
          position: absolute;
          inset: 0;
          z-index: 10;
          border-radius: 50%;
        }
        .music-hint {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
        }
        .music-quote {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          max-width: 380px;
          text-align: center;
          color: rgba(255,255,255,0.4);
          font-size: 1rem;
          line-height: 1.6;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ---- COUNTDOWN HERO (locked state) ---- */
        .countdown-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          animation: fadeUp 0.6s ease-out forwards;
        }
        .countdown-hero-label {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 1rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .countdown-hero-units {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .hero-unit-wrap {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .hero-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(183,110,255,0.18);
          border-radius: 1rem;
          padding: 0.9rem 1.2rem 0.7rem;
          min-width: 70px;
          box-shadow: 0 0 20px rgba(183,110,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .hero-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          background: linear-gradient(135deg, #e8c5ff 30%, #c5a3ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          animation: numPulse 1s ease-in-out infinite alternate;
        }
        @keyframes numPulse {
          from { opacity: 0.85; }
          to { opacity: 1; }
        }
        .hero-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-top: 0.3rem;
        }
        .hero-sep {
          font-size: 2rem;
          color: rgba(183,110,255,0.4);
          font-weight: bold;
          margin-bottom: 1rem;
          animation: numPulse 1s ease-in-out infinite alternate;
        }

        /* Locked envelope */
        .lock-envelope-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .lock-envelope {
          opacity: 0.35;
          filter: grayscale(1);
        }
        .lock-hint {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em;
        }

        /* Unlocked state */
        .unlock-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .unlock-badge {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 1.1rem;
          color: #e8c5ff;
          letter-spacing: 0.15em;
          background: rgba(183,110,255,0.12);
          border: 1px solid rgba(183,110,255,0.25);
          border-radius: 2rem;
          padding: 0.4rem 1.2rem;
        }
        .just-unlocked {
          animation: unlockPop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes unlockPop {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(183,110,255,0.3); border-radius: 2px; }

        @media (max-width: 600px) {
          .menu-grid { grid-template-columns: repeat(2, 1fr); }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .menu-header { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
          .message-card { padding: 2rem 1.5rem; }
        }
        
        /* Floating Music Button */
          .music-fab {
            bottom: 1.5rem;
            position: absolute;
            right: 1.5rem;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(183,110,255,0.15);
            border: 1px solid rgba(183,110,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100;
            backdrop-filter: blur(10px);
            transition: all 0.2s ease;
            font-size: 1.2rem;
            }
            .music-fab:hover {
              background: rgba(183,110,255,0.3);
              transform: scale(1.1);
              box-shadow: 0 0 20px rgba(183,110,255,0.4);
            }
            .music-fab.playing {
              animation: fabPulse 2s ease-in-out infinite;
            }
            @keyframes fabPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(183,110,255,0.4); }
              50% { box-shadow: 0 0 0 8px rgba(183,110,255,0); }
            }

        /* LETTER VIEW */
          .letter-view {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 5rem 2rem 2rem;
            overflow-y: auto;
            animation: fadeUp 0.4s ease-out forwards;
            gap: 1.5rem;
          }
          .letter-photo {
            width: 130px;
            height: 130px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(183,110,255,0.3);
            box-shadow: 0 0 30px rgba(183,110,255,0.2);
          }
          .letter-question {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-size: clamp(1rem, 2.5vw, 1.25rem);
            color: rgba(255,255,255,0.7);
            text-align: center;
            max-width: 480px;
            line-height: 1.7;
            border-left: 2px solid rgba(183,110,255,0.4);
            padding-left: 1rem;
          }
          .letter-input-wrap {
            width: 100%;
            max-width: 500px;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .letter-textarea {
            width: 100%;
            min-height: 100px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(183,110,255,0.2);
            border-radius: 1rem;
            padding: 1rem 1.2rem;
            color: rgba(255,255,255,0.85);
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.05rem;
            resize: none;
            outline: none;
            transition: border-color 0.2s;
          }
          .letter-textarea::placeholder {
            color: rgba(255,255,255,0.2);
            font-style: italic;
          }
          .letter-textarea:focus {
            border-color: rgba(183,110,255,0.5);
            box-shadow: 0 0 15px rgba(183,110,255,0.1);
          }
          .letter-submit-btn {
            align-self: flex-end;
            background: rgba(183,110,255,0.15);
            border: 1px solid rgba(183,110,255,0.35);
            color: #e8c5ff;
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-size: 1rem;
            padding: 0.55rem 1.5rem;
            border-radius: 2rem;
            cursor: pointer;
            transition: all 0.2s;
            letter-spacing: 0.05em;
          }
          .letter-submit-btn:hover {
            background: rgba(183,110,255,0.3);
            box-shadow: 0 0 15px rgba(183,110,255,0.25);
          }
          .letter-submit-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
          .saved-letters-wrap {
            width: 100%;
            max-width: 500px;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .saved-divider {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-size: 0.8rem;
            color: rgba(255,255,255,0.2);
            letter-spacing: 0.15em;
            text-align: center;
            text-transform: uppercase;
          }
          .saved-letter-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 1rem;
            padding: 1rem 1.2rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }
          .saved-letter-text {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-size: 1rem;
            color: rgba(255,255,255,0.65);
            line-height: 1.6;
          }
          .saved-letter-date {
            font-size: 0.7rem;
            color: rgba(255,255,255,0.2);
            letter-spacing: 0.1em;
            text-align: right;
          }
      `}</style>

      {/* Background: static stars + meteor shower */}
      <div className="stars">
        {/* Tiny twinkling stars */}
        {[...Array(90)].map((_, i) => {
          const size = 0.8 + Math.random() * 2;
          return (
            <div key={`s${i}`} className="star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: size + 'px',
              height: size + 'px',
              '--dur': `${2 + Math.random() * 5}s`,
              '--maxop': Math.random() * 0.6 + 0.1,
              animationDelay: `${Math.random() * 6}s`,
            }} />
          );
        })}

        {/* Meteors */}
        {[...Array(18)].map((_, i) => {
          const tailLen = 80 + Math.random() * 180;
          const travel = 600 + Math.random() * 700;
          const speed = 1.8 + Math.random() * 3.5;
          const delay = Math.random() * 14;
          const startLeft = 10 + Math.random() * 90;
          const startTop = -5 + Math.random() * 55;
          return (
            <div key={`m${i}`} className="meteor" style={{
              '--top': `${startTop}%`,
              '--left': `${startLeft}%`,
              '--len': `${tailLen}px`,
              '--speed': `${speed}s`,
              '--delay': `${delay}s`,
              '--travel': travel,
            }} />
          );
        })}
      </div>
      <div className="aurora" />

      <audio ref={audioRef} loop>
        <source src="/Lagu.mp3" type="audio/mpeg" />
      </audio>

      <div className="card">

        {/* ENVELOPE */}
        {view === "envelope" && (
          <div className="envelope-view">
            <div className="title-script">Happy Birthday</div>
            <div className="subtitle-small">— untuk kamu yang spesial —</div>

            {/* COUNTDOWN OR UNLOCK */}
            {!isUnlocked ? (
              <div className="countdown-hero">
                <div className="countdown-hero-label">Amplop terbuka dalam</div>
                <div className="countdown-hero-units">
                  {Object.entries(timeLeft).map(([label, value], i, arr) => (
                    <div key={label} className="hero-unit-wrap">
                      <div className="hero-unit">
                        <div className="hero-num">{String(value).padStart(2, '0')}</div>
                        <div className="hero-label">{label}</div>
                      </div>
                      {i < arr.length - 1 && <div className="hero-sep">:</div>}
                    </div>
                  ))}
                </div>
                <div className="lock-envelope-wrap">
                  <div className="lock-envelope">
                    <svg viewBox="0 0 220 160" width="180" height="130" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="envGradL" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#2a2035" />
                          <stop offset="100%" stopColor="#1a1225" />
                        </linearGradient>
                      </defs>
                      <rect x="0" y="30" width="220" height="130" rx="8" fill="url(#envGradL)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                      <path d="M0 30 L110 95 L220 30 Z" fill="#201830" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <path d="M0 160 L85 100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      <path d="M220 160 L135 100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      {/* Lock icon */}
                      <rect x="96" y="98" width="28" height="22" rx="4" fill="rgba(255,255,255,0.15)" />
                      <path d="M101 98 v-7 a9 9 0 0 1 18 0 v7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="110" cy="109" r="3" fill="rgba(255,255,255,0.4)" />
                    </svg>
                  </div>
                  <div className="lock-hint">Amplop terkunci sampai waktunya tiba ✦</div>
                </div>
              </div>
            ) : (
              <div className={`unlock-state ${justUnlocked ? 'just-unlocked' : ''}`}>
                <div className="unlock-badge">🎉 Waktunya tiba!</div>
                <div className="envelope-wrap" onClick={handleOpenEnvelope}>
                  <div className="envelope-svg-wrap">
                    <svg viewBox="0 0 220 160" width="220" height="160" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4a1a6b" />
                          <stop offset="100%" stopColor="#2d0f45" />
                        </linearGradient>
                        <linearGradient id="flapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3d1560" />
                          <stop offset="100%" stopColor="#250c38" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <rect x="0" y="30" width="220" height="130" rx="8" fill="url(#envGrad)" stroke="rgba(183,110,255,0.25)" strokeWidth="1" />
                      <path d="M0 30 L110 95 L220 30 Z" fill="url(#flapGrad)" stroke="rgba(183,110,255,0.2)" strokeWidth="1" />
                      <path d="M0 160 L85 100" stroke="rgba(183,110,255,0.12)" strokeWidth="1" />
                      <path d="M220 160 L135 100" stroke="rgba(183,110,255,0.12)" strokeWidth="1" />
                      <circle cx="110" cy="105" r="22" fill="#b06edf" filter="url(#glow)" opacity="0.9" />
                      <circle cx="110" cy="105" r="18" fill="#c990f5" />
                      <text x="110" y="111" textAnchor="middle" fontSize="16" fill="rgba(40,10,60,0.8)">✦</text>
                    </svg>
                  </div>
                </div>
                <div className="envelope-hint">klik untuk membuka</div>
              </div>
            )}
          </div>
        )}

        {/* MENU */}
        {view === "menu" && (
          <div className="menu-view">
            <div className="menu-header">
              <div className="menu-title">Gift for you ✦</div>
            </div>

            <div className="menu-subtitle">Pilih untuk melihat</div>

            <div className="menu-grid">
              {menuItems.map(item => (
                <button key={item.id} className="menu-btn" onClick={() => setView(item.id)}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CAKE */}
        {view === "cake" && (
          <div className="cake-view">
            <button className="close-btn" onClick={closeDetail}>✕ Tutup</button>

            {candleBlown && (
              <div className="confetti-container">
                {[...Array(60)].map((_, i) => (
                  <div key={i} className="confetti-piece" style={{
                    left: `${Math.random() * 100}%`,
                    top: '-5%',
                    backgroundColor: ['#e8c5ff', '#ffb3d9', '#c5d5ff', '#fbbf24', '#6ee7b7', '#f87171'][Math.floor(Math.random() * 6)],
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }} />
                ))}
              </div>
            )}

            <div className="cake-heading">
              {candleBlown ? "Selamat Ulang Tahun ke 20 Sayang! 🎉" : "Make a wish..."}
            </div>
            <div className="cake-hint" style={{ opacity: candleBlown ? 0 : 1 }}>
              (Klik kuenya untuk tiup lilin!)
            </div>

            <div className="cake-interactive" onClick={() => setCandleBlown(true)}>
              <svg viewBox="0 0 280 280" width="280" height="280" xmlns="http://www.w3.org/2000/svg">
                {/* Plate */}
                <ellipse cx="140" cy="260" rx="130" ry="14" fill="#2a2040" />
                <ellipse cx="140" cy="255" rx="120" ry="10" fill="#3d3060" />

                {/* Tier 3 (bottom) */}
                <rect x="30" y="190" width="220" height="60" rx="10" fill="#c084fc" />
                <rect x="30" y="190" width="220" height="10" rx="5" fill="#a855f7" />
                {[50, 80, 110, 140, 170, 200].map((x, i) => (
                  <ellipse key={i} cx={x} cy="250" rx="14" ry="8" fill="#f5d0fe" opacity="0.6" />
                ))}

                {/* Tier 2 (middle) */}
                <rect x="60" y="135" width="160" height="55" rx="8" fill="#e879f9" />
                <rect x="60" y="135" width="160" height="8" rx="4" fill="#d946ef" />
                {[80, 110, 140, 170, 200].map((x, i) => (
                  <ellipse key={i} cx={x} cy="190" rx="11" ry="7" fill="#fdf4ff" opacity="0.55" />
                ))}

                {/* Tier 1 (top) */}
                <rect x="90" y="90" width="100" height="45" rx="8" fill="#f0abfc" />
                <rect x="90" y="90" width="100" height="7" rx="3.5" fill="#e879f9" />
                {[105, 130, 155, 175].map((x, i) => (
                  <ellipse key={i} cx={x} cy="135" rx="9" ry="6" fill="#fdf4ff" opacity="0.5" />
                ))}

                {/* Candle */}
                <rect x="133" y="58" width="14" height="32" rx="3" fill="white" />
                <rect x="133" y="62" width="14" height="3" fill="#f9a8d4" opacity="0.6" />
                <rect x="133" y="70" width="14" height="3" fill="#f9a8d4" opacity="0.6" />
                <rect x="133" y="78" width="14" height="3" fill="#f9a8d4" opacity="0.6" />

                {/* Flame */}
                {!candleBlown && (
                  <g className="flame" style={{ transformOrigin: '140px 52px' }}>
                    <ellipse cx="140" cy="50" rx="7" ry="12" fill="#fde68a" opacity="0.95" />
                    <ellipse cx="140" cy="52" rx="4" ry="8" fill="#fbbf24" />
                    <ellipse cx="140" cy="54" rx="2" ry="4" fill="#f97316" />
                    <ellipse cx="140" cy="52" rx="5" ry="10" fill="rgba(253,230,138,0.3)" />
                  </g>
                )}

                {/* Decorative stars */}
                {[[55, 200], [225, 195], [45, 155], [235, 160], [75, 105], [205, 110]].map(([x, y], i) => (
                  <text key={i} x={x} y={y} fontSize="12" fill="rgba(255,255,255,0.4)" textAnchor="middle">✦</text>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* MESSAGE */}
        {view === "message" && (
          <div className="detail-view">
            <button className="close-btn" onClick={closeDetail}>✕ Tutup</button>
            <div className="message-card">
              <h2 className="message-heading">Happy Birthday Sayang!</h2>
              <div className="message-divider" />
              <p className="message-body">
                Selamat ulang tahun untuk orang yang paling mengerti aku. 💖
                <br /><br />
                Semoga di usia yang baru ini, kamu selalu dikelilingi hal-hal baik. Makasih ya sudah selalu ada dan selalu jadi dirimu sendiri.
                <br /><br />
                Aku akan selalu dukung semua mimpi-mimpi kamu. I love you! 💙
              </p>
              <div className="message-hearts">
                <span style={{ animation: 'breathe 1.8s ease-in-out infinite' }}>💖</span>
                <span style={{ animation: 'breathe 2.2s ease-in-out infinite' }}>💙</span>
                <span style={{ animation: 'breathe 1.5s ease-in-out infinite' }}>💖</span>
              </div>
            </div>
          </div>
        )}

        {/* GALLERY */}
        {view === "gallery" && (
          <div className="gallery-view">
            <button className="close-btn" onClick={closeDetail}>✕ Tutup</button>
            <div className="gallery-title">Tumpukan Foto Cantikk ✦</div>
            <div className="gallery-grid">
              {photos.map((img, i) => (
                <div key={i} className="photo-frame">
                  <img src={img} alt={`Kenangan ${i + 1}`} />
                  <div className="photo-caption">Foto cantik #{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GIFT */}
        {view === "gift" && (
          <div className="gift-view">
            <button className="close-btn" onClick={closeDetail}>✕ Tutup</button>
            <div className="gift-card">
              <span className="gift-icon">🎁</span>
              <h2 className="gift-heading">Kejutan Lainnya!</h2>
              <p className="gift-text">
                Kado terbesarnya adalah... aku yang akan selalu bersama kamu selamanyaaa! ✨💖
              </p>
            </div>
          </div>
        )}

        {/* LETTER */}
        {view === "letter" && (
          <div className="letter-view">
            <button className="close-btn" onClick={closeDetail}>✕ Tutup</button>

            <img
              src="/foto kecil.jpg"
              alt="Foto masa kecil"
              className="letter-photo"
            />

            <p className="letter-question">
              "Jika kamu diberi kesempatan untuk bertemu anak kecil ini, kamu ingin berkata apa?"
            </p>

            <div className="letter-input-wrap">
              <textarea
                className="letter-textarea"
                placeholder="Tulis pesanmu di sini..."
                value={letterInput}
                onChange={(e) => setLetterInput(e.target.value)}
                maxLength={300}
              />
              <button
                className="letter-submit-btn"
                onClick={handleSubmitLetter}
                disabled={!letterInput.trim()}
              >
                Kirim Pesan ✦
              </button>
            </div>

            {savedLetters.length > 0 && (
              <div className="saved-letters-wrap">
                <div className="saved-divider">— pesan tersimpan —</div>
                {savedLetters.map((entry) => (
                  <div key={entry.id} className="saved-letter-card">
                    <div className="saved-letter-text">"{entry.text}"</div>
                    <div className="saved-letter-date">{entry.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MUSIC */}
        {view === "piringan" && (
          <div className="music-view">
            <button className="close-btn" onClick={closeDetail}>✕ Tutup</button>
            <div className="music-title">Lagu Spesial Kita ✦</div>
            <div className="vinyl-wrap">
              <img src="/Piring.png" alt="vinyl record" />
              <div className="vinyl-center">❤️</div>
            </div>
            <div className="music-hint">♪ memutar lagu spesial untukmu ♪</div>
            <div className="music-quote">
              "Lagu ini mungkin menggambarkan kamu hehe 💙 Happy Birthday Sayang! Semoga kado kecil ini bikin kamu senyum hari ini."
            </div>
          </div>
        )}

        {/* Floating Music Button - muncul di semua halaman kecuali envelope */}
        {view !== "envelope" && (
          <button
            className={`music-fab ${isPlaying ? 'playing' : ''}`}
            onClick={toggleMusic}
            title={isPlaying ? 'Pause musik' : 'Play musik'}
          >
            {isPlaying ? '⏸' : '▶️'}
          </button>
        )}

      </div>
    </div>
  );
}