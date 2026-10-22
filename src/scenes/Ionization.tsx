import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {Arrow, Card, Glow, Label, Stage, V} from '../components/primitives';
import {En, Electron} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const TOP = 240;
const BOT = 820;
const COLS = [C.gold, C.cyan, C.violet, C.mint, C.pink];

export const Ionization: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const show = ramp(t, cue(0) - 0.4, cue(0) + 1);
  const sc = ramp(t, cue(5) - 0.2, cue(5) + 1.4, EASE_IN_OUT);
  const virial = ramp(t, cue(7) - 0.3, cue(7) + 0.9);
  // skala: H saja (−14…+1 eV) → bersama He⁺ (−56…+1 eV)
  const k = mix((BOT - TOP) / 15, (BOT - TOP) / 57, sc);
  const eY = (e: number) => TOP + (1 - e) * k;
  const hx = mix(260, 220, sc);
  const hw = mix(560, 420, sc);
  const lift = ramp(t, cue(1) + 0.4, cue(1) + 2.6, EASE_IN_OUT);
  const iLab = ramp(t, cue(2), cue(2) + 0.6, BACK);
  const kj = ramp(t, cue(3), cue(3) + 0.6, BACK);
  const n2 = ramp(t, cue(4), cue(4) + 1, EASE_IN_OUT);
  const he = ramp(t, cue(5) + 0.4, cue(5) + 1.6) * (1 - virial);
  const warn = ramp(t, cue(6), cue(6) + 0.7, BACK) * (1 - virial);
  const bars = [ramp(t, wordOf(7, 'kinetik'), wordOf(7, 'kinetik') + 1, EASE_IN_OUT), ramp(t, wordOf(7, 'potensialnya'), wordOf(7, 'potensialnya') + 1, EASE_IN_OUT)];

  const ladder = (x: number, w: number, Z: number, op: number, name: string) => (
    <g opacity={op}>
      <rect x={x} y={TOP - 40} width={w} height={eY(0) - TOP + 40} fill={C.ink} opacity={0.04} />
      <line x1={x} y1={eY(0)} x2={x + w} y2={eY(0)} stroke={C.ink} strokeWidth={2} strokeDasharray="10 8" />
      <Label x={x + w / 2} y={TOP - 14} size={22} color={C.muted}>
        elektron bebas (E &gt; 0)
      </Label>
      {[1, 2, 3, 4, 5].map((n, i) => (
        <g key={n}>
          <line x1={x} y1={eY(En(n, Z))} x2={x + w} y2={eY(En(n, Z))} stroke={COLS[i]} strokeWidth={i < 2 ? 5 : 3} />
          {i < 2 ? (
            <Label x={x - 16} y={eY(En(n, Z))} size={24} color={COLS[i]} anchor="end" font="serif" italic>
              n = {n}
            </Label>
          ) : null}
        </g>
      ))}
      <Label x={x + w / 2} y={BOT + 40} size={34} weight={700} color={C.ink}>
        {name}
      </Label>
    </g>
  );

  const ey = mix(eY(En(1)), eY(0.6), lift);
  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={show}>
          {ladder(hx, hw, 1, 1, 'H')}
          {/* elektron terlepas */}
          <Electron x={hx + hw * 0.35 + 60 * lift} y={ey} r={12} opacity={1 - ramp(t, cue(4) - 0.4, cue(4))} />
          <g opacity={ramp(t, cue(1) + 0.8, cue(1) + 1.4)}>
            <Arrow x1={hx + hw * 0.62} y1={eY(En(1)) - 6} x2={hx + hw * 0.62} y2={eY(0) + 8} color="gold" width={5} />
            <Label x={hx + hw * 0.62 + 18} y={(eY(En(1)) + eY(0)) / 2} size={30} color={C.gold} anchor="start" weight={700} opacity={iLab}>
              13,6 eV
            </Label>
            <Label x={hx + hw * 0.62 + 18} y={(eY(En(1)) + eY(0)) / 2 + 40} size={24} color={C.gold} anchor="start" opacity={kj * (1 - sc)}>
              ≈ 1312 kJ/mol
            </Label>
          </g>
          <g opacity={n2}>
            <Arrow x1={hx + hw * 0.85} y1={eY(En(2)) - 6} x2={hx + hw * 0.85} y2={eY(0) + 8} color="cyan" width={5} />
            <Label x={hx + hw * 0.85 + 16} y={(eY(En(2)) + eY(0)) / 2} size={24} color={C.cyan} anchor="start" weight={700}>
              3,4 eV
            </Label>
          </g>
          {/* He⁺ */}
          <g opacity={he}>
            {ladder(1010, 420, 2, 1, 'He⁺')}
            <Arrow x1={1010 + 420 * 0.62} y1={eY(En(1, 2)) - 6} x2={1010 + 420 * 0.62} y2={eY(0) + 8} color="red" width={5} />
            <Label x={1010 + 420 * 0.62 + 18} y={(eY(En(1, 2)) + eY(0)) / 2} size={30} color={C.red} anchor="start" weight={700}>
              54,4 eV
            </Label>
            <Label x={1010 + 420 * 0.62 + 18} y={(eY(En(1, 2)) + eY(0)) / 2 + 40} size={24} color={C.red} anchor="start">
              = 4 × 13,6
            </Label>
          </g>
          {/* teorema virial */}
          <g opacity={virial}>
            {(() => {
              const base = 520;
              const kk = 10;
              const bx = 1060;
              return (
                <g>
                  <line x1={bx - 40} y1={base} x2={bx + 640} y2={base} stroke={C.ink} strokeWidth={2} />
                  <Label x={bx - 50} y={base} size={22} color={C.muted} anchor="end">
                    0
                  </Label>
                  <rect x={bx} y={base - 13.6 * kk * bars[0]} width={150} height={13.6 * kk * bars[0]} fill={C.gold} opacity={0.85} />
                  <rect x={bx + 230} y={base} width={150} height={27.2 * kk * bars[1]} fill={C.red} opacity={0.85} />
                  <rect x={bx + 460} y={base} width={150} height={13.6 * kk * bars[1]} fill={C.cyan} opacity={0.85 * bars[1]} />
                  <Label x={bx + 75} y={base - 13.6 * kk - 28} size={26} color={C.gold} weight={700} opacity={bars[0]}>
                    ⟨T⟩ = +13,6
                  </Label>
                  <Label x={bx + 305} y={base + 27.2 * kk + 28} size={26} color={C.red} weight={700} opacity={bars[1]}>
                    ⟨V⟩ = −27,2
                  </Label>
                  <Label x={bx + 535} y={base + 13.6 * kk + 28} size={26} color={C.cyan} weight={700} opacity={bars[1]}>
                    E = −13,6 eV
                  </Label>
                </g>
              );
            })()}
          </g>
        </g>
        <Glow x={hx + hw * 0.62} y={eY(0)} r={80} color="gold" opacity={0.5 * ramp(t, cue(1) + 2.2, cue(1) + 2.8) * (1 - n2)} />
      </Stage>
      <Card x={1450} y={330} opacity={iLab * (1 - sc)} accent={C.gold}>
        <div style={{fontSize: 44}}>
          <V>I</V>
          <sub style={{fontSize: 24}}>n</sub> = −<V>E</V>
          <sub style={{fontSize: 24}}>n</sub> = 13,6 eV · <V>Z</V>² / <V>n</V>²
        </div>
      </Card>
      <Card x={1450} y={520} opacity={kj * (1 - sc)} accent={C.gold} style={{fontSize: 30}}>
        13,6 eV × 96,485 kJ mol⁻¹ eV⁻¹ ≈ <b style={{color: C.gold}}>1312 kJ/mol</b>
      </Card>
      <Card x={1700} y={360} opacity={he * ramp(t, wordOf(5, 'empat'), wordOf(5, 'empat') + 0.6, BACK)} accent={C.red} anchor="right" style={{fontSize: 32}}>
        <V>Z</V> = 2 → <V>Z</V>² = 4
      </Card>
      <Card x={1700} y={520} opacity={warn} accent={C.red} anchor="right" style={{fontSize: 26}}>
        <div style={{color: C.red, fontWeight: 700}}>⚠ bukan He netral</div>
        <div>He netral (2 elektron): I₁ ≈ 24,6 eV</div>
      </Card>
      <div style={{position: 'absolute', left: 1020, top: 250, fontFamily: FONT.sans, fontSize: 30, color: C.ink, fontWeight: 600, opacity: virial}}>
        Teorema virial (Coulomb): ⟨T⟩ = −E, ⟨V⟩ = 2E
      </div>
    </AbsoluteFill>
  );
};
