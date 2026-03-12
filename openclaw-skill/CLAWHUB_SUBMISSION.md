⏸ HOLD — Do not submit to ClawHub until after HN Show HN launch. Target: submit within 24h of HN post going live to maximize simultaneous discovery.

# ClawHub Submission Draft

## 1) SKILL NAME

Loop Engine Governance

## 2) SHORT DESCRIPTION (<=160 chars)

Add structural approval gates and audit trails to any OpenClaw skill. Loop Engine governs what your AI agent is allowed to do.

## 3) LONG DESCRIPTION (<=500 chars)

Loop Engine adds deterministic guards, human approval gates, and a full transition audit trail to OpenClaw skills. An agent can propose an action, but execution can be blocked until a human approves through WhatsApp or Telegram. The runtime enforces state-machine transitions structurally, so policy is not prompt-dependent. See full integration docs: https://loopengine.io/docs/examples/openclaw

## 4) TAGS

- governance
- approval-gates
- audit
- enterprise
- state-machine
- typescript

## 5) COMMANDS

- `start loop [loop-id]` — Start a loop instance and return instance ID + current state.
- `transition [instance-id] [transition-id]` — Execute a transition with guard and actor checks.
- `approve [instance-id]` — Execute the available human approval transition for a pending loop.
- `reject [instance-id]` — Execute the available human rejection transition for a pending loop.
- `status [instance-id]` — Return current state, status, and latest transition details.
- `list loops` — List all registered loop definitions available to start.

## 6) LINKS

- Docs: https://loopengine.io/docs/examples/openclaw
- npm: https://www.npmjs.com/package/@loop-engine/adapter-openclaw
- GitHub: https://github.com/loopengine/loop-examples/tree/main/openclaw-skill
