# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```bash
# Desenvolvimento completo (Turso + Vite) - Recomendado
pnpm run dev:full

# Desenvolvimento apenas Vite (sem banco local)
pnpm dev

# Alternativa via concurrently
pnpm run dev:turso
```

### Scripts Disponíveis

- **`pnpm run dev:full`** - Inicia Turso local + servidor de desenvolvimento com verificações automáticas
- **`pnpm dev`** - Apenas servidor de desenvolvimento Vite
- **`pnpm run dev:turso`** - Turso + Vite via concurrently (versão simples)
- **`pnpm run turso:start`** - Apenas Turso local na porta 8080

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
