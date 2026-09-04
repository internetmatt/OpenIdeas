import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { resolveBrandLogoUrl, resolveBrandProductName } from './brandConfig.mjs'

afterEach(() => {
    delete globalThis.__FLOWISE_BRAND__
})

describe('portable brand configuration', () => {
    it('preserves Flowise defaults without host configuration', () => {
        assert.equal(resolveBrandProductName('Flowise'), 'Flowise')
        assert.equal(resolveBrandLogoUrl('light.svg', 'dark.svg', false), 'light.svg')
        assert.equal(resolveBrandLogoUrl('light.svg', 'dark.svg', true), 'dark.svg')
    })

    it('uses trimmed host-provided values', () => {
        globalThis.__FLOWISE_BRAND__ = {
            productName: '  Agent Flows  ',
            logoUrl: '  /brand/light.svg  ',
            darkLogoUrl: '  /brand/dark.svg  '
        }

        assert.equal(resolveBrandProductName('Flowise'), 'Agent Flows')
        assert.equal(resolveBrandLogoUrl('light.svg', 'dark.svg', false), '/brand/light.svg')
        assert.equal(resolveBrandLogoUrl('light.svg', 'dark.svg', true), '/brand/dark.svg')
    })

    it('ignores blank host values', () => {
        globalThis.__FLOWISE_BRAND__ = { productName: ' ', logoUrl: '', darkLogoUrl: '\n' }

        assert.equal(resolveBrandProductName('Flowise'), 'Flowise')
        assert.equal(resolveBrandLogoUrl('light.svg', 'dark.svg', true), 'dark.svg')
    })
})
