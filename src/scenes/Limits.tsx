import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Arrow, Badge, Label, Stage} from '../components/primitives';
import {Electron, Nucleus, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Tabel periodik: [periode, golongan] → blok
const blockOf = (g: number) => (g <= 2 ? 's' : g >= 13 ? 'p' : 'd');
const BLOCK_COL: Record<string, string> = {s: C.gold, p: C.cyan, d: C.violet, f: C.mint};
const CELLS: {r: number; c: number; b: string}[] = (() => {
  const out: {r: number; c: number; b: string}[] = [];
  out.push({r: 1, c: 1, b: 's'}, {r: 1, c: 18, b: 's'});
  for (const r of [2, 3]) for (const c of [1, 2, 13, 14, 15, 16, 17, 18]) out.push({r, c, b: blockOf(c)});
  for (const r of [4, 5, 6, 7]) for (let c = 1; c <= 18; c++) out.push({r, c, b: blockOf(c)});
  for (const r of [9, 10]) for (let c = 3; c <= 16; c++) out.push({r, c, b: 'f'});
  return out;
})();

export const Limits: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const A = win(t, cue(0) - 0.4, cue(3) - 0.4, 0.8, 0.7);
  const split = ramp(t, cue(1) + 0.4, cue(1) + 2.4, EASE_IN_OUT);
  const badges = [wordOf(2, 'relativistik'), wordOf(2, 'Lamb'), wordOf(2, 'hiperhalus')].map((w) => ramp(t, w - 0.1, w + 0.5, BACK));
  const B = win(t, cue(3) - 0.3, cue(5) - 0.3, 0.8, 0.7);
  const many = ramp(t, cue(3), cue(3) + 0.8);
  const lv = ramp(t, cue(4), cue(4) + 1.2, EASE_IN_OUT);
  const P = ramp(t, cue(5) - 0.2, cue(5) + 0.8);
  const fill = ramp(t, cue(6) - 0.2, cue(6) + 3, EASE_IN_OUT);
  // komponen garis (skematis): satu garis → beberapa
  const comps = [-0.9, -0.35, 0.25, 0.8];

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== struktur halus ===== */}
        <g opacity={A}>
          <rect x={460} y={300} width={1000} height={260} rx={16} fill="#060914" stroke={C.faint} strokeWidth={2} />
          {comps.map((c, i) => (
            <rect key={i} x={960 + c * 220 * split - 4} y={330} width={8} height={200} fill={wlColor(656)} opacity={i === 1 || i === 2 ? 1 : 0.55 * split + (1 - split) * 0.2} filter="url(#glow)" />
          ))}
          <Label x={960} y={600} size={26} color={C.muted}>
            garis H-α dilihat dengan resolusi sangat tinggi (skematis)
          </Label>
        </g>
        {/* ===== atom berelektron banyak ===== */}
        <g opacity={B}>
          <g opacity={many}>
            <circle cx={520} cy={520} r={220} fill="url(#soft-cyan)" opacity={0.25} />
            <Nucleus x={520} y={520} r={28} label="+3" />
            {[0, 1, 2].map((k) => {
              const a = t * (k === 2 ? 0.7 : 1.6) + k * 2.1;
              const r = k === 2 ? 200 : 80;
              return <Electron key={k} x={520 + r * Math.cos(a)} y={520 + r * Math.sin(a)} r={11} />;
            })}
            {(() => {
              const a0 = t * 1.6;
              const a2 = t * 0.7 + 4.2;
              const e0 = [520 + 80 * Math.cos(a0), 520 + 80 * Math.sin(a0)];
              const e2 = [520 + 200 * Math.cos(a2), 520 + 200 * Math.sin(a2)];
              return <Arrow x1={mix(e0[0], e2[0], 0.3)} y1={mix(e0[1], e2[1], 0.3)} x2={mix(e0[0], e2[0], 0.7)} y2={mix(e0[1], e2[1], 0.7)} color="red" width={3} both />;
            })()}
            <Label x={520} y={800} size={28} color={C.ink} weight={600}>
              Li: 3 elektron saling tolak & menyaring
            </Label>
          </g>
          {/* diagram 2s/2p */}
          <g opacity={lv}>
            {[
              {x: 1060, name: 'H', s: 420, p: 420},
              {x: 1440, name: 'atom banyak elektron', s: 520, p: 380},
            ].map((d) => (
              <g key={d.name}>
                <line x1={d.x - 110} y1={d.s} x2={d.x - 10} y2={d.s} stroke={C.gold} strokeWidth={5} />
                <line x1={d.x + 10} y1={mix(420, d.p, lv)} x2={d.x + 110} y2={mix(420, d.p, lv)} stroke={C.cyan} strokeWidth={5} />
                <Label x={d.x - 60} y={d.s + 32} size={24} color={C.gold} weight={700}>
                  2s
                </Label>
                <Label x={d.x + 60} y={mix(420, d.p, lv) - 30} size={24} color={C.cyan} weight={700}>
                  2p
                </Label>
                <Label x={d.x} y={640} size={24} color={C.muted}>
                  {d.name}
                </Label>
              </g>
            ))}
            <Label x={1250} y={300} size={26} color={C.ink}>
              s lebih menembus → energi lebih rendah
            </Label>
          </g>
        </g>
        {/* ===== tabel periodik ===== */}
        <g opacity={P}>
          {CELLS.map((cl, i) => {
            const x = 330 + (cl.c - 1) * 70;
            const y = 200 + (cl.r - 1) * 56 - (cl.r >= 9 ? 24 : 0);
            const order = cl.b === 's' ? 0 : cl.b === 'p' ? 1 : cl.b === 'd' ? 2 : 3;
            const p = ramp(fill, order * 0.22, order * 0.22 + 0.3);
            return <rect key={i} x={x} y={y} width={62} height={50} rx={7} fill={BLOCK_COL[cl.b]} opacity={0.12 + 0.55 * p} stroke={BLOCK_COL[cl.b]} strokeOpacity={0.6} />;
          })}
          {(['s', 'p', 'd', 'f'] as const).map((b, i) => (
            <text key={b} x={[265, 1310, 960, 330][i]} y={[420, 240, 320, 680][i]} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={40} fill={BLOCK_COL[b]} opacity={ramp(fill, i * 0.22, i * 0.22 + 0.3)}>
              blok {b}
            </text>
          ))}
        </g>
      </Stage>
      <Badge x={620} y={720} text="struktur halus" color={C.gold} opacity={A * badges[0]} />
      <Badge x={960} y={720} text="pergeseran Lamb" color={C.cyan} opacity={A * badges[1]} />
      <Badge x={1300} y={720} text="struktur hiperhalus" color={C.violet} opacity={A * badges[2]} />
    </AbsoluteFill>
  );
};
