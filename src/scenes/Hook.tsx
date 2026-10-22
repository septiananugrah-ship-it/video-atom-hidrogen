import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN, EASE_IN_OUT, mix, rand, ramp, win} from '../anim';
import {Glow, Label, Stage} from '../components/primitives';
import {BALMER, Electron, Nucleus, OrbitalCloud, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Tabung lucutan, prisma, dan layar spektrum.
const TUBE = {x0: 170, x1: 760, y: 470};
const PRISM = {x: 1010, y: 470};
const SCREEN = {x: 1560, y0: 260, y1: 700};
// panjang gelombang → posisi vertikal pada layar (merah di atas, ungu di bawah)
const wlY = (nm: number) => mix(SCREEN.y0 + 30, SCREEN.y1 - 30, (700 - nm) / (700 - 390));
const FOCUS = {x: (TUBE.x0 + TUBE.x1) / 2, y: TUBE.y};
const ATOM_C = {x: 960, y: 470};
// partikel gas di dalam plasma: molekul H₂ (pasangan) dan atom H (tunggal)
const GAS = Array.from({length: 70}, (_, i) => ({
  x: rand(i * 4.7) * 1920,
  y: 120 + rand(i * 9.1 + 2) * 840,
  a: rand(i * 3.3) * Math.PI,
  mol: rand(i * 5.9) > 0.35,
  v: 0.3 + rand(i * 1.7),
})).filter((g) => Math.hypot(g.x - ATOM_C.x, g.y - ATOM_C.y) > 140);

export const Hook: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  // zoom-through: lab (tabung) → plasma → satu atom
  const z1 = ramp(t, cue(6) - 0.5, cue(6) + 1.1, EASE_IN);
  const z2 = ramp(t, cue(6) + 0.7, cue(6) + 2.6, EASE_IN_OUT);
  const s1 = Math.exp(z1 * Math.log(30));
  const stage1 = 1 - ramp(z1, 0.55, 1);
  const gas = ramp(z1, 0.45, 0.9) * (1 - ramp(z2, 0.75, 1));
  const s2 = Math.exp(z2 * Math.log(14));
  const hud = win(t, cue(6) - 0.4, cue(7) + 0.4, 0.4, 0.8);
  const expo = Math.round(mix(-1, -10, Math.min(1, 0.45 * z1 + 0.55 * z2)));
  const tube = ramp(t, 0.2, 1.4);
  const on = ramp(t, wordOf(0, 'listrik'), wordOf(0, 'listrik') + 0.5);
  const glow = on * (0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3)) * (0.6 + 0.4 * ramp(t, cue(1), cue(1) + 0.8));
  const beam = ramp(t, cue(2) + 0.2, cue(2) + 1.2);
  const rainbow = win(t, cue(3) - 0.2, cue(4) - 0.2, 0.6, 0.8);
  const lines = BALMER.map((b, i) => ramp(t, cue(4) + 0.6 + i * 0.35, cue(4) + 1.1 + i * 0.35));
  const q = ramp(t, cue(5), cue(5) + 0.6, BACK) * (1 - ramp(t, cue(6) - 0.4, cue(6) + 0.3));
  const atom = ramp(z2, 0.7, 1);
  const tags = ramp(t, cue(7), cue(7) + 0.6, BACK);
  const pink = '#ff6fb5';

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={stage1} transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${s1}) translate(${-FOCUS.x} ${-FOCUS.y})`}>
          {/* tabung gas */}
          <g opacity={tube}>
            <Glow x={(TUBE.x0 + TUBE.x1) / 2} y={TUBE.y} r={420} color="red" opacity={0.35 * glow} />
            <rect x={TUBE.x0} y={TUBE.y - 46} width={TUBE.x1 - TUBE.x0} height={92} rx={46} fill="rgba(180,200,255,0.06)" stroke="#9fb0d8" strokeOpacity={0.5} strokeWidth={3} />
            <rect x={TUBE.x0 + 30} y={TUBE.y - 22} width={TUBE.x1 - TUBE.x0 - 60} height={44} rx={22} fill={pink} opacity={0.85 * glow} filter="url(#glow-strong)" />
            <rect x={TUBE.x0 + 40} y={TUBE.y - 8} width={TUBE.x1 - TUBE.x0 - 80} height={16} rx={8} fill="#fff" opacity={0.55 * glow} />
            {[TUBE.x0 - 26, TUBE.x1 + 6].map((x, i) => (
              <rect key={i} x={x} y={TUBE.y - 30} width={20} height={60} rx={5} fill="#5d6680" />
            ))}
            <path d={`M${TUBE.x0 - 16},${TUBE.y + 30} L${TUBE.x0 - 16},${TUBE.y + 150} L${TUBE.x1 + 16},${TUBE.y + 150} L${TUBE.x1 + 16},${TUBE.y + 30}`} fill="none" stroke={C.muted} strokeWidth={3} />
            <rect x={(TUBE.x0 + TUBE.x1) / 2 - 60} y={TUBE.y + 128} width={120} height={44} rx={8} fill="#141b33" stroke={C.gold} strokeWidth={2} />
            <Label x={(TUBE.x0 + TUBE.x1) / 2} y={TUBE.y + 150} size={22} color={C.gold} font="mono">
              ~ 5 kV
            </Label>
            <Label x={(TUBE.x0 + TUBE.x1) / 2} y={TUBE.y - 92} size={30} color={C.ink} weight={600} opacity={ramp(t, wordOf(0, 'hidrogen'), wordOf(0, 'hidrogen') + 0.5)}>
              H₂
            </Label>
          </g>
          {/* berkas menuju prisma */}
          <line x1={TUBE.x1 + 30} y1={TUBE.y} x2={mix(TUBE.x1 + 30, PRISM.x - 40, beam)} y2={TUBE.y} stroke={pink} strokeWidth={10} opacity={0.7 * beam} filter="url(#glow)" />
          <g opacity={beam}>
            <path d={`M${PRISM.x},${PRISM.y - 130} L${PRISM.x + 115},${PRISM.y + 80} L${PRISM.x - 115},${PRISM.y + 80} Z`} fill="rgba(170,200,255,0.12)" stroke="#cfe0ff" strokeOpacity={0.7} strokeWidth={3} />
            <Label x={PRISM.x} y={PRISM.y + 120} size={24} color={C.muted}>
              prisma
            </Label>
          </g>
          {/* pelangi utuh (yang TIDAK terlihat) */}
          <g opacity={rainbow}>
            {Array.from({length: 40}, (_, i) => {
              const nm = 390 + (i / 39) * 310;
              return <line key={i} x1={PRISM.x + 40} y1={PRISM.y} x2={SCREEN.x} y2={wlY(nm)} stroke={wlColor(nm)} strokeWidth={3} opacity={0.35} />;
            })}
            <rect x={SCREEN.x} y={SCREEN.y0} width={70} height={SCREEN.y1 - SCREEN.y0} fill="url(#rainbow-v)" opacity={0.85} />
            <line x1={SCREEN.x - 20} y1={SCREEN.y0 - 20} x2={SCREEN.x + 90} y2={SCREEN.y1 + 20} stroke={C.red} strokeWidth={8} opacity={ramp(t, cue(3) + 1.2, cue(3) + 1.6)} />
          </g>
          {/* layar */}
          <rect x={SCREEN.x} y={SCREEN.y0} width={70} height={SCREEN.y1 - SCREEN.y0} rx={6} fill="#0b1022" stroke={C.faint} strokeWidth={2} opacity={beam} />
          {BALMER.map((b, i) => {
            const y = wlY(b.nm);
            const col = wlColor(b.nm);
            return (
              <g key={b.ni} opacity={lines[i]}>
                <line x1={PRISM.x + 40} y1={PRISM.y} x2={SCREEN.x} y2={y} stroke={col} strokeWidth={4} opacity={0.6} />
                <rect x={SCREEN.x + 4} y={y - 4} width={62} height={8} fill={col} filter="url(#glow)" />
                <Glow x={SCREEN.x + 35} y={y} r={70} color="white" opacity={0.15} />
              </g>
            );
          })}
          <text x={1760} y={500} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={800} fontSize={190} fill={C.gold} opacity={q} style={{scale: String(0.7 + 0.3 * q)}}>
            ?
          </text>
        </g>
        {/* plasma: molekul H₂ dan atom H */}
        <g opacity={gas} transform={`translate(${ATOM_C.x} ${ATOM_C.y}) scale(${s2}) translate(${-ATOM_C.x} ${-ATOM_C.y})`}>
          <circle cx={ATOM_C.x} cy={ATOM_C.y} r={900} fill="url(#soft-red)" opacity={0.18} />
          {GAS.map((g, i) => {
            const x = g.x + Math.sin(t * g.v + i) * 20;
            const y = g.y + Math.cos(t * g.v * 0.8 + i) * 16;
            const a = g.a + t * g.v;
            return g.mol ? (
              <g key={i}>
                <circle cx={x - 7 * Math.cos(a)} cy={y - 7 * Math.sin(a)} r={6} fill="#f2f5ff" opacity={0.8} />
                <circle cx={x + 7 * Math.cos(a)} cy={y + 7 * Math.sin(a)} r={6} fill="#f2f5ff" opacity={0.8} />
              </g>
            ) : (
              <circle key={i} cx={x} cy={y} r={6} fill="#ffd2ec" opacity={0.9} filter="url(#glow)" />
            );
          })}
          <circle cx={ATOM_C.x} cy={ATOM_C.y} r={7} fill="#ffd2ec" filter="url(#glow)" />
          <circle cx={ATOM_C.x} cy={ATOM_C.y} r={20} fill="url(#soft-cyan)" opacity={0.6} />
        </g>
        {/* HUD skala ala SCIENTIAN */}
        <g opacity={hud}>
          <line x1={110} y1={860} x2={330} y2={860} stroke={C.gold} strokeWidth={3} />
          <line x1={110} y1={850} x2={110} y2={870} stroke={C.gold} strokeWidth={3} />
          <line x1={330} y1={850} x2={330} y2={870} stroke={C.gold} strokeWidth={3} />
          <text x={110} y={830} fontFamily={FONT.mono} fontSize={30} fill={C.gold}>
            ≈ 10
            <tspan dy={-14} fontSize={20}>
              {expo}
            </tspan>
            <tspan dy={14}> m</tspan>
          </text>
          <text x={110} y={790} fontFamily={FONT.mono} fontSize={18} letterSpacing={3} fill={C.muted}>
            {expo > -3 ? 'TABUNG LUCUTAN' : expo > -9 ? 'GAS H₂ DAN ATOM H' : 'SATU ATOM H'}
          </text>
        </g>
        {/* atom paling sederhana */}
        <g opacity={atom}>
          <OrbitalCloud id="1s" x={960} y={470} size={300 * (0.6 + 0.4 * atom)} yaw={t * 0.2} p={atom} dot={2.4} neg={C.cyan} pos={C.cyan} opacity={0.75} />
          <Nucleus x={960} y={470} r={22} label="p⁺" />
          {(() => {
            const a = t * 1.7;
            const ex = 960 + 150 * Math.cos(a) + 40 * rand(Math.floor(t * 8));
            const ey = 470 + 110 * Math.sin(a * 1.3) - 30 * rand(Math.floor(t * 8) + 3);
            return <Electron x={ex} y={ey} r={11} />;
          })()}
          <g opacity={tags}>
            <Label x={900} y={470} size={30} color={C.red} weight={700} anchor="end">
              1 proton
            </Label>
            <Label x={1260} y={300} size={30} color={C.cyan} weight={700}>
              1 elektron
            </Label>
          </g>
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
