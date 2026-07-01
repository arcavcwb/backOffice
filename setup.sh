#!/bin/bash
set -e

echo "=== Creando rama de git ==="
git checkout -b feature/CAPSU-22-setup-inicial || true

echo "=== Inicializando Vite ==="
npx -y create-vite@latest temp_vite --no-interactive --template react-ts
shopt -s dotglob
mv temp_vite/* .
shopt -u dotglob
rmdir temp_vite

echo "=== Instalando dependencias ==="
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install @tanstack/react-query @tanstack/react-router
npm install -D vitest @playwright/test @testing-library/react @testing-library/dom jsdom

echo "=== Configurando Tailwind CSS ==="
cat << 'EOF' > vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})
EOF

cat << 'EOF' > src/index.css
@import "tailwindcss";
EOF

# Limpiando CSS genérico de Vite
echo "" > src/App.css

echo "=== Setup completado con éxito ==="
