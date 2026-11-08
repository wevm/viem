import { P256 } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account as CoreAccount } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const preT3Client = Client.create({
  account,
  chain: { ...tempoLocalnet, hardfork: 't2' },
  transport: http(tempo.rpcUrl),
})

describe('getRemainingLimit', () => {
  test('behavior: uses the pre-T3 selector', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    await Actions.accessKey.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
      limits: [{ limit: 5_000_000n, token: tempo.pathUsd }],
    })

    await expect(
      Actions.accessKey.getRemainingLimit(preT3Client, {
        accessKey,
        token: tempo.pathUsd,
      }),
    ).rejects.toThrowError('The contract function "getRemainingLimit" reverted')
  })

  test('call: requires an account', () => {
    const args = {
      accessKey: account.address,
      token: tempo.pathUsd,
    } as const

    expect(() => Actions.accessKey.getRemainingLimit.call(args)).toThrowError(
      CoreAccount.NotFoundError,
    )
    expect(() =>
      Actions.accessKey.getRemainingLimit.callWithPeriod(args),
    ).toThrowError(CoreAccount.NotFoundError)
  })
})
