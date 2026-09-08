/**
 * Host-seeded or incomplete JWT/session users often have no activeWorkspaceId.
 * OSS / local OpenIdeas is single-tenant: fall back to FLOWISE_DEFAULT_WORKSPACE_ID
 * (Ideas launcher uses "General", which matches the local chat_flow.workspaceId).
 */
export type WorkspaceScopedUser = {
    activeWorkspaceId?: string
    activeWorkspace?: string
    activeOrganizationId?: string
}

export function applyDefaultWorkspace<T extends WorkspaceScopedUser>(user: T): T {
    const workspaceId = user.activeWorkspaceId || process.env.FLOWISE_DEFAULT_WORKSPACE_ID || 'General'
    const organizationId = user.activeOrganizationId || process.env.FLOWISE_DEFAULT_ORGANIZATION_ID
    if (workspaceId === user.activeWorkspaceId && organizationId === user.activeOrganizationId) {
        return user
    }
    return {
        ...user,
        activeWorkspaceId: workspaceId,
        activeWorkspace: user.activeWorkspace || workspaceId,
        ...(organizationId ? { activeOrganizationId: organizationId } : {})
    }
}
