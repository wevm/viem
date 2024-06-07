import { parseAbi } from 'abitype'
import { expect, test } from 'vitest'
import { simpleAccountFactoryAbi } from '../../../../test/src/abis.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import {
  accounts,
  simpleAccountFactoryAddress,
} from '../../../../test/src/constants.js'
import { mine, readContract, writeContract } from '../../../actions/index.js'
import { encodeFunctionData } from '../../../utils/index.js'
import { toCoinbaseAccount } from '../accounts/toContractAccount.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

const ownerAddress = accounts[1].address

const client = anvilMainnet.getClient({ account: true })
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

  const callData = encodeFunctionData({
    abi: parseAbi(['function execute(address, uint256, bytes)']),
    functionName: 'execute',
    args: ['0x0000000000000000000000000000000000000000', 0n, '0x'],
  })

  const dummySignature =
    '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'

  expect(
    await estimateUserOperationGas(bundlerClient, {
      account: address,
      callData,
      signature: dummySignature,
    }),
  ).toMatchInlineSnapshot(`
    {
      "callGasLimit": 80000n,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": 50613n,
      "verificationGasLimit": 106794n,
    }
  `)
})

test('args: factory + factoryData', async () => {
  const salt = BigInt(Math.floor(Math.random() * 100))

  const account = await toCoinbaseAccount({
    owners: [ownerAddress],
    salt,
  }).setup(client)

  const callData = encodeFunctionData({
    abi: parseAbi(['function execute(address, uint256, bytes)']),
    functionName: 'execute',
    args: ['0x0000000000000000000000000000000000000000', 0n, '0x'],
  })

  const dummySignature =
    '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'

  expect(
    await estimateUserOperationGas(bundlerClient, {
      account: account.address,
      callData,
      factory: simpleAccountFactoryAddress,
      factoryData: encodeFunctionData({
        abi: simpleAccountFactoryAbi,
        functionName: 'createAccount',
        args: [ownerAddress, salt],
      }),
      signature: dummySignature,
    }),
  ).toBeDefined()
})

test('args: version', async () => {
  const bundlerClient = bundlerMainnet.getBundlerClient()
  const salt = BigInt(Math.floor(Math.random() * 100))

  const address = await readContract(client, {
    abi: simpleAccountFactoryAbi,
    address: simpleAccountFactoryAddress,
    functionName: 'getAddress',
    args: [ownerAddress, salt],
  })

  const callData = encodeFunctionData({
    abi: parseAbi(['function execute(address, uint256, bytes)']),
    functionName: 'execute',
    args: ['0x0000000000000000000000000000000000000000', 0n, '0x'],
  })

  const dummySignature =
    '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'

  expect(
    await estimateUserOperationGas(bundlerClient, {
      account: address,
      callData,
      entryPointVersion: '0.7.0',
      factory: simpleAccountFactoryAddress,
      factoryData: encodeFunctionData({
        abi: simpleAccountFactoryAbi,
        functionName: 'createAccount',
        args: [ownerAddress, salt],
      }),
      signature: dummySignature,
    }),
  ).toBeDefined()
})
