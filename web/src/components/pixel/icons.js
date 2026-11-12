// Acceso a los íconos pixel 16x16 (definidos en icons.json).
// Port de filosofia-app/src/components/pixel/icons.ts.
import data from './icons.json';

export function skillIcon(id) {
    return data['skill_' + id];
}

export function catIcon(id) {
    return data['cat_' + id];
}
