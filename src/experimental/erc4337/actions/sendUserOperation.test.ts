import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { accounts } from '../../../../test/src/constants.js'
import { deployMock4337Account } from '../../../../test/src/utils.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  estimateFeesPerGas,
  mine,
  writeContract,
} from '../../../actions/index.js'
import { parseEther } from '../../../utils/index.js'
import { solady } from '../accounts/implementations/solady.js'
import { toSmartAccount } from '../accounts/toSmartAccount.js'
import { sendUserOperation } from './sendUserOperation.js'

const ownerAddress = accounts[1].address
const ownerAccount = privateKeyToAccount(accounts[1].privateKey)

const client = anvilMainnet.getClient({ account: ownerAccount })
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

  await writeContract(client, {
    abi: account.abi,
    address: account.address,
    functionName: 'addDeposit',
    value: parseEther('1'),
  })
  await mine(client, {
    blocks: 1,
  })

  const fees = await estimateFeesPerGas(client)

  expect(
    await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    }),
  ).toBeDefined()
})
