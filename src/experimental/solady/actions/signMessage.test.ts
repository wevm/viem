import type { Address } from 'abitype'
import { beforeAll, expect, test } from 'vitest'

import { Mock4337AccountFactory07 } from '~contracts/generated.js'
import { anvilMainnet } from '~test/src/anvil.js'
import { accounts } from '~test/src/constants.js'
import { deployMock4337Account_07 } from '../../../../test/src/utils.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  mine,
  readContract,
  simulateContract,
  verifyMessage,
  writeContract,
} from '../../../actions/index.js'
import { encodeFunctionData, pad } from '../../../utils/index.js'
import { signMessage } from './signMessage.js'

let verifier: Address
beforeAll(async () => {
  const { factoryAddress } = await deployMock4337Account_07()
  const { result, request } = await simulateContract(client, {
    account: accounts[0].address,
    abi: Mock4337AccountFactory07.abi,
    address: factoryAddress,
    functionName: 'createAccount',
    args: [accounts[0].address, pad('0x0')],
  })
  verifier = result
  await writeContract(client, request)
  await mine(client, { blocks: 1 })
})

const client = anvilMainnet.getClient()

test('default', async () => {
  const message = 'hello world'
  const signature = await signMessage(client!, {
    account: accounts[0].address,
    message,
    verifier,
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      message,
      signature,
    }),
  ).toBeTruthy()
})

test('args: domain', async () => {
  const message = 'hello world'
  const signature = await signMessage(client!, {
    account: accounts[0].address,
    verifierDomain: {
      name: 'Mock4337Account',
      version: '1',
      chainId: 1,
      verifyingContract: verifier,
    },
    message,
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      message,
      signature,
    }),
  ).toBeTruthy()
})

test('raw message (hex)', async () => {
  const message = { raw: '0x68656c6c6f20776f726c64' } as const
  const signature = await signMessage(client!, {
    account: accounts[0].address,
    message,
    verifier,
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      message,
      signature,
    }),
  ).toBeTruthy()
})

test('raw message (bytes)', async () => {
  const message = {
    raw: Uint8Array.from([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]),
  } as const
  const signature = await signMessage(client!, {
    account: accounts[0].address,
    message,
    verifier,
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      message,
      signature,
    }),
  ).toBeTruthy()
})

test('inferred account', async () => {
  const clientWithAccount = anvilMainnet.getClient({
    account: accounts[0].address,
  })

  const message = 'hello world'
  const signature = await signMessage(clientWithAccount!, {
    message,
    verifier,
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      message,
      signature,
    }),
  ).toBeTruthy()
})

test('counterfactual smart account', async () => {
  const { factoryAddress } = await deployMock4337Account_07()

  const factoryData = encodeFunctionData({
    abi: Mock4337AccountFactory07.abi,
    functionName: 'createAccount',
    args: [accounts[0].address, pad('0x1')],
  })
  const verifier = await readContract(client, {
    account: accounts[0].address,
    abi: Mock4337AccountFactory07.abi,
    address: factoryAddress,
    functionName: 'getAddress',
    args: [pad('0x1')],
  })

  const message = 'hello world'
  const signature = await signMessage(client, {
    account: accounts[0].address,
    message,
    factory: factoryAddress,
    factoryData,
    verifier,
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      factory: factoryAddress,
      factoryData,
      message,
      signature,
    }),
  ).toBeTruthy()
})

test('local account', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  const message = 'hello world'
  const signature = await signMessage(client!, {
    account,
    message,
    verifier,
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      message,
      signature,
    }),
  ).toBeTruthy()
})

test('no account', async () => {
  await expect(
    // @ts-expect-error
    signMessage(client!, {
      message: 'hello world',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/experimental/solady/signMessage#account
    Version: viem@x.y.z]
  `,
  )
})
