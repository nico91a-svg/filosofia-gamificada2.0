// Acceso a los íconos pixel (definidos en icons.json).
import data from './icons.json';
import type { SpriteDef } from './PixelSprite';

const ICONS = data as Record<string, SpriteDef>;

export function skillIcon(id: string): SpriteDef | undefined {
  return ICONS[`skill_${id}`];
}

export function catIcon(id: string): SpriteDef | undefined {
  return ICONS[`cat_${id}`];
}
