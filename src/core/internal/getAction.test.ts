import { describe, expect, test, vi } from 'vp/test'

import { getAction } from './getAction.js'

describe('getAction', () => {
  test('behavior: uses fallback action when client action is missing', () => {
    const client = { id: 1 }
    const action = vi.fn(() => 69)

    const result = getAction(client, action, 'getChainId')({})

    expect({
      calls: action.mock.calls,
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          [
            {
              "id": 1,
            },
            {},
          ],
        ],
        "result": 69,
      }
    `)
  })

  test('behavior: uses implicit client action name first', () => {
    const getChainId = vi.fn(() => 1)
    const fallback = function getChainId() {
      return 2
    }
    const client = { getChainId }

    const result = getAction(client, fallback, 'chainId')({})

    expect({
      calls: getChainId.mock.calls,
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          [
            {},
          ],
        ],
        "result": 1,
      }
    `)
  })

  test('behavior: uses explicit action name when function name is unavailable', () => {
    const getChainId = vi.fn(() => 1)
    const fallback = Object.defineProperty(() => 2, 'name', { value: '' })
    const client = { getChainId }

    const result = getAction(client, fallback, 'getChainId')({})

    expect({
      calls: getChainId.mock.calls,
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          [
            {},
          ],
        ],
        "result": 1,
      }
    `)
  })

  test('behavior: preserves nullish client action return values', () => {
    const foo = vi.fn(() => null)
    const fallback = () => true
    const client = { foo }

    const result = getAction(client, fallback, 'foo')({})

    expect({
      calls: foo.mock.calls,
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          [
            {},
          ],
        ],
        "result": null,
      }
    `)
  })

  test('behavior: supports explicit nested client action paths', () => {
    const getBalance = vi.fn(() => 123n)
    const fallback = () => 456n
    const client = {
      public: {
        getBalance,
      },
    }

    const result = getAction(client, fallback, ['public', 'getBalance'])({
      address: '0x0000000000000000000000000000000000000000',
    })

    expect({
      calls: getBalance.mock.calls,
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          [
            {
              "address": "0x0000000000000000000000000000000000000000",
            },
          ],
        ],
        "result": 123n,
      }
    `)
  })
})
