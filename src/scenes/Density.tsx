import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, ramp} from '../anim';
import {Card, DrawPath, Formula, Frac, Glow, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {Nucleus, plotPath} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Kiri: atom 1s sebagai "bawang". Kanan: plot (s = r/a dari 0 sampai 5).
const AT = {x: 470, y: 530, px: 80}; // 80 px per a
const BOX = {x: 960, y: 770, w: 760, sy: 400};
const S_MAX = 5;
const X = (s: number) => BOX.x + (s / S_MAX) * BOX.w;
const dens = (s: number) => Math.exp(-2 * s); // |ψ|² dinormalisasi ke 1 di inti
const P = (s: number) => (4 * s * s * Math.exp(-2 * s)) / (4 * Math.exp(-2)); // dinormalisasi ke 1 di puncak
const areaUnder = (f: (s: number) => number, a: number, b: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const s = a + ((b - a) * i) / 80;
    pts.push(`${X(s).toFixed(1)},${(BOX.y - f(s) * BOX.sy).toFixed(1)}`);
  }
  return `M${X(a)},${BOX.y} L${pts.join(' L')} L${X(b)},${BOX.y} Z`;
};

export const Density: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const atom = ramp(t, cue(0) - 0.4, cue(0) + 1);
  const axes = ramp(t, cue(1) - 0.3, cue(1) + 0.6);
  const d = ramp(t, cue(1), cue(1) + 1.4, EASE_IN_OUT);
  const narrow = ramp(t, cue(2), cue(2) + 0.6);
  const shells = ramp(t, cue(3), cue(3) + 1.2);
  const r2 = ramp(t, cue(4), cue(4) + 1.4, EASE_IN_OUT);
  const pr = ramp(t, cue(5), cue(5) + 1.8, EASE_IN_OUT);
  const peak = ramp(t, cue(6) + 0.6, cue(6) + 1.2, BACK);
  const mode = ramp(t, cue(7), cue(7) + 0.6, BACK);
  const mean = ramp(t, cue(8), cue(8) + 0.8);
  const frac = ramp(t, wordOf(8, 'peluang'), wordOf(8, 'peluang') + 1.2, EASE_IN_OUT);
  const both = ramp(t, cue(9), cue(9) + 0.8, BACK);
  // kulit yang disorot bergerak keluar
  const sh = 0.25 + ((t - cue(3)) * 0.55) % 3.2;

  return (
    <AbsoluteFill>
      <Stage>
        {/* atom 1s: kerapatan sebagai gradien */}
        <g opacity={atom}>
          {Array.from({length: 26}, (_, i) => {
            const s = 4.2 * (1 - i / 26);
            return <circle key={i} cx={AT.x} cy={AT.y} r={s * AT.px} fill={C.cyan} opacity={0.06 * dens(s) + 0.012} />;
          })}
          <Nucleus x={AT.x} y={AT.y} r={10} />
          <Glow x={AT.x} y={AT.y} r={70 * (1 + narrow * 0.3)} color="white" opacity={0.4 * d} />
          <Label x={AT.x} y={200} size={26} color={C.cyan} weight={600} opacity={1 - shells}>
            orbital 1s
          </Label>
        </g>
        {/* bawang: kulit-kulit tipis */}
        <g opacity={shells}>
          {Array.from({length: 9}, (_, i) => (
            <circle key={i} cx={AT.x} cy={AT.y} r={(0.45 + i * 0.45) * AT.px} fill="none" stroke={C.gold} strokeOpacity={0.22} strokeWidth={2} />
          ))}
          <circle cx={AT.x} cy={AT.y} r={sh * AT.px} fill="none" stroke={C.gold} strokeWidth={10} strokeOpacity={0.75} filter="url(#glow)" />
          <Label x={AT.x} y={200} size={26} color={C.gold}>
            luas kulit = 4πr² → makin luar makin besar
          </Label>
        </g>
        {/* lingkaran r = a dan isi 32% */}
        <g opacity={peak}>
          <circle cx={AT.x} cy={AT.y} r={AT.px} fill="none" stroke={C.mint} strokeWidth={4} strokeDasharray="10 8" />
          <Label x={AT.x + AT.px + 10} y={AT.y - 20} size={24} color={C.mint} anchor="start">
            r = a
          </Label>
        </g>
        <circle cx={AT.x} cy={AT.y} r={AT.px} fill={C.mint} opacity={0.18 * frac} />
        {/* plot */}
        <g opacity={axes}>
          <line x1={BOX.x} y1={BOX.y} x2={BOX.x + BOX.w + 20} y2={BOX.y} stroke={C.muted} strokeWidth={2} />
          <line x1={BOX.x} y1={BOX.y + 10} x2={BOX.x} y2={BOX.y - BOX.sy - 40} stroke={C.muted} strokeWidth={2} />
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <Label key={s} x={X(s)} y={BOX.y + 26} size={20} color={C.faint}>
              {s}
            </Label>
          ))}
          <Label x={BOX.x + BOX.w + 46} y={BOX.y} size={24} color={C.muted}>
            r / a
          </Label>
        </g>
        <path d={areaUnder(P, 0, 1)} fill={C.mint} opacity={0.25 * frac} />
        <DrawPath d={plotPath(dens, 0, S_MAX, BOX)} p={d} stroke={C.cyan} width={5} len={2000} opacity={1 - 0.5 * pr} />
        <Label x={X(0.55)} y={BOX.y - 0.86 * BOX.sy} size={28} color={C.cyan} anchor="start" opacity={d * (1 - 0.5 * pr)}>
          |ψ|² — maksimum di inti
        </Label>
        <DrawPath d={plotPath((s) => Math.min(1.08, (s * s) / 16), 0, S_MAX, BOX)} p={r2} stroke={C.gold} width={3} dash="10 10" opacity={r2 * (1 - 0.6 * pr)} />
        <Label x={X(4.4)} y={BOX.y - 1.1 * BOX.sy + 10} size={26} color={C.gold} opacity={r2 * (1 - 0.6 * pr)}>
          r²
        </Label>
        <DrawPath d={plotPath(P, 0, S_MAX, BOX)} p={pr} stroke={C.mint} width={6} glow len={2000} />
        <Label x={X(2.1)} y={BOX.y - 0.78 * BOX.sy} size={30} color={C.mint} anchor="start" weight={700} opacity={pr}>
          P(r)
        </Label>
        <g opacity={peak}>
          <line x1={X(1)} y1={BOX.y} x2={X(1)} y2={BOX.y - BOX.sy} stroke={C.mint} strokeWidth={2} strokeDasharray="6 6" />
          <Glow x={X(1)} y={BOX.y - BOX.sy} r={40} color="mint" opacity={0.8} />
          <Label x={X(1)} y={BOX.y - BOX.sy - 30} size={24} color={C.mint} weight={700} opacity={mode}>
            radius paling mungkin = a
          </Label>
        </g>
        <g opacity={mean}>
          <line x1={X(1.5)} y1={BOX.y} x2={X(1.5)} y2={BOX.y - P(1.5) * BOX.sy} stroke={C.violet} strokeWidth={3} />
          <Label x={X(1.5) + 10} y={BOX.y - 40} size={24} color={C.violet} anchor="start" weight={600}>
            ⟨r⟩ = 1,5a
          </Label>
        </g>
        <Label x={X(0.5)} y={BOX.y - 0.18 * BOX.sy} size={30} color="#fff" weight={800} opacity={frac}>
          32%
        </Label>
      </Stage>
      <Formula x={1370} y={195} p={d * (1 - pr)} accent={C.cyan} caption="kerapatan peluang per volume">
        |<V>ψ</V>
        <Sub>1s</Sub>|<Sup>2</Sup>&nbsp;=&nbsp;<Frac n="1" d={<>π<V>a</V><Sup>3</Sup></>} />
        <V>e</V>
        <Sup>
          −<Frac n={<>2<V>r</V></>} d={<V>a</V>} size={0.9} />
        </Sup>
      </Formula>
      <Formula x={1370} y={195} p={pr * (1 - mean)} accent={C.mint} caption="peluang per jarak: kerapatan × luas kulit">
        <V color={C.mint}>P</V>(<V>r</V>)&nbsp;=&nbsp;<V>r</V>
        <Sup>2</Sup>
        <V>R</V>
        <Sup>2</Sup>&nbsp;=&nbsp;<Frac n={<>4<V>r</V><Sup>2</Sup></>} d={<><V>a</V><Sup>3</Sup></>} />
        <V>e</V>
        <Sup>
          −<Frac n={<>2<V>r</V></>} d={<V>a</V>} size={0.9} />
        </Sup>
      </Formula>
      <Formula x={1370} y={195} p={mean * (1 - both)} accent={C.mint} caption="⟨r⟩ = 1,5a">
        <V>P</V>(<V>r</V> &lt; <V>a</V>)&nbsp;=&nbsp;1 − 5<V>e</V>
        <Sup>−2</Sup>&nbsp;≈&nbsp;<b style={{color: C.mint, fontFamily: 'Outfit, sans-serif'}}>0,323</b>
      </Formula>
      <Card x={1370} y={195} opacity={both} accent={C.gold} style={{fontSize: 32}}>
        <div>
          <span style={{color: C.cyan}}>|ψ|²</span>: peluang per volume → puncak di inti
        </div>
        <div>
          <span style={{color: C.mint}}>
            <V>P</V>(<V>r</V>)
          </span>
          : peluang per jarak → puncak di <V>r</V> = <V>a</V>
        </div>
      </Card>
    </AbsoluteFill>
  );
};
