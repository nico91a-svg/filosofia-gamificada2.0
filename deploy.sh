#!/usr/bin/env bash
# Compila la web y la publica en Firebase Hosting.
#
# Requisitos (una sola vez):
#   npm install -g firebase-tools
#   firebase login
#
# Uso:  ./deploy.sh
# El sitio queda en https://filosofia-gamificada.web.app
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v firebase >/dev/null 2>&1; then
    echo "Falta firebase-tools. Instala con: npm install -g firebase-tools"
    exit 1
fi

echo "==> Instalando dependencias y verificando (lint + pruebas + build)"
(cd web && npm ci && npm run check)

echo "==> Publicando en Firebase Hosting"
firebase deploy --only hosting

echo "Listo: https://filosofia-gamificada.web.app"
