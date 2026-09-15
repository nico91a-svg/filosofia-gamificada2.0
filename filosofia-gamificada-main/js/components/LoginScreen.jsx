// Pantalla de login: selector de curso + credenciales.
// onLogin(type, username, password, cursoId) se llama al hacer submit.
// onCursoChange(cursoId) se llama tan pronto el usuario elige un curso, para que
// App.jsx empiece a cargar los datos del curso mientras el usuario completa el
// resto del formulario (evita race condition al hacer login).
window.LoginScreen = ({ onLogin, onCursoChange }) => {
    const { useState, useMemo, useEffect } = React;

    const cursos = window.CURSOS || [];
    const cursosActivos = useMemo(() => cursos.filter(function(c) { return c.activo !== false; }), [cursos]);

    // Si solo hay un curso activo, saltamos el selector.
    const savedCursoId = window.loadCursoSelection && window.loadCursoSelection();
    const initialCurso = cursosActivos.length === 1
        ? cursosActivos[0].id
        : (savedCursoId || null);

    const [cursoId, setCursoIdState] = useState(initialCurso);
    const [type, setType] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const curso = cursoId ? window.getCurso(cursoId) : null;

    // Wrapper que ademas notifica al padre para que empiece a cargar datos del curso.
    const setCursoId = (nextId) => {
        setCursoIdState(nextId);
        if (nextId && onCursoChange) onCursoChange(nextId);
    };

    // Al montar, si ya hay un cursoId inicial (auto-seleccionado), notificar al padre.
    useEffect(() => {
        if (cursoId && onCursoChange) onCursoChange(cursoId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = () => {
        if (window.saveCursoSelection && cursoId) window.saveCursoSelection(cursoId);
        onLogin(type, username, password, cursoId);
    };

    const cursoLabel = curso ? curso.nombre + ' · ' + curso.anio : '';

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4">
            {/* Fondo con gradient mesh + orbes animados */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950"></div>
            <div className="absolute top-0 -left-32 w-96 h-96 bg-fuchsia-600/30 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 -right-32 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl"></div>

            {/* Grid overlay sutil */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}></div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 shadow-2xl shadow-violet-900/50 ring-1 ring-white/20">
                        <span className="text-4xl">🏛️</span>
                    </div>
                    <h1 className="font-serif text-4xl font-bold text-white mb-2 tracking-tight">
                        {window.APP_CONFIG.nombre}
                    </h1>
                    <p className="text-violet-200/80 text-sm">{window.APP_CONFIG.subtitulo}</p>
                </div>

                {/* Card principal con glassmorphism */}
                <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-7">
                    {/* Paso 1: selector de curso */}
                    {!cursoId && (
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1">
                                Selecciona tu curso
                            </label>
                            {cursosActivos.map(function(c) {
                                // Mapa de gradientes → colores hex para inline (Tailwind CDN no
                                // genera clases dinamicas interpoladas).
                                var gradientMap = {
                                    'from-indigo-500 via-violet-500 to-fuchsia-500': 'linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef)',
                                    'from-emerald-500 via-teal-500 to-cyan-500': 'linear-gradient(90deg,#10b981,#14b8a6,#06b6d4)',
                                    'from-amber-500 via-orange-500 to-rose-500': 'linear-gradient(90deg,#f59e0b,#f97316,#f43f5e)',
                                    'from-sky-500 via-blue-500 to-indigo-500': 'linear-gradient(90deg,#0ea5e9,#3b82f6,#6366f1)'
                                };
                                var bg = gradientMap[c.gradient] || 'linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef)';
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setCursoId(c.id)}
                                        style={{ background: bg }}
                                        className="w-full group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:scale-[1.02] shadow-lg hover:shadow-2xl"
                                    >
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur text-3xl">
                                                {c.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-bold">{c.nombre}</div>
                                                <div className="text-white/80 text-sm">Año {c.anio}{c.colegio ? ' · ' + c.colegio : ''}</div>
                                            </div>
                                            <window.Icons.ChevronRight className="text-white/70 group-hover:translate-x-1 transition" />
                                        </div>
                                    </button>
                                );
                            })}
                            {cursosActivos.length === 0 && (
                                <div className="text-violet-200 text-sm text-center py-6">
                                    No hay cursos activos configurados.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paso 2: selector de rol */}
                    {cursoId && !type && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-violet-300 mb-0.5">Curso</div>
                                    <div className="text-white font-semibold">{cursoLabel}</div>
                                </div>
                                {cursosActivos.length > 1 && (
                                    <button onClick={() => setCursoId(null)} className="text-xs text-violet-300 hover:text-white underline underline-offset-2">
                                        cambiar
                                    </button>
                                )}
                            </div>

                            <button onClick={() => setType('profesor')}
                                className="w-full group bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white font-semibold py-4 px-5 rounded-xl transition flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                                    <window.Icons.Users size={20} className="text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div>Acceso Profesor</div>
                                    <div className="text-xs text-violet-300 font-normal">Gestion, XP y misiones</div>
                                </div>
                                <window.Icons.ChevronRight className="text-white/50 group-hover:translate-x-1 transition" />
                            </button>

                            <button onClick={() => setType('estudiante')}
                                className="w-full group bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white font-semibold py-4 px-5 rounded-xl transition flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg">
                                    <window.Icons.BookOpen size={20} className="text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div>Acceso Estudiante</div>
                                    <div className="text-xs text-violet-300 font-normal">Tu progreso y aventura</div>
                                </div>
                                <window.Icons.ChevronRight className="text-white/50 group-hover:translate-x-1 transition" />
                            </button>
                        </div>
                    )}

                    {/* Paso 3: credenciales */}
                    {cursoId && type && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                <div className={"w-10 h-10 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br " + (type === 'profesor' ? 'from-indigo-500 to-violet-600' : 'from-fuchsia-500 to-pink-600')}>
                                    {type === 'profesor'
                                        ? <window.Icons.Users size={20} className="text-white" />
                                        : <window.Icons.BookOpen size={20} className="text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-semibold">{type === 'profesor' ? 'Profesor' : 'Estudiante'}</div>
                                    <div className="text-xs text-violet-300 truncate">{cursoLabel}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1.5">
                                    {type === 'profesor' ? 'Usuario' : 'Nombre social'}
                                </label>
                                <input type="text"
                                    placeholder={type === 'profesor' ? 'profesor' : 'Ej: AmparoA'}
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                    autoFocus
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-violet-300/40 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1.5">
                                    Contraseña
                                </label>
                                <input type="password"
                                    placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && submit()}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-violet-300/40 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition" />
                            </div>

                            <button onClick={submit}
                                className="w-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 hover:from-fuchsia-400 hover:via-violet-400 hover:to-indigo-400 text-white font-bold py-3.5 rounded-lg transition shadow-lg shadow-violet-900/50 hover:shadow-violet-500/50">
                                Entrar
                            </button>
                            <button onClick={() => { setType(null); setUsername(''); setPassword(''); }}
                                className="w-full text-violet-300 hover:text-white text-sm py-2 transition">
                                ← Volver
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-violet-300/50 text-xs mt-6">
                    {window.APP_CONFIG.anio} · Nicolas Aldunate Gaete
                </p>
            </div>
        </div>
    );
};
