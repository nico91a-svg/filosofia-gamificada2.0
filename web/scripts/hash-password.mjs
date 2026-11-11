// Calcula el hash de la clave docente para pegarlo en src/config.js.
//   npm run hash-password -- <usuario> <clave-nueva>
import { createHash } from 'node:crypto';

const [usuario, password] = process.argv.slice(2);
if (!usuario || !password) {
    console.error('Uso: npm run hash-password -- <usuario> <clave>');
    process.exit(1);
}
const hash = createHash('sha256')
    .update('filosofo-en-formacion:' + usuario.trim().toLowerCase() + ':' + password)
    .digest('hex');
console.log('\nPega esto en src/config.js (profesor.passwordHash):\n\n  ' + hash + '\n');
