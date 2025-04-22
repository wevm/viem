import { beforeAll, expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { reset } from '../index.js'
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
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 0,
    }
  `,
  )
})

test('args: address (alias)', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    address: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
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
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 953,
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
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 10,
      "nonce": 953,
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
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 69,
    }
  `,
  )
})

test('behavior: executor (address)', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    executor: '0x0000000000000000000000000000000000000000',
  })

  expect(authorization.nonce).toBe(953)
})

test('behavior: executor (account)', async () => {
  const authorization = await prepareAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    executor: privateKeyToAccount(accounts[1].privateKey),
  })

  expect(authorization.nonce).toBe(953)
})

test('behavior: executor (self-executing)', async () => {
  {
    const authorization = await prepareAuthorization(client, {
      account,
      contractAddress: wagmiContractConfig.address,
      executor: 'self',
    })

    expect(authorization.nonce).toBe(954)
  }

  {
    const authorization = await prepareAuthorization(client, {
      account,
      contractAddress: wagmiContractConfig.address,
      executor: account,
    })

    expect(authorization.nonce).toBe(954)
  }
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
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
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
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
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

    Docs: https://viem.sh/docs/eip7702/prepareAuthorization
    Version: viem@x.y.z]
  `)
})
