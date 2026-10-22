import React from 'react';
import {rand, sample, smoothPath} from '../anim';
import {C} from '../theme';

/* ------------------------------------------------------------------ */
/* Foton: paket gelombang sinus dengan selubung Gauss.                 */
/* ------------------------------------------------------------------ */
export const PhotonPacket: React.FC<{
  x: number;
  y: number;
  wavelength: number;
  color: string;
  amp?: number;
  len?: number;
  opacity?: number;
  phase?: number;
  angle?: number;
}> = ({x, y, wavelength, color, amp = 28, len = 300, opacity = 1, phase = 0, angle = 0}) => {
  if (opacity <= 0) return null;
  const pts = sample(
    (u) => amp * Math.exp(-((u / (len * 0.32)) ** 2)) * Math.sin((2 * Math.PI * u) / wavelength + phase),
    -len / 2,
    len / 2,
    160,
  );
  const d = smoothPath(pts);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
      <path d={d} fill="none" stroke={color} strokeWidth={10} opacity={0.25} filter="url(#glow-strong)" />
      <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={1.3} opacity={0.7} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Atom hidrogen: fungsi radial, energi, warna garis spektrum.          */
/* ------------------------------------------------------------------ */
export const RY_EV = 13.6;
/** Energi tingkat n (eV), model inti diam dengan pembulatan 13,6 eV. */
export const En = (n: number, Z = 1) => (-RY_EV * Z * Z) / (n * n);
/** Konstanta Rydberg hidrogen (massa tereduksi), nm⁻¹. */
export const R_H = 1.0967758e-2;
/** Panjang gelombang vakum (nm) untuk emisi ni → nf. */
export const lambdaNm = (ni: number, nf: number) => 1 / (R_H * (1 / (nf * nf) - 1 / (ni * ni)));

/** Fungsi radial ternormalisasi R_nl(s), s = r/a (satuan a^-3/2). */
export const Rnl = (n: number, l: number, s: number) => {
  const k = `${n}${l}`;
  switch (k) {
    case '10':
      return 2 * Math.exp(-s);
    case '20':
      return (1 / (2 * Math.SQRT2)) * (2 - s) * Math.exp(-s / 2);
    case '21':
      return (1 / (2 * Math.sqrt(6))) * s * Math.exp(-s / 2);
    case '30':
      return (2 / (81 * Math.sqrt(3))) * (27 - 18 * s + 2 * s * s) * Math.exp(-s / 3);
    case '31':
      return (4 / (81 * Math.sqrt(6))) * (6 - s) * s * Math.exp(-s / 3);
    case '32':
      return (4 / (81 * Math.sqrt(30))) * s * s * Math.exp(-s / 3);
    default:
      return 0;
  }
};
/** Distribusi radial P(r) = r²R² (satuan 1/a). */
export const Pnl = (n: number, l: number, s: number) => s * s * Rnl(n, l, s) ** 2;

/** Warna kira-kira untuk panjang gelombang (nm); UV → ungu redup, IR → merah tua. */
export const wlColor = (nm: number) => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 380) return '#7a5cff';
  if (nm > 750) return '#8a1a1a';
  if (nm < 440) [r, g, b] = [(440 - nm) / 60, 0, 1];
  else if (nm < 490) [r, g, b] = [0, (nm - 440) / 50, 1];
  else if (nm < 510) [r, g, b] = [0, 1, (510 - nm) / 20];
  else if (nm < 580) [r, g, b] = [(nm - 510) / 70, 1, 0];
  else if (nm < 645) [r, g, b] = [1, (645 - nm) / 65, 0];
  else [r, g, b] = [1, 0, 0];
  const f = nm < 420 ? 0.45 + (0.55 * (nm - 380)) / 40 : nm > 700 ? 0.45 + (0.55 * (750 - nm)) / 50 : 1;
  const c = (v: number) => Math.round(255 * Math.pow(v * f, 0.8));
  // sedikit terangkan agar tetap menyala di latar gelap
  return `rgb(${Math.min(255, c(r) + 30)},${Math.min(255, c(g) + 30)},${Math.min(255, c(b) + 30)})`;
};

/** Garis Balmer tampak (vakum, nm) — dihitung dari rumus Rydberg. */
export const BALMER = [3, 4, 5, 6].map((ni) => ({ni, nm: lambdaNm(ni, 2)}));

/* ------------------------------------------------------------------ */
/* Awan orbital 3D: titik sampel |ψ|² (rejection sampling deterministik). */
/* ------------------------------------------------------------------ */
export type OrbitalId = '1s' | '2s' | '2px' | '2py' | '2pz' | '3s' | '3dz2' | '3dxy' | '3dxz' | '3dyz' | '3dx2y2';
type Pt = {x: number; y: number; z: number; s: number};

const PSI: Record<OrbitalId, {f: (x: number, y: number, z: number, r: number) => number; L: number}> = {
  '1s': {f: (_x, _y, _z, r) => Math.exp(-r), L: 4.5},
  '2s': {f: (_x, _y, _z, r) => (2 - r) * Math.exp(-r / 2), L: 12},
  '2px': {f: (x, _y, _z, r) => x * Math.exp(-r / 2), L: 11},
  '2py': {f: (_x, y, _z, r) => y * Math.exp(-r / 2), L: 11},
  '2pz': {f: (_x, _y, z, r) => z * Math.exp(-r / 2), L: 11},
  '3s': {f: (_x, _y, _z, r) => (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3), L: 22},
  '3dz2': {f: (x, y, z, r) => (3 * z * z - r * r) * Math.exp(-r / 3), L: 17},
  '3dxy': {f: (x, y, _z, r) => x * y * Math.exp(-r / 3), L: 16},
  '3dxz': {f: (x, _y, z, r) => x * z * Math.exp(-r / 3), L: 16},
  '3dyz': {f: (_x, y, z, r) => y * z * Math.exp(-r / 3), L: 16},
  '3dx2y2': {f: (x, y, _z, r) => (x * x - y * y) * Math.exp(-r / 3), L: 16},
};

const CACHE: Record<string, Pt[]> = {};
const SEED: Record<OrbitalId, number> = {'1s': 1, '2s': 2, '2px': 3, '2py': 4, '2pz': 5, '3s': 6, '3dz2': 7, '3dxy': 8, '3dxz': 9, '3dyz': 10, '3dx2y2': 11};
/** slab > 0: hanya irisan tipis |y| < slab (pecahan dari kotak) → penampang melintang. */
export const orbitalPoints = (id: OrbitalId, count = 1400, slab = 0): Pt[] => {
  const key = `${id}-${count}-${slab}`;
  const hit = CACHE[key];
  if (hit) return hit;
  const {f, L} = PSI[id];
  // cari maksimum |ψ|² pada kisi kasar
  let max = 0;
  const g = 28;
  for (let i = 0; i <= g; i++)
    for (let j = 0; j <= g; j++)
      for (let k = 0; k <= g; k++) {
        const x = -L + (2 * L * i) / g;
        const y = -L + (2 * L * j) / g;
        const z = -L + (2 * L * k) / g;
        max = Math.max(max, f(x, y, z, Math.hypot(x, y, z)) ** 2);
      }
  max *= 1.15;
  const pts: Pt[] = [];
  const seed = 1000 * SEED[id];
  let tries = 0;
  while (pts.length < count && tries < 3_000_000) {
    const x = (rand(seed + tries * 4.1) * 2 - 1) * L;
    const y = (rand(seed + tries * 4.1 + 1.3) * 2 - 1) * L * (slab > 0 ? slab : 1);
    const z = (rand(seed + tries * 4.1 + 2.7) * 2 - 1) * L;
    const u = rand(seed + tries * 4.1 + 3.9);
    tries++;
    const v = f(x, y, z, Math.hypot(x, y, z));
    if (u * max < v * v) pts.push({x: x / L, y: y / L, z: z / L, s: Math.sign(v)});
  }
  CACHE[key] = pts;
  return pts;
};

/**
 * Awan orbital diproyeksikan dari 3D. Titik berwarna menurut tanda fase (emas +, biru −).
 * yaw/pitch dalam radian; size = jari-jari kotak sampel dalam piksel.
 */
export const OrbitalCloud: React.FC<{
  id: OrbitalId;
  x: number;
  y: number;
  size: number;
  yaw?: number;
  pitch?: number;
  p?: number;
  opacity?: number;
  dot?: number;
  pos?: string;
  neg?: string;
  count?: number;
  slab?: number;
}> = ({id, x, y, size, yaw = 0, pitch = 0.35, p = 1, opacity = 1, dot = 2.6, pos = C.gold, neg = C.cyan, count, slab = 0}) => {
  if (opacity <= 0 || p <= 0) return null;
  const pts = orbitalPoints(id, count, slab);
  const n = Math.floor(pts.length * Math.min(1, p));
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const q = pts[i];
    // putar sumbu z ke atas layar: x→kanan, z→atas, y→kedalaman
    const x1 = q.x * cy - q.y * sy;
    const d1 = q.x * sy + q.y * cy;
    const z2 = q.z * cp - d1 * sp;
    const d2 = q.z * sp + d1 * cp;
    const depth = 0.55 + 0.45 * (1 - (d2 + 1) / 2);
    out.push(<circle key={i} cx={x + x1 * size} cy={y - z2 * size} r={dot * (0.75 + 0.5 * depth)} fill={q.s >= 0 ? pos : neg} opacity={0.18 + 0.5 * depth} />);
  }
  return <g opacity={opacity}>{out}</g>;
};

/** Inti (proton) bercahaya. */
export const Nucleus: React.FC<{x: number; y: number; r?: number; opacity?: number; label?: string}> = ({x, y, r = 16, opacity = 1, label}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r * 3.2} fill="url(#soft-red)" opacity={0.45} />
    <circle cx={x} cy={y} r={r} fill="url(#atom-O)" />
    {label ? (
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontFamily="Outfit, sans-serif" fontWeight={700} fontSize={r * 1.05} fill="#fff">
        {label}
      </text>
    ) : null}
  </g>
);

/** Elektron kecil berwarna biru. */
export const Electron: React.FC<{x: number; y: number; r?: number; opacity?: number; label?: boolean}> = ({x, y, r = 10, opacity = 1, label}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r * 3} fill="url(#soft-cyan)" opacity={0.6} />
    <circle cx={x} cy={y} r={r} fill={C.cyan} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" opacity={0.7} />
    {label ? (
      <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontFamily="Outfit, sans-serif" fontWeight={700} fontSize={r * 1.2} fill="#04212e">
        e
      </text>
    ) : null}
  </g>
);

/** Kurva fungsi pada kotak plot: x dalam [x0,x1] → piksel, y skala sy. */
export const plotPath = (f: (u: number) => number, x0: number, x1: number, box: {x: number; y: number; w: number; sy: number}, n = 260) =>
  smoothPath(sample(f, x0, x1, n).map(([u, v]) => [box.x + ((u - x0) / (x1 - x0)) * box.w, box.y - v * box.sy]));
