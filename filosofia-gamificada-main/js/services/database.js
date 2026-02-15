// Servicio de base de datos: Firebase con fallback a localStorage
(function() {
    var db = null;

    try {
        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            firebase.initializeApp(window.APP_CONFIG.firebase);
        }
        if (typeof firebase !== 'undefined') {
            db = firebase.database();
        }
    } catch (error) {
        console.warn("Firebase no configurado. Usando localStorage como fallback.", error);
    }

    window.DatabaseService = {
        save: function(path, data) {
            try {
                if (db) {
                    return db.ref(path).set(data);
                } else {
                    localStorage.setItem('filosofo_' + path.replace(/\//g, '_'), JSON.stringify(data));
                    return Promise.resolve();
                }
            } catch (error) {
                console.error("Error guardando datos:", error);
                localStorage.setItem('filosofo_' + path.replace(/\//g, '_'), JSON.stringify(data));
                return Promise.resolve();
            }
        },

        load: function(path, callback) {
            try {
                if (db) {
                    db.ref(path).on('value', function(snapshot) {
                        var data = snapshot.val();
                        callback(data);
                    });
                } else {
                    var saved = localStorage.getItem('filosofo_' + path.replace(/\//g, '_'));
                    callback(saved ? JSON.parse(saved) : null);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
                var saved = localStorage.getItem('filosofo_' + path.replace(/\//g, '_'));
                callback(saved ? JSON.parse(saved) : null);
            }
        },

        loadOnce: function(path) {
            return new Promise(function(resolve) {
                try {
                    if (db) {
                        db.ref(path).once('value').then(function(snapshot) {
                            resolve(snapshot.val());
                        }).catch(function() {
                            var saved = localStorage.getItem('filosofo_' + path.replace(/\//g, '_'));
                            resolve(saved ? JSON.parse(saved) : null);
                        });
                    } else {
                        var saved = localStorage.getItem('filosofo_' + path.replace(/\//g, '_'));
                        resolve(saved ? JSON.parse(saved) : null);
                    }
                } catch (error) {
                    var saved = localStorage.getItem('filosofo_' + path.replace(/\//g, '_'));
                    resolve(saved ? JSON.parse(saved) : null);
                }
            });
        },

        isFirebaseConnected: function() {
            return db !== null;
        }
    };
})();
