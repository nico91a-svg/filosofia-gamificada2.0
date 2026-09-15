#!/usr/bin/env bash
# Deploy de la web a Firebase Hosting.
#
# Uso:
#   ./deploy.sh
#
# Requisitos (una sola vez):
#   npm install -g firebase-tools
#   firebase login
#
# El sitio queda en:
#   https://filosofia-gamificada.web.app
#   https://filosofia-gamificada.firebaseapp.com

set -euo pipefail

cd "$(dirname "$0")"

if ! command -v firebase >/dev/null 2>&1; then
    echo "❌ firebase-tools no esta instalado."
    echo "   Instala con: npm install -g firebase-tools"
    exit 1
fi

echo "🚀 Publicando en Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Listo. El sitio esta en:"
echo "   https://filosofia-gamificada.web.app"
