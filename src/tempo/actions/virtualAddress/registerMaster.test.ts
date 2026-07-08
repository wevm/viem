import { VirtualAddress } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { Actions as CoreActions } from 'viem'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

// Precomputed 32-bit PoW salt for dev account 0 (derives masterId below).
const salt =
  '0x00000000000000000000000000000000000000000000000000000000abf52baf' as const
const masterId = '0x58e21090' as const

describe('registerMasterSync', () => {
  test('default', async () => {
    const { receipt, ...result } = await Actions.virtualAddress.registerMasterSync(
      client,
      { salt },
    )

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "masterAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "masterId": "0x58e21090",
      }
    `)
  })
})

describe('registerMaster', () => {
  test('default', async () => {
    // Fresh genesis: the salt's master ID is unregistered again.
    await tempo.restart()

    const hash = await Actions.virtualAddress.registerMaster(client, { salt })
    const receipt = await CoreActions.transaction.waitForReceipt(client, {
      hash,
    }).receipt
    expect(receipt.status).toBe('success')

    const { args } = Actions.virtualAddress.registerMaster.extractEvent(
      receipt.logs,
    )
    expect(args).toMatchInlineSnapshot(`
      {
        "masterAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "masterId": "0x58e21090",
      }
    `)
  })
})

// Reads below run against the master registered in `registerMaster`.
describe('getMasterAddress', () => {
  test('default', async () => {
    await expect(
      Actions.virtualAddress.getMasterAddress(client, { masterId }),
    ).resolves.toBe(account.address)
  })

  test('behavior: unregistered master', async () => {
    await expect(
      Actions.virtualAddress.getMasterAddress(client, {
        masterId: '0xdeadbeef',
      }),
    ).resolves.toBeNull()
  })
})

describe('resolve', () => {
  test('default', async () => {
    const address = VirtualAddress.from({
      masterId,
      userTag: '0x010203040506',
    })

    await expect(
      Actions.virtualAddress.resolve(client, { address }),
    ).resolves.toBe(account.address)
  })

  test('behavior: non-virtual address', async () => {
    await expect(
      Actions.virtualAddress.resolve(client, { address: account.address }),
    ).resolves.toBe(account.address)
  })

  test('behavior: unregistered virtual address', async () => {
    const address = VirtualAddress.from({
      masterId: '0xdeadbeef',
      userTag: '0x010203040506',
    })

    await expect(
      Actions.virtualAddress.resolve(client, { address }),
    ).resolves.toBeNull()
  })
})
