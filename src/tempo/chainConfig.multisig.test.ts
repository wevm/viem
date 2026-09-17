import { Account, MultisigConfig } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { prepareTransactionRequest } from '../actions/index.js'

const client = getClient({ account: accounts[0] })
const account = Account.fromMultisig({
  owners: [accounts[1], accounts[2], accounts[3]],
  threshold: 2,
})

describe('prepareTransactionRequest', () => {
  test('behavior: models a quorum without excess approvals', async () => {
    const request = await prepareTransactionRequest(client, {
      account,
      parameters: ['chainId'],
    })
    expect(request.multisig).toEqual({
      account: account.address,
      config: account.config,
    })
    expect(request.multisigSimulation).toEqual({
      config: account.config,
      approvals: account.config.owners
        .slice(0, 2)
        .map(({ owner }) => ({ owner })),
    })
  })

  test('behavior: explicit simulation approvals are preserved', async () => {
    const multisigSimulation = {
      config: account.config,
      approvals: account.config.owners
        .slice(1)
        .map(({ owner }) => ({ owner, keyType: 'secp256k1' as const })),
    }
    const request = await prepareTransactionRequest(client, {
      account,
      multisigSimulation,
      parameters: ['chainId'],
    })
    expect(request.multisigSimulation).toEqual(multisigSimulation)
  })

  test('behavior: rejects nonzero version before initialization', async () => {
    await expect(
      prepareTransactionRequest(client, {
        multisig: {
          account: account.address,
          config: MultisigConfig.from({ ...account.config, version: 1n }),
        },
        parameters: ['chainId'],
      }),
    ).rejects.toThrow(
      'Uninitialized multisig accounts require a version-zero config.',
    )
  })
})
