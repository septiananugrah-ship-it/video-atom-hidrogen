import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {Card, Formula, Frac, Glow, Label, NuTilde, Stage, Sub, Sup, V} from '../components/primitives';
import {wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Data garis Lyman dari modul (Contoh 15): x = 1 − 1/n², ν̃ (cm⁻¹).
const DATA: [number, number, number][] = [
  [2, 0.75, 82259],
  [3, 0.888889, 97492],
  [4, 0.9375, 102824],
  [5, 0.96, 105292],
  [6, 0.972222, 106632],
  [7, 0.979592, 107440],
];
const R_FIT = 109678.71;
const BOX = {x: 210, y: 790, w: 760, h: 540};
const X = (x: number) => BOX.x + x * BOX.w;
const Y = (v: number) => BOX.y - (v / 115000) * BOX.h;
// panel zoom Balmer-α (panjang gelombang vakum)
const Z = {x0: 1080, x1: 1740, y: 700, l0: 655.9, l1: 656.8};
const zX = (nm: number) => mix(Z.x0, Z.x1, (nm - Z.l0) / (Z.l1 - Z.l0));
const H_A = 656.47;
const D_A = H_A - 0.179;

export const Fit: React.FC = () => {
  const {t, cue} = useScene();
  const axes = ramp(t, 0.1, 1.2);
  const pts = DATA.map((_, i) => ramp(t, cue(1) + i * 0.25, cue(1) + i * 0.25 + 0.5, BACK));
  const xlab = ramp(t, cue(2), cue(2) + 0.6);
  const line = ramp(t, cue(3), cue(3) + 1.4, EASE_IN_OUT);
  const slopeC = ramp(t, cue(4), cue(4) + 0.7);
  const ion = ramp(t, cue(5), cue(5) + 0.7);
  const B = ramp(t, cue(6) - 0.3, cue(6) + 0.8);
  const muC = ramp(t, cue(7), cue(7) + 0.7);
  const shift = ramp(t, cue(8), cue(8) + 1.6, EASE_IN_OUT);
  const urey = ramp(t, cue(9), cue(9) + 0.7, BACK);
  const fade = 1 - 0.65 * B;
  // garis 'mencari' kemiringan terbaik (osilasi teredam menuju R)
  const fitp = ramp(t, cue(3), cue(3) + 2.8);
  const slope = R_FIT * (1 + 0.32 * Math.exp(-3.2 * fitp) * Math.cos(fitp * Math.PI * 3.5) * (fitp < 1 ? 1 : 0));
  const sse = DATA.reduce((acc, [, x, v]) => acc + (v - slope * x) ** 2, 0);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={axes * fade}>
          <line x1={BOX.x} y1={BOX.y} x2={BOX.x + BOX.w + 20} y2={BOX.y} stroke={C.muted} strokeWidth={2} />
          <line x1={BOX.x} y1={BOX.y + 10} x2={BOX.x} y2={BOX.y - BOX.h - 20} stroke={C.muted} strokeWidth={2} />
          {[0, 0.25, 0.5, 0.75, 1].map((x) => (
            <Label key={x} x={X(x)} y={BOX.y + 26} size={20} color={C.faint} font="mono">
              {String(x).replace('.', ',')}
            </Label>
          ))}
          {[0, 50000, 100000].map((v) => (
            <Label key={v} x={BOX.x - 14} y={Y(v)} size={20} color={C.faint} anchor="end" font="mono">
              {v === 0 ? '0' : `${v / 1000}k`}
            </Label>
          ))}
          <Label x={BOX.x - 10} y={BOX.y - BOX.h - 44} size={24} color={C.muted} anchor="start">
            bilangan gelombang (cm⁻¹)
          </Label>
          <Label x={X(0.5)} y={BOX.y + 64} size={26} color={C.cyan} opacity={xlab}>
            x = 1 − 1/nᵢ²
          </Label>
          <line x1={X(0)} y1={Y(0)} x2={mix(X(0), X(1.02), line)} y2={mix(Y(0), Y(slope * 1.02), line)} stroke={C.gold} strokeWidth={4} filter="url(#glow)" />
          {/* sisa (residual) tiap titik */}
          {DATA.map(([n, x, v]) => (
            <line key={`r${n}`} x1={X(x)} y1={Y(v)} x2={X(x)} y2={Y(slope * x)} stroke={C.red} strokeWidth={3} opacity={line * (1 - ramp(t, cue(3) + 2.6, cue(3) + 3.2))} />
          ))}
          <g opacity={line * (1 - ramp(t, cue(4), cue(4) + 0.6))}>
            <Label x={X(0.05)} y={Y(108000)} size={24} color={C.red} anchor="start" weight={600}>
              jumlah kuadrat sisa
            </Label>
            <rect x={X(0.05)} y={Y(104000)} width={Math.min(330, 330 * Math.sqrt(sse / 6.0e8))} height={16} rx={8} fill={C.red} opacity={0.8} />
          </g>
          {DATA.map(([n, x, v], i) => (
            <g key={n} opacity={pts[i]}>
              <circle cx={X(x)} cy={Y(v)} r={11} fill={C.cyan} stroke="#fff" strokeWidth={2} />
              {i < 2 ? (
                <Label x={X(x) - 18} y={Y(v) - 4} size={20} color={C.cyan} anchor="end" font="mono">
                  {`${n}→1`}
                </Label>
              ) : null}
            </g>
          ))}
          <Glow x={X(0)} y={Y(0)} r={36} color="gold" opacity={line} />
          <Label x={X(0.32)} y={Y(R_FIT * 0.32) - 40} size={28} color={C.gold} weight={700} opacity={slopeC}>
            kemiringan = R
          </Label>
        </g>
        {/* zoom Balmer-α H vs D */}
        <g opacity={B}>
          <rect x={Z.x0 - 20} y={Z.y - 150} width={Z.x1 - Z.x0 + 40} height={190} rx={14} fill="#060914" stroke={C.faint} strokeWidth={2} />
          {[656.0, 656.2, 656.4, 656.6, 656.8].map((nm) => (
            <Label key={nm} x={zX(nm)} y={Z.y + 64} size={18} color={C.faint} font="mono">
              {nm.toFixed(1).replace('.', ',')}
            </Label>
          ))}
          <Label x={(Z.x0 + Z.x1) / 2} y={Z.y - 176} size={24} color={C.ink} weight={600}>
            Balmer-α (3 → 2), panjang gelombang vakum (nm)
          </Label>
          <rect x={zX(H_A) - 4} y={Z.y - 130} width={8} height={150} fill={wlColor(656)} filter="url(#glow)" />
          <Label x={zX(H_A) + 14} y={Z.y - 112} size={24} color={C.ink} anchor="start" weight={700}>
            H
          </Label>
          <g opacity={shift}>
            <rect x={zX(mix(H_A, D_A, shift)) - 4} y={Z.y - 130} width={8} height={150} fill={C.violet} filter="url(#glow)" />
            <Label x={zX(D_A) - 14} y={Z.y - 112} size={24} color={C.violet} anchor="end" weight={700}>
              D
            </Label>
            <line x1={zX(D_A)} y1={Z.y + 30} x2={zX(H_A)} y2={Z.y + 30} stroke={C.gold} strokeWidth={3} />
            <Label x={(zX(D_A) + zX(H_A)) / 2} y={Z.y - 10} size={22} color={C.gold} font="mono" weight={700}>
              0,179 nm
            </Label>
          </g>
        </g>
      </Stage>
      <Formula x={1420} y={330} p={xlab * (1 - slopeC)} accent={C.cyan} caption={<>deret Lyman (n<sub>f</sub> = 1): semua titik (x, bilangan gelombang) segaris</>}>
        <NuTilde />&nbsp;=&nbsp;<V>R</V>&nbsp;
        <span style={{fontSize: '1.25em'}}>(</span>1&nbsp;−&nbsp;<Frac n="1" d={<><V>n</V><Sub>i</Sub><Sup>2</Sup></>} />
        <span style={{fontSize: '1.25em'}}>)</span>&nbsp;=&nbsp;<V>R</V>
        <V color={C.cyan}>x</V>
      </Formula>
      <Formula x={1420} y={330} p={slopeC * (1 - ion)} accent={C.gold} caption="kuadrat terkecil melalui titik asal">
        <V>R</V>&nbsp;=&nbsp;<Frac n={<>Σ <V>x</V><Sub>i</Sub><NuTilde /><Sub>i</Sub></>} d={<>Σ <V>x</V><Sub>i</Sub><Sup>2</Sup></>} />
        &nbsp;≈&nbsp;<b style={{color: C.gold, fontFamily: 'Outfit, sans-serif', fontSize: '0.8em'}}>109 678,7 cm⁻¹</b>
      </Formula>
      <Formula x={1420} y={330} p={ion * (1 - B)} accent={C.gold} caption="≈ 1312 kJ/mol">
        <V>I</V>&nbsp;=&nbsp;<V>h</V>
        <V>c</V>
        <V>R</V>&nbsp;≈&nbsp;<b style={{color: C.gold, fontFamily: 'Outfit, sans-serif'}}>13,598 eV</b>
      </Formula>
      <Formula x={1420} y={330} p={B * (1 - muC)} accent={C.violet} size={50} caption="garis Balmer deuterium, cara yang sama">
        <V>R</V>
        <Sub>D</Sub>&nbsp;≈&nbsp;109 710,8 cm⁻¹&nbsp;→&nbsp;<V>I</V>
        <Sub>D</Sub>&nbsp;≈&nbsp;13,602 eV
      </Formula>
      <Formula x={1420} y={330} p={B * muC} accent={C.violet} caption="inti lebih berat → μ lebih besar → R sedikit lebih besar">
        <V>R</V>
        <Sub>μ</Sub>&nbsp;=&nbsp;<Frac n={<><V>R</V><Sub>∞</Sub></>} d={<>1 + <Frac n={<><V>m</V><Sub>e</Sub></>} d={<><V>m</V><Sub>N</Sub></>} size={0.8} /></>} />
      </Formula>
      <Card x={590} y={300} opacity={urey} accent={C.gold} style={{fontSize: 26}}>
        <div style={{color: C.gold, fontWeight: 700}}>Urey, Brickwedde &amp; Murphy (1932)</div>
        <div>deuterium ditemukan dari garis Balmer yang bergeser</div>
      </Card>
    </AbsoluteFill>
  );
};
