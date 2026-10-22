import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {DrawPath, Formula, Frac, Glow, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {En, plotPath} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Diagram tingkat energi (skala linear eV).
const D = {x0: 180, x1: 820, top: 230, bottom: 820};
const eY = (e: number) => mix(D.bottom, D.top, (e + 14.2) / 15.2);
const LV = [1, 2, 3, 4, 5, 6, 7, 8];
const COLS = [C.gold, C.cyan, C.violet, C.mint, C.pink, C.blue, C.amber, C.muted];

export const Quant: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  // Fase A: deret & syarat berhenti (baris 0–4)
  const A = win(t, cue(1) - 0.4, cue(5) - 0.4, 0.8, 0.7);
  const q = ramp(t, cue(0), cue(0) + 0.6, BACK) * (1 - ramp(t, cue(1) - 0.3, cue(1)));
  const series = ramp(t, cue(1), cue(1) + 0.8, BACK);
  const blow = ramp(t, cue(2), cue(2) + 2, EASE_IN_OUT);
  const stop = ramp(t, cue(3), cue(3) + 1.6, EASE_IN_OUT);
  const nCard = ramp(t, cue(4), cue(4) + 0.8);
  const rec = ramp(t, cue(2), cue(2) + 0.8);
  const nums = [wordOf(4, 'satu'), wordOf(4, 'dua'), wordOf(4, 'tiga')].map((w) => ramp(t, w, w + 0.4, BACK));
  // Fase B: diagram energi (baris 5–9)
  const B = ramp(t, cue(5) - 0.4, cue(5) + 0.6);
  const formula = ramp(t, cue(5), cue(5) + 0.8, BACK);
  const lvTimes = [wordOf(6, 'satu'), wordOf(6, 'dua'), wordOf(6, 'tiga', 2)];
  const cont = ramp(t, wordOf(7, 'ionisasi') - 0.3, wordOf(7, 'ionisasi') + 0.8);
  const bohr = ramp(t, cue(8), cue(8) + 0.8, BACK) * (1 - ramp(t, cue(9) - 0.3, cue(9) + 0.3));
  const cross = ramp(t, wordOf(8, 'bukan'), wordOf(8, 'bukan') + 0.5);
  const deg = ramp(t, cue(9), cue(9) + 0.8);
  const PU = {x: 260, y: 700, w: 900, sy: 900};

  return (
    <AbsoluteFill>
      <Stage>
        <text x={960} y={500} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={800} fontSize={220} fill={C.violet} opacity={q}>
          ?
        </text>
        {/* ===== Fase A ===== */}
        <g opacity={A}>
          <line x1={PU.x} y1={PU.y} x2={PU.x + PU.w + 20} y2={PU.y} stroke={C.muted} strokeWidth={2} />
          <line x1={PU.x} y1={PU.y + 20} x2={PU.x} y2={PU.y - 420} stroke={C.muted} strokeWidth={2} />
          <Label x={PU.x + PU.w + 46} y={PU.y} size={26} color={C.muted} font="serif" italic>
            r
          </Label>
          <Label x={PU.x - 34} y={PU.y - 410} size={30} color={C.muted} font="serif" italic>
            u
          </Label>
          {/* deret tak berhenti: meledak */}
          <DrawPath d={plotPath((s) => s * Math.exp(-s) + 0.00035 * Math.exp(0.85 * s), 0, 8.5, PU)} p={blow} stroke={C.red} width={5} glow len={2500} />
          <g opacity={ramp(t, cue(2) + 1.6, cue(2) + 2.2)}>
            <Label x={PU.x + PU.w - 40} y={PU.y - 470} size={30} color={C.red} weight={700} anchor="end">
              ✗ deret tak berhenti → meledak
            </Label>
          </g>
          {/* deret berhenti: meluruh */}
          <DrawPath d={plotPath((s) => s * Math.exp(-s), 0, 10, PU)} p={stop} stroke={C.mint} width={5} glow len={2500} />
          <Label x={PU.x + 560} y={PU.y - 120} size={30} color={C.mint} weight={700} opacity={ramp(t, cue(3) + 1.2, cue(3) + 1.8)}>
            ✓ deret berhenti → meluruh, ternormalisasi
          </Label>
        </g>
        {/* ===== Fase B: tingkat energi ===== */}
        <g opacity={B}>
          <rect x={D.x0} y={D.top - 40} width={D.x1 - D.x0} height={eY(0) - D.top + 40} fill="url(#rainbow-h)" opacity={0.08 * cont} />
          <line x1={D.x0} y1={eY(0)} x2={D.x1} y2={eY(0)} stroke={C.ink} strokeWidth={2} strokeDasharray="10 8" opacity={cont} />
          <Label x={D.x1 + 20} y={eY(0)} size={24} color={C.ink} anchor="start" opacity={cont}>
            0 eV · batas ionisasi
          </Label>
          <Label x={(D.x0 + D.x1) / 2} y={D.top - 10} size={24} color={C.muted} opacity={cont}>
            kontinum: elektron bebas
          </Label>
          <line x1={D.x0 - 30} y1={eY(-14)} x2={D.x0 - 30} y2={eY(0.6)} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <Label x={D.x0 - 30} y={eY(0.9)} size={24} color={C.muted} font="serif" italic>
            E
          </Label>
          {LV.map((n, i) => {
            const p = i < 3 ? Math.max(0.35 * ramp(t, cue(5) + 1.5, cue(5) + 2.5), ramp(t, lvTimes[i] - 0.2, lvTimes[i] + 0.5)) : ramp(t, cue(7) + (i - 3) * 0.25, cue(7) + (i - 3) * 0.25 + 0.6);
            const y = eY(En(n));
            return (
              <g key={n} opacity={p}>
                <line x1={mix((D.x0 + D.x1) / 2, D.x0, p)} y1={y} x2={mix((D.x0 + D.x1) / 2, D.x1, p)} y2={y} stroke={COLS[i]} strokeWidth={i < 3 ? 5 : 3} />
                {i < 3 ? (
                  <Label x={D.x0 - 60} y={y} size={26} color={COLS[i]} anchor="end" font="serif" italic>
                    n = {n}
                  </Label>
                ) : null}
                {i < 3 ? (
                  <Label x={D.x1 + 20} y={y} size={26} color={COLS[i]} anchor="start" font="mono">
                    {En(n).toFixed(i === 2 ? 2 : 1).replace('.', ',').replace('-', '−')} eV
                  </Label>
                ) : null}
              </g>
            );
          })}
          {/* degenerasi n² */}
          <g opacity={deg}>
            <Label x={1440} y={470} size={28} color={C.ink} weight={600}>
              jumlah orbital per kulit = n²
            </Label>
            {[1, 2, 3, 4].map((n, i) => (
              <g key={n} opacity={ramp(t, cue(9) + 0.3 + i * 0.35, cue(9) + 0.8 + i * 0.35)}>
                <Label x={1150} y={540 + i * 75} size={28} color={COLS[i]} anchor="end" font="serif" italic>
                  n = {n}
                </Label>
                {Array.from({length: n * n}, (_, k) => (
                  <rect key={k} x={1180 + k * 34} y={522 + i * 75} width={26} height={36} rx={5} fill={COLS[i]} opacity={0.8} />
                ))}
                <Label x={1190 + n * n * 34} y={540 + i * 75} size={26} color={C.ink} anchor="start" font="mono">
                  {n * n}
                </Label>
              </g>
            ))}
          </g>
          {/* model Bohr vs syarat batas */}
          <g opacity={bohr}>
            <g transform="translate(1290 620)">
              {[50, 110, 190].map((r) => (
                <circle key={r} cx={0} cy={0} r={r} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
              ))}
              <circle cx={0} cy={0} r={10} fill={C.red} />
              <circle cx={110 * Math.cos(t * 1.5)} cy={110 * Math.sin(t * 1.5)} r={9} fill={C.cyan} />
              <line x1={-150} y1={-150} x2={150} y2={150} stroke={C.red} strokeWidth={8} opacity={cross} />
              <line x1={-150} y1={150} x2={150} y2={-150} stroke={C.red} strokeWidth={8} opacity={cross} />
              <Label x={0} y={225} size={24} color={C.muted}>
                lintasan Bohr
              </Label>
            </g>
            <g transform="translate(1620 620)" opacity={cross}>
              <circle cx={0} cy={0} r={130} fill="url(#soft-cyan)" opacity={0.45} />
              <circle cx={0} cy={0} r={10} fill={C.red} />
              <Glow x={0} y={0} r={60} color="mint" opacity={0.3} />
              <Label x={0} y={225} size={24} color={C.mint} weight={600}>
                syarat batas ✓
              </Label>
            </g>
          </g>
        </g>
      </Stage>
      <Formula x={1480} y={290} p={A * series * (1 - rec)} accent={C.violet} caption="solusi radial sebagai deret pangkat">
        <V>u</V>(<V>ρ</V>)&nbsp;=&nbsp;<V>ρ</V>
        <Sup>ℓ+1</Sup>
        <V>e</V>
        <Sup>
          −<Frac n={<V>ρ</V>} d="2" size={0.9} />
        </Sup>
        &nbsp;Σ&nbsp;<V>c</V>
        <Sub>j</Sub>
        <V>ρ</V>
        <Sup>j</Sup>
      </Formula>
      <Formula x={1480} y={290} p={A * rec * (1 - nCard)} accent={C.violet} caption="deret berhenti hanya bila pembilangnya nol">
        <Frac n={<><V>c</V><Sub>j+1</Sub></>} d={<><V>c</V><Sub>j</Sub></>} />
        &nbsp;=&nbsp;
        <Frac n={<><V>j</V> + <V>ℓ</V> + 1 − <V color={C.gold}>η</V></>} d={<>(<V>j</V> + 1)(<V>j</V> + 2<V>ℓ</V> + 2)</>} />
      </Formula>
      <Formula
        x={1480}
        y={290}
        p={A * nCard}
        accent={C.gold}
        caption={
          <span style={{display: 'inline-flex', gap: 26, fontFamily: FONT.mono, fontSize: 40, color: C.gold}}>
            {['1', '2', '3', '…'].map((x, i) => (
              <span key={x} style={{opacity: nums[Math.min(i, 2)], scale: String(0.6 + 0.4 * nums[Math.min(i, 2)])}}>
                {x}
              </span>
            ))}
          </span>
        }
      >
        <V color={C.gold}>η</V>&nbsp;=&nbsp;<V color={C.gold}>n</V>&nbsp;=&nbsp;<V>n</V>
        <Sub>r</Sub>&nbsp;+&nbsp;<V>ℓ</V>&nbsp;+&nbsp;1
      </Formula>
      <Formula x={1480} y={290} p={B * formula} accent={C.gold} caption="energi hanya bergantung pada n (model Coulomb dasar)">
        <V color={C.gold}>E</V>
        <Sub>n</Sub>&nbsp;=&nbsp;−13,6&nbsp;eV&nbsp;·&nbsp;<Frac n={<><V>Z</V><Sup>2</Sup></>} d={<><V>n</V><Sup>2</Sup></>} />
      </Formula>
    </AbsoluteFill>
  );
};
