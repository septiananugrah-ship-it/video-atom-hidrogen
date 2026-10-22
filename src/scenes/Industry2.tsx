import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Badge, DrawPath, Glow, Label, Stage} from '../components/primitives';
import {wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Garis emisi tampak (udara, nm) untuk "kode batang" unsur.
const BARCODE = [
  {el: 'H', lines: [656.3, 486.1, 434.0, 410.2]},
  {el: 'Na', lines: [589.0, 589.6]},
  {el: 'Hg', lines: [404.7, 435.8, 546.1, 577.0, 579.1]},
];
const BX = {x0: 520, x1: 1500};
const bX = (nm: number) => mix(BX.x0, BX.x1, (nm - 390) / (700 - 390));
const METALS = [
  {el: 'Pb', nm: '220,35 nm', name: 'timbal'},
  {el: 'Cd', nm: '228,80 nm', name: 'kadmium'},
  {el: 'As', nm: '193,70 nm', name: 'arsen'},
];

export const Industry2: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const A = win(t, cue(0) - 0.4, cue(2) - 0.4, 0.8, 0.7);
  const rows = BARCODE.map((_, i) => ramp(t, cue(0) + 0.6 + i * 0.6, cue(0) + 1.4 + i * 0.6));
  const tags = ramp(t, cue(1), cue(1) + 0.7, BACK);
  const B = win(t, cue(2) - 0.3, cue(5) - 0.4, 0.8, 0.7);
  const torch = ramp(t, cue(2), cue(2) + 1);
  const temp = ramp(t, wordOf(2, 'enam'), wordOf(2, 'enam') + 0.6, BACK);
  const emit = ramp(t, cue(3), cue(3) + 1, EASE_IN_OUT);
  const calib = ramp(t, wordOf(3, 'intensitas'), wordOf(3, 'intensitas') + 1.4, EASE_IN_OUT);
  const metals = METALS.map((_, i) => ramp(t, cue(4) + 0.6 + i * 0.4, cue(4) + 1.2 + i * 0.4, BACK));
  const Cph = win(t, cue(5) - 0.3, cue(7) - 0.4, 0.8, 0.7);
  const trace = ramp(t, cue(5) + 0.4, cue(5) + 4, EASE_IN_OUT);
  const stark = ramp(t, cue(6), cue(6) + 1.6, EASE_IN_OUT);
  const D = ramp(t, cue(7) - 0.3, cue(7) + 0.8);
  const flame = (k: number) => 0.85 + 0.15 * Math.sin(t * (17 + k * 5) + k);

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== kode batang unsur ===== */}
        <g opacity={A}>
          {BARCODE.map((b, i) => {
            const y = 300 + i * 150;
            return (
              <g key={b.el} opacity={rows[i]}>
                <text x={430} y={y} textAnchor="end" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={800} fontSize={54} fill={C.ink}>
                  {b.el}
                </text>
                <rect x={BX.x0} y={y - 50} width={BX.x1 - BX.x0} height={100} rx={8} fill="#060914" stroke={C.faint} strokeWidth={2} />
                {b.lines.map((nm) => (
                  <rect key={nm} x={bX(nm) - 3} y={y - 46} width={6} height={92} fill={wlColor(nm)} filter="url(#glow)" />
                ))}
              </g>
            );
          })}
          <Label x={(BX.x0 + BX.x1) / 2} y={760} size={24} color={C.muted} opacity={rows[2]}>
            garis emisi tampak (390–700 nm): setiap unsur punya "kode batang" sendiri
          </Label>
        </g>
        {/* ===== ICP-OES ===== */}
        <g opacity={B}>
          <g opacity={torch}>
            {/* obor plasma */}
            <rect x={300} y={560} width={80} height={240} rx={10} fill="rgba(180,200,255,0.1)" stroke="#9fb0d8" strokeWidth={2} />
            {[0, 1, 2, 3].map((k) => (
              <ellipse key={k} cx={340} cy={590 + k * 26} rx={70} ry={10} fill="none" stroke={C.amber} strokeWidth={6} />
            ))}
            <Glow x={340} y={460} r={190} color="white" opacity={0.55 * flame(0)} />
            <path d={`M290,570 C280,${470 - 20 * flame(1)} 320,${380 - 30 * flame(2)} 340,${330 - 20 * flame(1)} C360,${380 - 30 * flame(2)} 400,${470 - 20 * flame(1)} 390,570 Z`} fill="#fff4ff" opacity={0.85} filter="url(#glow-strong)" />
            <path d="M310,570 C305,500 330,450 340,420 C350,450 375,500 370,570 Z" fill={C.violet} opacity={0.6} />
            <Label x={340} y={840} size={22} color={C.muted}>
              aerosol sampel + argon
            </Label>
          </g>
          <g opacity={temp}>
            <Label x={560} y={300} size={30} color={C.gold} weight={700} anchor="start">
              plasma argon
            </Label>
            <Label x={560} y={340} size={26} color={C.gold} anchor="start" font="mono">
              ≈ 6 000 – 10 000 K
            </Label>
          </g>
          {/* cahaya emisi → spektrometer */}
          <g opacity={emit}>
            {[0, 1, 2].map((k) => (
              <line key={k} x1={420} y1={460} x2={mix(420, 860, emit)} y2={460 + (k - 1) * 14} stroke={[C.violet, C.cyan, C.gold][k]} strokeWidth={4} opacity={0.7} />
            ))}
            <rect x={860} y={400} width={150} height={120} rx={12} fill="#1b2340" stroke={C.cyan} strokeWidth={2} />
            <Label x={935} y={460} size={22} color={C.cyan} weight={600}>
              spektrometer
            </Label>
          </g>
          {/* kurva kalibrasi */}
          <g opacity={calib}>
            <line x1={1120} y1={780} x2={1500} y2={780} stroke={C.muted} strokeWidth={2} />
            <line x1={1120} y1={790} x2={1120} y2={420} stroke={C.muted} strokeWidth={2} />
            <DrawPath d="M1120,780 L1480,450" p={calib} stroke={C.gold} width={4} len={600} />
            {[0.2, 0.45, 0.7, 0.92].map((f) => (
              <circle key={f} cx={1120 + 360 * f} cy={780 - 330 * f + (f === 0.45 ? 8 : -6)} r={9} fill={C.cyan} />
            ))}
            <Label x={1310} y={820} size={22} color={C.muted}>
              kadar unsur
            </Label>
            <Label x={1100} y={420} size={22} color={C.muted} anchor="end">
              intensitas
            </Label>
          </g>
          {METALS.map((m, i) => (
            <g key={m.el} opacity={metals[i]}>
              <rect x={1570} y={270 + i * 150} width={170} height={120} rx={14} fill="rgba(12,18,40,0.9)" stroke={C.red} strokeWidth={2} />
              <text x={1655} y={318 + i * 150} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={44} fill={C.ink}>
                {m.el}
              </text>
              <text x={1655} y={360 + i * 150} textAnchor="middle" fontFamily={FONT.mono} fontSize={18} fill={C.muted}>
                {m.nm}
              </text>
            </g>
          ))}
        </g>
        {/* ===== plasma etsa & Stark ===== */}
        <g opacity={Cph}>
          <rect x={200} y={300} width={560} height={420} rx={24} fill="#0b1022" stroke={C.muted} strokeWidth={3} />
          <rect x={260} y={620} width={440} height={30} rx={6} fill="#5d6680" />
          <ellipse cx={480} cy={520} rx={210} ry={80} fill={C.violet} opacity={0.35 * flame(3)} filter="url(#glow-strong)" />
          <Label x={480} y={690} size={22} color={C.muted}>
            wafer silikon
          </Label>
          <Label x={480} y={270} size={26} color={C.ink} weight={600}>
            ruang plasma etsa
          </Label>
          {/* jejak OES vs waktu */}
          <line x1={860} y1={720} x2={1240} y2={720} stroke={C.muted} strokeWidth={2} />
          <line x1={860} y1={730} x2={860} y2={380} stroke={C.muted} strokeWidth={2} />
          <DrawPath d="M860,450 L1010,455 C1040,458 1050,640 1080,650 L1240,655" p={trace} stroke={C.cyan} width={4} len={900} />
          <line x1={1050} y1={380} x2={1050} y2={720} stroke={C.gold} strokeWidth={2} strokeDasharray="6 6" opacity={ramp(trace, 0.6, 0.8)} />
          <Label x={1050} y={360} size={22} color={C.gold} weight={700} opacity={ramp(trace, 0.6, 0.8)}>
            titik akhir → stop
          </Label>
          <Label x={1050} y={756} size={20} color={C.muted}>
            waktu
          </Label>
          <Label x={846} y={390} size={20} color={C.muted} anchor="end">
            I
          </Label>
          {/* pelebaran Stark */}
          <g opacity={stark}>
            {(() => {
              const prof = (w: number, h: number) => {
                const pts: string[] = [];
                for (let i = 0; i <= 120; i++) {
                  const u = -1 + (2 * i) / 120;
                  pts.push(`${i === 0 ? 'M' : 'L'}${(1530 + u * 200).toFixed(1)},${(720 - h * Math.exp(-((u / w) ** 2))).toFixed(1)}`);
                }
                return pts.join(' ');
              };
              return (
                <g>
                  <line x1={1320} y1={720} x2={1740} y2={720} stroke={C.muted} strokeWidth={2} />
                  <path d={prof(0.06, 300)} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.6} />
                  <path d={prof(mix(0.06, 0.32, stark), mix(300, 120, stark))} fill="none" stroke={wlColor(486)} strokeWidth={5} filter="url(#glow)" />
                  <Label x={1530} y={360} size={24} color={C.ink} weight={600}>
                    garis Balmer melebar
                  </Label>
                  <Label x={1530} y={756} size={20} color={C.muted}>
                    lebar garis → kerapatan elektron
                  </Label>
                </g>
              );
            })()}
          </g>
        </g>
      </Stage>
      <Badge x={1700} y={380} text="emisi atom" color={C.gold} opacity={A * tags} />
      <Badge x={1700} y={480} text="serapan atom" color={C.cyan} opacity={A * tags} />
      {['air minum', 'pangan', 'farmasi', 'semikonduktor', 'laboratorium mutu'].map((s, i) => (
        <Badge key={s} x={260 + i * 350} y={500} text={s} color={[C.cyan, C.mint, C.gold, C.violet, C.amber][i]} opacity={D * ramp(t, cue(7) + i * 0.3, cue(7) + i * 0.3 + 0.5)} />
      ))}
    </AbsoluteFill>
  );
};
