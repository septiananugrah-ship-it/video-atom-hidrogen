import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, pathOf, ramp, win} from '../anim';
import {Arrow, Card, DrawPath, Glow, Label, Stage, V} from '../components/primitives';
import {Electron, Nucleus, OrbitalCloud, plotPath} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const O = {x: 600, y: 600};
const L = 300;
const proj = (x: number, y: number, z: number): [number, number] => [O.x + y * L - x * L * 0.5, O.y - z * L + x * L * 0.32];

export const Separation: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  // Fase A: simetri bola (baris 0)
  const A = win(t, cue(0) - 0.6, cue(1) - 0.2, 0.8, 0.6);
  const ring = ramp(t, cue(0) + 0.6, cue(0) + 2);
  // Fase B: koordinat bola (baris 1–4)
  const B = win(t, cue(1) - 0.3, cue(5) - 0.4, 0.8, 0.7);
  const axes = ramp(t, cue(1), cue(1) + 1, EASE_IN_OUT);
  const rP = ramp(t, wordOf(1, 'jarak'), wordOf(1, 'jarak') + 0.8);
  const thP = ramp(t, wordOf(1, 'theta'), wordOf(1, 'theta') + 0.8);
  const phP = ramp(t, wordOf(1, 'phi'), wordOf(1, 'phi') + 0.8);
  const prod = ramp(t, cue(2), cue(2) + 0.8, BACK);
  const rPart = ramp(t, wordOf(3, 'radial'), wordOf(3, 'radial') + 0.6);
  const yPart = ramp(t, wordOf(3, 'harmonik'), wordOf(3, 'harmonik') + 0.6);
  const mod5 = ramp(t, cue(4), cue(4) + 0.7, BACK);
  // Fase C: persamaan radial (baris 5–6)
  const Cph = ramp(t, cue(5) - 0.3, cue(5) + 0.7);
  const uplot = ramp(t, cue(6) - 0.2, cue(6) + 1.6, EASE_IN_OUT);
  const ends = ramp(t, cue(6) + 1.2, cue(6) + 2);

  const th = (50 * Math.PI) / 180;
  const ph = ((35 + 8 * Math.sin(t * 0.5)) * Math.PI) / 180;
  const r = 1.05;
  const P = proj(r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th));
  const Pxy = proj(r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), 0);
  const arc = (from: number, to: number, f: (a: number) => [number, number]) =>
    pathOf(Array.from({length: 30}, (_, i) => f(mix(from, to, i / 29))));
  const thArc = arc(0, th, (a) => proj(0.35 * Math.sin(a) * Math.cos(ph), 0.35 * Math.sin(a) * Math.sin(ph), 0.35 * Math.cos(a)));
  const phArc = arc(0, ph, (a) => proj(0.4 * Math.cos(a), 0.4 * Math.sin(a), 0));
  const UP = {x: 1050, y: 640, w: 680, sy: 520};

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== Fase A: potensial sama di semua arah ===== */}
        <g opacity={A}>
          <circle cx={960} cy={500} r={230} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="10 12" opacity={ring} />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k / 6) * Math.PI * 2 + t * 0.3;
            return <Electron key={k} x={960 + 230 * Math.cos(a)} y={500 + 230 * Math.sin(a)} r={10} opacity={ring} />;
          })}
          <Nucleus x={960} y={500} r={22} label="p⁺" />
          <Label x={960} y={790} size={32} color={C.gold} weight={600} opacity={ring}>
            jarak sama → energi potensial sama, ke arah mana pun
          </Label>
        </g>
        {/* ===== Fase B: koordinat bola ===== */}
        <g opacity={B}>
          <g opacity={axes}>
            {[
              [proj(-0.2, 0, 0), proj(1.3, 0, 0), 'x'],
              [proj(0, -0.2, 0), proj(0, 1.5, 0), 'y'],
              [proj(0, 0, -0.2), proj(0, 0, 1.25), 'z'],
            ].map(([a, b, n]) => (
              <g key={n as string}>
                <Arrow x1={(a as number[])[0]} y1={(a as number[])[1]} x2={(b as number[])[0]} y2={(b as number[])[1]} color="muted" width={3} />
                <Label x={(b as number[])[0] + 22} y={(b as number[])[1] - 16} size={28} color={C.muted} font="serif" italic>
                  {n as string}
                </Label>
              </g>
            ))}
            <Nucleus x={O.x} y={O.y} r={14} />
          </g>
          <line x1={O.x} y1={O.y} x2={mix(O.x, P[0], rP)} y2={mix(O.y, P[1], rP)} stroke={C.cyan} strokeWidth={5} />
          <Electron x={P[0]} y={P[1]} r={12} opacity={rP} />
          <Label x={(O.x + P[0]) / 2 + 26} y={(O.y + P[1]) / 2 - 10} size={34} color={C.cyan} font="serif" italic opacity={rP}>
            r
          </Label>
          <line x1={P[0]} y1={P[1]} x2={Pxy[0]} y2={Pxy[1]} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" opacity={phP} />
          <line x1={O.x} y1={O.y} x2={Pxy[0]} y2={Pxy[1]} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" opacity={phP} />
          <DrawPath d={thArc} p={thP} stroke={C.violet} width={4} len={600} />
          <Label x={proj(0, 0, 0.45)[0] + 40} y={proj(0, 0, 0.45)[1] + 10} size={34} color={C.violet} font="serif" italic opacity={thP}>
            θ
          </Label>
          <DrawPath d={phArc} p={phP} stroke={C.gold} width={4} len={600} />
          <Label x={proj(0.55, 0.25, 0)[0]} y={proj(0.55, 0.25, 0)[1] + 30} size={34} color={C.gold} font="serif" italic opacity={phP}>
            φ
          </Label>
          {/* ilustrasi R dan Y */}
          <g opacity={prod}>
            <g opacity={rPart}>
              <DrawPath d={plotPath((u) => Math.exp(-u), 0, 5, {x: 1100, y: 760, w: 240, sy: 150})} p={rPart} stroke={C.cyan} width={4} len={800} />
              <line x1={1100} y1={760} x2={1350} y2={760} stroke={C.muted} strokeWidth={2} />
              <Label x={1225} y={800} size={24} color={C.cyan}>
                R(r): bergantung jarak
              </Label>
            </g>
            <g opacity={yPart}>
              <OrbitalCloud id="2pz" x={1560} y={680} size={120} yaw={t * 0.7} pitch={0.4} dot={1.6} count={800} pos={C.violet} neg={C.pink} />
              <Label x={1560} y={800} size={24} color={C.violet}>
                Y(θ, φ): bergantung arah
              </Label>
            </g>
          </g>
        </g>
        {/* ===== Fase C: u(r) ===== */}
        <g opacity={Cph}>
          <line x1={UP.x} y1={UP.y} x2={UP.x + UP.w + 20} y2={UP.y} stroke={C.muted} strokeWidth={2} />
          <line x1={UP.x} y1={UP.y + 20} x2={UP.x} y2={UP.y - 340} stroke={C.muted} strokeWidth={2} />
          <Label x={UP.x + UP.w + 44} y={UP.y} size={26} color={C.muted} font="serif" italic>
            r
          </Label>
          <Label x={UP.x - 40} y={UP.y - 330} size={30} color={C.gold} font="serif" italic>
            u
          </Label>
          <DrawPath d={plotPath((s) => s * Math.exp(-s) * 1.0, 0, 8, UP)} p={uplot} stroke={C.gold} width={5} glow len={2000} />
          <g opacity={ends}>
            <Glow x={UP.x} y={UP.y} r={40} color="gold" opacity={0.8} />
            <Label x={UP.x + 10} y={UP.y + 40} size={24} color={C.gold} anchor="start">
              u(0) = 0
            </Label>
            <Label x={UP.x + UP.w - 10} y={UP.y - 40} size={24} color={C.gold} anchor="end">
              u → 0 di kejauhan
            </Label>
          </g>
        </g>
      </Stage>

      <Card x={1430} y={330} opacity={B * prod} scale={0.85 + 0.15 * prod} accent={C.gold}>
        <div style={{fontSize: 56}}>
          <V>ψ</V>(<V>r</V>, <V>θ</V>, <V>φ</V>) = <span style={{color: C.cyan, opacity: 0.4 + 0.6 * rPart}}><V>R</V>(<V>r</V>)</span> ·{' '}
          <span style={{color: C.violet, opacity: 0.4 + 0.6 * yPart}}><V>Y</V>(<V>θ</V>, <V>φ</V>)</span>
        </div>
      </Card>
      <Card x={1430} y={470} opacity={B * mod5} accent={C.violet} style={{fontSize: 30}}>
        <span style={{color: C.violet, fontWeight: 600}}>Modul 5:</span> Λ²<V>Y</V> = −<V>ℓ</V>(<V>ℓ</V>+1)<V>Y</V>
      </Card>
      <Card x={520} y={430} opacity={Cph} scale={0.9 + 0.1 * Cph} accent={C.gold}>
        <div style={{fontSize: 40}}>
          −<span style={{fontSize: 34}}>ħ²</span>/2<V>μ</V> · <V>u</V>″ + <V color={C.red}>V</V>
          <sub style={{fontSize: 22, color: C.red}}>eff</sub>(<V>r</V>) <V>u</V> = <V>E u</V>
        </div>
        <div style={{fontSize: 28, color: C.muted, marginTop: 8, textAlign: 'center'}}>
          dengan <V color={C.gold}>u</V> = <V>r</V> · <V color={C.cyan}>R</V>(<V>r</V>)
        </div>
      </Card>
      <Card x={520} y={640} opacity={ramp(t, cue(6), cue(6) + 0.7, BACK)} accent={C.mint} style={{fontSize: 28}}>
        syarat batas: <V>u</V>(0) = 0 dan <V>u</V>(∞) = 0
      </Card>
    </AbsoluteFill>
  );
};
