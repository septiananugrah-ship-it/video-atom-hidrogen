import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Frac, Glow, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {En, Electron, PhotonPacket, lambdaNm, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Diagram tingkat (linear eV) di atas, pita spektrum (skala log λ) di bawah.
const D = {x0: 160, x1: 1760, top: 200, bottom: 600};
const S = {x0: 200, x1: 1720, y: 750, h: 70, lmin: 80, lmax: 2000};
const lX = (nm: number) => mix(S.x0, S.x1, Math.log(nm / S.lmin) / Math.log(S.lmax / S.lmin));
const NMAX = 7;
const SERIES = [
  {nf: 1, name: 'Lyman', x: 300, col: C.violet, region: 'ultraviolet'},
  {nf: 2, name: 'Balmer', x: 760, col: C.cyan, region: 'tampak + UV'},
  {nf: 3, name: 'Paschen', x: 1330, col: C.red, region: 'inframerah'},
];
const lineCol = (nm: number) => (nm < 380 ? C.violet : nm > 750 ? '#c0392b' : wlColor(nm));
const R_NM = 1.0967758e-2;
const BALMER_X = (k: number) => SERIES[1].x + k * 70;

export const Series: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  // kamera: zoom ke tingkat n ≥ 2 selama deret Balmer & Paschen
  const zoom = win(t, cue(5) - 0.3, cue(10) - 0.2, 1.4, 1.4);
  const eY = (e: number) => mix(mix(D.bottom, D.top, (e + 13.6) / 14.2), mix(D.bottom, D.top, (e + 3.75) / 4.35), zoom);

  const diag = ramp(t, 0.1, 1.2);
  const drop = ramp(t, cue(0) + 1.2, cue(0) + 2.2, EASE_IN_OUT);
  const ph = ramp(t, cue(0) + 2.0, cue(0) + 4.5);
  const gap = ramp(t, cue(1), cue(1) + 0.6) * (1 - ramp(t, cue(2) - 0.3, cue(2)));
  const formula = win(t, cue(2) - 0.2, cue(3) - 0.4, 0.7, 0.6);
  const strip = ramp(t, cue(3) - 0.3, cue(3) + 0.7);
  const serT = [cue(3), cue(5), cue(9)];
  const sers = serT.map((c) => ramp(t, c, c + 1.8, EASE_IN_OUT));
  const lya = ramp(t, cue(4), cue(4) + 0.6, BACK);
  // empat garis Balmer tampak, tepat saat disebut
  const bWords = [wordOf(6, 'Tiga'), wordOf(7, 'empat'), wordOf(7, 'lima'), wordOf(7, 'enam', 1)];
  const bFly = bWords.map((w) => ramp(t, w + 0.25, w + 1.25, EASE_IN_OUT));
  const bLand = bWords.map((w) => ramp(t, w + 1.15, w + 1.45));
  const four = ramp(t, cue(8), cue(8) + 0.6) * (1 - ramp(t, cue(9), cue(9) + 0.6));
  const limits = ramp(t, cue(10) + 0.5, cue(10) + 1.6);
  const dim = 1 - 0.75 * formula;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <clipPath id="series-clip">
            <rect x={0} y={150} width={1920} height={505} />
          </clipPath>
        </defs>
        <g opacity={diag * dim} clipPath="url(#series-clip)">
          <line x1={D.x0} y1={eY(0)} x2={D.x1} y2={eY(0)} stroke={C.ink} strokeWidth={2} strokeDasharray="10 8" opacity={0.7} />
          <Label x={D.x1} y={eY(0) - 22} size={22} color={C.muted} anchor="end">
            n = ∞ (0 eV)
          </Label>
          {Array.from({length: NMAX}, (_, i) => i + 1).map((n) => (
            <g key={n}>
              <line x1={D.x0} y1={eY(En(n))} x2={D.x1} y2={eY(En(n))} stroke={C.ink} strokeOpacity={n <= 3 ? 0.75 : 0.35} strokeWidth={n <= 3 ? 3 : 2} />
              {n <= 3 || (zoom > 0.5 && n <= 5) ? (
                <Label x={D.x0 - 14} y={eY(En(n))} size={24} color={C.ink} anchor="end" font="serif" italic opacity={n <= 3 ? 1 : zoom}>
                  n = {n}
                </Label>
              ) : null}
            </g>
          ))}
          {/* elektron 3 → 2 memancarkan foton (pengantar) */}
          <g opacity={1 - sers[1]}>
            <Electron x={1580} y={mix(eY(En(3)), eY(En(2)), drop)} r={11} />
            <PhotonPacket x={1580 + 260 * ph} y={mix(eY(En(2)), 120, ph) + 30} wavelength={40} color={wlColor(656)} amp={20} len={170} opacity={ph > 0 ? 1 - ramp(t, cue(0) + 4, cue(0) + 4.6) : 0} phase={-t * 12} angle={-30} />
          </g>
          <g opacity={gap}>
            <line x1={1520} y1={eY(En(3))} x2={1520} y2={eY(En(2))} stroke={C.gold} strokeWidth={3} />
            <Label x={1500} y={(eY(En(3)) + eY(En(2))) / 2} size={28} color={C.gold} anchor="end" weight={700}>
              E foton = ΔE
            </Label>
          </g>
          {/* panah transisi per deret */}
          {SERIES.map((s, si) => (
            <g key={s.name} opacity={sers[si]}>
              {Array.from({length: NMAX - s.nf}, (_, k) => {
                const ni = s.nf + 1 + k;
                const x = si === 1 ? BALMER_X(k) : s.x + k * 46;
                const nm = lambdaNm(ni, s.nf);
                const p = ramp(t, serT[si] + k * 0.18, serT[si] + k * 0.18 + 0.6);
                const visBalmer = si === 1 && k < 4;
                const pa = visBalmer ? Math.max(0.25 * p, ramp(t, bWords[k] - 0.1, bWords[k] + 0.4)) : p;
                return (
                  <g key={ni} opacity={pa}>
                    <line x1={x} y1={eY(En(ni))} x2={x} y2={mix(eY(En(ni)), eY(En(s.nf)) - 10, Math.min(1, pa * 1.2))} stroke={visBalmer ? wlColor(nm) : s.col} strokeWidth={visBalmer ? 7 : 4} markerEnd="url(#arrow-ink)" />
                  </g>
                );
              })}
              <Label x={(si === 1 ? BALMER_X(1.5) : s.x + 120)} y={eY(En(s.nf)) + 34} size={30} color={s.col} weight={700}>
                {s.name}
              </Label>
              <Label x={(si === 1 ? BALMER_X(1.5) : s.x + 120)} y={eY(En(s.nf)) + 64} size={22} color={C.muted}>
                berakhir di n = {s.nf} · {s.region}
              </Label>
            </g>
          ))}
          {/* elektron Balmer yang jatuh */}
          {bWords.map((w, k) => {
            const ni = k + 3;
            const fall = ramp(t, w - 0.1, w + 0.35, EASE_IN_OUT);
            const vis = win(t, w - 0.3, w + 1.2, 0.2, 0.4);
            return vis > 0 ? <Electron key={k} x={BALMER_X(k)} y={mix(eY(En(ni)), eY(En(2)), fall)} r={10} opacity={vis} /> : null;
          })}
          <g opacity={lya * (1 - zoom)}>
            <Label x={SERIES[0].x - 20} y={eY(-6.5)} size={26} color={C.violet} anchor="end" weight={700}>
              Lyman-α
            </Label>
            <Label x={SERIES[0].x - 20} y={eY(-6.5) + 32} size={24} color={C.violet} anchor="end" font="mono">
              121,6 nm
            </Label>
          </g>
        </g>
        {/* foton Balmer terbang ke pita spektrum */}
        {bWords.map((_, k) => {
          const nm = lambdaNm(k + 3, 2);
          const f = bFly[k];
          if (f <= 0 || f >= 1) return null;
          const x0 = BALMER_X(k);
          const y0 = eY(En(2));
          const x1 = lX(nm);
          const y1 = S.y - S.h / 2;
          const x = mix(x0, x1, f);
          const y = mix(y0, y1, f) - Math.sin(Math.PI * f) * 40;
          const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
          return <PhotonPacket key={k} x={x} y={y} wavelength={26 + k * -3} color={wlColor(nm)} amp={16} len={130} phase={-t * 14} angle={ang} />;
        })}
        {/* pita spektrum (log λ) */}
        <g opacity={strip}>
          <rect x={S.x0} y={S.y - S.h / 2} width={S.x1 - S.x0} height={S.h} rx={8} fill="#060914" stroke={C.faint} strokeWidth={2} />
          <rect x={lX(380)} y={S.y - S.h / 2} width={lX(750) - lX(380)} height={S.h} fill="url(#rainbow-h)" opacity={0.18} />
          {[100, 200, 1000, 2000].map((nm) => (
            <Label key={nm} x={lX(nm)} y={S.y + S.h / 2 + 22} size={20} color={C.faint} font="mono">
              {nm}
            </Label>
          ))}
          <Label x={S.x1 + 8} y={S.y + S.h / 2 + 22} size={20} color={C.faint} anchor="start">
            nm
          </Label>
          <Label x={(lX(380) + lX(750)) / 2} y={S.y + S.h / 2 + 22} size={20} color={C.muted}>
            tampak
          </Label>
          {SERIES.map((s, si) =>
            Array.from({length: 12}, (_, k) => {
              const ni = s.nf + 1 + k;
              const nm = lambdaNm(ni, s.nf);
              if (si === 1 && k < 4) return null; // garis Balmer tampak dicap oleh foton
              const p = ramp(t, serT[si] + 0.4 + k * 0.12, serT[si] + 0.9 + k * 0.12);
              return <rect key={`${si}-${ni}`} x={lX(nm) - 1.5} y={S.y - S.h / 2 + 4} width={3} height={S.h - 8} fill={lineCol(nm)} opacity={p * (k < 6 ? 0.85 : 0.45)} />;
            }),
          )}
          {bLand.map((b, k) => {
            const nm = lambdaNm(k + 3, 2);
            const flash = win(t, bWords[k] + 1.15, bWords[k] + 1.5, 0.1, 0.8);
            const lx = [1193, 1100, 1020, 940][k];
            return (
              <g key={k} opacity={b}>
                <Glow x={lX(nm)} y={S.y} r={40 + 120 * flash} color="white" opacity={0.6 * flash + 0.15 * four} />
                <rect x={lX(nm) - 3.5} y={S.y - S.h / 2 + 2} width={7} height={S.h - 4} fill={wlColor(nm)} filter="url(#glow)" />
                <line x1={lX(nm)} y1={S.y - S.h / 2 - 2} x2={lx} y2={S.y - S.h / 2 - 22} stroke={wlColor(nm)} strokeWidth={1.5} />
                <Label x={lx} y={S.y - S.h / 2 - 40} size={22} color={wlColor(nm)} font="mono" weight={600}>
                  {Math.round(nm)}
                </Label>
              </g>
            );
          })}
          <g opacity={limits}>
            {[
              [1, 'batas Lyman 91,2'],
              [2, 'batas Balmer 364,7'],
              [3, 'batas Paschen 820,6'],
            ].map(([nf, txt], i) => {
              const nm = ((nf as number) * (nf as number)) / R_NM;
              return (
                <g key={i}>
                  <line x1={lX(nm)} y1={S.y - S.h / 2 - 8} x2={lX(nm)} y2={S.y + S.h / 2 + 8} stroke={C.gold} strokeWidth={2} strokeDasharray="5 4" />
                  <Label x={lX(nm)} y={S.y + S.h / 2 + 52} size={20} color={C.gold} font="mono">
                    {txt as string}
                  </Label>
                </g>
              );
            })}
          </g>
        </g>
      </Stage>
      <Formula x={960} y={400} p={formula} accent={C.gold} caption={<>R<sub>H</sub> ≈ 1,0968 × 10⁷ m⁻¹ · n<sub>f</sub> tingkat akhir · n<sub>i</sub> tingkat awal</>}>
        <Frac n="1" d={<V>λ</V>} />
        &nbsp;=&nbsp;<V>R</V>
        <Sub>μ</Sub>
        <V>Z</V>
        <Sup>2</Sup>&nbsp;
        <span style={{fontSize: '1.3em'}}>(</span>
        <Frac n="1" d={<><V>n</V><Sub>f</Sub><Sup>2</Sup></>} />
        &nbsp;−&nbsp;
        <Frac n="1" d={<><V>n</V><Sub>i</Sub><Sup>2</Sup></>} />
        <span style={{fontSize: '1.3em'}}>)</span>
      </Formula>
    </AbsoluteFill>
  );
};
