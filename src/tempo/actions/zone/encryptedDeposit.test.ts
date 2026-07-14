import type { StateOverrides } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Client as CoreClient } from 'viem'
import { Client, http } from 'viem/tempo'
import { tempoLocalnet, tempoModerato } from 'viem/chains'

import { encryptedDeposit } from './encryptedDeposit.js'
import { encryptedDepositSync } from './encryptedDepositSync.js'
import type { PreparedEncryptedDeposit } from './types.js'

const encryptionKeyCode =
  '0x7f79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798600052600260205260406000f3'

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

  expect(
    encryptedDeposit.calls({
      ...prepared,
      portalAddress: undefined,
      recipient: prepared.bouncebackRecipient,
    })[1].address,
  ).toBe(prepared.portalAddress)

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

test('behavior: prepare encrypted payloads', async () => {
  const client = Client.create({
    chain: tempoModerato,
    transport: http(tempo.rpcUrl),
  })
  const stateOverride = {
    [prepared.portalAddress]: { code: encryptionKeyCode },
  } satisfies StateOverrides.StateOverrides
  const options = {
    recipient: prepared.bouncebackRecipient,
    stateOverride,
    zoneId: prepared.zoneId,
  }

  const [deposit, defaultDeposit, recipient, defaultRecipient] =
    await Promise.all([
      encryptedDeposit.prepare(client, {
        ...options,
        amount: prepared.amount,
        bouncebackRecipient: prepared.bouncebackRecipient,
        portalAddress: prepared.portalAddress,
        token: prepared.token,
      }),
      encryptedDeposit.prepare(client, {
        ...options,
        amount: prepared.amount,
        bouncebackRecipient: prepared.bouncebackRecipient,
        token: prepared.token,
      }),
      encryptedDeposit.prepareRecipient(client, {
        ...options,
        portalAddress: prepared.portalAddress,
      }),
      encryptedDeposit.prepareRecipient(client, options),
    ])

  expect(deposit.portalAddress).toBe(prepared.portalAddress)
  expect(defaultDeposit.portalAddress).toBe(prepared.portalAddress)
  expect(recipient.portalAddress).toBe(prepared.portalAddress)
  expect(defaultRecipient.portalAddress).toBe(prepared.portalAddress)
  expect(deposit.keyIndex).toBeGreaterThan(0n)
  expect(recipient.encrypted.ciphertext).toMatch(/^0x[\da-f]+$/)
})

test('behavior: send prepared encrypted deposits', async () => {
  const client = tempo.getClient()
  const options = {
    ...prepared,
    account: client.account,
    chainId: client.chain.id,
  }

  const { receipt } = await encryptedDepositSync(client, options)
  expect(receipt.status).toMatchInlineSnapshot('"success"')

  await expect(encryptedDeposit(client, options)).resolves.toMatch(
    /^0x[\da-f]{64}$/,
  )
})

test('error: unavailable encryption key', async () => {
  const client = tempo.getClient()
  const options = {
    amount: prepared.amount,
    portalAddress: prepared.portalAddress,
    token: prepared.token,
    zoneId: prepared.zoneId,
  }

  await expect(encryptedDeposit(client, options)).rejects.toThrow()
  await expect(
    encryptedDepositSync(client, {
      ...options,
      bouncebackRecipient: prepared.bouncebackRecipient,
      recipient: prepared.bouncebackRecipient,
      throwOnReceiptRevert: false,
    }),
  ).rejects.toThrow()
})

test('error: no configured encryption key', async () => {
  const client = Client.create({
    chain: tempoModerato,
    transport: http(tempo.rpcUrl),
  })
  await expect(
    encryptedDeposit.prepare(client, {
      amount: prepared.amount,
      bouncebackRecipient: prepared.bouncebackRecipient,
      portalAddress: prepared.portalAddress,
      recipient: prepared.bouncebackRecipient,
      stateOverride: {
        [prepared.portalAddress]: { code: '0x600060005260206000f3' },
      },
      token: prepared.token,
      zoneId: prepared.zoneId,
    }),
  ).rejects.toThrow('No sequencer encryption key configured.')
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

test('error: prepare without chain', async () => {
  const client = CoreClient.create({ transport: http(tempo.rpcUrl) })

  await expect(
    encryptedDeposit.prepare(client, {
      amount: prepared.amount,
      bouncebackRecipient: prepared.bouncebackRecipient,
      portalAddress: prepared.portalAddress,
      recipient: prepared.bouncebackRecipient,
      token: prepared.token,
      zoneId: prepared.zoneId,
    }),
  ).rejects.toThrow('`chain` is required.')
  await expect(
    encryptedDeposit.prepareRecipient(client, {
      portalAddress: prepared.portalAddress,
      recipient: prepared.bouncebackRecipient,
      zoneId: prepared.zoneId,
    }),
  ).rejects.toThrow('`chain` is required.')
})
