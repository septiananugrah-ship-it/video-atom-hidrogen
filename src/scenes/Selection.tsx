import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Glow, Label, Part, Stage, Sub, V} from '../components/primitives';
import {PhotonPacket} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Diagram Grotrian: kolom s, p, d, f. Sumbu energi digambar tidak linear (∝ 1/n) agar terbaca.
const COLX = [520, 860, 1200, 1540];
const SUB = ['s', 'p', 'd', 'f'];
const lvY = (n: number) => 210 + 540 / n;
const HALF = 110;

type Tr = {from: [number, number]; to: [number, number]; ok: boolean};
const arrowPts = (tr: Tr, p: number) => {
  const x1 = COLX[tr.from[1]];
  const y1 = lvY(tr.from[0]);
  const x2 = COLX[tr.to[1]];
  const y2 = lvY(tr.to[0]);
  // geser sedikit agar panah dari level yang sama tidak bertumpuk
  return {x1, y1, x2: mix(x1, x2, p), y2: mix(y1, y2, p)};
};

const TrArrow: React.FC<{tr: Tr; p: number; label?: string; dx?: number; at?: number}> = ({tr, p, label, dx = 0, at = 0.5}) => {
  if (p <= 0) return null;
  const a = arrowPts(tr, p);
  const col = tr.ok ? C.mint : C.red;
  return (
    <g>
      <line
        x1={a.x1 + dx}
        y1={a.y1}
        x2={a.x2 + dx}
        y2={a.y2}
        stroke={col}
        strokeWidth={tr.ok ? 6 : 5}
        strokeDasharray={tr.ok ? undefined : '14 10'}
        markerEnd={`url(#arrow-${tr.ok ? 'mint' : 'red'})`}
        filter={tr.ok ? 'url(#glow)' : undefined}
      />
      {label && p > 0.9 ? (
        <Label x={mix(a.x1, a.x2, at) + dx + (tr.ok ? 26 : -26)} y={mix(a.y1, a.y2, at)} size={26} color={col} weight={700} anchor={tr.ok ? 'start' : 'end'}>
          {label}
        </Label>
      ) : null}
    </g>
  );
};

export const Selection: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const A = win(t, cue(0) - 0.4, cue(4) - 0.4, 0.8, 0.7);
  const photon = ramp(t, 0.2, 1.2);
  const rule1 = ramp(t, cue(2), cue(2) + 0.8, BACK);
  const rule2 = ramp(t, cue(3), cue(3) + 0.8, BACK);
  const B = ramp(t, cue(4) - 0.4, cue(4) + 0.8);
  const cols = SUB.map((_, i) => ramp(t, cue(4) + 0.4 + i * 0.3, cue(4) + 1 + i * 0.3));
  const a2p = ramp(t, cue(5), cue(5) + 1, EASE_IN_OUT);
  const a2s = ramp(t, cue(6), cue(6) + 1, EASE_IN_OUT);
  const a3d2p = ramp(t, cue(7), cue(7) + 1, EASE_IN_OUT);
  const a3d1s = ramp(t, wordOf(7, 'tetapi'), wordOf(7, 'tetapi') + 1, EASE_IN_OUT);
  const nfree = ramp(t, cue(8) + 0.4, cue(8) + 1.4, EASE_IN_OUT);
  const two = ramp(t, cue(9) + 1, cue(9) + 2.5);
  const spin = (t - cue(1)) * 3;

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== foton membawa momentum sudut ===== */}
        <g opacity={A}>
          <PhotonPacket x={720} y={420} wavelength={46} color={C.gold} amp={34} len={460} phase={-t * 10} opacity={photon} />
          <g opacity={photon}>
            <ellipse cx={1020} cy={420} rx={70} ry={26} fill="none" stroke={C.gold} strokeWidth={4} />
            <circle cx={1020 + 70 * Math.cos(spin)} cy={420 + 26 * Math.sin(spin)} r={9} fill={C.gold} />
            <line x1={1020} y1={420} x2={1020} y2={300} stroke={C.gold} strokeWidth={5} markerEnd="url(#arrow-gold)" />
            <Label x={1060} y={300} size={32} color={C.gold} anchor="start" font="serif" italic>
              1 ħ
            </Label>
            <Label x={860} y={540} size={28} color={C.muted}>
              foton = 1 satuan momentum sudut
            </Label>
          </g>
        </g>
        {/* ===== diagram Grotrian ===== */}
        <g opacity={B}>
          {SUB.map((s, l) => (
            <g key={s} opacity={cols[l]}>
              <Label x={COLX[l]} y={830} size={40} color={C.ink} weight={700}>
                {s}
              </Label>
              <Label x={COLX[l]} y={790} size={20} color={C.muted} font="serif" italic>
                ℓ = {l}
              </Label>
              {[1, 2, 3, 4]
                .filter((n) => n > l)
                .map((n) => (
                  <g key={n}>
                    <line x1={COLX[l] - HALF / 2} y1={lvY(n)} x2={COLX[l] + HALF / 2} y2={lvY(n)} stroke={C.ink} strokeWidth={4} />
                    <Label x={COLX[l] - HALF / 2 - 12} y={lvY(n)} size={22} color={C.muted} anchor="end">
                      {`${n}${s}`}
                    </Label>
                  </g>
                ))}
            </g>
          ))}
          <Label x={230} y={lvY(4) - 60} size={20} color={C.faint} anchor="start" opacity={cols[0]}>
            E (skala tidak linear)
          </Label>
          <TrArrow tr={{from: [2, 1], to: [1, 0], ok: true}} p={a2p} label="✓ Lyman-α" dx={0} />
          <TrArrow tr={{from: [2, 0], to: [1, 0], ok: false}} p={a2s * (1 - two)} label="✗ Δℓ = 0" dx={-30} />
          <TrArrow tr={{from: [3, 2], to: [2, 1], ok: true}} p={a3d2p} label="✓" dx={0} at={0.35} />
          <TrArrow tr={{from: [3, 2], to: [1, 0], ok: false}} p={a3d1s} label="✗ Δℓ = −2" dx={0} at={0.18} />
          <TrArrow tr={{from: [4, 1], to: [1, 0], ok: true}} p={nfree} label="✓ 4p → 1s: Δn = 3" dx={30} at={0.12} />
          <TrArrow tr={{from: [3, 1], to: [2, 0], ok: true}} p={nfree} dx={0} />
          {/* 2s meluruh dua foton */}
          <g opacity={two}>
            <Glow x={COLX[0] - 30} y={(lvY(2) + lvY(1)) / 2} r={80} color="violet" opacity={0.5} />
            <PhotonPacket x={COLX[0] - 160} y={(lvY(2) + lvY(1)) / 2 - 30} wavelength={30} color={C.violet} amp={16} len={150} phase={-t * 10} angle={200} />
            <PhotonPacket x={COLX[0] - 160} y={(lvY(2) + lvY(1)) / 2 + 30} wavelength={30} color={C.violet} amp={16} len={150} phase={-t * 10} angle={160} />
            <line x1={COLX[0] - 30} y1={lvY(2)} x2={COLX[0] - 30} y2={lvY(1) - 10} stroke={C.violet} strokeWidth={4} strokeDasharray="4 6" />
            <Label x={COLX[0] - 160} y={(lvY(2) + lvY(1)) / 2 + 90} size={22} color={C.violet}>
              2s → 1s: dua foton, τ ≈ 0,12 dtk
            </Label>
          </g>
        </g>
      </Stage>
      <Formula x={960} y={700} p={A * rule1} accent={C.mint} caption="aturan seleksi dipol listrik (satu foton)">
        Δ<V>ℓ</V>&nbsp;=&nbsp;±1
        <Part p={rule2}>
          <span style={{margin: '0 40px', color: C.faint}}>·</span>Δ<V>m</V>
          <Sub>ℓ</Sub>&nbsp;=&nbsp;0, ±1
        </Part>
      </Formula>
      <Formula
        x={1860}
        y={225}
        anchor="right"
        size={52}
        p={B * ramp(t, cue(4) + 0.6, cue(4) + 1.4)}
        accent={C.mint}
        caption={
          <span style={{opacity: nfree, color: C.gold, fontSize: 40, fontFamily: 'Source Serif 4, serif'}}>
            Δ<i>n</i> bebas
          </span>
        }
      >
        Δ<V>ℓ</V>&nbsp;=&nbsp;±1
      </Formula>
    </AbsoluteFill>
  );
};
