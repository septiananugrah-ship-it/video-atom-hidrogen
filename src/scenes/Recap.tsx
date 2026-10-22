import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, ramp, smoothPath} from '../anim';
import {DrawPath, Glow, Label, Stage} from '../components/primitives';
import {BALMER, Electron, Nucleus, OrbitalCloud, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const NODES = [
  {x: 250, y: 470, title: 'Coulomb + μ', color: C.red},
  {x: 534, y: 560, title: 'ψ = R · Y', color: C.cyan},
  {x: 818, y: 470, title: 'Eₙ = −13,6/n² eV', color: C.gold},
  {x: 1102, y: 560, title: 'orbital s, p, d', color: C.violet},
  {x: 1386, y: 470, title: 'Rydberg & Δℓ = ±1', color: C.mint},
  {x: 1670, y: 560, title: 'penggaris cahaya', color: C.amber},
];
const PATH = smoothPath(NODES.map((n) => [n.x, n.y]));

const Icon: React.FC<{i: number; x: number; y: number; t: number}> = ({i, x, y, t}) => {
  switch (i) {
    case 0:
      return (
        <g>
          <Nucleus x={x - 30} y={y} r={16} />
          <Electron x={x + 36} y={y + 6 * Math.sin(t * 3)} r={9} />
        </g>
      );
    case 1:
      return (
        <text x={x} y={y + 4} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={40} fill={C.cyan}>
          R·Y
        </text>
      );
    case 2:
      return (
        <g>
          {[1, 2, 3, 4].map((n) => (
            <line key={n} x1={x - 44} y1={y + 34 - (1 - 1 / (n * n)) * 60} x2={x + 44} y2={y + 34 - (1 - 1 / (n * n)) * 60} stroke={C.gold} strokeWidth={4} />
          ))}
        </g>
      );
    case 3:
      return <OrbitalCloud id="3dz2" x={x} y={y} size={70} yaw={t * 0.8} pitch={0.4} dot={1.2} count={600} />;
    case 4:
      return (
        <g>
          {BALMER.map((b, k) => (
            <rect key={b.ni} x={x - 44 + k * 26} y={y - 34} width={6} height={68} fill={wlColor(b.nm)} filter="url(#glow)" />
          ))}
        </g>
      );
    default:
      return (
        <g>
          <rect x={x - 50} y={y - 14} width={100} height={28} rx={4} fill={C.amber} opacity={0.25} stroke={C.amber} />
          {Array.from({length: 11}, (_, k) => (
            <line key={k} x1={x - 50 + k * 10} y1={y - 14} x2={x - 50 + k * 10} y2={y - 14 + (k % 5 === 0 ? 14 : 8)} stroke={C.amber} strokeWidth={2} />
          ))}
        </g>
      );
  }
};

export const Recap: React.FC = () => {
  const {t, cue} = useScene();
  const intro = ramp(t, cue(0) - 0.3, cue(0) + 1);
  const nodesOut = ramp(t, cue(7) - 0.3, cue(7) + 1, EASE_IN_OUT);
  const tube = ramp(t, cue(7) + 0.2, cue(7) + 1.8, EASE_IN_OUT);
  const lines = ramp(t, cue(8) - 0.2, cue(8) + 2.5, EASE_IN_OUT);
  const lit = NODES.map((_, i) => ramp(t, cue(i + 1) - 0.1, cue(i + 1) + 0.6, BACK));
  const pathP = Math.max(...lit.map((l, i) => (l > 0 ? (i + l) / (NODES.length - 1) : 0)));
  const pink = '#ff6fb5';
  const glow = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={intro * (1 - nodesOut)}>
          <DrawPath d={PATH} p={Math.min(1, pathP)} stroke={C.gold} width={3} opacity={0.6} len={3000} />
          {NODES.map((n, i) => (
            <g key={i} opacity={lit[i]} transform={`translate(${n.x} ${n.y}) scale(${0.7 + 0.3 * lit[i]}) translate(${-n.x} ${-n.y})`}>
              <Glow x={n.x} y={n.y} r={150} color="gold" opacity={0.15} />
              <circle cx={n.x} cy={n.y} r={92} fill="rgba(12,18,40,0.9)" stroke={n.color} strokeWidth={3} />
              <Icon i={i} x={n.x} y={n.y} t={t} />
              <Label x={n.x} y={n.y + (i % 2 ? 140 : -140)} size={28} color={n.color} weight={700}>
                {n.title}
              </Label>
            </g>
          ))}
        </g>
        {/* penutup: tabung hidrogen & empat garis */}
        <g opacity={tube}>
          <Glow x={960} y={360} r={420} color="red" opacity={0.3 * glow} />
          <rect x={560} y={314} width={800} height={92} rx={46} fill="rgba(180,200,255,0.06)" stroke="#9fb0d8" strokeOpacity={0.5} strokeWidth={3} />
          <rect x={590} y={338} width={740} height={44} rx={22} fill={pink} opacity={0.85 * glow} filter="url(#glow-strong)" />
          <rect x={600} y={352} width={720} height={16} rx={8} fill="#fff" opacity={0.5 * glow} />
        </g>
        {BALMER.map((b, i) => {
          const x = 960 + ((560 - b.nm) / 150) * 600;
          const p = ramp(lines, i * 0.15, i * 0.15 + 0.5);
          return (
            <g key={b.ni} opacity={p}>
              <rect x={x - 4} y={480} width={8} height={300} fill={wlColor(b.nm)} filter="url(#glow)" />
              <Glow x={x} y={630} r={90} color="white" opacity={0.12} />
              <Label x={x} y={810} size={22} color={wlColor(b.nm)} font="mono">
                {`${b.ni}→2`}
              </Label>
            </g>
          );
        })}
      </Stage>
    </AbsoluteFill>
  );
};
