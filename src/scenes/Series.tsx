import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Card, Label, Stage, V} from '../components/primitives';
import {En, Electron, PhotonPacket, lambdaNm, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Diagram tingkat (linear eV) di atas, pita spektrum (skala log λ) di bawah.
const D = {x0: 160, x1: 1760, top: 200, bottom: 600};
const eY = (e: number) => mix(D.bottom, D.top, (e + 13.6) / 14.2);
const S = {x0: 200, x1: 1720, y: 745, h: 70, lmin: 80, lmax: 2000};
const lX = (nm: number) => mix(S.x0, S.x1, Math.log(nm / S.lmin) / Math.log(S.lmax / S.lmin));
const NMAX = 7;
const SERIES = [
  {nf: 1, name: 'Lyman', x: 330, col: C.violet, region: 'ultraviolet'},
  {nf: 2, name: 'Balmer', x: 820, col: C.cyan, region: 'tampak + UV'},
  {nf: 3, name: 'Paschen', x: 1380, col: C.red, region: 'inframerah'},
];
const lineCol = (nm: number) => (nm < 380 ? C.violet : nm > 750 ? '#c0392b' : wlColor(nm));

export const Series: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const diag = ramp(t, cue(0) - 0.6, cue(0) + 0.8);
  const drop = ramp(t, cue(0) + 1.2, cue(0) + 2.2, EASE_IN_OUT);
  const ph = ramp(t, cue(0) + 2.0, cue(0) + 4.5);
  const gap = ramp(t, cue(1), cue(1) + 0.6) * (1 - ramp(t, cue(3) - 0.5, cue(3)));
  const formula = win(t, cue(2) - 0.2, cue(3) - 0.4, 0.7, 0.6);
  const strip = ramp(t, cue(3) - 0.3, cue(3) + 0.7);
  const sers = [ramp(t, cue(3), cue(3) + 1.8, EASE_IN_OUT), ramp(t, cue(5), cue(5) + 1.8, EASE_IN_OUT), ramp(t, cue(9), cue(9) + 1.8, EASE_IN_OUT)];
  const lya = ramp(t, cue(4), cue(4) + 0.6, BACK);
  const balmerWords = [wordOf(6, 'Tiga'), wordOf(7, 'empat'), wordOf(7, 'lima'), wordOf(7, 'enam')];
  const bLines = balmerWords.map((w) => ramp(t, w - 0.1, w + 0.5, BACK));
  const four = ramp(t, cue(8), cue(8) + 0.6) * (1 - ramp(t, cue(9), cue(9) + 0.6));
  const limits = ramp(t, cue(10) + 0.5, cue(10) + 1.6);
  const dim = 1 - 0.75 * formula;

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={diag * dim}>
          <line x1={D.x0} y1={eY(0)} x2={D.x1} y2={eY(0)} stroke={C.ink} strokeWidth={2} strokeDasharray="10 8" opacity={0.7} />
          <Label x={D.x1 + 10} y={eY(0) - 22} size={20} color={C.muted} anchor="end">
            n = ∞ (0 eV)
          </Label>
          {Array.from({length: NMAX}, (_, i) => i + 1).map((n) => (
            <g key={n}>
              <line x1={D.x0} y1={eY(En(n))} x2={D.x1} y2={eY(En(n))} stroke={C.ink} strokeOpacity={n <= 3 ? 0.75 : 0.35} strokeWidth={n <= 3 ? 3 : 2} />
              {n <= 3 ? (
                <Label x={D.x0 - 14} y={eY(En(n))} size={24} color={C.ink} anchor="end" font="serif" italic>
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
          {/* selisih energi */}
          <g opacity={gap}>
            <line x1={1520} y1={eY(En(3))} x2={1520} y2={eY(En(2))} stroke={C.gold} strokeWidth={3} />
            <Label x={1500} y={(eY(En(3)) + eY(En(2))) / 2} size={26} color={C.gold} anchor="end" weight={700}>
              E_foton = ΔE
            </Label>
          </g>
          {/* panah transisi per deret */}
          {SERIES.map((s, si) => (
            <g key={s.name} opacity={sers[si]}>
              {Array.from({length: NMAX - s.nf}, (_, k) => {
                const ni = s.nf + 1 + k;
                const x = s.x + k * 46;
                const nm = lambdaNm(ni, s.nf);
                const p = ramp(t, [cue(3), cue(5), cue(9)][si] + k * 0.18, [cue(3), cue(5), cue(9)][si] + k * 0.18 + 0.6);
                const lit = si === 1 && k < 4 ? Math.max(0.5, bLines[k]) : 1;
                return (
                  <g key={ni} opacity={p * lit}>
                    <line x1={x} y1={eY(En(ni))} x2={x} y2={mix(eY(En(ni)), eY(En(s.nf)) - 10, p)} stroke={si === 1 && k < 4 ? wlColor(nm) : s.col} strokeWidth={si === 1 && k < 4 ? 6 : 4} markerEnd="url(#arrow-ink)" />
                  </g>
                );
              })}
              <Label x={s.x + 120} y={eY(En(s.nf)) + 34} size={30} color={s.col} weight={700}>
                {s.name}
              </Label>
              <Label x={s.x + 120} y={eY(En(s.nf)) + 66} size={20} color={C.muted}>
                berakhir di n = {s.nf} · {s.region}
              </Label>
            </g>
          ))}
          <g opacity={lya}>
            <Label x={330 - 20} y={eY(-6.5)} size={24} color={C.violet} anchor="end" weight={700}>
              Lyman-α
            </Label>
            <Label x={330 - 20} y={eY(-6.5) + 30} size={22} color={C.violet} anchor="end" font="mono">
              121,6 nm
            </Label>
          </g>
        </g>
        {/* pita spektrum (log λ) */}
        <g opacity={strip}>
          <rect x={S.x0} y={S.y - S.h / 2} width={S.x1 - S.x0} height={S.h} rx={8} fill="#060914" stroke={C.faint} strokeWidth={2} />
          <rect x={lX(380)} y={S.y - S.h / 2} width={lX(750) - lX(380)} height={S.h} fill="url(#rainbow-h)" opacity={0.18} />
          {[100, 200, 1000, 2000].map((nm) => (
            <Label key={nm} x={lX(nm)} y={S.y + S.h / 2 + 22} size={18} color={C.faint} font="mono">
              {nm}
            </Label>
          ))}
          <Label x={S.x1 + 6} y={S.y + S.h / 2 + 22} size={18} color={C.faint} anchor="start">
            nm
          </Label>
          <Label x={(lX(380) + lX(750)) / 2} y={S.y + S.h / 2 + 22} size={18} color={C.muted}>
            tampak
          </Label>
          {SERIES.map((s, si) =>
            Array.from({length: 12}, (_, k) => {
              const ni = s.nf + 1 + k;
              const nm = lambdaNm(ni, s.nf);
              const p = ramp(t, [cue(3), cue(5), cue(9)][si] + 0.4 + k * 0.12, [cue(3), cue(5), cue(9)][si] + 0.9 + k * 0.12);
              const glow = si === 1 && k < 4 ? 0.5 + 0.5 * Math.max(bLines[k], four) : 0.7;
              return <rect key={`${si}-${ni}`} x={lX(nm) - 1.5} y={S.y - S.h / 2 + 4} width={3} height={S.h - 8} fill={lineCol(nm)} opacity={p * glow * (k < 6 ? 1 : 0.5)} />;
            }),
          )}
          {bLines.map((b, k) => {
            const nm = lambdaNm(k + 3, 2);
            return (
              <g key={k} opacity={b}>
                <rect x={lX(nm) - 3} y={S.y - S.h / 2 + 2} width={6} height={S.h - 4} fill={wlColor(nm)} filter="url(#glow)" />
                <line x1={lX(nm)} y1={S.y - S.h / 2 - 2} x2={[1193, 1100, 1020, 940][k]} y2={S.y - S.h / 2 - 22} stroke={wlColor(nm)} strokeWidth={1.5} />
                <Label x={[1193, 1100, 1020, 940][k]} y={S.y - S.h / 2 - 38} size={20} color={wlColor(nm)} font="mono" weight={600}>
                  {Math.round(nm)}
                </Label>
              </g>
            );
          })}
          <g opacity={limits}>
            {[
              [1, 'batas Lyman 91,2'],
              [2, 'batas Balmer 364,7'],
              [3, 'batas Paschen 820'],
            ].map(([nf, txt], i) => {
              const nm = 1 / (1.0967758e-2 / ((nf as number) * (nf as number)));
              return (
                <g key={i}>
                  <line x1={lX(nm)} y1={S.y - S.h / 2 - 8} x2={lX(nm)} y2={S.y + S.h / 2 + 8} stroke={C.gold} strokeWidth={2} strokeDasharray="5 4" />
                  <Label x={lX(nm)} y={S.y + S.h / 2 + 52} size={19} color={C.gold} font="mono">
                    {txt as string}
                  </Label>
                </g>
              );
            })}
          </g>
        </g>
      </Stage>
      <Card x={960} y={400} opacity={formula} scale={0.85 + 0.15 * formula} accent={C.gold}>
        <div style={{fontSize: 56}}>
          1/<V>λ</V> = <V>R</V>
          <sub style={{fontSize: 26}}>μ</sub>
          <V>Z</V>² ( 1/<V>n</V>
          <sub style={{fontSize: 26}}>f</sub>² − 1/<V>n</V>
          <sub style={{fontSize: 26}}>i</sub>² )
        </div>
        <div style={{fontSize: 24, color: C.muted, textAlign: 'center', fontFamily: FONT.sans}}>
          <V>R</V>
          <sub>H</sub> ≈ 1,0968 × 10⁷ m⁻¹ · <V>n</V>
          <sub>f</sub> = tingkat akhir, <V>n</V>
          <sub>i</sub> = tingkat awal
        </div>
      </Card>
    </AbsoluteFill>
  );
};
