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
import { pad, parseEther } from '../../../utils/index.js'
import { solady } from '../accounts/implementations/solady.js'
import { toSmartAccount } from '../accounts/toSmartAccount.js'
import type { UserOperation } from '../types/userOperation.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'
import { sendUserOperation } from './sendUserOperation.js'

const ownerAddress = accounts[1].address
const ownerAccount = privateKeyToAccount(accounts[1].privateKey)

const client = anvilMainnet.getClient({ account: ownerAccount })
const bundlerClient = bundlerMainnet.getBundlerClient()

test('default', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  }).initialize(client)

  await writeContract(client, {
    ...account.factory,
    functionName: 'createAccount',
    args: [ownerAddress, pad('0x0')],
  })
  await mine(client, {
    blocks: 1,
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

  const nonce = await account.getNonce()
  const callData = await account.getCallData([
    {
      to: '0x0000000000000000000000000000000000000000',
      value: parseEther('1'),
    },
  ])
  const dummySignature = await account.getFormattedSignature()

  const fees = await estimateFeesPerGas(client)
  const gas = await estimateUserOperationGas(bundlerClient, {
    account,
    callData,
    nonce,
    signature: dummySignature,
  })

  const userOperation = {
    ...fees,
    ...gas,
    callData,
    nonce,
    sender: account.address,
    signature: dummySignature,
  } as const satisfies UserOperation

  const signature = await account.signUserOperation({ userOperation })

  expect(
    await sendUserOperation(bundlerClient, {
      account,
      ...userOperation,
      signature,
    }),
  ).toBeDefined()
})

test('args: factory + factoryData', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const fees = await estimateFeesPerGas(client)

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  }).initialize(client)

  await writeContract(client, {
    abi: account.abi,
    address: account.address,
    functionName: 'addDeposit',
    value: parseEther('5'),
  })
  await mine(client, {
    blocks: 1,
  })

  const callData = await account.getCallData([
    {
      to: accounts[2].address,
      value: parseEther('1'),
    },
  ])
  const dummySignature = await account.getFormattedSignature()
  const nonce = await account.getNonce()
  const { factory, factoryData } = await account.getFactoryArgs()

  const gas = await estimateUserOperationGas(bundlerClient, {
    account,
    callData,
    factory,
    factoryData,
    nonce,
    signature: dummySignature,
  })

  const userOperation = {
    ...fees,
    ...gas,
    account,
    callData,
    factory,
    factoryData,
    nonce,
    signature: dummySignature,
  } as const

  const signature = await account.signUserOperation({ userOperation })

  expect(
    await sendUserOperation(bundlerClient, { ...userOperation, signature }),
  ).toBeDefined()
})
