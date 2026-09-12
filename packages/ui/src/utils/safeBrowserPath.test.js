import { assignLocationIfUsable, isUsableBrowserPath, replaceMissingFlowPath } from './safeBrowserPath'

describe('safeBrowserPath', () => {
    it('rejects JS holes that would navigate to /undefined', () => {
        expect(isUsableBrowserPath(undefined)).toBe(false)
        expect(isUsableBrowserPath(null)).toBe(false)
        expect(isUsableBrowserPath('undefined')).toBe(false)
        expect(isUsableBrowserPath('/undefined')).toBe(false)
        expect(isUsableBrowserPath('/v2/agentcanvas/undefined')).toBe(false)
        expect(isUsableBrowserPath('/canvas-island/undefined')).toBe(false)
        expect(isUsableBrowserPath('')).toBe(false)
    })

    it('accepts real Flowise routes and UUIDs', () => {
        expect(isUsableBrowserPath('/')).toBe(true)
        expect(isUsableBrowserPath('/signin')).toBe(true)
        expect(isUsableBrowserPath('/v2/agentcanvas')).toBe(true)
        expect(isUsableBrowserPath('/v2/agentcanvas/40c7ee5e-e191-4547-83f1-4c5dcc8d9356')).toBe(true)
        expect(isUsableBrowserPath('/canvas/40c7ee5e-e191-4547-83f1-4c5dcc8d9356?x=1')).toBe(true)
    })

    it('never assigns location.href when redirectUrl is missing', () => {
        const locationRef = { href: '/login', pathname: '/login' }
        expect(assignLocationIfUsable(undefined, locationRef)).toBe(false)
        expect(assignLocationIfUsable({ redirectUrl: '/' }, locationRef)).toBe(false)
        expect(locationRef.href).toBe('/login')
        expect(assignLocationIfUsable('/', locationRef)).toBe(true)
        expect(locationRef.href).toBe('/')
    })

    it('does not reload the current document (login resolve / → / loop)', () => {
        const locationRef = { href: 'http://127.0.0.1:3010/', pathname: '/' }
        expect(assignLocationIfUsable('/', locationRef)).toBe(false)
        expect(locationRef.href).toBe('http://127.0.0.1:3010/')
    })

    it('replaceState drops a literal undefined path back to /', () => {
        const locationRef = { pathname: '/undefined' }
        const historyRef = { replaceState: jest.fn() }
        expect(replaceMissingFlowPath(locationRef, historyRef)).toBe(true)
        expect(historyRef.replaceState).toHaveBeenCalledWith(null, '', '/')
        expect(replaceMissingFlowPath({ pathname: '/v2/agentcanvas/abc' }, historyRef)).toBe(false)
    })
})
