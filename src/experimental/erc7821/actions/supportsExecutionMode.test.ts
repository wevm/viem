import { expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { deploy } from '~test/utils.js'
import { ERC7821Example } from '../../../../contracts/generated.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  mine,
  sendTransaction,
  signAuthorization,
} from '../../../actions/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
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

test('behavior: does not share in-flight checks across Clients', async () => {
  const address = '0x0000000000000000000000000000000000000001'
  const pending = supportsExecutionMode(
    createClient({
      transport: custom({ request: () => new Promise(() => {}) }),
    }),
    { address },
  )
  void pending

  expect(
    await supportsExecutionMode(
      createClient({
        transport: custom({
          request: async () => `0x${'1'.padStart(64, '0')}`,
        }),
      }),
      { address },
    ),
  ).toMatchInlineSnapshot(`true`)
})
