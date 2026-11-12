// Pantalla de acceso en tres pasos: curso -> rol -> credenciales.
import React, { useState } from 'react';
import { APP_CONFIG } from '../config.js';
import { getPaleta, loadCursoSelection } from '../data/cursos.js';
import { Icons } from './shared/Icons.jsx';
import { Logo } from './shared/Status.jsx';

const ROLES = {
    profesor: { titulo: 'Profesor', detalle: 'Gestión, XP y misiones', Icon: 'Users' },
    estudiante: { titulo: 'Estudiante', detalle: 'Tu progreso y aventura', Icon: 'BookOpen' }
};

export function LoginScreen({ cursos, cursoId, onCursoChange, onLogin, error, onClearError, status }) {
    const cursosActivos = cursos.filter((c) => c.activo !== false);
    const unico = cursosActivos.length === 1;

    // Se salta el paso de curso si hay uno solo o si este dispositivo ya eligio
    // antes. `null` significa "aun no decide el usuario": asi el selector aparece
    // si la lista de cursos llega del servidor despues de pintar la pantalla.
    const [recordado] = useState(() => !!loadCursoSelection());
    const [cursoElegido, setCursoElegido] = useState(null);
    const [tipo, setTipo] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);

    const curso = cursosActivos.find((c) => c.id === cursoId) || cursosActivos[0];
    const mostrarCursos = !(cursoElegido === null ? (unico || recordado) : cursoElegido) && !unico;
    const cursoLabel = curso ? curso.nombre + ' · ' + curso.anio : '';

    const elegirCurso = (id) => {
        onCursoChange(id);
        setCursoElegido(true);
    };

    const volver = () => {
        setTipo(null);
        setUsername('');
        setPassword('');
        onClearError();
    };

    const submit = async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
            await onLogin(tipo, username, password);
        } finally {
            setBusy(false);
        }
    };

    const rol = tipo ? ROLES[tipo] : null;
    const RolIcon = rol ? Icons[rol.Icon] : null;

    return (
        <div className="min-h-screen relative overflow-hidden bg-dungeon-950 flex items-center justify-center p-4">
            {/* cuadricula de piedra sutil */}
            <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: 'linear-gradient(rgba(107,95,163,.6) 2px, transparent 2px), linear-gradient(90deg, rgba(107,95,163,.6) 2px, transparent 2px)',
                backgroundSize: '48px 48px'
            }}></div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mb-5"><Logo /></div>
                    <h1 className="font-serif text-xl sm:text-2xl text-gold mb-4 leading-relaxed" style={{ textShadow: '3px 3px 0 #1c1538' }}>{APP_CONFIG.nombre}</h1>
                    <p className="text-arcane text-sm uppercase tracking-wider">{APP_CONFIG.subtitulo}</p>
                </div>

                <div className="panel-pixel p-6 animate-fade-in">
                    {/* Paso 1: curso */}
                    {mostrarCursos && (
                        <div className="space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-arcane mb-1">Selecciona tu curso</h2>
                            {cursosActivos.map((c) => (
                                <button key={c.id} type="button" onClick={() => elegirCurso(c.id)}
                                    style={{ background: getPaleta(c.paleta).card }}
                                    className="w-full group border-2 border-stone-dark p-4 text-left transition-transform hover:translate-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-dungeon-950/40 border border-stone-dark text-3xl">{c.emoji}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-parchment font-bold truncate">{c.nombre}</div>
                                            <div className="text-parchment/70 text-sm truncate">Año {c.anio}{c.colegio ? ' · ' + c.colegio : ''}</div>
                                        </div>
                                        <Icons.ChevronRight className="text-parchment/70 group-hover:translate-x-1 transition" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Paso 2: rol */}
                    {!mostrarCursos && !tipo && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-arcane mb-0.5">Curso</div>
                                    <div className="text-parchment font-bold">{cursoLabel}</div>
                                </div>
                                {!unico && (
                                    <button type="button" onClick={() => setCursoElegido(false)}
                                        className="text-xs text-arcane hover:text-gold underline underline-offset-2">cambiar</button>
                                )}
                            </div>
                            {Object.entries(ROLES).map(([id, r]) => {
                                const Icon = Icons[r.Icon];
                                return (
                                    <button key={id} type="button" onClick={() => setTipo(id)}
                                        className="btn-pixel-ghost w-full normal-case tracking-normal py-4 px-5 !justify-start gap-4">
                                        <div className={'w-10 h-10 border-2 border-stone-dark flex items-center justify-center ' + (id === 'profesor' ? 'bg-gold' : 'bg-arcane')}>
                                            <Icon size={20} className={id === 'profesor' ? 'text-dungeon-950' : 'text-white'} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div>Acceso {r.titulo}</div>
                                            <div className="text-xs text-arcane font-normal normal-case">{r.detalle}</div>
                                        </div>
                                        <Icons.ChevronRight className="text-parchment/50" />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Paso 3: credenciales */}
                    {!mostrarCursos && tipo && (
                        <form onSubmit={submit} className="space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b-2 border-stone-dark">
                                <div className={'w-10 h-10 border-2 border-stone-dark flex items-center justify-center ' + (tipo === 'profesor' ? 'bg-gold' : 'bg-arcane')}>
                                    <RolIcon size={20} className={tipo === 'profesor' ? 'text-dungeon-950' : 'text-white'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-parchment font-bold">{rol.titulo}</div>
                                    <div className="text-xs text-arcane truncate">{cursoLabel}</div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="login-usuario" className="block text-xs font-bold uppercase tracking-wider text-arcane mb-1.5">
                                    {tipo === 'profesor' ? 'Usuario' : 'Nombre social'}
                                </label>
                                <input id="login-usuario" type="text" autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                    autoComplete="username"
                                    placeholder={tipo === 'profesor' ? 'profesor' : 'Tu nombre en la plataforma'}
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="input-pixel w-full px-4 py-3" />
                            </div>

                            <div>
                                <label htmlFor="login-clave" className="block text-xs font-bold uppercase tracking-wider text-arcane mb-1.5">Contraseña</label>
                                <input id="login-clave" type="password" autoComplete="current-password" placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="input-pixel w-full px-4 py-3" />
                            </div>

                            {error && (
                                <div role="alert" className="bg-ruby/20 border-2 border-ruby text-parchment text-sm px-3 py-2">
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={busy || !username || !password}
                                className="btn-pixel-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                {busy ? 'Entrando…' : 'Entrar'}
                            </button>
                            <button type="button" onClick={volver} className="w-full text-arcane hover:text-gold text-sm py-2 transition">
                                ← Volver
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-arcane/60 text-xs mt-6" data-testid="login-footer">
                    {APP_CONFIG.anio} · {APP_CONFIG.autor}
                    {status === 'offline' && <span className="block mt-1 text-gold/80">Sin conexión: se usará la última copia guardada.</span>}
                </p>
            </div>
        </div>
    );
}
