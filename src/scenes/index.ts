import type React from 'react';
import {Density} from './Density';
import {Fit} from './Fit';
import {Hook} from './Hook';
import {Industry} from './Industry';
import {Industry2} from './Industry2';
import {Ionization} from './Ionization';
import {Limits} from './Limits';
import {Maser} from './Maser';
import {Numbers} from './Numbers';
import {Orbitals} from './Orbitals';
import {Outro} from './Outro';
import {Quant} from './Quant';
import {Radial} from './Radial';
import {Recap} from './Recap';
import {Roadmap} from './Roadmap';
import {Selection} from './Selection';
import {Separation} from './Separation';
import {Series} from './Series';
import {System} from './System';
import {Title} from './Title';
import {Veff} from './Veff';

// Pemetaan id scene di naskah → komponen visual.
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  title: Title,
  roadmap: Roadmap,
  system: System,
  separation: Separation,
  veff: Veff,
  quant: Quant,
  numbers: Numbers,
  radial: Radial,
  density: Density,
  orbitals: Orbitals,
  ionization: Ionization,
  series: Series,
  selection: Selection,
  fit: Fit,
  limits: Limits,
  industry: Industry,
  industry2: Industry2,
  maser: Maser,
  recap: Recap,
  outro: Outro,
};
