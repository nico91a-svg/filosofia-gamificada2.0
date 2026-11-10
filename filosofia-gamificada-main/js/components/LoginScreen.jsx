// Pantalla de login
window.LoginScreen = ({ onLogin }) => {
    const [type, setType] = React.useState(null);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎓</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{window.APP_CONFIG.nombre}</h1>
                    <p className="text-gray-600">{window.APP_CONFIG.subtitulo}</p>
                    <p className="text-gray-400 text-sm mt-1">{window.APP_CONFIG.anio}</p>
                </div>

                {!type ? (
                    <div className="space-y-4">
                        <button onClick={() => setType('profesor')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2">
                            <window.Icons.Users size={24} /> Acceso Profesor
                        </button>
                        <button onClick={() => setType('estudiante')}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2">
                            <window.Icons.BookOpen size={24} /> Acceso Estudiante
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input type="text" placeholder={type === 'profesor' ? 'Usuario' : 'Tu nombre social'}
                            value={username} onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <input type="password" placeholder="Contraseña"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onLogin(type, username, password)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <div className="flex gap-2">
                            <button onClick={() => onLogin(type, username, password)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">Entrar</button>
                            <button onClick={() => { setType(null); setUsername(''); setPassword(''); }}
                                className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition">Volver</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
