import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {BALMER, Nucleus, OrbitalCloud, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const Letters: React.FC<{text: string; t: number; start: number; step: number; style: React.CSSProperties}> = ({text, t, start, step, style}) => (
  <div style={{display: 'flex', justifyContent: 'center', ...style}}>
    {text.split('').map((ch, i) => {
      const p = ramp(t, start + i * step, start + i * step + 0.9);
      return (
        <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: p, translate: `0px ${(1 - p) * 40}px`, filter: `blur(${(1 - p) * 12}px)`}}>
          {ch}
        </span>
      );
    })}
  </div>
);

export const Title: React.FC = () => {
  const {t} = useScene();
  const cloud = ramp(t, 0, 4, EASE_IN_OUT);
  const sweep = ramp(t, 2.2, 4.2, EASE_IN_OUT);
  const sub = ramp(t, 2.6, 3.6);
  const line = ramp(t, 1.8, 3.2, EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <Stage>
        <Glow x={960} y={470} r={620} color="gold" opacity={0.2 * cloud} />
        <OrbitalCloud id="2pz" x={960} y={470} size={430} yaw={t * 0.25} pitch={0.5} p={cloud} opacity={0.35} dot={2.2} />
        <Nucleus x={960} y={470} r={10} opacity={cloud} />
        {/* garis Balmer menyapu dari kiri ke kanan */}
        {BALMER.map((b, i) => {
          const p = ramp(t, 0.8 + i * 0.25, 2.4 + i * 0.25, EASE_IN_OUT);
          const x = 360 + i * 400;
          return <rect key={b.ni} x={x - 3} y={140} width={6} height={800 * p} fill={wlColor(b.nm)} opacity={0.35} filter="url(#glow)" />;
        })}
      </Stage>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{position: 'relative', textAlign: 'center'}}>
          <Letters text="STRUKTUR & SPEKTRUM" t={t} start={0.4} step={0.04} style={{fontFamily: FONT.sans, fontWeight: 300, fontSize: 64, letterSpacing: 18, color: C.ink, marginRight: -18}} />
          <Letters
            text="ATOM HIDROGEN"
            t={t}
            start={0.9}
            step={0.07}
            style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 170, letterSpacing: 4, lineHeight: 1.05, color: C.gold, textShadow: '0 0 60px rgba(255,194,74,0.45)'}}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(100deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,0.35) ${sweep * 140 - 20}%, transparent ${sweep * 140 - 10}%)`,
              mixBlendMode: 'overlay',
            }}
          />
        </div>
        <div style={{width: 640 * line, height: 2, margin: '30px 0 24px', background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
        <div style={{fontFamily: FONT.sans, fontSize: 36, color: C.muted, letterSpacing: 1, opacity: sub, translate: `0px ${(1 - sub) * 16}px`}}>
          Kimia Kuantum · Modul 6 — orbital, tingkat energi &amp; garis spektrum
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
