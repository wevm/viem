import { parseAbi } from 'abitype'
import { expect, test } from 'vitest'
import { simpleAccountFactoryAbi } from '../../../../test/src/abis.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import {
  accounts,
  simpleAccountFactoryAddress,
} from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  estimateFeesPerGas,
  mine,
  readContract,
  sendTransaction,
  signMessage,
  writeContract,
} from '../../../actions/index.js'
import { encodeFunctionData, parseEther } from '../../../utils/index.js'
import type { UserOperation } from '../types/userOperation.js'
import { getUserOperationHash } from '../utils/getUserOperationHash.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'
import { sendUserOperation } from './sendUserOperation.js'

const ownerAddress = accounts[1].address
const ownerAccount = privateKeyToAccount(accounts[1].privateKey)

const client = anvilMainnet.getClient({ account: ownerAccount })
const bundlerClient = bundlerMainnet.getBundlerClient()

test('default', async () => {
  const salt = BigInt(Math.floor(Math.random() * 100))

  await writeContract(client, {
    address: simpleAccountFactoryAddress,
    abi: simpleAccountFactoryAbi,
    functionName: 'createAccount',
    args: [ownerAddress, salt],
  })
  await mine(client, {
    blocks: 1,
  })

  const address = await readContract(client, {
    abi: simpleAccountFactoryAbi,
    address: simpleAccountFactoryAddress,
    functionName: 'getAddress',
    args: [ownerAddress, salt],
  })

  await sendTransaction(client, {
    to: address,
    value: parseEther('1'),
  })
  await mine(client, {
    blocks: 1,
  })

  const nonce = await readContract(client, {
    abi: parseAbi(['function getNonce() pure returns (uint256)']),
    address,
    functionName: 'getNonce',
  })

  const callData = encodeFunctionData({
    abi: parseAbi(['function execute(address, uint256, bytes)']),
    functionName: 'execute',
    args: ['0x0000000000000000000000000000000000000000', 0n, '0x'],
  })

  const dummySignature =
    '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'

  const fees = await estimateFeesPerGas(client)
  const gas = await estimateUserOperationGas(bundlerClient, {
    account: address,
    callData,
    nonce,
    signature: dummySignature,
  })

  const userOperation = {
    ...fees,
    ...gas,
    callData,
    nonce,
    sender: address,
    signature: dummySignature,
  } as const satisfies UserOperation

  const userOpHash = getUserOperationHash({
    chainId: client.chain.id,
    entryPointAddress: client.chain.contracts.entryPoint070.address,
    userOperation,
  })

  const signature = await signMessage(client, {
    message: {
      raw: userOpHash,
    },
  })

  expect(
    await sendUserOperation(bundlerClient, {
      account: address,
      ...userOperation,
      signature,
    }),
  ).toBeDefined()
})

test('args: factory + factoryData', async () => {
  const salt = BigInt(Math.floor(Math.random() * 100))

  const fees = await estimateFeesPerGas(client)

  const address = await readContract(client, {
    abi: simpleAccountFactoryAbi,
    address: simpleAccountFactoryAddress,
    functionName: 'getAddress',
    args: [ownerAddress, salt],
  })

  await sendTransaction(client, {
    to: address,
    value: parseEther('1'),
  })
  await mine(client, {
    blocks: 1,
  })

  const callData = encodeFunctionData({
    abi: parseAbi(['function execute(address, uint256, bytes)']),
    functionName: 'execute',
    args: ['0x0000000000000000000000000000000000000000', 0n, '0x'],
  })

  const dummySignature =
    '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'

  const gas = await estimateUserOperationGas(bundlerClient, {
    account: address,
    callData,
    factory: simpleAccountFactoryAddress,
    factoryData: encodeFunctionData({
      abi: simpleAccountFactoryAbi,
      functionName: 'createAccount',
      args: [ownerAddress, salt],
    }),
    nonce: 0n,
    signature: dummySignature,
  })

  const userOperation = {
    ...fees,
    ...gas,
    account: address,
    callData,
    factory: simpleAccountFactoryAddress,
    factoryData: encodeFunctionData({
      abi: simpleAccountFactoryAbi,
      functionName: 'createAccount',
      args: [ownerAddress, salt],
    }),
    nonce: 0n,
    signature: dummySignature,
  } as const

  const userOpHash = getUserOperationHash({
    chainId: client.chain.id,
    entryPointAddress: client.chain.contracts.entryPoint070.address,
    userOperation: {
      ...userOperation,
      sender: address,
    },
  })

  const signature = await signMessage(client, {
    message: {
      raw: userOpHash,
    },
  })

  expect(
    await sendUserOperation(bundlerClient, { ...userOperation, signature }),
  ).toBeDefined()
})
