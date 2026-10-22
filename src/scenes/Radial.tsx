import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, ramp} from '../anim';
import {Card, DrawPath, Formula, Frac, Glow, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {Rnl, plotPath} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const BOX = {x: 200, y: 620, w: 1100, sy: 175};
const S_MAX = 20;
const X = (s: number) => BOX.x + (s / S_MAX) * BOX.w;
const Y = (v: number) => BOX.y - v * BOX.sy;
const clip = (v: number) => Math.max(-0.6, Math.min(2.4, v));
const CURVES = [
  {n: 1, l: 0, name: '1s', col: C.gold},
  {n: 2, l: 0, name: '2s', col: C.cyan},
  {n: 2, l: 1, name: '2p', col: C.mint},
  {n: 3, l: 0, name: '3s', col: C.violet},
];
const NODES_3S = [(9 - 3 * Math.sqrt(3)) / 2, (9 + 3 * Math.sqrt(3)) / 2];

/** Area di bawah kurva R yang negatif (fase −) diwarnai biru. */
const negArea = (n: number, l: number) => {
  const pts: string[] = [];
  const N = 300;
  for (let i = 0; i <= N; i++) {
    const s = (i / N) * S_MAX;
    pts.push(`${X(s).toFixed(1)},${Y(Math.min(0, clip(Rnl(n, l, s) * scaleOf(n, l)))).toFixed(1)}`);
  }
  return `M${X(0)},${Y(0)} L${pts.join(' L')} L${X(S_MAX)},${Y(0)} Z`;
};
const posArea = (n: number, l: number) => {
  const pts: string[] = [];
  const N = 300;
  for (let i = 0; i <= N; i++) {
    const s = (i / N) * S_MAX;
    pts.push(`${X(s).toFixed(1)},${Y(Math.max(0, clip(Rnl(n, l, s) * scaleOf(n, l)))).toFixed(1)}`);
  }
  return `M${X(0)},${Y(0)} L${pts.join(' L')} L${X(S_MAX)},${Y(0)} Z`;
};
// perbesaran tampilan agar kurva n = 2, 3 terbaca (ditulis di legenda)
const scaleOf = (n: number, l = 0) => (n === 1 ? 1 : n === 2 ? (l === 0 ? 2.5 : 6) : 6);

export const Radial: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const axes = ramp(t, cue(0) - 0.3, cue(0) + 0.8);
  const parts = ramp(t, cue(1), cue(1) + 0.8, BACK);
  const p1 = ramp(t, cue(2), cue(2) + 1.6, EASE_IN_OUT);
  const p2 = ramp(t, cue(3), cue(3) + 1.6, EASE_IN_OUT);
  const node2 = ramp(t, cue(4), cue(4) + 0.6);
  const rule = ramp(t, cue(5), cue(5) + 0.8, BACK);
  const p2p = ramp(t, cue(6), cue(6) + 1.4, EASE_IN_OUT);
  const p3 = ramp(t, wordOf(6, 'tiga'), wordOf(6, 'tiga') + 1.6, EASE_IN_OUT);
  const node3 = ramp(t, wordOf(6, 'sekitar'), wordOf(6, 'sekitar') + 0.6);
  const phase = ramp(t, cue(7), cue(7) + 1);
  const ps = [p1, p2, p2p, p3];
  const dim = (i: number) => (i === 0 ? 1 - 0.6 * p2 : i === 1 ? 1 - 0.5 * p3 : 1);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={axes}>
          <line x1={BOX.x} y1={Y(0)} x2={BOX.x + BOX.w + 20} y2={Y(0)} stroke={C.muted} strokeWidth={2} />
          <line x1={BOX.x} y1={Y(-0.7)} x2={BOX.x} y2={Y(2.5)} stroke={C.muted} strokeWidth={2} />
          {[0, 2, 5, 10, 15, 20].map((s) => (
            <Label key={s} x={X(s)} y={Y(0) + 28} size={20} color={C.faint}>
              {s}
            </Label>
          ))}
          <Label x={BOX.x + BOX.w + 50} y={Y(0)} size={24} color={C.muted}>
            r / a
          </Label>
          <Label x={BOX.x - 20} y={Y(2.5)} size={26} color={C.muted} anchor="end">
            R
          </Label>
        </g>
        {CURVES.map((c, i) => (
          <g key={c.name} opacity={dim(i)}>
            {c.l === 0 && c.n > 1 ? <path d={negArea(c.n, c.l)} fill={C.cyan} opacity={0.22 * phase} /> : null}
            <path d={posArea(c.n, c.l)} fill={C.gold} opacity={0.1 * phase * (i === 3 || i === 1 ? 1 : 0.6)} />
            <DrawPath d={plotPath((s) => clip(Rnl(c.n, c.l, s) * scaleOf(c.n, c.l)), 0.0, S_MAX, BOX, 400)} p={ps[i]} stroke={c.col} width={5} glow={i === 0} len={4000} />
            <Label x={1480} y={300 + i * 52} size={28} color={c.col} anchor="start" opacity={ps[i]} weight={600}>
              {c.name}
              <tspan fontSize={20} fill={C.muted}>
                {scaleOf(c.n, c.l) > 1 ? `  (×${String(scaleOf(c.n, c.l)).replace('.', ',')})` : ''}
              </tspan>
            </Label>
          </g>
        ))}
        {/* simpul 2s di r = 2a */}
        <g opacity={node2}>
          <line x1={X(2)} y1={Y(-0.6)} x2={X(2)} y2={Y(1.4)} stroke={C.cyan} strokeWidth={2} strokeDasharray="6 6" />
          <Glow x={X(2)} y={Y(0)} r={46} color="cyan" opacity={0.9} />
          <circle cx={X(2)} cy={Y(0)} r={8} fill="#fff" />
          <Label x={X(2) + 14} y={Y(1.55)} size={26} color={C.cyan} weight={700} anchor="start">
            simpul radial: r = 2a
          </Label>
        </g>
        <g opacity={node3}>
          {NODES_3S.map((s) => (
            <g key={s}>
              <Glow x={X(s)} y={Y(0)} r={40} color="violet" opacity={0.9} />
              <circle cx={X(s)} cy={Y(0)} r={7} fill="#fff" />
              <Label x={X(s)} y={Y(-0.85)} size={22} color={C.violet} font="mono">
                {s.toFixed(2).replace('.', ',')}a
              </Label>
            </g>
          ))}
        </g>
        <g opacity={phase}>
          <Label x={X(10)} y={Y(0.5)} size={26} color={C.gold} weight={600}>
            fase +
          </Label>
          <Label x={X(4.6)} y={Y(-0.45)} size={26} color={C.cyan} weight={600}>
            fase −
          </Label>
        </g>
        {/* a0 */}
        <g opacity={ramp(t, wordOf(2, 'Bohr'), wordOf(2, 'Bohr') + 0.6)}>
          <line x1={X(1)} y1={Y(0) - 10} x2={X(1)} y2={Y(0) + 10} stroke={C.gold} strokeWidth={3} />
          <Label x={X(1) + 12} y={Y(0) + 56} size={22} color={C.gold} anchor="start">
            a ≈ a₀ = 52,9 pm
          </Label>
        </g>
      </Stage>
      <Formula x={880} y={205} p={parts * (1 - ramp(t, cue(2), cue(2) + 0.6))} accent={C.gold} caption="perilaku dekat inti · peluruhan · simpul">
        <V>R</V>
        <Sub>nℓ</Sub>&nbsp;∝&nbsp;<span style={{color: C.mint}}><V>ρ</V><Sup>ℓ</Sup></span>&nbsp;·&nbsp;
        <span style={{color: C.cyan}}>
          <V>e</V>
          <Sup>
            −<Frac n={<V>ρ</V>} d="2" size={0.9} />
          </Sup>
        </span>
        &nbsp;·&nbsp;<span style={{color: C.violet}}><V>L</V>(<V>ρ</V>)</span>
      </Formula>
      <Formula x={880} y={205} p={ramp(t, cue(2) + 0.2, cue(2) + 1) * (1 - rule)} accent={C.gold} caption="a ≈ a₀ = 52,9 pm (jari-jari Bohr)">
        <V>R</V>
        <Sub>1s</Sub>&nbsp;=&nbsp;<Frac n="2" d={<><V>a</V><Sup><Frac n="3" d="2" size={0.9} /></Sup></>} />
        <V>e</V>
        <Sup>
          −<Frac n={<V>r</V>} d={<V>a</V>} size={0.9} />
        </Sup>
      </Formula>
      <Formula x={880} y={205} p={rule} accent={C.violet}>
        <span style={{fontFamily: 'Outfit, sans-serif', fontSize: '0.8em'}}>simpul radial</span>&nbsp;=&nbsp;<V color={C.violet}>n</V>&nbsp;−&nbsp;<V>ℓ</V>&nbsp;−&nbsp;1
      </Formula>
      <Card x={1860} y={730} opacity={phase} accent={C.cyan} anchor="right" style={{fontSize: 30}}>
        <div>tanda − = fase gelombang,</div>
        <div style={{color: C.cyan}}>bukan peluang negatif</div>
      </Card>
    </AbsoluteFill>
  );
};
