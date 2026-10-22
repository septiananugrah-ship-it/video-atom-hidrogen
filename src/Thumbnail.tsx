import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Glow, Stage} from './components/primitives';
import {BALMER, Nucleus, OrbitalCloud, wlColor} from './components/viz';
import {C, FONT, H, W} from './theme';

/** Gambar sampul video (2560×1440 lewat skala 4/3, lihat Root.tsx). */
const Cover: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 70% 45%, #2c1a5a 0%, ${C.bg2} 45%, ${C.bg} 100%)`}}>
    <Stage>
      <Glow x={1400} y={470} r={560} color="gold" opacity={0.25} />
      <OrbitalCloud id="2pz" x={1400} y={470} size={430} yaw={0.6} pitch={0.35} count={2200} dot={2.6} />
      <Nucleus x={1400} y={470} r={14} />
      {BALMER.map((b, i) => (
        <rect key={b.ni} x={1060 + i * 40 + ((656 - b.nm) / 250) * 300} y={830} width={12} height={180} fill={wlColor(b.nm)} filter="url(#glow)" />
      ))}
    </Stage>
    <div style={{position: 'absolute', left: 110, top: 230, width: 900}}>
      <div style={{fontFamily: FONT.mono, fontSize: 30, letterSpacing: 8, color: C.gold}}>KIMIA KUANTUM · MODUL 6</div>
      <div style={{fontFamily: FONT.sans, fontSize: 74, fontWeight: 800, color: C.ink, lineHeight: 1.05, marginTop: 10}}>Struktur &amp; Spektrum</div>
      <div style={{fontFamily: FONT.sans, fontSize: 150, fontWeight: 800, color: C.gold, lineHeight: 1, marginTop: 24, textShadow: '0 0 50px rgba(255,194,74,0.45)'}}>
        Atom
        <br />
        Hidrogen
      </div>
      <div style={{display: 'flex', gap: 14, marginTop: 44}}>
        {[
          ['orbital', C.cyan],
          ['deret Balmer', C.violet],
          ['industri', C.amber],
        ].map(([t, col]) => (
          <div key={t} style={{padding: '10px 22px', borderRadius: 999, border: `2px solid ${col}`, color: col, fontFamily: FONT.sans, fontWeight: 600, fontSize: 30}}>
            {t}
          </div>
        ))}
      </div>
    </div>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.6) 100%)'}} />
  </AbsoluteFill>
);

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${2560 / W})`, transformOrigin: '0 0'}}>
      <Cover />
    </div>
  </AbsoluteFill>
);
