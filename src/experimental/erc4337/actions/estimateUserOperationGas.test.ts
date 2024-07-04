import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { accounts } from '../../../../test/src/constants.js'
import { deployMock4337Account } from '../../../../test/src/utils.js'
import { solady } from '../accounts/implementations/solady.js'
import { toSmartAccount } from '../accounts/toSmartAccount.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

const ownerAddress = accounts[1].address

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

test('default', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    client,
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  })

  expect(
    await estimateUserOperationGas(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    }),
  ).toMatchInlineSnapshot(`
    {
      "callGasLimit": 80000n,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": 51642n,
      "verificationGasLimit": 259060n,
    }
  `)
})

test('error: account not defined', async () => {
  await expect(() =>
    estimateUserOperationGas(bundlerClient, {
      // @ts-expect-error
      account: undefined,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

    Version: viem@x.y.z]
  `)
})
