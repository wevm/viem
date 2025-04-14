import { expect, test } from 'vitest'
import { ERC7821Example } from '../../../../contracts/generated.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { deploy } from '../../../../test/src/utils.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  mine,
  sendTransaction,
  signAuthorization,
} from '../../../actions/index.js'
import { supportsExecutionMode } from './supportsExecutionMode.js'

const client = anvilMainnet.getClient({
  account: privateKeyToAccount(accounts[0].privateKey),
})

test('default', async () => {
  const { contractAddress } = await deploy(client, {
    abi: ERC7821Example.abi,
    bytecode: ERC7821Example.bytecode.object,
  })

  expect(
    await supportsExecutionMode(client, {
      address: contractAddress!,
    }),
  ).toBe(true)
  expect(
    await supportsExecutionMode(client, {
      address: client.account.address,
    }),
  ).toBe(false)

  const authorization = await signAuthorization(client, {
    contractAddress: contractAddress!,
    executor: 'self',
  })
  await sendTransaction(client, {
    authorizationList: [authorization],
    to: client.account.address,
  })

  await mine(client, { blocks: 1 })

  expect(
    await supportsExecutionMode(client, {
      address: client.account.address,
    }),
  ).toBe(true)
})

test('args: mode = opData', async () => {
  const { contractAddress } = await deploy(client, {
    abi: ERC7821Example.abi,
    bytecode: ERC7821Example.bytecode.object,
  })

  expect(
    await supportsExecutionMode(client, {
      address: contractAddress!,
      mode: 'opData',
    }),
  ).toBe(true)
})

test('args: mode = batchOfBatches', async () => {
  const { contractAddress } = await deploy(client, {
    abi: ERC7821Example.abi,
    bytecode: ERC7821Example.bytecode.object,
  })

  expect(
    await supportsExecutionMode(client, {
      address: contractAddress!,
      mode: 'batchOfBatches',
    }),
  ).toBe(true)
})

test('args: mode (hex)', async () => {
  const { contractAddress } = await deploy(client, {
    abi: ERC7821Example.abi,
    bytecode: ERC7821Example.bytecode.object,
  })

  expect(
    await supportsExecutionMode(client, {
      address: contractAddress!,
      mode: '0x0100000000007821000200000000000000000000000000000000000000000000',
    }),
  ).toBe(true)
})
