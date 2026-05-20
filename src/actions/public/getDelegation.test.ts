import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

const account = '0x0000000000000000000000000000000000000001'
const delegate = '0x0000000000000000000000000000000000c0ffee'

describe('getDelegation', () => {
  test('behavior: returns undefined when account has no code', async () => {
    const client = anvil.getClient(anvilMainnet)

    const delegation = await actions.getDelegation(client, {
      address: '0x0000000000000000000000000000000000000002',
    })

    expect(delegation).toMatchInlineSnapshot(`undefined`)
  })

  test('behavior: returns undefined for non-delegation bytecode', async () => {
    const client = anvil.getClient(anvilMainnet)
    await actions.setCode(client, { address: account, bytecode: '0x6001600055' })

    const delegation = await actions.getDelegation(client, {
      address: account,
    })

    expect(delegation).toMatchInlineSnapshot(`undefined`)
  })

  test('behavior: returns the delegated address for an EIP-7702 designator', async () => {
    const client = anvil.getClient(anvilMainnet)
    const bytecode = `0xef0100${delegate.slice(2)}` as const
    await actions.setCode(client, { address: account, bytecode })

    const delegation = await actions.getDelegation(client, {
      address: account,
    })

    expect(delegation).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000C0FFEE"`,
    )
  })
})
