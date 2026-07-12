import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Client, http } from 'viem/tempo'
import { tempoLocalnet, tempoModerato } from 'viem/chains'

import { encryptedDeposit } from './encryptedDeposit.js'
import type { PreparedEncryptedDeposit } from './types.js'

const prepared = {
  amount: 1_000_000n,
  bouncebackRecipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  chainId: tempoModerato.id,
  encrypted: {
    ciphertext: '0x1234',
    ephemeralPubkeyX:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    ephemeralPubkeyYParity: 0,
    nonce: '0x000000000000000000000000',
    tag: '0x00000000000000000000000000000000',
  },
  keyIndex: 0n,
  portalAddress: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
  token: '0x20c0000000000000000000000000000000000000',
  zoneId: 7,
} satisfies PreparedEncryptedDeposit

test('behavior: prepared encrypted deposit payload', async () => {
  const calls = encryptedDeposit.calls(prepared)

  expect(calls[0].args).toEqual([prepared.portalAddress, prepared.amount])
  expect(calls[1].address).toBe(prepared.portalAddress)
  expect(calls[1].functionName).toBe('depositEncrypted')
  expect(calls[1].args[2]).toBe(prepared.keyIndex)
  expect(calls[1].args[3]).toEqual(prepared.encrypted)
  expect(calls[1].args[4]).toBe(prepared.bouncebackRecipient)
  expect(calls[1].data.slice(0, 10)).toMatchInlineSnapshot('"0xb01f22e4"')

  const client = tempo.getClient()
  await expect(
    encryptedDeposit(client, {
      ...prepared,
      chainId: prepared.chainId + 1,
    }),
  ).rejects.toThrow(
    'Prepared encrypted deposit chain ID does not match client chain.',
  )
})

test('error: no account', async () => {
  const client = Client.create({
    chain: tempoLocalnet,
    transport: http(tempo.rpcUrl),
  })

  await expect(
    encryptedDeposit(client, {
      amount: 1n,
      token: '0x20c0000000000000000000000000000000000000',
      zoneId: 7,
    }),
  ).rejects.toThrow('`account` is required.')
})
