import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, ramp, win} from '../anim';
import {Card, Glow, Label, Stage, V} from '../components/primitives';
import {OrbitalCloud, type OrbitalId} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const COLS = [
  {sym: 'n', name: 'utama', range: '1, 2, 3, …', role: 'energi & ukuran', color: C.gold, x: 400},
  {sym: 'ℓ', name: 'orbital', range: '0 … n − 1', role: 'bentuk', color: C.cyan, x: 960},
  {sym: 'mℓ', name: 'magnetik', range: '−ℓ … +ℓ', role: 'orientasi', color: C.violet, x: 1520},
];
const SUB = ['s', 'p', 'd', 'f'];
const SUB_COL = [C.gold, C.cyan, C.violet, C.mint];

export const Numbers: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const A = win(t, cue(0) - 0.4, cue(4) - 0.4, 0.8, 0.7);
  const heads = COLS.map((_, i) => ramp(t, cue(0) + 0.3 + i * 0.3, cue(0) + 0.9 + i * 0.3, BACK));
  const lit = [cue(1), cue(2), cue(3)].map((c, i) => ramp(t, c, c + 0.5) * (i === 2 ? 1 : 1 - 0.5 * ramp(t, [cue(2), cue(3)][i], [cue(2), cue(3)][i] + 0.5)));
  const B = ramp(t, cue(4) - 0.3, cue(4) + 0.7);
  const rows = [1, 2, 3, 4].map((n) => {
    const w = [wordOf(4, 'pertama'), wordOf(4, 'kedua'), wordOf(4, 'ketiga'), wordOf(4, 'keempat')][n - 1];
    return ramp(t, w - 0.1, w + 0.6, BACK);
  });
  const spin = ramp(t, cue(5), cue(5) + 0.8);
  const ex1 = ramp(t, cue(6), cue(6) + 0.6, BACK);
  const ex2 = ramp(t, wordOf(6, 'sedangkan'), wordOf(6, 'sedangkan') + 0.6, BACK);
  const shapes: OrbitalId[] = ['1s', '2pz', '3dz2'];
  const orient: OrbitalId[] = ['2px', '2py', '2pz'];

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={A}>
          {COLS.map((c, i) => (
            <g key={i} opacity={heads[i]}>
              <Glow x={c.x} y={300} r={200} color={(['gold', 'cyan', 'violet'] as const)[i]} opacity={0.25 * lit[i]} />
              <rect x={c.x - 230} y={200} width={460} height={190} rx={22} fill="rgba(12,18,40,0.85)" stroke={c.color} strokeOpacity={0.35 + 0.6 * lit[i]} strokeWidth={2.5} />
              <text x={c.x - 190} y={290} fontFamily={FONT.serif} fontStyle="italic" fontSize={92} fill={c.color} dominantBaseline="central">
                {c.sym}
              </text>
              <text x={c.x - 50} y={262} fontFamily={FONT.sans} fontSize={28} fontWeight={700} fill={C.ink}>
                {c.name}
              </text>
              <text x={c.x - 50} y={302} fontFamily={FONT.mono} fontSize={24} fill={C.muted}>
                {c.range}
              </text>
              <text x={c.x - 50} y={344} fontFamily={FONT.sans} fontSize={26} fill={c.color} opacity={lit[i]}>
                → {c.role}
              </text>
            </g>
          ))}
          {/* n: ukuran tumbuh */}
          <g opacity={lit[0]}>
            {[1, 2, 3].map((n) => (
              <circle key={n} cx={400} cy={640} r={40 * n * n * 0.45 + 20} fill="none" stroke={C.gold} strokeOpacity={0.7 - n * 0.15} strokeWidth={3} />
            ))}
            <circle cx={400} cy={640} r={7} fill={C.red} />
            <Label x={400} y={830} size={24} color={C.gold}>
              n = 1, 2, 3: makin besar
            </Label>
          </g>
          {/* ℓ: bentuk */}
          <g opacity={lit[1]}>
            {shapes.map((id, k) => (
              <g key={id}>
                <OrbitalCloud id={id} x={800 + k * 160} y={620} size={k === 0 ? 70 : 85} yaw={t * 0.6} pitch={0.4} dot={1.4} count={700} />
                <Label x={800 + k * 160} y={760} size={34} color={SUB_COL[k]} weight={700}>
                  {SUB[k]}
                </Label>
                <Label x={800 + k * 160} y={800} size={22} color={C.muted} font="serif" italic>
                  ℓ = {k}
                </Label>
              </g>
            ))}
          </g>
          {/* mℓ: orientasi */}
          <g opacity={lit[2]}>
            {orient.map((id, k) => (
              <g key={id}>
                <OrbitalCloud id={id} x={1360 + k * 160} y={620} size={85} yaw={0.5} pitch={0.35} dot={1.4} count={700} />
                <Label x={1360 + k * 160} y={760} size={28} color={C.violet} weight={600}>
                  p
                  <tspan dy={8} fontSize={20}>
                    {'xyz'[k]}
                  </tspan>
                </Label>
              </g>
            ))}
            <Label x={1520} y={800} size={22} color={C.muted}>
              ℓ = 1 → mℓ = −1, 0, +1 (tiga orientasi)
            </Label>
          </g>
        </g>
        {/* ===== tabel kulit ===== */}
        <g opacity={B}>
          {[1, 2, 3, 4].map((n, i) => {
            const y = 250 + i * 135;
            let x = 330;
            return (
              <g key={n} opacity={rows[i]}>
                <Label x={180} y={y} size={36} color={C.gold} font="serif" italic>
                  n = {n}
                </Label>
                {Array.from({length: n}, (_, l) => {
                  const g = (
                    <g key={l}>
                      <Label x={x + ((2 * l + 1) * 44) / 2 - 4} y={y - 46} size={22} color={SUB_COL[l]} weight={700}>
                        {`${n}${SUB[l]}`}
                      </Label>
                      {Array.from({length: 2 * l + 1}, (_, m) => (
                        <g key={m}>
                          <rect x={x + m * 44} y={y - 22} width={38} height={44} rx={6} fill={SUB_COL[l]} opacity={0.2} stroke={SUB_COL[l]} strokeWidth={2} />
                          <g opacity={spin}>
                            <text x={x + m * 44 + 11} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={24} fill={C.ink} fontFamily={FONT.sans}>
                              ↑
                            </text>
                            <text x={x + m * 44 + 27} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={24} fill={C.ink} fontFamily={FONT.sans}>
                              ↓
                            </text>
                          </g>
                        </g>
                      ))}
                    </g>
                  );
                  x += (2 * l + 1) * 44 + 26;
                  return g;
                })}
                <Label x={1150} y={y} size={30} color={C.ink} anchor="start" font="mono">
                  {n * n} orbital
                </Label>
                <Label x={1370} y={y} size={30} color={C.mint} anchor="start" font="mono" opacity={spin}>
                  · {2 * n * n} keadaan
                </Label>
              </g>
            );
          })}
        </g>
      </Stage>
      <Card x={1580} y={760} opacity={B * spin * (1 - ex1)} accent={C.mint} style={{fontSize: 30}}>
        spin <V>m</V>
        <sub>s</sub> = ±½ → 2<V>n</V>² keadaan per kulit
      </Card>
      <Card x={1250} y={790} opacity={B * ex1} accent={C.mint} anchor="right" style={{fontSize: 30}}>
        (<V>n</V>, <V>ℓ</V>, <V>m</V>
        <sub>ℓ</sub>) = (3, 2, −2) <span style={{color: C.mint}}>✓ salah satu 3d</span>
      </Card>
      <Card x={1310} y={790} opacity={B * ex2} accent={C.red} anchor="left" style={{fontSize: 30}}>
        (2, 2, 0) <span style={{color: C.red}}>✗ ℓ harus &lt; n</span>
      </Card>
    </AbsoluteFill>
  );
};
