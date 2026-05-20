# OpenClaw

OpenClaw is a personal AI assistant platform you run on your own devices. It supports voice, chat, live canvas rendering, multi-channel integration (Telegram, WhatsApp, etc.), and is extensible via plugins to add new skills or providers.

## Features
- Voice input/output across platforms
- Real-time canvas and markdown/chat UI
- Plugin and extension system
- Multi-channel messaging: Telegram, WhatsApp, Discord, etc.
- Configurable gateway (control plane)
- Extensible via plugins (skills, providers)

## Quick Start
1. **Install dependencies**
    ```sh
    pnpm install
    ```
2. **Launch gateway (control plane):**
    ```sh
    pnpm gateway:watch
    ```
3. **Start UI development server:**
    ```sh
    pnpm ui:dev
    ```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to develop plugins and contribute.

## Code Structure
- `src/`          – Core logic (tasks, transcription, agents)
- `packages/`     – SDKs and contracts
- `extensions/`   – Plugins, providers, and skills
- `ui/`           – User interface (Vite/Lit)

## License
See [LICENSE](LICENSE).
