import { beforeAll, expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../../test/src/abis.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { reset } from '../../../actions/index.js'
import { prepareAuthorization } from './prepareAuthorization.js'

const account = privateKeyToAccount(accounts[0].privateKey)
const client = anvilMainnet.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: anvilMainnet.forkBlockNumber,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
})

test('default', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 0,
    }
  `,
  )
})

test('behavior: partial authorization: no chainId + nonce', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 664,
    }
  `,
  )
})

test('behavior: partial authorization: no nonce', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    chainId: 10,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 10,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 664,
    }
  `,
  )
})

test('behavior: partial authorization: no chainId', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    nonce: 69,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 69,
    }
  `,
  )
})

test('behavior: delegate is address', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    delegate: '0x0000000000000000000000000000000000000000',
  })

  expect(authorization.nonce).toBe(663)
})

test('behavior: delegate is truthy', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    delegate: true,
  })

  expect(authorization.nonce).toBe(663)
})

test('behavior: account as delegate', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    delegate: account,
  })

  expect(authorization.nonce).toBe(664)
})

test('behavior: hoisted account on client', async () => {
  const client = anvilMainnet.getClient({ account })
  const authorization = await prepareAuthorization(client, {
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 0,
    }
  `,
  )
})

test('behavior: no client chain', async () => {
  const client = anvilMainnet.getClient({ chain: false })
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    nonce: 0,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 0,
    }
  `,
  )
})

test('error: no account', async () => {
  await expect(() =>
    // @ts-expect-error
    prepareAuthorization(client, {
      contractAddress: wagmiContractConfig.address,
      chainId: 1,
      nonce: 0,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/experimental/eip7702/prepareAuthorization
    Version: viem@x.y.z]
  `)
})
