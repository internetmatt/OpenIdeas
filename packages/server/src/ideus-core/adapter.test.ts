import { describe, expect, it } from '@jest/globals'
import {
    IDEUS_OPENIDEAS_DEFAULT_BASE_URL,
    IDEUS_OPENIDEAS_DEFAULT_PORT,
    chatflowApiPath,
    coreCanvasIframeOrigins,
    coreCanvasIframeOriginsCsv,
    executionsQueryPath,
    openIdeasChatFromCoreSession,
    openIdeasPointerFromWorkflowMeta,
    predictionApiPath
} from './adapter'

describe('openIdeasPointerFromWorkflowMeta', () => {
    it('returns a chatflow pointer when Core meta is engine=flowise with an id', () => {
        expect(openIdeasPointerFromWorkflowMeta({ engine: 'flowise', externalFlowId: 'af-1' })).toEqual({
            engine: 'flowise',
            externalFlowId: 'af-1',
            chatflowId: 'af-1'
        })
    })

    it('returns null when the workflow still runs on the n8n engine', () => {
        expect(openIdeasPointerFromWorkflowMeta({ engine: 'n8n', externalFlowId: 'af-1' })).toBeNull()
    })

    it('returns null when engine is flowise but externalFlowId is missing', () => {
        expect(openIdeasPointerFromWorkflowMeta({ engine: 'flowise' })).toBeNull()
    })

    it('returns null for blank externalFlowId', () => {
        expect(openIdeasPointerFromWorkflowMeta({ engine: 'flowise', externalFlowId: '   ' })).toBeNull()
    })
})

describe('OpenIdeas API paths used by Core /rest/flowise/*', () => {
    it('builds the chatflow GET path Core already calls', () => {
        expect(chatflowApiPath('af/1')).toBe('/api/v1/chatflows/af%2F1')
    })

    it('builds the predict path Core already calls', () => {
        expect(predictionApiPath('af-1')).toBe('/api/v1/prediction/af-1')
    })

    it('builds the executions query Core already calls', () => {
        expect(executionsQueryPath('af-1')).toBe('/api/v1/executions?agentflowId=af-1')
    })
})

describe('openIdeasChatFromCoreSession', () => {
    const session = { id: 'sess-1', title: 'New idea', workflowId: 'wf-9', agentId: null }

    it('uses workflow.meta externalFlowId when the Chat Hub row is canvas-linked', () => {
        expect(openIdeasChatFromCoreSession(session, { engine: 'flowise', externalFlowId: 'af-1' })).toEqual({
            chatId: 'sess-1',
            chatflowId: 'af-1'
        })
    })

    it('falls back to session.workflowId when meta is not a Flowise pointer', () => {
        expect(openIdeasChatFromCoreSession(session, { engine: 'n8n' })).toEqual({
            chatId: 'sess-1',
            chatflowId: 'wf-9'
        })
    })
})

describe('Ideus local defaults', () => {
    it('defaults OpenIdeas to port 3010 so it does not collide with Ideas or Grafana', () => {
        expect(IDEUS_OPENIDEAS_DEFAULT_PORT).toBe(3010)
        expect(IDEUS_OPENIDEAS_DEFAULT_BASE_URL).toBe('http://localhost:3010')
    })

    it('lists Core canvas iframe origins for IFRAME_ORIGINS', () => {
        expect(coreCanvasIframeOrigins()).toContain('https://wt-flowise-replacement.localhost')
        expect(coreCanvasIframeOriginsCsv()).toContain('http://localhost:5678')
    })
})
