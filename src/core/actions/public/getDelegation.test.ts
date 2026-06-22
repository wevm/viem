import * as Address from 'ox/Address'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions } from 'viem'

import { getDelegation } from './getDelegation.js'

const client = anvil.getClient(anvil.mainnet)

const account = constants.accounts[0].address
const target = constants.accounts[1].address

test('default: delegated account', async () => {
  // EIP-7702 delegation designator: `0xef0100` + 20-byte target address.
  const designator = `0xef0100${target.slice(2)}` as const
  await Actions.test.setCode(client, {
    address: account,
    bytecode: designator,
  })

  expect(await getDelegation(client, { address: account })).toBe(
    Address.checksum(target),
  )
})

test('not delegated: no code', async () => {
  await Actions.test.setCode(client, { address: account, bytecode: '0x' })

  expect(await getDelegation(client, { address: account })).toBeUndefined()
})

test('not delegated: non-designator code (wrong size)', async () => {
  await Actions.test.setCode(client, {
    address: account,
    bytecode: '0x60806040',
  })

  expect(await getDelegation(client, { address: account })).toBeUndefined()
})

test('not delegated: 23-byte code without designator prefix', async () => {
  // 3-byte prefix (`0xdeadbe`) + 20-byte address = 23 bytes, but not `0xef0100`.
  await Actions.test.setCode(client, {
    address: account,
    bytecode: `0xdeadbe${target.slice(2)}`,
  })

  expect(await getDelegation(client, { address: account })).toBeUndefined()
})
