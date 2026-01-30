# Browser NL CLI (extractable starter)

A minimal, terminal-first entry point that lets you talk to the browser tool in natural language.
It runs Moltbot's embedded agent with **only** the `browser` tool enabled, so it is a good
starting point for extracting the browser automation layer into a standalone project.

## What this demo does

- Reads natural language from stdin and forwards it to the embedded agent.
- Restricts tool usage to `browser` only.
- Persists a local session transcript so the agent can keep context between turns.

## Prereqs

- Node 22+ and `pnpm install` at the repo root.
- A configured model/provider (for example, `ANTHROPIC_API_KEY` or your preferred provider env).
- Browser control enabled in config (see `docs/tools/browser.md`).

## Run (inside this repo)

```bash
node --import tsx examples/browser-nl-cli/browser-nl.ts
```

Optional overrides:

```bash
BROWSER_NL_PROVIDER=openai BROWSER_NL_MODEL=gpt-5.2 \
  node --import tsx examples/browser-nl-cli/browser-nl.ts
```

## Extract into a new project

If you want this in a standalone repo, keep these pieces:

- `examples/browser-nl-cli/browser-nl.ts` (the CLI loop + config override).
- `src/agents/pi-embedded.ts` and `src/agents/pi-embedded-runner/**` (embedded agent runner).
- `src/agents/tools/browser-tool.ts` + `src/browser/**` (browser control + action pipeline).
- `src/config/**` (config + model selection; or replace with your own config layer).

The CLI currently imports directly from the repo. For a standalone repo, copy those modules
and update import paths accordingly.
