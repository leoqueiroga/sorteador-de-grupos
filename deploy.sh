#!/bin/bash
set -e

# ─── Configuração ─────────────────────────────────────────────────────────────
# Pode ser sobrescrito via variável de ambiente:
#   DEPLOY_DIR=/caminho/destino APP_DOMAIN=meudominio.com ./deploy.sh
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/sorteador}"
APP_DOMAIN="${APP_DOMAIN:-localhost}"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

# ─── Funções ──────────────────────────────────────────────────────────────────
info()    { echo -e "\033[1;34m[info]\033[0m  $*"; }
success() { echo -e "\033[1;32m[ok]\033[0m    $*"; }
error()   { echo -e "\033[1;31m[erro]\033[0m  $*" >&2; exit 1; }

# ─── Pré-requisitos ───────────────────────────────────────────────────────────
command -v node  >/dev/null 2>&1 || error "Node.js não encontrado."
command -v npm   >/dev/null 2>&1 || error "npm não encontrado."
command -v nginx >/dev/null 2>&1 || error "nginx não encontrado."

# ─── Etapas ───────────────────────────────────────────────────────────────────
cd "$REPO_DIR"

info "Atualizando repositório..."
git pull

info "Instalando dependências..."
npm install --prefer-offline

info "Executando testes..."
npm test || error "Testes falharam. Deploy abortado."

info "Gerando build de produção..."
npm run build

info "Copiando arquivos para $DEPLOY_DIR..."
sudo mkdir -p "$DEPLOY_DIR"
sudo cp -r dist/* "$DEPLOY_DIR/"
sudo chown -R www-data:www-data "$DEPLOY_DIR"

info "Verificando configuração do Nginx..."
sudo nginx -t || error "Configuração do Nginx inválida."

info "Recarregando Nginx..."
sudo systemctl reload nginx

success "Deploy concluído → https://$APP_DOMAIN"
