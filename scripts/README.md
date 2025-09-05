# Scripts de Desenvolvimento

Este diretório contém scripts utilitários para facilitar o desenvolvimento do projeto.

## 🚀 start-dev.sh

Script principal para iniciar o ambiente de desenvolvimento completo.

### O que faz:

- ✅ Verifica se o Turso CLI está instalado
- ✅ Verifica se o pnpm está instalado
- ✅ Cria arquivo .env se não existir
- ✅ Inicia Turso local na porta 8080
- ✅ Inicia servidor de desenvolvimento Vite
- ✅ Gerencia logs em `logs/turso.log`
- ✅ Cleanup automático ao interromper (Ctrl+C)

### Como usar:

```bash
# Método 1: Via npm script (recomendado)
pnpm run dev:full

# Método 2: Execução direta
./scripts/start-dev.sh

# Método 3: Via concurrently (mais simples)
pnpm run dev:turso
```

### Requisitos:

- Turso CLI instalado
- pnpm instalado
- Arquivo .env configurado (criado automaticamente se não existir)

### Logs:

- Logs do Turso: `logs/turso.log`
- Logs do Vite: No terminal

### Portas:

- Turso: `localhost:8080`
- Vite: `localhost:5173` (ou próxima disponível)

## 🛠️ Scripts NPM Disponíveis

```bash
# Desenvolvimento normal (apenas Vite)
pnpm dev

# Desenvolvimento completo (Turso + Vite) - Script robusto
pnpm run dev:full

# Desenvolvimento completo (Turso + Vite) - Via concurrently
pnpm run dev:turso

# Apenas Turso local
pnpm run turso:start
```

## 🚨 Troubleshooting

### Erro: "Turso CLI não encontrado"

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash
```

### Erro: "pnpm não encontrado"

```bash
# Instalar pnpm
npm install -g pnpm
```

### Erro: "Porta já em uso"

- Turso: Mude a porta no script (--port 8081)
- Vite: Será automaticamente redirecionado para próxima porta

### Limpar dados do banco local

```bash
rm local.db
# Reiniciar o servidor
```
