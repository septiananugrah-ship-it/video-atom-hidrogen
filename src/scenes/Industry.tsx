import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {Card, DrawPath, Glow, Label, Stage} from '../components/primitives';
import {wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Plot emisi lampu deuterium (skematis): kontinum UV + garis Balmer D (udara: 486,0 & 656,1 nm).
const PL = {x0: 240, x1: 1200, y: 820, h: 290, l0: 180, l1: 700};
const lx = (nm: number) => mix(PL.x0, PL.x1, (nm - PL.l0) / (PL.l1 - PL.l0));
const cont = (nm: number) => (nm < 185 ? 0 : 0.9 * Math.exp(-(((nm - 225) / 70) ** 2)) + 0.28 * Math.exp(-(((nm - 330) / 120) ** 2)));
const LINES = [
  {nm: 486.0, h: 0.75, name: 'D-β 486,0'},
  {nm: 656.1, h: 1.05, name: 'D-α 656,1'},
];
const spec = (nm: number, w = 1.2) => cont(nm) * 0.7 + LINES.reduce((s, l) => s + l.h * Math.exp(-(((nm - l.nm) / w) ** 2)), 0);
const specPath = (shift = 0, w = 1.2) => {
  const pts: string[] = [];
  for (let i = 0; i <= 900; i++) {
    const nm = PL.l0 + ((PL.l1 - PL.l0) * i) / 900;
    pts.push(`${i === 0 ? 'M' : 'L'}${lx(nm).toFixed(1)},${(PL.y - Math.min(1.15, spec(nm - shift, w)) * PL.h).toFixed(1)}`);
  }
  return pts.join(' ');
};

export const Industry: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const inst = ramp(t, 0.1, 1.3);
  const lamp = Math.max(0.35 * ramp(t, 0.4, 1.2), ramp(t, wordOf(1, 'deuterium'), wordOf(1, 'deuterium') + 0.6));
  const beam = ramp(t, wordOf(1, 'sumber') , wordOf(1, 'sumber') + 1.5, EASE_IN_OUT);
  const axes = ramp(t, cue(2) - 0.3, cue(2) + 0.6);
  const contP = ramp(t, cue(2), cue(2) + 1.8, EASE_IN_OUT);
  const lines = ramp(t, cue(3), cue(3) + 1, EASE_IN_OUT);
  const ruler = ramp(t, cue(4), cue(4) + 1);
  const pharma = ramp(t, cue(5), cue(5) + 0.7, BACK);
  const shift = ramp(t, cue(6), cue(6) + 0.8);
  const fix = ramp(t, cue(6) + 1.6, cue(6) + 3, EASE_IN_OUT);
  const off = 3 * (1 - fix); // nm, puncak terbaca bergeser lalu dikoreksi
  const flicker = 0.85 + 0.15 * Math.sin(t * 31) * Math.sin(t * 13);

  return (
    <AbsoluteFill>
      <Stage>
        {/* skema spektrofotometer */}
        <g opacity={inst}>
          {/* lampu */}
          <Glow x={300} y={330} r={110} color="violet" opacity={0.7 * lamp * flicker} />
          <ellipse cx={300} cy={330} rx={55} ry={65} fill="rgba(200,190,255,0.12)" stroke="#cfc8ff" strokeWidth={3} />
          <circle cx={300} cy={330} r={16} fill="#e9e3ff" opacity={lamp * flicker} filter="url(#glow-strong)" />
          <rect x={270} y={392} width={60} height={34} rx={6} fill="#4a5266" />
          <Label x={300} y={460} size={22} color={C.violet} weight={600}>
            lampu D₂
          </Label>
          {/* berkas */}
          <line x1={360} y1={330} x2={mix(360, 640, beam)} y2={330} stroke="#d9d0ff" strokeWidth={8} opacity={0.6 * beam} filter="url(#glow)" />
          {/* kisi difraksi */}
          <g opacity={beam}>
            <rect x={640} y={270} width={20} height={120} fill="#8ea0c8" />
            {Array.from({length: 12}, (_, i) => (
              <line key={i} x1={640} y1={276 + i * 9.5} x2={660} y2={276 + i * 9.5} stroke="#24304f" strokeWidth={2} />
            ))}
            <Label x={650} y={430} size={22} color={C.muted}>
              monokromator
            </Label>
            {[300, 450, 600].map((nm, i) => (
              <line key={nm} x1={665} y1={330} x2={900} y2={300 + i * 30} stroke={nm < 400 ? C.violet : wlColor(nm)} strokeWidth={3} opacity={0.6} />
            ))}
            <line x1={900} y1={330} x2={1010} y2={330} stroke={C.violet} strokeWidth={5} opacity={0.8} />
            <rect x={1010} y={280} width={60} height={110} rx={6} fill="rgba(120,200,255,0.15)" stroke={C.cyan} strokeWidth={2} />
            <Label x={1040} y={430} size={22} color={C.muted}>
              sampel
            </Label>
            <line x1={1070} y1={330} x2={1260} y2={330} stroke={C.violet} strokeWidth={4} opacity={0.6} />
            <rect x={1260} y={290} width={70} height={80} rx={8} fill="#1b2340" stroke={C.gold} strokeWidth={2} />
            <Label x={1295} y={430} size={22} color={C.muted}>
              detektor
            </Label>
            <rect x={1400} y={260} width={300} height={150} rx={12} fill="#0b1022" stroke={C.faint} strokeWidth={2} />
            <Label x={1550} y={300} size={22} color={C.muted} font="mono">
              UV-Vis / HPLC
            </Label>
            <DrawPath d={`M1420,380 Q1480,380 1500,340 T1560,360 T1680,330`} p={beam} stroke={C.mint} width={3} len={600} />
          </g>
        </g>
        {/* spektrum emisi lampu */}
        <g opacity={axes}>
          <line x1={PL.x0} y1={PL.y} x2={PL.x1 + 20} y2={PL.y} stroke={C.muted} strokeWidth={2} />
          {[200, 300, 400, 500, 600, 700].map((nm) => (
            <Label key={nm} x={lx(nm)} y={PL.y + 24} size={18} color={C.faint} font="mono">
              {nm}
            </Label>
          ))}
          <Label x={PL.x1 + 60} y={PL.y + 24} size={20} color={C.faint}>
            nm
          </Label>
          <rect x={lx(380)} y={PL.y - PL.h - 20} width={lx(700) - lx(380)} height={PL.h + 20} fill="url(#rainbow-h)" opacity={0.06} />
        </g>
        <DrawPath d={specPath(off * shift, 1.2)} p={Math.min(contP, 0.999) + lines * 0.001} stroke={C.violet} width={4} len={5000} />
        <g opacity={lines}>
          {LINES.map((l) => (
            <g key={l.nm}>
              <Glow x={lx(l.nm + off * shift)} y={PL.y - l.h * PL.h} r={40} color="white" opacity={0.5} />
              <Label x={lx(l.nm) + (l.nm < 500 ? -14 : 14)} y={PL.y - l.h * PL.h + 6} size={22} color={wlColor(l.nm)} weight={700} anchor={l.nm < 500 ? 'end' : 'start'} font="mono">
                {l.name}
              </Label>
            </g>
          ))}
          <Label x={lx(250)} y={PL.y - 0.75 * PL.h} size={22} color={C.violet}>
            kontinum UV
          </Label>
        </g>
        {/* penggaris */}
        <g opacity={ruler}>
          <rect x={PL.x0} y={PL.y + 46} width={PL.x1 - PL.x0} height={22} rx={4} fill={C.gold} opacity={0.18} stroke={C.gold} strokeOpacity={0.6} />
          {Array.from({length: 53}, (_, i) => (
            <line key={i} x1={lx(180 + i * 10)} y1={PL.y + 46} x2={lx(180 + i * 10)} y2={PL.y + 46 + (i % 5 === 0 ? 14 : 7)} stroke={C.gold} strokeWidth={1.5} />
          ))}
          {LINES.map((l) => (
            <line key={l.nm} x1={lx(l.nm)} y1={PL.y - l.h * PL.h} x2={lx(l.nm)} y2={PL.y + 68} stroke={C.gold} strokeWidth={2} strokeDasharray="5 5" />
          ))}
        </g>
        {/* koreksi */}
        <g opacity={shift}>
          <Label x={lx(656.1 + off) + 16} y={PL.y - 1.12 * PL.h} size={22} color={fix > 0.95 ? C.mint : C.red} anchor="start" weight={700}>
            {fix > 0.95 ? '✓ dikalibrasi' : `terbaca ${(656.1 + off).toFixed(1).replace('.', ',')} nm`}
          </Label>
        </g>
      </Stage>
      <Card x={1740} y={640} opacity={pharma} accent={C.gold} anchor="right" style={{fontSize: 26}}>
        <div style={{fontFamily: FONT.mono, color: C.gold, fontSize: 20, letterSpacing: 2}}>FARMAKOPE</div>
        <div>uji ketepatan panjang gelombang</div>
        <div style={{color: C.muted, fontSize: 22}}>garis D₂ 486,0 & 656,1 nm (di udara)</div>
      </Card>
    </AbsoluteFill>
  );
};
