# Contributing to OpenClaw

Contributions are welcome. This project is designed for extensibility—new skills, providers, and plugins can be added as extensions.

## Development Setup
- Install dependencies: `pnpm install`
- Run test suite: `pnpm test`
- Start the gateway: `pnpm gateway:watch`
- UI dev server: `pnpm ui:dev`

## Plugin & Skill Development
- Place new plugins/skills/providers in `extensions/`.
- Reference existing plugins (e.g., `extensions/tavily/`, `extensions/codex/`) as examples.
- A plugin consists of a TypeScript entrypoint and `openclaw.plugin.json` manifest.
- For skills, provide a minimal SKILL.md with name and usage.

## Submitting Changes
- Create minimal, focused pull requests.
- Run the tests locally.
- Describe the purpose and minimal usage/maintenance steps.

## More
See the [README.md](README.md) for project structure.
