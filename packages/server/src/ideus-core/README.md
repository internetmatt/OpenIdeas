# Ideus / Core schema adapter

Types and mapping notes so AskDilly-Core `wt-flowise-replacement` can point
`IDEUS_FLOWISE_BASE_URL` at **this** OpenIdeas checkout instead of stock
`flowiseai/flowise`.

Product name: **OpenIdeas**. Apache-2.0 attribution remains with FlowiseAI.

## Core → OpenIdeas

| Core (AskDilly-Core) | OpenIdeas |
| --- | --- |
| Workflow row in Chat Hub / Overview (`/home/workflows`) | Chatflow or Agentflow |
| `workflow.meta.engine === 'flowise'` | Use OpenIdeas canvas (not n8n NodeView) |
| `workflow.meta.externalFlowId` | Chatflow / Agentflow `id` |
| `POST /rest/flowise/agentflows/:workflowId/predict` | `POST /api/v1/prediction/:id` |
| `GET /rest/flowise/...` proxy | `/api/v1/chatflows/:id`, `/api/v1/executions` |
| Chat Hub session `id` | Predict body `chatId` |

`engine: 'flowise'` is a **wire name**. Do not rename it in this adapter until
Core ships a dedicated breaking PR.

## Local swap

```bash
# Core worktree (.worktrees/wt-flowise-replacement)
IDEUS_FLOWISE_BASE_URL=http://localhost:3010
IDEUS_FLOWISE_API_KEY=<server-side OpenIdeas workspace key>

# This repo
PORT=3010
IFRAME_ORIGINS=http://localhost:5678,http://localhost:15678,https://wt-flowise-replacement.localhost
```

Copy [`docs/env.ideus.example`](../../../../docs/env.ideus.example) to `packages/server/.env`.
Upstream Flowise still documents `:3000`; Ideus siblings use **3010**.

## Activate / publish

Core **activate** stays on the n8n-derived workflow row (compat bridge for
already-activated graphs). OpenIdeas `deployed` / `isPublic` on `IChatFlow`
is the canvas-side publish flag. Do not treat OpenIdeas deploy as a replacement
for Core activate until the compat bridge is retired.
