# Assistant-to-flow manifest

[`assistant-flow-manifest.v1.json`](assistant-flow-manifest.v1.json) is a portable association layer between an assistant catalog and deployed Flowise flows. It contains identifiers and display labels only; keep credentials, API tokens, prompts with private data, and other environment secrets out of the manifest.

Each assistant in the consuming application's inventory must appear exactly once:

- `assistantId` is the consuming application's stable assistant ID.
- `flowId` is the ID assigned by the target Flowise deployment after a flow is created or imported.
- `kind` is `chatflow` or `agentflow`. `agentflow` targets the Agentflow V2 editor.
- `label` is optional display text.

Validate the manifest with the IDs from the assistant inventory before deployment:

```js
import manifest from './assistant-flow-manifest.v1.json' with { type: 'json' }
import { validateAssistantFlowManifest } from '../packages/ui/src/utils/assistantFlowManifest.mjs'

const assistantIds = ['research-assistant', 'document-assistant']
const result = validateAssistantFlowManifest(manifest, assistantIds)

if (!result.valid) {
    throw new Error(result.errors.join('\n'))
}
```

Flow exports and association manifests have different lifecycles. Commit sanitized Flowise export JSON when the graph itself should be shared. After importing it into another deployment, update this manifest with the newly assigned `flowId`. Do not assume that development and work deployments use the same origin, port, or flow IDs.
