// Pantallas y avisos de estado: arranque, conexion y errores inesperados.
import React from 'react';

export function Logo({ size = 80 }) {
    return (
        <div
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 shadow-2xl shadow-violet-900/50 ring-1 ring-white/20"
            style={{ width: size, height: size }}
        >
            <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62} fill="none" aria-hidden="true">
                <path d="M32 9 8 22v4h48v-4L32 9Z" fill="#fff" />
                <rect x="13" y="29" width="6" height="19" rx="1" fill="#fff" />
                <rect x="24" y="29" width="6" height="19" rx="1" fill="#fff" />
                <rect x="34" y="29" width="6" height="19" rx="1" fill="#fff" />
                <rect x="45" y="29" width="6" height="19" rx="1" fill="#fff" />
                <rect x="8" y="50" width="48" height="5" rx="1" fill="#fff" />
            </svg>
        </div>
    );
}

export function SplashScreen({ mensaje = 'Preparando el sistema' }) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="relative text-center text-white">
                <div className="mb-5 animate-pulse-slow"><Logo /></div>
                <h1 className="font-serif text-3xl font-bold mb-2 tracking-tight">Cargando...</h1>
                <p className="text-violet-200/70 text-sm">{mensaje}</p>
            </div>
        </div>
    );
}

// Aviso fijo cuando no hay conexion: los datos mostrados son la ultima copia
// guardada y no se aceptan cambios (ver SyncedResource).
export function ConnectionBanner({ status, blockedWrites, visible }) {
    if (!visible || status !== 'offline') return null;
    return (
        <div role="status" data-testid="offline-banner"
            className="sticky top-0 z-[60] bg-amber-500 text-amber-950 text-sm font-semibold px-4 py-2 text-center shadow">
            Sin conexión: se muestra la última copia guardada y no se pueden guardar cambios.
            {blockedWrites > 0 && ' El último cambio no se guardó.'}
        </div>
    );
}

// Aviso permanente cuando se usan datos de ensayo (?db=sandbox).
export function SandboxBanner({ namespace }) {
    if (!namespace) return null;
    return (
        <div role="status" data-testid="sandbox-banner"
            className="sticky top-0 z-[61] bg-cyan-400 text-cyan-950 text-sm font-semibold px-4 py-2 text-center shadow">
            Modo de prueba ({namespace}): estos son datos de ensayo. Nada de lo que hagas aquí cambia tus cursos reales.{' '}
            <a href="?db=real" className="underline">Volver a los datos reales</a>
        </div>
    );
}

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('Error inesperado en la interfaz:', error, info);
    }

    render() {
        if (!this.state.error) return this.props.children;
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
                <div className="max-w-md text-center">
                    <div className="text-5xl mb-4">🧩</div>
                    <h1 className="font-serif text-2xl font-bold mb-2">Algo salió mal</h1>
                    <p className="text-violet-200/80 text-sm mb-6">
                        La aplicación encontró un error inesperado. Tu progreso está guardado; recarga para continuar.
                    </p>
                    <button onClick={() => window.location.reload()}
                        className="bg-violet-600 hover:bg-violet-500 font-bold px-6 py-3 rounded-lg transition">
                        Recargar
                    </button>
                    <pre className="mt-6 text-left text-xs text-violet-300/60 whitespace-pre-wrap break-words">
                        {String(this.state.error && this.state.error.message)}
                    </pre>
                </div>
            </div>
        );
    }
}
