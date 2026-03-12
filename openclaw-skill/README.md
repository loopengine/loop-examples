# OpenClaw Loop Engine Skill

OpenClaw can use this skill to start loops, execute transitions, and route human approvals through WhatsApp, Telegram, Slack, Discord, Signal, or iMessage while Loop Engine enforces state and guard constraints.

## Prerequisites

- Node.js 18+
- OpenClaw running locally
- `@loop-engine/sdk@0.1.x`

## Install

Copy this folder into your OpenClaw skills directory:

```bash
cp -r openclaw-skill ~/.openclaw/skills/loop-engine
```

## Configuration

- Edit `src/loops/*.ts` to swap or add loop definitions.
- Replace in-memory defaults in `src/lib/engine.ts` with a persistent store if needed.
- Keep approval transitions limited to human actors for production safety.

## Security note

This skill executes real transitions. Review `actors` on each transition and guard requirements before deploying in shared messaging environments.

## References

- https://loopengine.io/docs/examples/openclaw
- https://github.com/loopengine/loop-engine
