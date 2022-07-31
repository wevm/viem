import { expect, test, vi } from 'vitest'

import { injectedProvider } from './injectedProvider'

test('undefined window', () => {
  vi.stubGlobal('window', undefined)

  expect(injectedProvider()).toEqual(null)
})

test('creates', async () => {
  vi.stubGlobal('window', {
    ethereum: {
      on: () => null,
      removeListener: () => null,
      request: vi.fn(({ method }) => {
        if (method === 'eth_requestAccounts') {
          return ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac']
        }
      }),
    },
  })

  expect(injectedProvider()).toMatchInlineSnapshot(`
    {
      "on": [Function],
      "removeListener": [Function],
      "request": [Function],
      "type": "walletProvider",
    }
  `)
})
