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

  const callData = await account.getCallData([
    { to: '0x0000000000000000000000000000000000000000' },
  ])

  const request = await prepareUserOperationRequest(bundlerClient, {
    account,
    callData,
  })

  expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
      "nonce": 0n,
      "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
      "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    }
  `)
})
