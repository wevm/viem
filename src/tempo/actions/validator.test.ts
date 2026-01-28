import { describe, expect, test } from 'vitest'
import { accounts, getClient, nodeEnv } from '~test/tempo/config.js'
import { generatePrivateKey, privateKeyToAddress } from '../../accounts/index.js'
import { isAddress } from '../../utils/address/isAddress.js'
import * as actions from './index.js'

const account = accounts[0]
const account2 = accounts[1]
const validator = accounts[19]
const randomValidatorAddress = privateKeyToAddress(generatePrivateKey())

const client = getClient({
  account,
})

describe.runIf(nodeEnv === 'localnet')('add', () => {
  test('default', async () => {
    const initialCount = await actions.validator.getCount(client)

    const { receipt } = await actions.validator.addSync(client, {
      newValidatorAddress: randomValidatorAddress,
      publicKey:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      active: true,
      inboundAddress: '192.168.1.100:8080',
      outboundAddress: '192.168.1.100:8080',
    })

    expect(receipt.status).toBe('success')

    const newCount = await actions.validator.getCount(client)
    expect(newCount).toBe(initialCount + 1n)

    // Verify the validator was added
    const validator = await actions.validator.get(client, {
      validator: randomValidatorAddress,
    })
    expect(validator.validatorAddress).toBe(randomValidatorAddress)
    expect(validator.active).toBe(true)
  })

  test('behavior: unauthorized caller', async () => {
    await expect(
      actions.validator.add(getClient({ account: account2 }), {
        newValidatorAddress: '0x1234567890123456789012345678901234567890',
        publicKey:
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        active: true,
        inboundAddress: '192.168.1.100:8080',
        outboundAddress: '192.168.1.100:8080',
      }),
    ).rejects.toThrow()
  })
})

describe.runIf(nodeEnv === 'localnet')('changeOwner', () => {
  test('default', async () => {
    // Change owner to account2
    const { receipt } = await actions.validator.changeOwnerSync(client, {
      newOwner: account2.address,
    })

    expect(receipt.status).toBe('success')

    // Verify the owner was changed
    const newOwner = await actions.validator.getOwner(client)
    expect(newOwner.toLowerCase()).toBe(account2.address.toLowerCase())

    // Top up account 2 with pathUSD so it can change back
    await actions.token.transferSync(client, {
      to: account2.address,
      amount: 1000000n,
      token: 0n,
    })

    // Change owner back to account (using account2 as the new owner)
    await actions.validator.changeOwnerSync(getClient({ account: account2 }), {
      newOwner: account.address,
    })

    // Verify owner is restored
    const restoredOwner = await actions.validator.getOwner(client)
    expect(restoredOwner.toLowerCase()).toBe(account.address.toLowerCase())
  })
})

describe.runIf(nodeEnv === 'localnet')('changeStatus', () => {
  test('default', async () => {
    // Get an existing validator
    const validators = await actions.validator.list(client)
    expect(validators.length).toBeGreaterThan(0)

    const validatorAddress = validators[0].validatorAddress
    const initialStatus = validators[0].active

    // Toggle the status
    const { receipt } = await actions.validator.changeStatusSync(client, {
      validator: validatorAddress,
      active: !initialStatus,
    })

    expect(receipt.status).toBe('success')

    // Verify the status was changed
    const validator = await actions.validator.get(client, {
      validator: validatorAddress,
    })
    expect(validator.active).toBe(!initialStatus)

    // Restore the original status
    await actions.validator.changeStatusSync(client, {
      validator: validatorAddress,
      active: initialStatus,
    })
  })
})

describe('getNextFullDkgCeremony', () => {
  test('default', async () => {
    const epoch = await actions.validator.getNextFullDkgCeremony(client)

    expect(typeof epoch).toBe('bigint')
  })
})

describe('getOwner', () => {
  test('default', async () => {
    const owner = await actions.validator.getOwner(client)

    // Tempo genesis locally has the first account as the contract owner
    expect(owner).toBe(account.address)
  })
})

describe('get', () => {
  test('default', async () => {
    const validators = await actions.validator.list(client)
    expect(validators.length).toBeGreaterThan(0)

    const validatorAddress = validators[0].validatorAddress

    const validator = await actions.validator.get(client, {
      validator: validatorAddress,
    })

    expect(validator.validatorAddress).toBe(validatorAddress)
    expect(validator).toHaveProperty('publicKey')
    expect(validator).toHaveProperty('active')
    expect(validator).toHaveProperty('index')
    expect(validator).toHaveProperty('inboundAddress')
    expect(validator).toHaveProperty('outboundAddress')
  })
})

describe('getByIndex', () => {
  test('default', async () => {
    const validatorAddress = await actions.validator.getByIndex(client, {
      index: 0n,
    })

    expect(isAddress(validatorAddress)).toBe(true)
  })
})

describe('getCount', () => {
  test('default', async () => {
    const count = await actions.validator.getCount(client)

    expect(typeof count).toBe('bigint')
    expect(count).toBeGreaterThan(0n)
  })

  test('behavior: count matches validators array length', async () => {
    const count = await actions.validator.getCount(client)
    const validators = await actions.validator.list(client)

    expect(count).toBe(BigInt(validators.length))
  })
})

describe('list', () => {
  test('default', async () => {
    const validators = await actions.validator.list(client)

    // Localnet should have at least one validator
    expect(Array.isArray(validators)).toBe(true)
    expect(validators.length).toBeGreaterThan(0)

    // Each validator should have the expected structure
    const validator = validators[0]
    expect(validator).toHaveProperty('publicKey')
    expect(validator).toHaveProperty('active')
    expect(validator).toHaveProperty('index')
    expect(validator).toHaveProperty('validatorAddress')
    expect(validator).toHaveProperty('inboundAddress')
    expect(validator).toHaveProperty('outboundAddress')
  })
})

describe('setNextFullDkgCeremony', () => {
  test('default', async (ctx) => {
    const owner = await actions.validator.getOwner(client)

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      ctx.skip()
    }

    const initialEpoch = await actions.validator.getNextFullDkgCeremony(client)
    const newEpoch = initialEpoch + 100n

    const { receipt } = await actions.validator.setNextFullDkgCeremonySync(
      client,
      {
        epoch: newEpoch,
      },
    )

    expect(receipt.status).toBe('success')

    // Verify the epoch was changed
    const updatedEpoch = await actions.validator.getNextFullDkgCeremony(client)
    expect(updatedEpoch).toBe(newEpoch)
  })
})

describe.runIf(nodeEnv === 'localnet')('update', () => {
  test('default', async () => {
    // Fund the validator account so it can send transactions
    await actions.token.transferSync(client, {
      to: validator.address,
      amount: 1000000n,
      token: 0n,
    })

    // Get current validator info
    const validatorBefore = await actions.validator.get(client, {
      validator: validator.address,
    })

    // Update the validator info (only the validator itself can call this)
    const newPublicKey =
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    const newInboundAddress = '10.0.0.1:9090'
    const newOutboundAddress = '10.0.0.1:9090'

    const { receipt } = await actions.validator.updateSync(
      getClient({ account: validator }),
      {
        newValidatorAddress: validator.address,
        publicKey: newPublicKey,
        inboundAddress: newInboundAddress,
        outboundAddress: newOutboundAddress,
      },
    )

    expect(receipt.status).toBe('success')

    // Verify the validator info was updated
    const validatorAfter = await actions.validator.get(client, {
      validator: validator.address,
    })

    expect(validatorAfter.publicKey).toBe(newPublicKey)
    expect(validatorAfter.inboundAddress).toBe(newInboundAddress)
    expect(validatorAfter.outboundAddress).toBe(newOutboundAddress)
    // Index and active status should remain the same
    expect(validatorAfter.index).toBe(validatorBefore.index)
    expect(validatorAfter.active).toBe(validatorBefore.active)
  })

  test('behavior: only validator can update itself', async () => {
    // Try to update the validator from a different account (should fail)
    await expect(
      actions.validator.update(client, {
        newValidatorAddress: validator.address,
        publicKey:
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        inboundAddress: '10.0.0.1:9090',
        outboundAddress: '10.0.0.1:9090',
      }),
    ).rejects.toThrow()
  })
})
