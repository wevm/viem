import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { accounts } from '../../../../test/src/constants.js'
import { deployMock4337Account } from '../../../../test/src/utils.js'
import { mine, writeContract } from '../../../actions/index.js'
import { pad } from '../../../utils/index.js'
import { solady } from '../accounts/implementations/solady.js'
import { toSmartAccount } from '../accounts/toSmartAccount.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

const ownerAddress = accounts[1].address

const client = anvilMainnet.getClient({ account: true })
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

  const callData = await account.getCallData([
    { to: '0x0000000000000000000000000000000000000000' },
  ])

  const dummySignature = await account.getFormattedSignature()

  expect(
    await estimateUserOperationGas(bundlerClient, {
      account,
      callData,
      signature: dummySignature,
    }),
  ).toMatchInlineSnapshot(`
    {
      "callGasLimit": 80000n,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": 50613n,
      "verificationGasLimit": 109657n,
    }
  `)
})

test('args: factory + factoryData', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  }).initialize(client)

  const callData = await account.getCallData([
    { to: '0x0000000000000000000000000000000000000000' },
  ])
  const dummySignature = await account.getFormattedSignature()
  const { factory, factoryData } = await account.getFactoryArgs()

  expect(
    await estimateUserOperationGas(bundlerClient, {
      account,
      callData,
      factory,
      factoryData,
      signature: dummySignature,
    }),
  ).toBeDefined()
})

test('args: version', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  }).initialize(client)

  const callData = await account.getCallData([
    { to: '0x0000000000000000000000000000000000000000' },
  ])
  const dummySignature = await account.getFormattedSignature()
  const { factory, factoryData } = await account.getFactoryArgs()

  expect(
    await estimateUserOperationGas(bundlerClient, {
      account,
      callData,
      entryPointVersion: '0.7',
      factory,
      factoryData,
      signature: dummySignature,
    }),
  ).toBeDefined()
})

test('args: entrypoint', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  }).initialize(client)

  const callData = await account.getCallData([
    { to: '0x0000000000000000000000000000000000000000' },
  ])
  const dummySignature = await account.getFormattedSignature()
  const { factory, factoryData } = await account.getFactoryArgs()

  expect(
    await estimateUserOperationGas(bundlerClient, {
      account,
      callData,
      entryPointAddress: account.entryPointAddress,
      factory,
      factoryData,
      signature: dummySignature,
    }),
  ).toMatchInlineSnapshot(`
    {
      "callGasLimit": 80000n,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": 51656n,
      "verificationGasLimit": 259093n,
    }
  `)
})

test('error: account not deployed', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  }).initialize(client)

  const callData = await account.getCallData([
    { to: '0x0000000000000000000000000000000000000000' },
  ])
  const dummySignature = await account.getFormattedSignature()

  await expect(() =>
    estimateUserOperationGas(bundlerClient, {
      account,
      callData,
      signature: dummySignature,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [RpcRequestError: RPC Request failed.

    URL: http://localhost
    Request body: {"method":"eth_estimateUserOperationGas","params":[{"callData":"0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000","nonce":"0x0","sender":"0x215181Bf237336849bb2Ae506dffE31666cb73B9","signature":"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"},"0x0000000071727De22E5E9d8BAf0edAc6f37da032"]}

    Details: UserOperation reverted during simulation with reason: AA20 account not deployed
    Version: viem@1.0.2]
  `,
  )
})

test('error: entrypoint not defined', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  }).initialize(client)

  const callData = await account.getCallData([
    { to: '0x0000000000000000000000000000000000000000' },
  ])
  const dummySignature = await account.getFormattedSignature()
  const { factory, factoryData } = await account.getFactoryArgs()

  const bundlerClient = bundlerMainnet.getBundlerClient({ chain: false })

  await expect(() =>
    // @ts-expect-error
    estimateUserOperationGas(bundlerClient, {
      account,
      callData,
      factory,
      factoryData,
      signature: dummySignature,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '[Error: client chain not configured. entryPointAddress is required.]',
  )
})

test('error: account not defined', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: ownerAddress,
    }),
  }).initialize(client)

  const callData = await account.getCallData([
    { to: '0x0000000000000000000000000000000000000000' },
  ])
  const dummySignature = await account.getFormattedSignature()
  const { factory, factoryData } = await account.getFactoryArgs()

  await expect(() =>
    estimateUserOperationGas(bundlerClient, {
      // @ts-expect-error
      account: undefined,
      callData,
      factory,
      factoryData,
      signature: dummySignature,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

    Docs: https://viem.sh/docs/actions/wallet/sendTransaction#account
    Version: viem@1.0.2]
  `)
})
