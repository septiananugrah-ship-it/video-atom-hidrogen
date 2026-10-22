import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp, sample, smoothPath, win} from '../anim';
import {Formula, Frac, Glow, Label, Stage, Sub, V} from '../components/primitives';
import {Electron, Nucleus, OrbitalCloud} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

/** Panah spin (sudut dalam derajat, 0 = ke atas). */
const Spin: React.FC<{x: number; y: number; len: number; angle: number; color: string; opacity?: number}> = ({x, y, len, angle, color, opacity = 1}) => {
  const a = (angle * Math.PI) / 180;
  const dx = Math.sin(a) * len;
  const dy = -Math.cos(a) * len;
  return (
    <g opacity={opacity}>
      <line x1={x - dx * 0.5} y1={y - dy * 0.5} x2={x + dx * 0.5} y2={y + dy * 0.5} stroke={color} strokeWidth={6} strokeLinecap="round" markerEnd={`url(#arrow-${color === C.red ? 'red' : 'cyan'})`} />
    </g>
  );
};

/** Satelit sederhana (badan + dua panel surya). */
const Sat: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 ? <circle r={60} fill="url(#soft-gold)" opacity={glow} /> : null}
    <rect x={-60} y={-9} width={42} height={18} fill="#2f5fbf" stroke="#9fb8ff" strokeWidth={1.5} />
    <rect x={18} y={-9} width={42} height={18} fill="#2f5fbf" stroke="#9fb8ff" strokeWidth={1.5} />
    <rect x={-16} y={-14} width={32} height={28} rx={4} fill="#d9dde8" />
    <circle cx={0} cy={20} r={6} fill={C.gold} />
  </g>
);

export const Maser: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  // Fase 0: satelit melintas di langit
  const P0 = win(t, -0.2, cue(1) - 0.4, 0.6, 0.6);
  // Fase A: dua keadaan spin + tingkat hiperhalus + pembalikan spin
  const A = win(t, cue(1) - 0.4, cue(4) - 0.4, 0.8, 0.7);
  const atom = ramp(t, cue(1), cue(1) + 0.8);
  const levels = ramp(t, cue(2), cue(2) + 0.8);
  const flip = ramp(t, wordOf(3, 'membalik'), wordOf(3, 'membalik') + 0.8, EASE_IN_OUT);
  const wave = ramp(t, wordOf(3, 'memancarkan'), wordOf(3, 'memancarkan') + 3.5);
  const nuCard = ramp(t, wordOf(3, 'gigahertz') - 0.4, wordOf(3, 'gigahertz') + 0.4);
  // Fase B: maser → satelit Galileo
  const B = win(t, cue(4) - 0.3, cue(7) - 0.4, 0.8, 0.7);
  const dev = ramp(t, cue(4), cue(4) + 0.8) * (1 - ramp(t, cue(5) - 0.3, cue(5) + 0.4));
  const earth = ramp(t, cue(5) - 0.2, cue(5) + 1);
  const esa = ramp(t, cue(6), cue(6) + 0.8);
  // Fase C: 1 ns ≈ 30 cm
  const Cph = win(t, cue(7) - 0.3, cue(8) - 0.4, 0.8, 0.7);
  const pulse = ramp(t, cue(7) + 0.6, cue(7) + 6.5);
  // Fase D: ponsel
  const Dph = ramp(t, cue(8) - 0.3, cue(8) + 0.8);

  const PX = 600;
  const PY = 480;
  const electronAngle = t * 1.6;
  const ex = PX + 240 * Math.cos(electronAngle);
  const ey = PY + 95 * Math.sin(electronAngle);
  // tingkat hiperhalus
  const L = {x0: 1140, x1: 1640, up: 400, down: 560};
  const dotY = mix(L.up, L.down, flip);

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== 0: di atas kepala ===== */}
        <g opacity={P0}>
          <circle cx={960} cy={2050} r={1250} fill="#0b2a52" stroke="#5b8cff" strokeWidth={4} strokeOpacity={0.7} />
          <circle cx={960} cy={2050} r={1290} fill="none" stroke="#4fd6ff" strokeOpacity={0.18} strokeWidth={40} />
          <Sat x={mix(200, 1720, ramp(t, 0, cue(1)))} y={360 - 60 * Math.sin(Math.PI * ramp(t, 0, cue(1)))} s={1.4} glow={0.5} />
        </g>
        {/* ===== A: spin dan hiperhalus ===== */}
        <g opacity={A}>
          <g opacity={atom}>
            <OrbitalCloud id="1s" x={PX} y={PY} size={300} yaw={t * 0.2} dot={2} count={900} pos={C.cyan} neg={C.cyan} opacity={0.4} />
            <Nucleus x={PX} y={PY} r={34} label="p⁺" />
            <Spin x={PX} y={PY - 70} len={70} angle={0} color={C.red} />
            <Electron x={ex} y={ey} r={13} />
            <Spin x={ex} y={ey - 48} len={56} angle={180 * flip} color={C.cyan} />
            <Label x={PX} y={PY + 175} size={30} color={flip > 0.5 ? C.mint : C.gold} weight={700}>
              {flip > 0.5 ? 'spin berlawanan (F = 0)' : 'spin searah (F = 1)'}
            </Label>
          </g>
          <g opacity={levels}>
            <line x1={L.x0} y1={L.up} x2={L.x1} y2={L.up} stroke={C.gold} strokeWidth={5} />
            <line x1={L.x0} y1={L.down} x2={L.x1} y2={L.down} stroke={C.mint} strokeWidth={5} />
            <Label x={L.x1 + 16} y={L.up} size={26} color={C.gold} anchor="start">
              F = 1 · searah
            </Label>
            <Label x={L.x1 + 16} y={L.down} size={26} color={C.mint} anchor="start">
              F = 0 · berlawanan
            </Label>
            <line x1={L.x0 - 30} y1={L.up} x2={L.x0 - 30} y2={L.down} stroke={C.ink} strokeWidth={2} />
            <Label x={L.x0 - 44} y={(L.up + L.down) / 2} size={26} color={C.ink} anchor="end">
              ΔE ≈ 5,9 μeV
            </Label>
            <Label x={(L.x0 + L.x1) / 2} y={L.down + 60} size={22} color={C.muted}>
              (jarak digambar dibesarkan — aslinya ≈ 2,3 juta kali lebih kecil dari 13,6 eV)
            </Label>
            <circle cx={(L.x0 + L.x1) / 2} cy={dotY} r={14} fill={C.cyan} filter="url(#glow)" />
          </g>
          {/* gelombang mikro 21 cm */}
          <g opacity={wave * (1 - ramp(t, cue(4) - 0.8, cue(4) - 0.4))}>
            {(() => {
              const x0 = PX + 120;
              const len = 1200 * wave;
              const d = smoothPath(sample((u) => 720 + 26 * Math.sin((2 * Math.PI * (u - t * 140)) / 210), x0, x0 + len, 240));
              return (
                <g>
                  <path d={d} fill="none" stroke={C.violet} strokeWidth={5} filter="url(#glow)" opacity={0.9} />
                  <line x1={x0 + 210} y1={770} x2={x0 + 420} y2={770} stroke={C.violet} strokeWidth={2} opacity={ramp(wave, 0.4, 0.6)} />
                  <Label x={x0 + 315} y={800} size={24} color={C.violet} opacity={ramp(wave, 0.4, 0.6)}>
                    λ ≈ 21 cm
                  </Label>
                </g>
              );
            })()}
          </g>
        </g>
        {/* ===== B: maser & Galileo ===== */}
        <g opacity={B}>
          <g opacity={dev}>
            <rect x={540} y={300} width={260} height={420} rx={40} fill="#1b2340" stroke={C.muted} strokeWidth={3} />
            <ellipse cx={670} cy={510} rx={80} ry={130} fill="rgba(160,131,255,0.15)" stroke={C.violet} strokeWidth={3} />
            {Array.from({length: 14}, (_, k) => (
              <circle key={k} cx={670 + 50 * Math.sin(k * 2.1 + t * 2)} cy={510 + 100 * Math.cos(k * 1.3 + t * 1.5)} r={6} fill={k % 3 === 0 ? C.mint : C.gold} />
            ))}
            <Glow x={670} y={510} r={200} color="violet" opacity={0.35 + 0.15 * Math.sin(t * 9)} />
            <Label x={670} y={760} size={26} color={C.violet} weight={600}>
              rongga maser hidrogen
            </Label>
            <circle cx={1220} cy={510} r={170} fill="#0b1022" stroke={C.gold} strokeWidth={4} />
            {Array.from({length: 12}, (_, k) => (
              <line key={k} x1={1220 + 150 * Math.sin((k * Math.PI) / 6)} y1={510 - 150 * Math.cos((k * Math.PI) / 6)} x2={1220 + 165 * Math.sin((k * Math.PI) / 6)} y2={510 - 165 * Math.cos((k * Math.PI) / 6)} stroke={C.gold} strokeWidth={3} />
            ))}
            <line x1={1220} y1={510} x2={1220 + 140 * Math.sin(Math.floor(t * 2) * 0.1047)} y2={510 - 140 * Math.cos(Math.floor(t * 2) * 0.1047)} stroke={C.ink} strokeWidth={4} />
            <path d={`M800,510 C900,${510 - 60 * Math.sin(t * 6)} 960,${510 + 60 * Math.sin(t * 6)} 1050,510`} fill="none" stroke={C.violet} strokeWidth={4} />
            <Label x={1220} y={720} size={26} color={C.gold} font="mono">
              1 420 405 752 Hz
            </Label>
          </g>
          <g opacity={earth}>
            <circle cx={960} cy={520} r={160} fill="#0b2a52" stroke="#5b8cff" strokeWidth={3} />
            <Glow x={960} y={520} r={260} color="cyan" opacity={0.25} />
            {[-28, 0, 28].map((rot, k) => {
              const a = t * 0.5 + k * 2.1;
              const sx = 960 + 430 * Math.cos(a);
              const sy = 520 + 120 * Math.sin(a);
              const r = (rot * Math.PI) / 180;
              const X = 960 + (sx - 960) * Math.cos(r) - (sy - 520) * Math.sin(r);
              const Y = 520 + (sx - 960) * Math.sin(r) + (sy - 520) * Math.cos(r);
              return (
                <g key={k}>
                  <ellipse cx={960} cy={520} rx={430} ry={120} fill="none" stroke={C.muted} strokeOpacity={0.4} strokeWidth={2} transform={`rotate(${rot} 960 520)`} />
                  <Sat x={X} y={Y} s={0.6} glow={k === 1 ? 0.6 : 0} />
                </g>
              );
            })}
            <Label x={960} y={790} size={30} color={C.ink} weight={600}>
              konstelasi Galileo · ±23 000 km di atas Bumi
            </Label>
          </g>
        </g>
        {/* ===== C: 1 ns ≈ 30 cm ===== */}
        <g opacity={Cph}>
          <line x1={360} y1={600} x2={1560} y2={600} stroke={C.muted} strokeWidth={3} />
          {Array.from({length: 5}, (_, k) => (
            <g key={k}>
              <line x1={360 + k * 300} y1={585} x2={360 + k * 300} y2={615} stroke={C.ink} strokeWidth={3} />
              <Label x={360 + k * 300} y={645} size={26} color={C.ink} font="mono">
                {k === 0 ? '0' : `${k} ns`}
              </Label>
              <Label x={360 + k * 300} y={555} size={24} color={C.gold} font="mono" opacity={ramp(pulse, k / 4 - 0.02, k / 4 + 0.05)}>
                {k === 0 ? '0' : `${k * 30} cm`}
              </Label>
            </g>
          ))}
          <Glow x={mix(360, 1560, pulse)} y={600} r={80} color="gold" opacity={0.9} />
          <circle cx={mix(360, 1560, pulse)} cy={600} r={10} fill="#fff" />
        </g>
        {/* ===== D: ponsel ===== */}
        <g opacity={Dph}>
          <rect x={860} y={330} width={200} height={380} rx={30} fill="#0b1022" stroke={C.ink} strokeWidth={4} />
          <rect x={876} y={360} width={168} height={320} rx={10} fill="#12305a" />
          <path d="M880,470 C930,450 980,520 1040,480 M880,580 C940,560 990,620 1040,600 M920,370 L960,680" stroke="#4f7dff" strokeWidth={6} fill="none" opacity={0.6} />
          <path d={`M960,${520 - 8 * Math.abs(Math.sin(t * 3))} m0,-40 c-22,0 -34,18 -34,32 c0,24 34,52 34,52 s34,-28 34,-52 c0,-14 -12,-32 -34,-32 z`} fill={C.red} />
          {[420, 960, 1500].map((sx, k) => (
            <g key={k}>
              <Sat x={sx} y={200} s={0.7} glow={0.4} />
              <line x1={sx} y1={220} x2={960} y2={420} stroke={C.gold} strokeWidth={2} strokeDasharray="8 10" strokeDashoffset={-t * 60} opacity={0.7} />
            </g>
          ))}
        </g>
      </Stage>
      <Formula x={1390} y={250} p={A * nuCard} accent={C.violet} caption="≈ 1,42 GHz · λ ≈ 21 cm (gelombang mikro)">
        <V>ν</V>&nbsp;=&nbsp;<Frac n={<>Δ<V>E</V></>} d={<V>h</V>} />
        &nbsp;≈&nbsp;1&nbsp;420&nbsp;405&nbsp;752&nbsp;Hz
      </Formula>
      <Formula x={960} y={225} p={B * esa} accent={C.gold} caption="maser hidrogen pasif satelit Galileo (ESA)">
        <span style={{fontFamily: FONT.sans, fontSize: '0.8em'}}>meleset ≈&nbsp;</span>
        <Frac n={<span style={{fontFamily: FONT.sans}}>1 detik</span>} d={<span style={{fontFamily: FONT.sans}}>3 juta tahun</span>} />
      </Formula>
      <Formula x={960} y={300} p={Cph * ramp(t, cue(7) + 0.2, cue(7) + 1)} accent={C.gold} caption="untuk Δt = 1 ns (c ≈ 3,00 × 10⁸ m/s)">
        Δ<V>x</V>&nbsp;=&nbsp;<V>c</V>&nbsp;·&nbsp;Δ<V>t</V>&nbsp;≈&nbsp;30 cm
      </Formula>
      <Formula x={1460} y={820} p={Dph * ramp(t, wordOf(8, 'peta'), wordOf(8, 'peta') + 0.6)} accent={C.mint} size={48}>
        <span style={{fontFamily: FONT.sans}}>
          spin 1 elektron → <V>ν</V>
          <Sub>21 cm</Sub> → posisi
        </span>
      </Formula>
    </AbsoluteFill>
  );
};
