import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateAssistantFlowManifest } from './assistantFlowManifest.mjs'

const manifest = {
    schemaVersion: 1,
    associations: [
        { assistantId: 'research-assistant', flowId: 'research-flow', kind: 'chatflow' },
        { assistantId: 'document-assistant', flowId: 'document-flow', kind: 'agentflow' }
    ]
}

describe('assistant-flow manifest validation', () => {
    it('accepts one chatflow or agentflow association for every assistant', () => {
        assert.deepEqual(validateAssistantFlowManifest(manifest, ['research-assistant', 'document-assistant']), {
            valid: true,
            errors: []
        })
    })

    it('reports assistants without a flow association', () => {
        const result = validateAssistantFlowManifest(manifest, ['research-assistant', 'missing-assistant'])

        assert.equal(result.valid, false)
        assert.deepEqual(result.errors, ['Assistant "missing-assistant" must have exactly one flow association'])
    })

    it('rejects duplicate assistant associations', () => {
        const duplicateManifest = {
            ...manifest,
            associations: [...manifest.associations, { assistantId: 'research-assistant', flowId: 'other', kind: 'chatflow' }]
        }

        const result = validateAssistantFlowManifest(duplicateManifest, ['research-assistant', 'document-assistant'])

        assert.equal(result.valid, false)
        assert.deepEqual(result.errors, ['Assistant "research-assistant" must have exactly one flow association'])
    })

    it('rejects unsupported flow kinds and empty identifiers', () => {
        const result = validateAssistantFlowManifest(
            {
                schemaVersion: 1,
                associations: [{ assistantId: '', flowId: 'flow', kind: 'workflow' }]
            },
            []
        )

        assert.equal(result.valid, false)
        assert.deepEqual(result.errors, [
            'Association 0 must provide a non-empty assistantId',
            'Association 0 kind must be "chatflow" or "agentflow"'
        ])
    })

    it('requires schema version 1 and an associations collection', () => {
        const result = validateAssistantFlowManifest({ schemaVersion: 2 }, [])

        assert.equal(result.valid, false)
        assert.deepEqual(result.errors, [
            'Manifest schemaVersion must be 1',
            'Manifest associations must be an array'
        ])
    })

    it('matches trimmed assistant identifiers against the required inventory', () => {
        const result = validateAssistantFlowManifest(
            {
                schemaVersion: 1,
                associations: [{ assistantId: ' research-assistant ', flowId: ' flow-id ', kind: 'chatflow' }]
            },
            ['research-assistant']
        )

        assert.deepEqual(result, { valid: true, errors: [] })
    })
})
