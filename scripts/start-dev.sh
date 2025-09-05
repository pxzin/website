#!/bin/bash

# Script para iniciar o Turso local e o servidor de desenvolvimento
# Autor: GitHub Copilot
# Data: 5 de setembro de 2025

echo "🚀 Iniciando ambiente de desenvolvimento..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se o Turso está instalado
check_turso() {
    if ! command -v turso &> /dev/null; then
        echo -e "${RED}❌ Turso CLI não encontrado!${NC}"
        echo -e "${YELLOW}📋 Para instalar o Turso CLI:${NC}"
        echo "   curl -sSfL https://get.tur.so/install.sh | bash"
        echo "   Ou visite: https://docs.turso.tech/cli/installation"
        exit 1
    else
        echo -e "${GREEN}✅ Turso CLI encontrado${NC}"
    fi
}

# Função para verificar se o pnpm está instalado
check_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}❌ pnpm não encontrado!${NC}"
        echo -e "${YELLOW}📋 Para instalar o pnpm:${NC}"
        echo "   npm install -g pnpm"
        exit 1
    else
        echo -e "${GREEN}✅ pnpm encontrado${NC}"
    fi
}

# Função de cleanup quando o script é interrompido
cleanup() {
    echo -e "\n${YELLOW}🛑 Encerrando serviços...${NC}"
    # Mata todos os processos filhos
    pkill -P $$
    echo -e "${GREEN}✅ Serviços encerrados${NC}"
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Verificar dependências
echo -e "${BLUE}🔍 Verificando dependências...${NC}"
check_turso
check_pnpm

# Criar diretório para logs se não existir
mkdir -p logs

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando a partir do .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Arquivo .env criado${NC}"
    else
        echo -e "${RED}❌ Arquivo .env.example não encontrado!${NC}"
        exit 1
    fi
fi

# Verificar se as variáveis do Turso estão configuradas
if ! grep -q "TURSO_DATABASE_URL" .env || ! grep -q "TURSO_AUTH_TOKEN" .env; then
    echo -e "${YELLOW}⚠️  Variáveis do Turso não configuradas no .env${NC}"
    echo -e "${BLUE}ℹ️  Usando Turso local...${NC}"
fi

echo -e "${BLUE}🗄️  Iniciando Turso local...${NC}"
# Iniciar Turso em background, redirecionando output para arquivo de log
turso dev --db-file ./local.db --port 8080 > logs/turso.log 2>&1 &
TURSO_PID=$!

# Aguardar um pouco para o Turso inicializar
sleep 3

# Verificar se o Turso está rodando
if ps -p $TURSO_PID > /dev/null; then
    echo -e "${GREEN}✅ Turso local iniciado (PID: $TURSO_PID)${NC}"
    echo -e "${BLUE}   📊 Database: ./local.db${NC}"
    echo -e "${BLUE}   🌐 Porta: 8080${NC}"
    echo -e "${BLUE}   📋 Logs: logs/turso.log${NC}"
else
    echo -e "${RED}❌ Falha ao iniciar Turso local${NC}"
    exit 1
fi

echo -e "${BLUE}⚡ Iniciando servidor de desenvolvimento...${NC}"
# Iniciar servidor de desenvolvimento
pnpm dev

# Se chegou aqui, significa que o pnpm dev foi interrompido
cleanup
