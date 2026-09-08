import { applyDefaultWorkspace } from './applyDefaultWorkspace'

describe('applyDefaultWorkspace', () => {
    const savedWorkspace = process.env.FLOWISE_DEFAULT_WORKSPACE_ID
    const savedOrg = process.env.FLOWISE_DEFAULT_ORGANIZATION_ID

    afterEach(() => {
        if (savedWorkspace !== undefined) process.env.FLOWISE_DEFAULT_WORKSPACE_ID = savedWorkspace
        else delete process.env.FLOWISE_DEFAULT_WORKSPACE_ID
        if (savedOrg !== undefined) process.env.FLOWISE_DEFAULT_ORGANIZATION_ID = savedOrg
        else delete process.env.FLOWISE_DEFAULT_ORGANIZATION_ID
    })

    it('keeps an explicit workspace', () => {
        expect(applyDefaultWorkspace({ activeWorkspaceId: 'ws-1', activeWorkspace: 'A' })).toEqual({
            activeWorkspaceId: 'ws-1',
            activeWorkspace: 'A'
        })
    })

    it('fills General when the session has no workspace', () => {
        delete process.env.FLOWISE_DEFAULT_WORKSPACE_ID
        expect(applyDefaultWorkspace({ id: 'user-1' } as { id: string; activeWorkspaceId?: string })).toEqual({
            id: 'user-1',
            activeWorkspaceId: 'General',
            activeWorkspace: 'General'
        })
    })

    it('honors FLOWISE_DEFAULT_WORKSPACE_ID and organization env', () => {
        process.env.FLOWISE_DEFAULT_WORKSPACE_ID = 'General'
        process.env.FLOWISE_DEFAULT_ORGANIZATION_ID = 'projecto-local-org'
        expect(applyDefaultWorkspace({})).toEqual({
            activeWorkspaceId: 'General',
            activeWorkspace: 'General',
            activeOrganizationId: 'projecto-local-org'
        })
    })
})
