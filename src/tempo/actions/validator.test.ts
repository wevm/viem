import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account } from 'viem'
import { Actions } from 'viem/tempo'
import { Hex } from 'viem/utils'

const client = tempo.getClient()

/** Dev mnemonic account 19, registered in-file as a self-updating validator. */
const validator = Account.fromMnemonic(
  'test test test test test test test test test test test junk',
  { addressIndex: 19 },
)
const validatorClient = tempo.getClient({ account: validator })

const randomValidator = Account.random()
const randomPublicKey = Hex.random(32)

/** Funds `to` with pathUSD for fees. */
async function fund(to: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: 1_000_000n,
    feeToken: tempo.alphaUsd,
    to,
    token: 0n,
  } as never)
}

describe('add', () => {
  test('default', async () => {
    const initialCount = await Actions.validator.getCount(client)

    const { receipt } = await Actions.validator.addSync(client, {
      active: true,
      feeToken: tempo.alphaUsd,
      inboundAddress: '192.168.1.100:8080',
      newValidatorAddress: randomValidator.address,
      outboundAddress: '192.168.1.100:8080',
      publicKey: randomPublicKey,
    } as never)
    expect(receipt.status).toBe('success')

    await expect(
      Actions.validator.getCount(client),
    ).resolves.toBeGreaterThanOrEqual(initialCount + 1n)

    await expect(
      Actions.validator.get(client, { validator: randomValidator.address }),
    ).resolves.toEqual({
      active: true,
      index: 0n,
      inboundAddress: '192.168.1.100:8080',
      outboundAddress: '192.168.1.100:8080',
      publicKey: randomPublicKey,
      validatorAddress: randomValidator.address,
    })
  })

  test('behavior: unauthorized caller', async () => {
    const other = tempo.accounts[1]
    const otherClient = tempo.getClient({
      account: Account.fromPrivateKey(other.privateKey),
    })
    await fund(other.address)

    await expect(
      Actions.validator.add(otherClient, {
        active: true,
        feeToken: tempo.pathUsd,
        inboundAddress: '192.168.1.100:8080',
        newValidatorAddress: Account.random().address,
        outboundAddress: '192.168.1.100:8080',
        publicKey: Hex.random(32),
      } as never),
    ).rejects.toThrow('error Unauthorized()')
  })
})

describe('changeOwner', () => {
  test('default', async () => {
    const other = tempo.accounts[1]
    const otherClient = tempo.getClient({
      account: Account.fromPrivateKey(other.privateKey),
    })

    const { receipt } = await Actions.validator.changeOwnerSync(client, {
      feeToken: tempo.alphaUsd,
      newOwner: other.address,
    } as never)
    expect(receipt.status).toBe('success')
    await expect(
      Actions.validator.getOwner(client),
    ).resolves.toMatchInlineSnapshot(
      `"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"`,
    )

    // Fund the new owner so it can transfer ownership back.
    await fund(other.address)
    const { receipt: restoreReceipt } = await Actions.validator.changeOwnerSync(
      otherClient,
      { feeToken: tempo.pathUsd, newOwner: tempo.accounts[0].address } as never,
    )
    expect(restoreReceipt.status).toBe('success')
    await expect(
      Actions.validator.getOwner(client),
    ).resolves.toMatchInlineSnapshot(
      `"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`,
    )
  })
})

describe('changeStatus', () => {
  test('default', async () => {
    const before = await Actions.validator.get(client, {
      validator: randomValidator.address,
    })

    const { receipt } = await Actions.validator.changeStatusSync(client, {
      active: !before.active,
      feeToken: tempo.alphaUsd,
      validator: randomValidator.address,
    } as never)
    expect(receipt.status).toBe('success')
    await expect(
      Actions.validator.get(client, { validator: randomValidator.address }),
    ).resolves.toEqual({ ...before, active: !before.active })

    // Restore the original status.
    await Actions.validator.changeStatusSync(client, {
      active: before.active,
      feeToken: tempo.alphaUsd,
      validator: randomValidator.address,
    } as never)
    await expect(
      Actions.validator.get(client, { validator: randomValidator.address }),
    ).resolves.toEqual(before)
  })
})

describe('getNextFullDkgCeremony', () => {
  test('default', async () => {
    await expect(
      Actions.validator.getNextFullDkgCeremony(client),
    ).resolves.toMatchInlineSnapshot('0n')
  })
})

describe('getOwner', () => {
  test('default', async () => {
    await expect(
      Actions.validator.getOwner(client),
    ).resolves.toMatchInlineSnapshot(
      `"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`,
    )
  })
})

describe('get', () => {
  test('default', async () => {
    const validators = await Actions.validator.list(client)
    expect(validators.length).toBeGreaterThan(0)

    const found = await Actions.validator.get(client, {
      validator: validators[0]!.validatorAddress,
    })
    expect(found).toEqual(validators[0])
    expect(Hex.size(found.publicKey)).toBe(32)
  })
})

describe('getByIndex', () => {
  test('default', async () => {
    await expect(
      Actions.validator.getByIndex(client, { index: 0n }),
    ).resolves.toBe(randomValidator.address)
  })
})

describe('getCount', () => {
  test('default', async () => {
    await expect(
      Actions.validator.getCount(client),
    ).resolves.toBeGreaterThanOrEqual(1n)
  })

  test('behavior: count matches validators array length', async () => {
    const count = await Actions.validator.getCount(client)
    const validators = await Actions.validator.list(client)
    expect(count).toBe(BigInt(validators.length))
  })
})

describe('list', () => {
  test('default', async () => {
    const validators = await Actions.validator.list(client)
    expect(validators.length).toBeGreaterThanOrEqual(1)
    expect(validators[0]).toEqual({
      active: true,
      index: 0n,
      inboundAddress: '192.168.1.100:8080',
      outboundAddress: '192.168.1.100:8080',
      publicKey: randomPublicKey,
      validatorAddress: randomValidator.address,
    })
  })
})

describe('setNextFullDkgCeremony', () => {
  test('default', async () => {
    const initialEpoch = await Actions.validator.getNextFullDkgCeremony(client)
    const epoch = initialEpoch + 100n

    const { receipt } = await Actions.validator.setNextFullDkgCeremonySync(
      client,
      { epoch, feeToken: tempo.alphaUsd } as never,
    )
    expect(receipt.status).toBe('success')

    await expect(
      Actions.validator.getNextFullDkgCeremony(client),
    ).resolves.toBe(epoch)
  })
})

describe('update', () => {
  test('default', async () => {
    // Register the validator, and fund it to pay for its own update.
    await Actions.validator.addSync(client, {
      active: true,
      feeToken: tempo.alphaUsd,
      inboundAddress: '192.168.1.101:8080',
      newValidatorAddress: validator.address,
      outboundAddress: '192.168.1.101:8080',
      publicKey:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    } as never)
    await fund(validator.address)

    const before = await Actions.validator.get(client, {
      validator: validator.address,
    })

    const { receipt } = await Actions.validator.updateSync(validatorClient, {
      feeToken: tempo.pathUsd,
      inboundAddress: '10.0.0.1:9090',
      newValidatorAddress: validator.address,
      outboundAddress: '10.0.0.1:9090',
      publicKey:
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    } as never)
    expect(receipt.status).toBe('success')

    // Index and active status survive the update.
    await expect(
      Actions.validator.get(client, { validator: validator.address }),
    ).resolves.toEqual({
      ...before,
      inboundAddress: '10.0.0.1:9090',
      outboundAddress: '10.0.0.1:9090',
      publicKey:
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    })
  })

  test('behavior: only the validator can update itself', async () => {
    await expect(
      Actions.validator.update(client, {
        feeToken: tempo.alphaUsd,
        inboundAddress: '10.0.0.1:9090',
        newValidatorAddress: validator.address,
        outboundAddress: '10.0.0.1:9090',
        publicKey:
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      } as never),
    ).rejects.toThrow('error ValidatorNotFound()')
  })
})
