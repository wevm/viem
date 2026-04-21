import { afterEach, describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import * as Prool from '~test/tempo/prool.js'
import { VirtualAddress } from '../index.js'
import * as actions from './index.js'

const account = accounts[0]

const client = getClient({
  account,
})

// Pre-computed PoW salt for accounts[0] (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
const salt =
  '0x00000000000000000000000000000000000000000000000000000000abf52baf' as const
const masterId = '0x58e21090' as const

afterEach(async () => {
  await Prool.restart(client)
})

describe('getMasterAddress', () => {
  test('unregistered', async () => {
    const result = await actions.virtualAddress.getMasterAddress(client, {
      masterId: '0xdeadbeef',
    })
    expect(result).toBeNull()
  })

  test('registered', async () => {
    await actions.virtualAddress.registerMasterSync(client, {
      salt,
      feeToken,
    })

    const result = await actions.virtualAddress.getMasterAddress(client, {
      masterId,
    })
    expect(result).toBe(account.address)
  })
})

describe('resolve', () => {
  test('non-virtual address', async () => {
    const result = await actions.virtualAddress.resolve(client, {
      address: account.address,
    })
    expect(result).toBe(account.address)
  })

  test('registered virtual address', async () => {
    await actions.virtualAddress.registerMasterSync(client, {
      feeToken,
      salt,
    })

    const virtualAddr = VirtualAddress.from({
      masterId,
      userTag: '0x010203040506',
    })

    const result = await actions.virtualAddress.resolve(client, {
      address: virtualAddr,
    })
    expect(result).toBe(account.address)
  })

  test('unregistered virtual address', async () => {
    const virtualAddr = VirtualAddress.from({
      masterId: '0xdeadbeef',
      userTag: '0x010203040506',
    })

    const result = await actions.virtualAddress.resolve(client, {
      address: virtualAddr,
    })
    expect(result).toBeNull()
  })
})

describe('registerMaster', () => {
  test('default', async () => {
    const hash = await actions.virtualAddress.registerMaster(client, {
      salt,
      feeToken,
    })
    expect(hash).toBeDefined()
    expect(hash).toMatch(/^0x/)
  })
})

describe('registerMasterSync', () => {
  test('default', async () => {
    const { receipt, ...result } =
      await actions.virtualAddress.registerMasterSync(client, {
        salt,
        feeToken,
      })

    expect(receipt).toBeDefined()
    expect(result.masterId).toBe(masterId)
    expect(result.masterAddress).toBe(account.address)
  })
})
