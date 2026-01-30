import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";

import { runEmbeddedPiAgent } from "../../src/agents/pi-embedded.js";
import { DEFAULT_MODEL, DEFAULT_PROVIDER } from "../../src/agents/defaults.js";
import { resolveConfiguredModelRef } from "../../src/agents/model-selection.js";
import { loadConfig } from "../../src/config/config.js";

const baseConfig = loadConfig();
const configuredModel = resolveConfiguredModelRef({
  cfg: baseConfig,
  defaultProvider: DEFAULT_PROVIDER,
  defaultModel: DEFAULT_MODEL,
});

const provider = process.env.BROWSER_NL_PROVIDER?.trim() || configuredModel.provider;
const model = process.env.BROWSER_NL_MODEL?.trim() || configuredModel.model;

const { tools: baseTools, ...restConfig } = baseConfig;
const { alsoAllow: _alsoAllow, profile: _profile, allow: _allow, deny: _deny, ...toolsRest } =
  baseTools ?? {};

const config = {
  ...restConfig,
  tools: {
    ...toolsRest,
    allow: ["browser"],
    deny: [],
  },
};

const dataDir = path.resolve(process.cwd(), ".browser-nl");
const workspaceDir = path.join(dataDir, "workspace");
const sessionFile = path.join(dataDir, "session.jsonl");
const sessionId = "browser-nl";

await fs.mkdir(workspaceDir, { recursive: true });

const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log("Browser NL CLI ready. Type your request or 'exit' to quit.");

while (true) {
  const line = (await rl.question("> ")).trim();
  if (!line) continue;
  if (line === "exit" || line === "quit") break;

  const result = await runEmbeddedPiAgent({
    sessionId,
    sessionFile,
    workspaceDir,
    prompt: line,
    timeoutMs: 120_000,
    runId: crypto.randomUUID(),
    provider,
    model,
    config,
  });

  const payloads = result.payloads ?? [];
  if (payloads.length === 0) {
    console.log("(no response)");
    continue;
  }

  for (const payload of payloads) {
    if (payload.text) console.log(payload.text);
    if (payload.mediaUrls?.length) {
      console.log(`(media: ${payload.mediaUrls.join(", ")})`);
      continue;
    }
    if (payload.mediaUrl) console.log(`(media: ${payload.mediaUrl})`);
  }
}

await rl.close();
