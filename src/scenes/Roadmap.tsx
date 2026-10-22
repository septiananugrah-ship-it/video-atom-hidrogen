import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {BALMER, OrbitalCloud, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Peta video: tiga bagian wajib tugas.
const CARDS = [
  {n: '1', title: 'Prinsip & teori dasar', sub: 'Coulomb → Schrödinger → orbital', color: C.cyan, x: 420},
  {n: '2', title: 'Implementasi dalam kimia', sub: 'ionisasi, deret spektrum, aturan seleksi', color: C.violet, x: 960},
  {n: '3', title: 'Penerapan di industri', sub: 'lampu D₂, ICP-OES, plasma', color: C.amber, x: 1500},
];
const Y = 560;

const Icon: React.FC<{i: number; x: number; y: number; t: number}> = ({i, x, y, t}) => {
  if (i === 0) return <OrbitalCloud id="2pz" x={x} y={y} size={80} yaw={t * 0.6} pitch={0.4} dot={1.4} count={700} />;
  if (i === 1)
    return (
      <g>
        <rect x={x - 80} y={y - 40} width={160} height={80} rx={8} fill="#070a16" stroke={C.faint} />
        {BALMER.map((b) => {
          const xx = x - 70 + ((700 - b.nm) / 310) * 140;
          return <rect key={b.ni} x={xx - 2} y={y - 34} width={4} height={68} fill={wlColor(b.nm)} filter="url(#glow)" />;
        })}
      </g>
    );
  const smoke = (k: number) => {
    const ph = (t * 0.5 + k / 3) % 1;
    return <circle key={k} cx={x + 38 + ph * 14} cy={y - 50 - ph * 40} r={6 + ph * 10} fill={C.muted} opacity={(1 - ph) * 0.5} />;
  };
  return (
    <g>
      {[0, 1, 2].map(smoke)}
      <path
        d={`M${x - 70},${y + 32} L${x - 70},${y - 4} L${x - 40},${y - 20} L${x - 40},${y - 4} L${x - 10},${y - 20} L${x - 10},${y - 4} L${x + 20},${y - 20} L${x + 30},${y - 20} L${x + 30},${y - 50} L${x + 46},${y - 50} L${x + 46},${y + 32} Z`}
        fill={C.amber}
        opacity={0.85}
      />
    </g>
  );
};

export const Roadmap: React.FC = () => {
  const {t, cue} = useScene();
  const head = ramp(t, -0.2, 0.9);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', opacity: head, translate: `0px ${(1 - head) * 20}px`}}>
        <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 6, color: C.gold}}>TOPIK KAJIAN · MODUL 6</div>
        <div style={{fontFamily: FONT.sans, fontSize: 64, fontWeight: 700, color: C.ink, marginTop: 6}}>Struktur &amp; Spektrum Atom Hidrogen</div>
      </div>
      <Stage>
        {CARDS.map((c, i) => {
          const p = ramp(t, cue(i + 1) - 0.2, cue(i + 1) + 0.6, BACK);
          const lit = ramp(t, cue(i + 1), cue(i + 1) + 0.4) * (i === 2 || t < cue(i + 2) ? 1 : 0.55);
          return (
            <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 40})`}>
              <Glow x={c.x} y={Y} r={260} color={(['cyan', 'violet', 'gold'] as const)[i]} opacity={0.18 * lit} />
              <rect x={c.x - 252} y={Y - 170} width={504} height={340} rx={28} fill="rgba(12,18,40,0.82)" stroke={c.color} strokeOpacity={0.35 + 0.5 * lit} strokeWidth={2.5} />
              <text x={c.x - 214} y={Y - 110} fontFamily={FONT.mono} fontSize={64} fontWeight={600} fill={c.color} dominantBaseline="central">
                {c.n}
              </text>
              <Icon i={i} x={c.x + 130} y={Y - 100} t={t} />
              <text x={c.x - 214} y={Y + 10} fontFamily={FONT.sans} fontSize={31} fontWeight={700} fill={C.ink}>
                {c.title}
              </text>
              <text x={c.x - 214} y={Y + 58} fontFamily={FONT.sans} fontSize={21} fill={C.muted}>
                {c.sub}
              </text>
            </g>
          );
        })}
      </Stage>
    </AbsoluteFill>
  );
};
