import { expect, test } from 'vitest'
import { NonceManager } from 'viem'

import * as anvil from '~test/anvil.js'
import { accounts } from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)
const address = accounts[0].address
const chainId = 1

test('default', () => {
  const manager = NonceManager.jsonRpc()
  expect(manager).toMatchInlineSnapshot(`
    {
      "consume": [Function],
      "get": [Function],
      "increment": [Function],
      "reset": [Function],
    }
  `)
})

test('jsonRpc: get reads pending nonce', async () => {
  const manager = NonceManager.jsonRpc()
  const nonce = await manager.get({ address, chainId, client })
  expect(nonce).toBeTypeOf('number')
})

test('consume increments sequentially', async () => {
  const manager = NonceManager.jsonRpc()

  const base = await manager.get({ address, chainId, client })
  const first = await manager.consume({ address, chainId, client })
  const second = await manager.consume({ address, chainId, client })

  expect(first).toBe(base)
  expect(second).toBe(base + 1)
})

test('parallel consume returns sequential nonces', async () => {
  const manager = NonceManager.jsonRpc()

  const base = await manager.get({ address, chainId, client })
  const nonces = await Promise.all([
    manager.consume({ address, chainId, client }),
    manager.consume({ address, chainId, client }),
    manager.consume({ address, chainId, client }),
  ])

  expect(nonces.sort((a, b) => a - b)).toEqual([base, base + 1, base + 2])
})

test('increment then get reflects the delta', async () => {
  const manager = NonceManager.jsonRpc()

  const base = await manager.get({ address, chainId, client })
  manager.increment({ address, chainId })
  manager.increment({ address, chainId })

  expect(await manager.get({ address, chainId, client })).toBe(base + 2)
})

test('reset clears tracked nonce', async () => {
  const manager = NonceManager.jsonRpc()

  const base = await manager.get({ address, chainId, client })
  await manager.consume({ address, chainId, client })
  await manager.consume({ address, chainId, client })
  manager.reset({ address, chainId })

  expect(await manager.get({ address, chainId, client })).toBe(base)
})

test('custom source: get preserves consumed nonce cache', async () => {
  const manager = NonceManager.from({
    source: { get: () => 1, set: () => {} },
  })

  expect(await manager.consume({ address, chainId, client })).toBe(1)
  expect(await manager.get({ address, chainId, client })).toBe(2)
  expect(await manager.consume({ address, chainId, client })).toBe(2)
})

test('custom source: reset clears consumed nonce cache', async () => {
  const manager = NonceManager.from({
    source: { get: () => 1, set: () => {} },
  })

  expect(await manager.consume({ address, chainId, client })).toBe(1)
  manager.reset({ address, chainId })
  expect(await manager.consume({ address, chainId, client })).toBe(1)
})

test('jsonRpc returns independent managers', async () => {
  const manager = NonceManager.jsonRpc()
  const other = NonceManager.jsonRpc()

  const base = await manager.consume({ address, chainId, client })

  expect(await manager.get({ address, chainId, client })).toBe(base + 1)
  expect(await other.get({ address, chainId, client })).toBe(base)
})
