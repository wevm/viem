import { ContractError } from 'viem'
import { Actions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as tempo from '~test/tempo.js'

const client = tempo.getClient()

describe('getConfigCommitment', () => {
  test.skipIf(tempo.configurableAccounts)(
    'behavior: chain without the precompile',
    async () => {
      await expect(
        Actions.accounts.getConfigCommitment(client, {
          account: tempo.accounts[0].address,
        }),
      ).resolves.toMatchInlineSnapshot(
        `"0x0000000000000000000000000000000000000000000000000000000000000000"`,
      )
    },
  )

  test('error: failed read', async () => {
    await expect(
      Actions.accounts.getConfigCommitment(client, {
        account: tempo.accounts[0].address,
        blockNumber: 2n ** 62n,
      }),
    ).rejects.toThrow(ContractError.ContractFunctionExecutionError)
  })
})
