// Pantallas y avisos de estado: arranque, conexion y errores inesperados.
import React from 'react';
import { PixelSprite } from '../pixel/PixelSprite.jsx';
import { OWL_SPRITE } from '../pixel/sprites.js';

export function Logo({ size = 80 }) {
    return (
        <div
            className="inline-flex items-center justify-center bg-dungeon-600 border-[3px] border-stone-dark"
            style={{ width: size, height: size, boxShadow: 'inset 2px 2px 0 0 #6b5fa3, inset -2px -2px 0 0 #1c1538, 4px 4px 0 0 rgba(0,0,0,.8)' }}
        >
            <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62} fill="none" aria-hidden="true" shapeRendering="crispEdges">
                <path d="M32 9 8 22v4h48v-4L32 9Z" fill="#f2c33d" />
                <rect x="13" y="29" width="6" height="19" fill="#e8d9a0" />
                <rect x="24" y="29" width="6" height="19" fill="#e8d9a0" />
                <rect x="34" y="29" width="6" height="19" fill="#e8d9a0" />
                <rect x="45" y="29" width="6" height="19" fill="#e8d9a0" />
                <rect x="8" y="50" width="48" height="5" fill="#f2c33d" />
            </svg>
        </div>
    );
}

export function SplashScreen({ mensaje = 'Preparando el sistema' }) {
    return (
        <div className="min-h-screen bg-dungeon-950 flex items-center justify-center">
            <div className="text-center text-parchment">
                <div className="mb-5 animate-pulse-slow inline-block">
                    <PixelSprite sprite={OWL_SPRITE} size={96} />
                </div>
                <h1 className="font-serif text-xl mb-3 tracking-tight text-gold">Cargando...</h1>
                <p className="text-arcane text-sm">{mensaje}</p>
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
            className="sticky top-0 z-[60] bg-gold text-[#3a2a06] border-b-2 border-gold-dark text-sm font-bold px-4 py-2 text-center">
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
            className="sticky top-0 z-[61] bg-emerald text-dungeon-950 border-b-2 border-stone-dark text-sm font-bold px-4 py-2 text-center">
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
            <div className="min-h-screen bg-dungeon-950 text-parchment flex items-center justify-center p-6">
                <div className="max-w-md text-center panel-pixel p-6">
                    <div className="mb-4 inline-block"><PixelSprite sprite={OWL_SPRITE} size={64} /></div>
                    <h1 className="font-serif text-lg mb-3 text-gold">Algo salió mal</h1>
                    <p className="text-arcane text-sm mb-6">
                        La aplicación encontró un error inesperado. Tu progreso está guardado; recarga para continuar.
                    </p>
                    <button onClick={() => window.location.reload()}
                        className="btn-pixel-primary px-6 py-3">
                        Recargar
                    </button>
                    <pre className="mt-6 text-left text-xs text-arcane/70 whitespace-pre-wrap break-words">
                        {String(this.state.error && this.state.error.message)}
                    </pre>
                </div>
            </div>
        );
    }
}
