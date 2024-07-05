import { expect, test } from 'vitest'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { getSmartAccounts } from '../../../../test/src/smartAccounts.js'
import { prepareUserOperationRequest } from './prepareUserOperationRequest.js'

const bundlerClient = bundlerMainnet.getBundlerClient()

const [account] = await getSmartAccounts()

test('default', async () => {
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
      "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
      "nonce": 0n,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": 51642n,
      "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
      "verificationGasLimit": 259060n,
    }
  `)
})
