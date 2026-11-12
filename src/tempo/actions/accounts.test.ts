import { ContractFunctionExecutionError } from 'viem'
import { describe, expect, test } from 'vitest'
import {
  accounts,
  configurableAccounts,
  getClient,
} from '~test/tempo/config.js'
import * as actions from './index.js'

const client = getClient()

describe('getConfigCommitment', () => {
  test.skipIf(configurableAccounts)(
    'behavior: chain without the precompile',
    async () => {
      await expect(
        actions.accounts.getConfigCommitment(client, {
          account: accounts[0].address,
        }),
      ).resolves.toMatchInlineSnapshot(
        `"0x0000000000000000000000000000000000000000000000000000000000000000"`,
      )
    },
  )

  test('error: failed read', async () => {
    await expect(
      actions.accounts.getConfigCommitment(client, {
        account: accounts[0].address,
        blockNumber: 2n ** 62n,
      }),
    ).rejects.toThrow(ContractFunctionExecutionError)
  })
})
