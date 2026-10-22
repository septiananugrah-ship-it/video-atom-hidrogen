import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, ramp, win} from '../anim';
import {Card, Glow, Label, Stage} from '../components/primitives';
import {Electron, Nucleus, OrbitalCloud, orbitalBox, orbitalPoints, projectPoint, type OrbitalId} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const D_ORBS: {id: OrbitalId; name: string; sub: string}[] = [
  {id: '3dxy', name: 'd', sub: 'xy'},
  {id: '3dxz', name: 'd', sub: 'xz'},
  {id: '3dyz', name: 'd', sub: 'yz'},
  {id: '3dx2y2', name: 'd', sub: 'x²−y²'},
  {id: '3dz2', name: 'd', sub: 'z²'},
];

const Name: React.FC<{x: number; y: number; n: string; sub?: string; color?: string; opacity?: number; size?: number}> = ({x, y, n, sub, color = C.ink, opacity = 1, size = 36}) => (
  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={700} fontSize={size} fill={color} opacity={opacity}>
    {n}
    {sub ? (
      <tspan fontSize={size * 0.6} dy={size * 0.25}>
        {sub}
      </tspan>
    ) : null}
  </text>
);

// skala yang sama untuk 1s dan 2s: 28 px per jari-jari Bohr
const PX_A = 28;
const N_EXPO = 1800;

export const Orbitals: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const yaw = t * 0.35;
  // Fase A: s (baris 0–2)
  const A = win(t, cue(0) - 0.4, cue(3) - 0.4, 0.8, 0.7);
  const s1 = ramp(t, cue(1) - 0.2, cue(1) + 1.6, EASE_IN_OUT);
  const s2 = ramp(t, cue(2) - 0.2, cue(2) + 1.6, EASE_IN_OUT);
  const merge = ramp(t, cue(0), cue(0) + 1.5, EASE_IN_OUT);
  // Fase B: p (baris 3–4)
  const B = win(t, cue(3) - 0.3, cue(5) - 0.4, 0.8, 0.7);
  const pz = ramp(t, cue(3), cue(3) + 1.6, EASE_IN_OUT);
  const plane = ramp(t, wordOf(3, 'bidang'), wordOf(3, 'bidang') + 0.8);
  const trio = ramp(t, cue(4), cue(4) + 1.2, EASE_IN_OUT);
  // Fase C: d (baris 5–6)
  const Cph = win(t, cue(5) - 0.3, cue(7) - 0.4, 0.8, 0.7);
  const ds = D_ORBS.map((_, i) => ramp(t, cue(5) + 0.3 + i * 0.4, cue(5) + 1.5 + i * 0.4, EASE_IN_OUT));
  const clover = ramp(t, wordOf(6, 'semanggi'), wordOf(6, 'semanggi') + 0.6);
  const z2 = ramp(t, wordOf(6, 'cincin'), wordOf(6, 'cincin') + 0.6);
  // Fase D: bukan lintasan (baris 7)
  const Dph = ramp(t, cue(7) - 0.3, cue(7) + 0.8);
  const sweep = ramp(t, cue(7) + 1.6, cue(7) + 7.5, (x) => x * x);
  // pz: tunggal (besar di tengah) → menjadi trio
  const pzX = 960 + (1440 - 960) * trio;
  const pzSize = 330 - 130 * trio;

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== s ===== */}
        <g opacity={A}>
          {/* separuh radial + separuh sudut menyatu */}
          <g opacity={1 - ramp(t, cue(1) - 0.4, cue(1) + 0.2)}>
            <text x={760 + 120 * merge} y={500} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={90} fill={C.cyan} opacity={merge}>
              R
            </text>
            <text x={1160 - 120 * merge} y={500} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={90} fill={C.violet} opacity={merge}>
              Y
            </text>
            <text x={960} y={500} textAnchor="middle" fontFamily={FONT.sans} fontSize={60} fill={C.ink} opacity={merge}>
              ×
            </text>
          </g>
          <OrbitalCloud id="1s" x={640} y={500} size={orbitalBox('1s') * PX_A} yaw={yaw} p={s1} count={1500} dot={2.2} />
          <Nucleus x={640} y={500} r={8} opacity={s1} />
          <Name x={640} y={800} n="1s" color={C.gold} opacity={s1} size={44} />
          <Label x={960} y={160} size={24} color={C.muted} opacity={s2}>
            skala sama: ⟨r⟩₁ₛ = 1,5a · ⟨r⟩₂ₛ = 6a
          </Label>
          <OrbitalCloud id="2s" x={1280} y={500} size={orbitalBox('2s') * PX_A} yaw={0} pitch={0} p={s2} count={2600} slab={0.05} dot={2.2} />
          <Nucleus x={1280} y={500} r={8} opacity={s2} />
          <Name x={1280} y={800} n="2s" color={C.gold} opacity={s2} size={44} />
          <Label x={1280} y={850} size={22} color={C.muted} opacity={s2}>
            irisan melintang: bola dalam (+) · bola luar (−) · simpul r = 2a
          </Label>
        </g>
        {/* ===== p ===== */}
        <g opacity={B}>
          <g opacity={plane * (1 - trio)}>
            <ellipse cx={960} cy={500} rx={360} ry={80} fill={C.ink} opacity={0.08} stroke={C.ink} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="10 8" />
            <Label x={1340} y={560} size={24} color={C.ink} anchor="start">
              bidang simpul
            </Label>
          </g>
          <OrbitalCloud id="2pz" x={pzX} y={500} size={pzSize} yaw={yaw} pitch={0.32} p={pz} count={1800} />
          <Nucleus x={pzX} y={500} r={8} opacity={pz} />
          <Name x={pzX} y={500 + pzSize + 50 - 40 * trio} n="2p" sub="z" color={C.cyan} opacity={pz} />
          {(['2px', '2py'] as OrbitalId[]).map((id, k) => (
            <g key={id} opacity={trio}>
              <OrbitalCloud id={id} x={480 + k * 480} y={500} size={200} yaw={yaw} pitch={0.32} count={1500} />
              <Nucleus x={480 + k * 480} y={500} r={8} />
              <Name x={480 + k * 480} y={710} n="2p" sub={'xy'[k]} color={C.cyan} />
            </g>
          ))}
          <g opacity={pz * (1 - trio)}>
            <Label x={960 - 300} y={260} size={28} color={C.gold} weight={600}>
              cuping fase +
            </Label>
            <Label x={960 - 300} y={760} size={28} color={C.cyan} weight={600}>
              cuping fase −
            </Label>
          </g>
        </g>
        {/* ===== d ===== */}
        <g opacity={Cph}>
          {D_ORBS.map((o, i) => {
            const x = 250 + i * 355;
            const hl = i < 4 ? clover : z2;
            return (
              <g key={o.id}>
                <rect x={x - 160} y={300} width={320} height={460} rx={24} fill={C.violet} opacity={0.08 * hl} stroke={C.violet} strokeOpacity={0.5 * hl} strokeWidth={2} />
                <OrbitalCloud id={o.id} x={x} y={500} size={170} yaw={yaw + (o.id === '3dz2' ? 0 : 0.3)} pitch={o.id === '3dxy' || o.id === '3dx2y2' ? 1.1 : 0.32} p={ds[i]} count={1400} dot={2} />
                <Nucleus x={x} y={500} r={6} opacity={ds[i]} />
                <Name x={x} y={720} n="3d" sub={o.sub} color={C.violet} opacity={ds[i]} />
              </g>
            );
          })}
        </g>
        {/* ===== bukan lintasan: eksposur panjang ===== */}
        <g opacity={Dph}>
          {(() => {
            const orbit = 1 - ramp(t, cue(7) + 1.2, cue(7) + 2.2);
            const a0 = t * 2.4;
            const ex = 960 + 260 * Math.cos(a0);
            const ey = 500 + 90 * Math.sin(a0);
            // setiap "pengukuran" menemukan elektron di satu titik acak menurut |ψ|²
            const k = Math.floor(N_EXPO * sweep);
            const pts = orbitalPoints('2pz', N_EXPO);
            const now = pts[Math.min(N_EXPO - 1, k)];
            const [nx, ny] = projectPoint(now, 960, 500, 300, yaw, 0.32);
            return (
              <g>
                <g opacity={orbit}>
                  <ellipse cx={960} cy={500} rx={260} ry={90} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="12 10" />
                  <Electron x={ex} y={ey} r={11} />
                  <line x1={700} y1={410} x2={1220} y2={590} stroke={C.red} strokeWidth={8} opacity={ramp(t, cue(7) + 0.4, cue(7) + 0.8)} />
                  <Label x={960} y={650} size={28} color={C.red} weight={600}>
                    lintasan melingkar ✗
                  </Label>
                </g>
                <OrbitalCloud id="2pz" x={960} y={500} size={300} yaw={yaw} pitch={0.32} count={N_EXPO} p={sweep} />
                <Nucleus x={960} y={500} r={8} />
                {sweep > 0 && sweep < 1 ? (
                  <g>
                    <Glow x={nx} y={ny} r={46} color="white" opacity={0.9} />
                    <circle cx={nx} cy={ny} r={7} fill="#fff" />
                  </g>
                ) : null}
                <Label x={1400} y={800} size={26} color={C.muted} opacity={ramp(t, cue(7) + 2, cue(7) + 3)} anchor="start">
                  {`${k.toLocaleString('id-ID')} pengukuran posisi`}
                </Label>
              </g>
            );
          })()}
        </g>
      </Stage>
      <Card x={960} y={200} opacity={Dph} accent={C.gold} style={{fontSize: 36}}>
        orbital = fungsi gelombang, <span style={{color: C.red}}>bukan lintasan</span>
      </Card>
      <Card x={960} y={210} opacity={Cph * ramp(t, cue(5) + 0.2, cue(5) + 1, BACK)} accent={C.violet} style={{fontSize: 34}}>
        ℓ = 2 · 5 orientasi · 2 permukaan simpul sudut
      </Card>
      <Card x={960} y={210} opacity={B * pz * (1 - trio)} accent={C.cyan} style={{fontSize: 34}}>
        ℓ = 1 · 1 bidang simpul melalui inti
      </Card>
    </AbsoluteFill>
  );
};
