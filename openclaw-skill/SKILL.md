---
name: Loop Engine
description: |
  Govern multi-actor operational workflows with Loop Engine — an open-source runtime
  for constrained, observable, and improvable enterprise loops.
  Start loops, execute transitions, and surface human approval gates
  directly through your messaging channel.
---

# Loop Engine

Use this skill when a user wants to start, inspect, approve, reject, or transition a governed loop.

## Commands

### `start loop [loop-id]`

Starts a new loop instance and returns the instance id with the current state.

Example: `start loop expense.approval`

### `transition [instance-id] [transition-id]`

Executes a transition after actor authorization and guard evaluation.

Example: `transition abc123 submit_for_approval`

### `approve [instance-id]`

Shortcut for a human approval transition. The actor is always the OpenClaw user (`type: "human"`).

Example: `approve abc123`

### `reject [instance-id]`

Shortcut for a human rejection transition on a pending approval state.

Example: `reject abc123`

### `status [instance-id]`

Returns current state, status, and recent transition history.

Example: `status abc123`

### `list loops`

Lists registered loop definitions available to start.

## Approval gate behavior

When a loop enters a state matching `PENDING` or `APPROVAL`, send:

```text
⚠️ Approval required for [loop-id] [instance-id]
[summary of pending action and value]
Reply: approve [instance-id] or reject [instance-id]
```

## Safety boundary

Approval transitions must remain restricted to `allowedActors` that include `human`. AI actor transitions cannot approve their own recommendations.
