import { MultisigConfig } from 'ox/tempo'
import { toHex } from 'viem'
import { sendTransactionSync, waitForTransactionReceipt } from 'viem/actions'
import { Account } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import * as actions from './index.js'

const client = getClient()

describe('getConfigCommitment', () => {
  test('behavior: uninitialized account', async () => {
    expect(
      await actions.multisig.getConfigCommitment(client, {
        account: accounts[0].address,
      }),
    ).toBe(toHex(0n, { size: 32 }))
  })
})

for (const sync of [false, true]) {
  describe(sync ? 'updateConfigSync' : 'updateConfig', () => {
    test('default', async () => {
      const account = Account.fromMultisig({
        salt: toHex(sync ? 0x502201 : 0x502200, { size: 32 }),
        owners: [accounts[17], accounts[18]],
        threshold: 2,
      })
      await actions.token.transferSync(client, {
        account: accounts[0],
        amount: { formatted: '10000' },
        to: account.address,
        token: feeToken,
      })
      await sendTransactionSync(client, {
        account,
        calls: [{ to: accounts[0].address }],
        feeToken,
      })
      expect(
        await actions.multisig.getConfigCommitment(client, {
          account: account.address,
        }),
      ).toBe(MultisigConfig.getCommitment(account.config))
      const parameters = {
        account,
        current: account.config,
        owners: account.config.owners,
        threshold: 1,
        feeToken,
      }
      const result = sync
        ? await actions.multisig.updateConfigSync(client, parameters)
        : {
            receipt: await waitForTransactionReceipt(client, {
              hash: await actions.multisig.updateConfig(client, parameters),
            }),
          }
      expect(result.receipt.status).toBe('success')
      const { args } = actions.multisig.updateConfig.extractEvent(
        result.receipt.logs,
      )
      expect(args).toEqual({
        account: account.address,
        salt: account.config.salt,
        version: 1n,
        threshold: 1,
        owners: account.config.owners.map(({ owner, weight }) => ({
          owner,
          weight,
        })),
      })
      expect(
        await actions.multisig.getConfigCommitment(client, {
          account: account.address,
        }),
      ).toBe(
        MultisigConfig.getCommitment({
          ...account.config,
          version: 1n,
          threshold: 1,
        }),
      )
    })
  })
}
