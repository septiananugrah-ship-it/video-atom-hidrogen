import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN, EASE_IN_OUT, mix, rand, ramp, win} from '../anim';
import {Arrow, DrawPath, Formula, Frac, Glow, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {Electron, Nucleus, plotPath} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Plot V(r) = −1/r (satuan bebas)
const PLOT = {x: 1080, y: 300, w: 640, sy: 90};
const vr = (u: number) => Math.max(-5.2, -1 / u);

export const System: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  // Fase A: dua partikel + potensial (baris 0–2)
  const A = win(t, cue(0) - 0.6, cue(3) - 0.4, 0.8, 0.7);
  const parts = ramp(t, cue(0), cue(0) + 0.8, BACK);
  const pull = ramp(t, cue(1), cue(1) + 0.6);
  const plot = ramp(t, cue(2) - 0.2, cue(2) + 2.2, EASE_IN_OUT);
  // jarak berosilasi agar terlihat V makin dalam saat dekat
  const sep = 1.3 + 0.9 * (0.5 + 0.5 * Math.cos((t - cue(2)) * 1.4));
  const dist = cue(2) < t ? sep : 2.2;
  const px = 560 - dist * 90;
  const ex = 560 + dist * 90;
  // Fase B: massa & pusat massa (baris 3–5)
  const B = win(t, cue(3) - 0.3, cue(6) - 0.4, 0.8, 0.7);
  const orbit = ramp(t, cue(5) - 0.2, cue(5) + 0.8);
  const ang = (t - cue(4)) * 1.6;
  const R = 300;
  const cm = {x: 960, y: 520};
  const rp = R / 9; // jari-jari orbit proton (dibesarkan agar terlihat; nyata 1/1836)
  // Fase C: pemisahan gerak & massa tereduksi (baris 6–8)
  const Cph = win(t, cue(6) - 0.3, cue(9) - 0.4, 0.8, 0.7);
  const split = ramp(t, cue(6), cue(6) + 1);
  const mu = ramp(t, cue(7), cue(7) + 0.7, BACK);
  const ratio = ramp(t, cue(8), cue(8) + 0.7, BACK);
  const drift = (t - cue(6)) * 40;
  // Fase D: ion hidrogenik (baris 9)
  const D = ramp(t, cue(9) - 0.3, cue(9) + 0.7);
  const species = [
    {name: 'H', Z: 1, x: 500},
    {name: 'He⁺', Z: 2, x: 960},
    {name: 'Li²⁺', Z: 3, x: 1420},
  ];

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== Fase A ===== */}
        <g opacity={A}>
          <g opacity={parts}>
            <Nucleus x={px} y={470} r={34} label="p⁺" />
            <Electron x={ex} y={470} r={16} label />
            <Label x={px} y={560} size={26} color={C.red} weight={600}>
              proton
            </Label>
            <Label x={ex} y={560} size={26} color={C.cyan} weight={600}>
              elektron
            </Label>
          </g>
          <g opacity={pull * (0.6 + 0.4 * Math.sin(t * 6))}>
            <Arrow x1={ex - 30} y1={470} x2={mix(ex - 30, (px + ex) / 2 + 12, 0.8)} y2={470} color="gold" width={5} />
            <Arrow x1={px + 44} y1={470} x2={mix(px + 44, (px + ex) / 2 - 12, 0.8)} y2={470} color="gold" width={5} />
          </g>
          <Label x={560} y={380} size={30} color={C.gold} weight={700} opacity={pull}>
            gaya Coulomb
          </Label>
          <g opacity={plot}>
            <line x1={PLOT.x} y1={PLOT.y} x2={PLOT.x + PLOT.w + 20} y2={PLOT.y} stroke={C.muted} strokeWidth={2} />
            <line x1={PLOT.x} y1={PLOT.y - 40} x2={PLOT.x} y2={PLOT.y + 500} stroke={C.muted} strokeWidth={2} />
            <Label x={PLOT.x + PLOT.w + 40} y={PLOT.y} size={28} font="serif" italic color={C.muted}>
              r
            </Label>
            <Label x={PLOT.x - 30} y={PLOT.y - 40} size={28} font="serif" italic color={C.muted}>
              V
            </Label>
            <Label x={PLOT.x - 24} y={PLOT.y} size={22} color={C.muted}>
              0
            </Label>
            <DrawPath d={plotPath(vr, 0.19, 7, PLOT)} p={plot} stroke={C.red} width={5} glow len={3000} />
            {(() => {
              const u = dist;
              const x = PLOT.x + ((u - 0.19) / (7 - 0.19)) * PLOT.w;
              const y = PLOT.y - vr(u) * PLOT.sy;
              return (
                <g opacity={ramp(t, cue(2) + 1.5, cue(2) + 2)}>
                  <Glow x={x} y={y} r={40} color="cyan" opacity={0.7} />
                  <circle cx={x} cy={y} r={11} fill={C.cyan} />
                </g>
              );
            })()}
          </g>
        </g>
        {/* ===== Fase B ===== */}
        <g opacity={B}>
          {/* timbangan: 1 proton vs 1836 elektron */}
          <g opacity={1 - ramp(t, cue(4) - 0.4, cue(4) + 0.2)}>
            {(() => {
              const fill = ramp(t, cue(3) + 0.4, cue(3) + 3.2, EASE_IN_OUT);
              const count = Math.round(1836 * fill);
              const tilt = 14 * (1 - fill); // derajat; kiri (proton) turun dulu
              const px0 = 960;
              const py0 = 560;
              const L = 420;
              const rad = (tilt * Math.PI) / 180;
              const lx = px0 - L * Math.cos(rad);
              const ly = py0 + L * Math.sin(rad);
              const rx = px0 + L * Math.cos(rad);
              const ry = py0 - L * Math.sin(rad);
              return (
                <g>
                  <path d={`M${px0 - 50},${py0 + 190} L${px0},${py0} L${px0 + 50},${py0 + 190} Z`} fill="#2a3352" stroke={C.muted} strokeWidth={2} />
                  <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#c8d3ef" strokeWidth={8} strokeLinecap="round" />
                  <circle cx={px0} cy={py0} r={10} fill={C.gold} />
                  {/* piring kiri: proton */}
                  <line x1={lx} y1={ly} x2={lx} y2={ly + 90} stroke={C.muted} strokeWidth={2} />
                  <path d={`M${lx - 110},${ly + 90} Q${lx},${ly + 140} ${lx + 110},${ly + 90} Z`} fill="#1b2340" stroke={C.muted} strokeWidth={2} />
                  <Nucleus x={lx} y={ly + 70} r={30} label="p⁺" />
                  {/* piring kanan: elektron yang tertuang */}
                  <line x1={rx} y1={ry} x2={rx} y2={ry + 90} stroke={C.muted} strokeWidth={2} />
                  <path d={`M${rx - 110},${ry + 90} Q${rx},${ry + 140} ${rx + 110},${ry + 90} Z`} fill="#1b2340" stroke={C.muted} strokeWidth={2} />
                  {Array.from({length: 160}, (_, k) => {
                    const shown = k < 160 * fill;
                    if (!shown) return null;
                    const ang = rand(k * 3.1) * Math.PI;
                    const rr = 70 * Math.sqrt(rand(k * 7.3));
                    return <circle key={k} cx={rx + rr * Math.cos(ang) * 1.3} cy={ry + 88 - rr * Math.sin(ang) * 0.55} r={4} fill={C.cyan} opacity={0.85} />;
                  })}
                  {/* aliran elektron dari atas */}
                  {fill > 0 && fill < 1
                    ? Array.from({length: 10}, (_, k) => {
                        const ph = (t * 1.8 + k / 10) % 1;
                        return <circle key={k} cx={rx + (rand(k) - 0.5) * 30} cy={mix(ry - 260, ry + 70, ramp(ph, 0, 1, EASE_IN))} r={4} fill={C.cyan} opacity={0.8} />;
                      })
                    : null}
                  <Label x={rx} y={ry - 290} size={34} color={C.cyan} weight={700} font="mono">
                    {count.toLocaleString('id-ID')} elektron
                  </Label>
                  <Label x={lx} y={ly - 60} size={34} color={C.red} weight={700}>
                    1 proton
                  </Label>
                </g>
              );
            })()}
          </g>
          <g opacity={ramp(t, cue(4), cue(4) + 0.8)}>
            <circle cx={cm.x} cy={cm.y} r={R} fill="none" stroke={C.cyan} strokeOpacity={0.3 * orbit} strokeWidth={2} strokeDasharray="8 10" />
            <circle cx={cm.x} cy={cm.y} r={rp} fill="none" stroke={C.red} strokeOpacity={0.5 * orbit} strokeWidth={2} strokeDasharray="4 6" />
            <Nucleus x={cm.x - rp * Math.cos(ang) * orbit} y={cm.y - rp * Math.sin(ang) * orbit + (1 - orbit) * 0} r={30} label="p⁺" />
            <Electron x={cm.x + R * Math.cos(ang) * orbit + (1 - orbit) * 300} y={cm.y + R * Math.sin(ang) * orbit} r={14} />
            <g opacity={orbit}>
              <line x1={cm.x - 12} y1={cm.y - 12} x2={cm.x + 12} y2={cm.y + 12} stroke={C.gold} strokeWidth={4} />
              <line x1={cm.x - 12} y1={cm.y + 12} x2={cm.x + 12} y2={cm.y - 12} stroke={C.gold} strokeWidth={4} />
              <Label x={cm.x + 120} y={cm.y - 40} size={26} color={C.gold} weight={600}>
                pusat massa
              </Label>
              <Label x={1560} y={840} size={20} color={C.muted} anchor="end">
                (orbit proton dibesarkan agar tampak)
              </Label>
            </g>
          </g>
        </g>
        {/* ===== Fase C ===== */}
        <g opacity={Cph}>
          <line x1={960} y1={230} x2={960} y2={mix(230, 600, split)} stroke={C.faint} strokeWidth={2} />
          <Label x={520} y={240} size={28} color={C.muted} weight={600} spacing={3}>
            GERAK SELURUH ATOM
          </Label>
          <Label x={1400} y={240} size={28} color={C.violet} weight={600} spacing={3}>
            GERAK RELATIF
          </Label>
          <g opacity={split}>
            <g transform={`translate(${(drift % 300) - 150} 0)`}>
              <circle cx={520} cy={420} r={80} fill="url(#soft-cyan)" opacity={0.5} />
              <Nucleus x={520} y={420} r={18} />
            </g>
            <Arrow x1={370} y1={530} x2={670} y2={530} color="muted" width={4} />
            <Label x={520} y={575} size={26} color={C.muted}>
              translasi bebas, tidak terkuantisasi oleh atom
            </Label>
            <Nucleus x={1300} y={420} r={22} />
            <Electron x={1300 + 220 * Math.cos(t * 0.9)} y={420 + 120 * Math.sin(t * 0.9)} r={12} />
            <Arrow x1={1300} y1={420} x2={1300 + 200 * Math.cos(t * 0.9)} y2={420 + 109 * Math.sin(t * 0.9)} color="violet" width={4} />
            <Label x={1300 + 110 * Math.cos(t * 0.9)} y={390 + 60 * Math.sin(t * 0.9)} size={32} color={C.violet} font="serif" italic>
              r
            </Label>
          </g>
        </g>
        {/* ===== Fase D ===== */}
        <g opacity={D}>
          {species.map((s, i) => {
            const p = ramp(t, cue(9) + i * 0.5, cue(9) + i * 0.5 + 0.7, BACK);
            const a = t * (1 + 0.5 * s.Z) + i;
            const rr = 150 / s.Z;
            return (
              <g key={s.name} opacity={p}>
                <circle cx={s.x} cy={470} r={rr * 1.3} fill="url(#soft-cyan)" opacity={0.45} />
                <circle cx={s.x} cy={470} r={rr} fill="none" stroke={C.cyan} strokeOpacity={0.3} strokeDasharray="6 8" />
                <Nucleus x={s.x} y={470} r={14 + 6 * s.Z} label={`+${s.Z}`} />
                <Electron x={s.x + rr * Math.cos(a)} y={470 + rr * Math.sin(a)} r={9} />
                <Label x={s.x} y={680} size={44} weight={700} color={C.ink}>
                  {s.name}
                </Label>
                <Label x={s.x} y={730} size={24} color={C.muted} font="serif" italic>
                  Z = {s.Z} · 1 elektron
                </Label>
              </g>
            );
          })}
        </g>
      </Stage>

      <Formula x={560} y={730} p={A * ramp(t, cue(2) + 0.6, cue(2) + 1.4)} accent={C.red} caption="energi potensial Coulomb">
        <V>V</V>(<V>r</V>) = −<Frac n={<><V>Z</V><V>e</V><Sup>2</Sup></>} d={<>4π<V>ε</V><Sub>0</Sub><V>r</V></>} />
      </Formula>
      <Formula x={960} y={760} p={Cph * mu * (1 - ratio)} accent={C.violet} caption="massa tereduksi">
        <V color={C.violet}>μ</V>&nbsp;=&nbsp;<Frac n={<><V>m</V><Sub>e</Sub><V>m</V><Sub>N</Sub></>} d={<><V>m</V><Sub>e</Sub> + <V>m</V><Sub>N</Sub></>} />
      </Formula>
      <Formula x={960} y={760} p={Cph * ratio} accent={C.gold} caption="hidrogen: ≈ 0,05 % lebih kecil — muncul lagi di spektrum (Bab 12)">
        <Frac n={<V color={C.violet}>μ</V>} d={<><V>m</V><Sub>e</Sub></>} />&nbsp;=&nbsp;<Frac n="1" d={<>1 + <Frac n={<><V>m</V><Sub>e</Sub></>} d={<><V>m</V><Sub>p</Sub></>} size={0.8} /></>} />&nbsp;≈&nbsp;<b style={{color: C.gold, fontFamily: 'Outfit, sans-serif'}}>0,999456</b>
      </Formula>
      <div
        style={{
          position: 'absolute',
          top: 800,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT.sans,
          fontSize: 28,
          color: C.muted,
          opacity: D * ramp(t, wordOf(9, 'He') , wordOf(9, 'He') + 0.6),
        }}
      >
        bukan He atau Li netral — hanya spesies berelektron satu
      </div>
    </AbsoluteFill>
  );
};
