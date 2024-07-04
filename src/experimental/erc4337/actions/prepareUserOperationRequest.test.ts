import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { accounts } from '../../../../test/src/constants.js'
import { deployMock4337Account } from '../../../../test/src/utils.js'
import { solady } from '../accounts/implementations/solady.js'
import { toSmartAccount } from '../accounts/toSmartAccount.js'
import { prepareUserOperationRequest } from './prepareUserOperationRequest.js'

const ownerAddress = accounts[1].address

const client = anvilMainnet.getClient()
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

  const request = await prepareUserOperationRequest(bundlerClient, {
    account,
    calls: [{ to: '0x0000000000000000000000000000000000000000' }],
  })

  expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
      "callGasLimit": 80000n,
      "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
      "factoryData": "0xf14ddffc00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000000",
      "nonce": 0n,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": 51642n,
      "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
      "verificationGasLimit": 259060n,
    }
  `)
})
