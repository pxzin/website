# Changelog

## 0.0.7 - 2025-09-10

### Added
- **Novas Ferramentas:**
  - Adicionada a ferramenta "Compressor de Vídeo" para reduzir o tamanho de arquivos de vídeo para um alvo específico (~171MB), utilizando `ffmpeg` no servidor.

## 0.0.6 - 2025-09-10

### Added
- **Módulo Financeiro (FinTrack):**
  - Funcionalidade de transferência de valores entre contas.
  - Suporte para transações recorrentes e opção para interromper a recorrência.
  - Ferramenta para importação de transações a partir de arquivos CSV.
  - Gerenciamento de Contas e Categorias (criar/editar) com seleção de ícones.
  - Novas seções para visualizar "Recorrências Ativas" e "Parcelas Ativas".
  - Componentes de insights financeiros e cálculos mensais.
  - Atalhos de teclado para acelerar a criação de transações e categorias.
- **Novas Ferramentas:**
  - Adicionada a ferramenta "Trim Transparency" para remover o fundo transparente de imagens.

### Changed
- Melhoria geral na interface e experiência de usuário do módulo financeiro, com novos componentes de resumo, cabeçalhos e listas de transações.
- Aprimoramento nos formulários de transação, conta e categoria, que agora utilizam modais e oferecem busca para facilitar a seleção.

### Refactored
- Arquitetura interna dos tipos de transação para otimizar o modelo de dados e a performance das consultas.
- Diversos componentes (`AccountForm`, `CategoryForm`, `TransactionForm`) foram refatorados para aumentar a reusabilidade e manutenibilidade.
- Reorganização da página principal do módulo financeiro para uma estrutura mais limpa e baseada em componentes.

## 0.0.5 - 2025-09-02

### Changed
- Migrated To-Do List data storage from a JSON file to a Turso database to ensure persistence on Vercel.

### Added
- Functionality to mark To-Do List tasks as complete.

### Fixed
- Data persistence for the To-Do List on Vercel's serverless environment.

## 0.0.4 - 2025-08-29

### Added
- "Tools" section with a simple to-do list.
- File-based data storage for the to-do list.

## 0.0.3 - 2025-08-29

### Added
- Unified project data source for homepage and projects page.
- Improved UI/UX for About, Projects, and Contact routes.

### Changed
- Improved website UI/UX (homepage redesign, new color palette, typography).
- Fixed navigation bar overlap and spacing.

## 0.0.2 - 2025-08-29

### Added
- Application versioning and changelog system.

### Fixed
- Version display on Vercel production.

## 0.0.1 - 2025-08-29

### Added
- Initial project setup.
- Temporary footer for deployment verification.

### Changed
- Updated project dependencies and migrated to Tailwind CSS v4.
