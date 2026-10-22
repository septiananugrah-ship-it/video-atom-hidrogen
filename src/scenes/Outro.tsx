import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {Nucleus, OrbitalCloud} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const REFS = [
  'Modul 6 Kimia Kuantum — Struktur dan Spektrum Atom Hidrogen (bahan kuliah IGMA Sanjaya, UNESA)',
  'P. Atkins & J. de Paula, Physical Chemistry · I. N. Levine, Quantum Chemistry',
  'NIST Atomic Spectra Database — garis H dan D',
  'H. C. Urey, F. G. Brickwedde & G. M. Murphy, Phys. Rev. 39, 164 (1932)',
  'European Pharmacopoeia 2.2.25 · D. Skoog dkk., Principles of Instrumental Analysis',
];

export const Outro: React.FC = () => {
  const {t, dur} = useScene();
  const a = ramp(t, 0, 1.6);
  const cloud = ramp(t, 0, 5, EASE_IN_OUT);
  const refs = ramp(t, 2.4, 3.4);
  const out = 1 - ramp(t, dur - 1.6, dur - 0.1, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <Glow x={960} y={330} r={500} color="gold" opacity={0.18} />
        <OrbitalCloud id="3dz2" x={960} y={330} size={330} yaw={t * 0.3} pitch={0.45} p={cloud} opacity={0.22} dot={2} />
        <Nucleus x={960} y={330} r={8} opacity={cloud} />
      </Stage>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 230}}>
        <div style={{fontFamily: FONT.sans, fontSize: 30, letterSpacing: 18, color: C.ink, fontWeight: 300, opacity: a}}>STRUKTUR &amp; SPEKTRUM</div>
        <div style={{fontFamily: FONT.sans, fontSize: 110, fontWeight: 800, color: C.gold, lineHeight: 1.05, opacity: a, textShadow: '0 0 50px rgba(255,194,74,0.4)'}}>ATOM HIDROGEN</div>
        <div style={{marginTop: 22, fontFamily: FONT.sans, fontSize: 34, color: C.ink, opacity: ramp(t, 1.2, 2.2)}}>Terima kasih telah menonton</div>
        <div style={{marginTop: 60, textAlign: 'center', opacity: refs}}>
          <div style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: C.muted, marginBottom: 14}}>RUJUKAN</div>
          {REFS.map((r) => (
            <div key={r} style={{fontFamily: FONT.sans, fontSize: 23, color: C.muted, lineHeight: 1.6}}>
              {r}
            </div>
          ))}
          <div style={{marginTop: 22, fontFamily: FONT.sans, fontSize: 20, color: C.faint}}>
            Awan orbital = sampel |ψ|² (emas = fase +, biru = fase −) · ilustrasi alat bersifat skematis
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
