import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {DrawPath, Formula, Frac, Glow, Label, Part, Stage, Sub, Sup, V} from '../components/primitives';
import {Rnl, plotPath} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const BOX = {x: 230, y: 430, w: 1040, sy: 380};
const S_MAX = 16;
const clampV = (v: number) => Math.max(-1.12, Math.min(0.55, v));
const veff = (l: number) => (s: number) => clampV(-1 / s + (l * (l + 1)) / (2 * s * s));
const X = (s: number) => BOX.x + (s / S_MAX) * BOX.w;
const Y = (v: number) => BOX.y - v * BOX.sy;
const COL = [C.red, C.cyan, C.violet];

export const Veff: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const axes = ramp(t, 0.1, 1.2);
  const coul = ramp(t, cue(1), cue(1) + 1.4, EASE_IN_OUT);
  const cent = ramp(t, wordOf(2, 'sentrifugal'), wordOf(2, 'sentrifugal') + 1.2, EASE_IN_OUT);
  const sum1 = ramp(t, cue(2) + 2.4, cue(2) + 3.6, EASE_IN_OUT);
  const s0 = ramp(t, cue(3), cue(3) + 0.5);
  const l12 = ramp(t, cue(4), cue(4) + 1.4, EASE_IN_OUT);
  const kin = ramp(t, cue(5), cue(5) + 0.7, BACK);
  const pen = ramp(t, cue(6), cue(6) + 1, EASE_IN_OUT);
  // bola l = 0 menggelinding ke inti
  const b0 = ramp(t, cue(3) + 0.4, cue(3) + 2.6, EASE_IN_OUT);
  const s0x = mix(9, 0.95, b0);
  // bola l = 1 memantul di dinding (osilasi di dalam sumur)
  const ph = (t - cue(4)) * 1.8;
  const s1 = 2 + 1.1 * Math.sin(ph) + 0.35;
  const mainFade = 1 - pen;

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={axes * mainFade}>
          <line x1={BOX.x} y1={Y(0)} x2={BOX.x + BOX.w + 20} y2={Y(0)} stroke={C.muted} strokeWidth={2} />
          <line x1={BOX.x} y1={Y(0.6)} x2={BOX.x} y2={Y(-1.15)} stroke={C.muted} strokeWidth={2} />
          <Label x={BOX.x + BOX.w + 50} y={Y(0)} size={26} color={C.muted}>
            r / a
          </Label>
          <Label x={BOX.x - 20} y={Y(0.62)} size={28} color={C.muted} font="serif" italic anchor="end">
            V
          </Label>
          {[4, 8, 12, 16].map((s) => (
            <Label key={s} x={X(s)} y={Y(0) + 26} size={20} color={C.faint}>
              {s}
            </Label>
          ))}
        </g>
        <g opacity={mainFade}>
          {/* Coulomb (l = 0) */}
          <DrawPath d={plotPath(veff(0), 0.9, S_MAX, BOX)} p={coul} stroke={C.red} width={5} glow len={3000} />
          {/* suku sentrifugal l=1 sendiri */}
          <DrawPath d={plotPath((s) => clampV(1 / (s * s)), 1.36, S_MAX, BOX)} p={cent * (1 - sum1 * 0.7)} stroke={C.gold} width={3} dash="10 10" opacity={cent} />
          <DrawPath d={plotPath(veff(1), 0.94, S_MAX, BOX)} p={sum1} stroke={COL[1]} width={5} glow len={3000} />
          <DrawPath d={plotPath(veff(2), 1.68, S_MAX, BOX)} p={l12} stroke={COL[2]} width={5} glow len={3000} />
          {[0, 1, 2].map((l) => {
            const p = [coul, sum1, l12][l];
            const pos = [
              [1.5, -0.85],
              [3.2, -0.38],
              [4.3, 0.14],
            ][l];
            return (
              <Label key={l} x={X(pos[0])} y={Y(pos[1])} size={30} color={COL[l]} font="serif" italic opacity={p} anchor="start">
                ℓ = {l}
              </Label>
            );
          })}
          <Label x={X(1.2)} y={Y(0.45)} size={24} color={C.gold} anchor="start" opacity={cent * (1 - sum1)}>
            ∝ ℓ(ℓ+1)/r² (positif)
          </Label>
          {/* bola-bola */}
          <g opacity={s0 * (1 - l12)}>
            <Glow x={X(s0x)} y={Y(veff(0)(s0x)) - 14} r={40} color="gold" opacity={0.6} />
            <circle cx={X(s0x)} cy={Y(veff(0)(s0x)) - 14} r={14} fill={C.gold} />
            <Label x={X(3)} y={Y(-1.0)} size={26} color={C.red} opacity={b0}>
              s: elektron bisa sampai ke inti
            </Label>
          </g>
          <g opacity={l12}>
            <rect x={X(0.3)} y={Y(0.55)} width={X(1.1) - X(0.3)} height={Y(-0.1) - Y(0.55)} fill={C.violet} opacity={0.12} />
            <Label x={X(1.6)} y={Y(0.3)} size={28} color={C.violet} weight={700} anchor="start">
              dinding sentrifugal
            </Label>
            <Glow x={X(s1)} y={Y(veff(1)(s1)) - 14} r={40} color="cyan" opacity={0.6} />
            <circle cx={X(s1)} cy={Y(veff(1)(s1)) - 14} r={14} fill={C.cyan} />
          </g>
          <circle cx={BOX.x} cy={Y(0)} r={10} fill={C.red} opacity={axes} />
          <Label x={BOX.x + 6} y={Y(0) - 30} size={22} color={C.red} anchor="start" opacity={axes}>
            inti
          </Label>
        </g>
        {/* penetrasi: R(r) ∝ r^ℓ dekat inti */}
        <g opacity={pen}>
          {[
            [3, 0, C.red, '3s'],
            [3, 1, C.cyan, '3p'],
            [3, 2, C.violet, '3d'],
          ].map(([n, l, col, name], i) => {
            const box = {x: 420, y: 780, w: 1080, sy: 3400};
            const f = (s: number) => Math.min(0.13, s * s * Rnl(n as number, l as number, s) ** 2);
            return (
              <g key={i}>
                <DrawPath d={plotPath(f, 0, 24, box)} p={ramp(t, cue(6) + 0.3 + i * 0.4, cue(6) + 1.8 + i * 0.4)} stroke={col as string} width={4} len={3000} />
                <Label x={box.x + 1110} y={780 - 50 - i * 40} size={26} color={col as string} anchor="start">
                  {name as string}
                </Label>
              </g>
            );
          })}
          <line x1={420} y1={780} x2={1520} y2={780} stroke={C.muted} strokeWidth={2} />
          <Label x={420} y={815} size={22} color={C.muted} anchor="start">
            inti
          </Label>
          <Label x={960} y={350} size={30} color={C.ink} weight={600}>
            distribusi radial tingkat n = 3: s paling menembus ke dekat inti
          </Label>
          <rect x={420} y={420} width={170} height={360} fill={C.red} opacity={0.08} />
        </g>
      </Stage>
      <Formula x={1250} y={200} p={mainFade * ramp(t, cue(0) + 0.3, cue(0) + 1.1) * (1 - kin)} accent={C.gold}>
        <V>V</V>
        <Sub>eff</Sub>(<V>r</V>)&nbsp;=&nbsp;
        <Part p={coul} color={C.red}>
          −<Frac n={<><V>Z</V><V>e</V><Sup>2</Sup></>} d={<>4π<V>ε</V><Sub>0</Sub><V>r</V></>} />
        </Part>
        &nbsp;
        <Part p={cent} color={C.gold}>
          +&nbsp;<Frac n={<><V>ħ</V><Sup>2</Sup><V>ℓ</V>(<V>ℓ</V> + 1)</>} d={<>2<V>μ</V><V>r</V><Sup>2</Sup></>} />
        </Part>
      </Formula>
      <Formula x={1250} y={200} p={mainFade * kin} accent={C.violet} caption={<>dengan <i>L</i>² = <i>ℓ</i>(<i>ℓ</i> + 1)<i>ħ</i>² — energi kinetik gerak sudut, bukan gaya baru</>}>
        <V>E</V>
        <Sub>sudut</Sub>&nbsp;=&nbsp;<Frac n={<><V>L</V><Sup>2</Sup></>} d={<>2<V>μ</V><V>r</V><Sup>2</Sup></>} />
      </Formula>
      <Formula x={1250} y={200} p={pen} accent={C.red} caption={<>dekat inti, faktor <i>r</i><sup>ℓ</sup> menekan orbital p dan d</>}>
        <V>R</V>(<V>r</V>)&nbsp;∝&nbsp;<V>r</V>
        <Sup>ℓ</Sup>
      </Formula>
    </AbsoluteFill>
  );
};
