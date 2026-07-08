import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Client, http } from 'viem/tempo'
import { tempoLocalnet, tempoModerato } from 'viem/chains'

import { encryptedDeposit } from './encryptedDeposit.js'
import type { PreparedEncryptedDeposit } from './types.js'

const prepared = {
  amount: 1_000_000n,
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

test.todo(
  'behavior: deposits tokens into zone with encrypted recipient (blocked: zone contracts do not support encrypted deposits; v2 skipped)',
)

test.todo(
  'behavior: prepare against live portal (blocked: dev node lacks zone portal contracts; `portalAddresses` has no localnet entry)',
)
