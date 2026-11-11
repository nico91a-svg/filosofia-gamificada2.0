// Pantalla de acceso en tres pasos: curso -> rol -> credenciales.
import React, { useState } from 'react';
import { APP_CONFIG } from '../config.js';
import { getPaleta, loadCursoSelection } from '../data/cursos.js';
import { Icons } from './shared/Icons.jsx';
import { Logo } from './shared/Status.jsx';

const ROLES = {
    profesor: { titulo: 'Profesor', detalle: 'Gestión, XP y misiones', gradient: 'from-indigo-500 to-violet-600', Icon: 'Users' },
    estudiante: { titulo: 'Estudiante', detalle: 'Tu progreso y aventura', gradient: 'from-fuchsia-500 to-pink-600', Icon: 'BookOpen' }
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
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950"></div>
            <div className="absolute top-0 -left-32 w-96 h-96 bg-fuchsia-600/30 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 -right-32 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}></div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mb-5"><Logo /></div>
                    <h1 className="font-serif text-4xl font-bold text-white mb-2 tracking-tight">{APP_CONFIG.nombre}</h1>
                    <p className="text-violet-200/80 text-sm">{APP_CONFIG.subtitulo}</p>
                </div>

                <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-7 animate-fade-in">
                    {/* Paso 1: curso */}
                    {mostrarCursos && (
                        <div className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1">Selecciona tu curso</h2>
                            {cursosActivos.map((c) => (
                                <button key={c.id} type="button" onClick={() => elegirCurso(c.id)}
                                    style={{ background: getPaleta(c.paleta).card }}
                                    className="w-full group rounded-xl p-4 text-left transition-all hover:scale-[1.02] shadow-lg hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 text-3xl">{c.emoji}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-bold truncate">{c.nombre}</div>
                                            <div className="text-white/80 text-sm truncate">Año {c.anio}{c.colegio ? ' · ' + c.colegio : ''}</div>
                                        </div>
                                        <Icons.ChevronRight className="text-white/70 group-hover:translate-x-1 transition" />
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
                                    <div className="text-xs uppercase tracking-wider text-violet-300 mb-0.5">Curso</div>
                                    <div className="text-white font-semibold">{cursoLabel}</div>
                                </div>
                                {!unico && (
                                    <button type="button" onClick={() => setCursoElegido(false)}
                                        className="text-xs text-violet-300 hover:text-white underline underline-offset-2">cambiar</button>
                                )}
                            </div>
                            {Object.entries(ROLES).map(([id, r]) => {
                                const Icon = Icons[r.Icon];
                                return (
                                    <button key={id} type="button" onClick={() => setTipo(id)}
                                        className="w-full group bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white font-semibold py-4 px-5 rounded-xl transition flex items-center gap-4">
                                        <div className={'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg ' + r.gradient}>
                                            <Icon size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div>Acceso {r.titulo}</div>
                                            <div className="text-xs text-violet-300 font-normal">{r.detalle}</div>
                                        </div>
                                        <Icons.ChevronRight className="text-white/50 group-hover:translate-x-1 transition" />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Paso 3: credenciales */}
                    {!mostrarCursos && tipo && (
                        <form onSubmit={submit} className="space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                <div className={'w-10 h-10 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br ' + rol.gradient}>
                                    <RolIcon size={20} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-semibold">{rol.titulo}</div>
                                    <div className="text-xs text-violet-300 truncate">{cursoLabel}</div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="login-usuario" className="block text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1.5">
                                    {tipo === 'profesor' ? 'Usuario' : 'Nombre social'}
                                </label>
                                <input id="login-usuario" type="text" autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                    autoComplete="username"
                                    placeholder={tipo === 'profesor' ? 'profesor' : 'Tu nombre en la plataforma'}
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-violet-300/40 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition" />
                            </div>

                            <div>
                                <label htmlFor="login-clave" className="block text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1.5">Contraseña</label>
                                <input id="login-clave" type="password" autoComplete="current-password" placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-violet-300/40 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition" />
                            </div>

                            {error && (
                                <div role="alert" className="bg-rose-500/15 border border-rose-400/40 text-rose-100 text-sm rounded-lg px-3 py-2">
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={busy || !username || !password}
                                className="w-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 hover:from-fuchsia-400 hover:via-violet-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition shadow-lg shadow-violet-900/50">
                                {busy ? 'Entrando…' : 'Entrar'}
                            </button>
                            <button type="button" onClick={volver} className="w-full text-violet-300 hover:text-white text-sm py-2 transition">
                                ← Volver
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-violet-300/50 text-xs mt-6" data-testid="login-footer">
                    {APP_CONFIG.anio} · {APP_CONFIG.autor}
                    {status === 'offline' && <span className="block mt-1 text-amber-300/80">Sin conexión: se usará la última copia guardada.</span>}
                </p>
            </div>
        </div>
    );
}
