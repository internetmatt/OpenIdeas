import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import { Request } from 'express'
import { Platform } from '../../Interface'
import { WorkspaceName } from '../database/entities/workspace.entity'

const mockGetPlatformType = jest.fn()
const mockWorkspaceFindOne = jest.fn(async (): Promise<unknown> => null)
const mockWorkspaceFind = jest.fn(async (): Promise<unknown[]> => [])
const mockOrganizationFindOne = jest.fn(async (): Promise<unknown> => null)
const mockRoleFindOne = jest.fn(async (): Promise<unknown> => null)
const mockUserFindOne = jest.fn(async (): Promise<unknown> => null)

jest.mock('../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn(() => ({
        identityManager: { getPlatformType: mockGetPlatformType },
        AppDataSource: {
            getRepository: jest.fn((entity: { name: string }) => {
                switch (entity.name) {
                    case 'Workspace':
                        return { findOne: mockWorkspaceFindOne, find: mockWorkspaceFind }
                    case 'Organization':
                        return { findOne: mockOrganizationFindOne }
                    case 'Role':
                        return { findOne: mockRoleFindOne }
                    case 'User':
                        return { findOne: mockUserFindOne }
                    default:
                        return { findOne: jest.fn() }
                }
            })
        }
    }))
}))

import { isLoopbackAddress, isLoopbackRequest, resolveOssLoopbackUser } from './ossLoopbackIdentity'

const workspace = {
    id: 'ws-1',
    name: WorkspaceName.DEFAULT_WORKSPACE,
    organizationId: 'org-1',
    createdBy: 'user-1'
}
const organization = {
    id: 'org-1',
    name: 'Default Organization',
    subscriptionId: null,
    customerId: null,
    createdBy: 'user-1'
}

describe('ossLoopbackIdentity', () => {
    const savedEmbedded = process.env.FLOWISE_DESKTOP_EMBEDDED
    const savedWorkspaceId = process.env.FLOWISE_DEFAULT_WORKSPACE_ID

    beforeEach(() => {
        delete process.env.FLOWISE_DESKTOP_EMBEDDED
        delete process.env.FLOWISE_DEFAULT_WORKSPACE_ID
        mockGetPlatformType.mockReset()
        mockWorkspaceFindOne.mockReset()
        mockWorkspaceFind.mockReset()
        mockOrganizationFindOne.mockReset()
        mockRoleFindOne.mockReset()
        mockUserFindOne.mockReset()
        mockGetPlatformType.mockReturnValue(Platform.OPEN_SOURCE)
        mockWorkspaceFindOne.mockResolvedValue(workspace)
        mockWorkspaceFind.mockResolvedValue([workspace])
        mockOrganizationFindOne.mockResolvedValue(organization)
        mockRoleFindOne.mockResolvedValue({ id: 'owner-role', name: 'owner', permissions: '["workspace"]' })
        mockUserFindOne.mockResolvedValue({ id: 'user-1', email: 'dilly@localhost.local', name: 'Dilly Admin' })
    })

    afterEach(() => {
        if (savedEmbedded !== undefined) process.env.FLOWISE_DESKTOP_EMBEDDED = savedEmbedded
        else delete process.env.FLOWISE_DESKTOP_EMBEDDED
        if (savedWorkspaceId !== undefined) process.env.FLOWISE_DEFAULT_WORKSPACE_ID = savedWorkspaceId
        else delete process.env.FLOWISE_DEFAULT_WORKSPACE_ID
    })

    describe('isLoopbackAddress', () => {
        it('accepts IPv4, IPv6, and mapped loopback', () => {
            expect(isLoopbackAddress('127.0.0.1')).toBe(true)
            expect(isLoopbackAddress('::1')).toBe(true)
            expect(isLoopbackAddress('::ffff:127.0.0.1')).toBe(true)
            expect(isLoopbackAddress('10.0.0.8')).toBe(false)
            expect(isLoopbackAddress(undefined)).toBe(false)
        })
    })

    describe('isLoopbackRequest', () => {
        it('uses the TCP peer, not the x-request-from header', () => {
            expect(isLoopbackRequest({ ip: '127.0.0.1' })).toBe(true)
            expect(isLoopbackRequest({ ip: '192.168.1.20', socket: { remoteAddress: '10.0.0.8' } })).toBe(false)
        })

        it('trusts FLOWISE_DESKTOP_EMBEDDED even when the peer is not loopback', () => {
            process.env.FLOWISE_DESKTOP_EMBEDDED = 'true'
            expect(isLoopbackRequest({ ip: '10.0.0.8' })).toBe(true)
        })
    })

    describe('resolveOssLoopbackUser', () => {
        const loopbackReq = { ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } } as Request

        it('attaches the default workspace owner for OSS loopback', async () => {
            const user = await resolveOssLoopbackUser(loopbackReq)
            expect(user).toMatchObject({
                id: 'user-1',
                email: 'dilly@localhost.local',
                activeOrganizationId: 'org-1',
                activeWorkspaceId: 'ws-1',
                isOrganizationAdmin: true
            })
            expect(user?.permissions).toEqual(['workspace'])
        })

        it('returns null on Cloud / Enterprise so those still need a JWT', async () => {
            mockGetPlatformType.mockReturnValue(Platform.CLOUD)
            await expect(resolveOssLoopbackUser(loopbackReq)).resolves.toBeNull()
        })

        it('returns null when the peer is not loopback', async () => {
            await expect(resolveOssLoopbackUser({ ip: '10.0.0.8' } as Request)).resolves.toBeNull()
            expect(mockWorkspaceFindOne).not.toHaveBeenCalled()
        })

        it('returns null when no workspace exists yet', async () => {
            mockWorkspaceFindOne.mockResolvedValue(null)
            mockWorkspaceFind.mockResolvedValue([])
            await expect(resolveOssLoopbackUser(loopbackReq)).resolves.toBeNull()
        })
    })
})
