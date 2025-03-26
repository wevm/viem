import { beforeAll, expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { verifyAuthorization } from '../../utils/authorization/verifyAuthorization.js'
import { reset } from '../index.js'
import { signAuthorization } from './signAuthorization.js'

const account = privateKeyToAccount(accounts[0].privateKey)
const client = anvilMainnet.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: anvilMainnet.forkBlockNumber,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
})

test('default', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  })

  expect({
    ...authorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 0,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
  expect(authorization.r).toBeDefined()
  expect(authorization.s).toBeDefined()
  expect(authorization.v).toBeDefined()
  expect(authorization.yParity).toBeDefined()
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('args: address (alias)', async () => {
  const authorization = await signAuthorization(client, {
    account,
    address: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  })

  expect({
    ...authorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 0,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: address as authorization', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
  })

  expect({
    ...authorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 664,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
  expect(authorization.r).toBeDefined()
  expect(authorization.s).toBeDefined()
  expect(authorization.v).toBeDefined()
  expect(authorization.yParity).toBeDefined()
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: partial authorization: no chainId + nonce', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
  })

  expect({
    ...authorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 664,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
  expect(authorization.r).toBeDefined()
  expect(authorization.s).toBeDefined()
  expect(authorization.v).toBeDefined()
  expect(authorization.yParity).toBeDefined()
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: partial authorization: no nonce', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    chainId: 10,
  })

  expect({
    ...authorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 10,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 664,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
  expect(authorization.r).toBeDefined()
  expect(authorization.s).toBeDefined()
  expect(authorization.v).toBeDefined()
  expect(authorization.yParity).toBeDefined()
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: partial authorization: no chainId', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    nonce: 69,
  })

  expect({
    ...authorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 69,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
  expect(authorization.r).toBeDefined()
  expect(authorization.s).toBeDefined()
  expect(authorization.v).toBeDefined()
  expect(authorization.yParity).toBeDefined()
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: sponsor is address', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    sponsor: '0x0000000000000000000000000000000000000000',
  })

  expect(authorization.nonce).toBe(663)
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: sponsor is truthy', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    sponsor: true,
  })

  expect(authorization.nonce).toBe(663)
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: account as sponsor', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    sponsor: account,
  })

  expect(authorization.nonce).toBe(664)
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: hoisted account on client', async () => {
  const client = anvilMainnet.getClient({ account })
  const authorization = await signAuthorization(client, {
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  })

  expect({
    ...authorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 0,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
  expect(authorization.r).toBeDefined()
  expect(authorization.s).toBeDefined()
  expect(authorization.v).toBeDefined()
  expect(authorization.yParity).toBeDefined()
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('behavior: no client chain', async () => {
  const client = anvilMainnet.getClient({ chain: false })
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    nonce: 0,
  })

  expect({
    ...authorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 0,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
  expect(authorization.r).toBeDefined()
  expect(authorization.s).toBeDefined()
  expect(authorization.v).toBeDefined()
  expect(authorization.yParity).toBeDefined()
  expect(
    await verifyAuthorization({
      address: account.address,
      authorization,
    }),
  ).toBe(true)
})

test('error: unsupported account type', async () => {
  await expect(() =>
    signAuthorization(client, {
      account: accounts[0].address,
      contractAddress: wagmiContractConfig.address,
      chainId: 1,
      nonce: 0,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountTypeNotSupportedError: Account type "json-rpc" is not supported.

    The \`signAuthorization\` Action does not support JSON-RPC Accounts.

    Docs: https://viem.sh/docs/eip7702/signAuthorization
    Version: viem@x.y.z]
  `)
})

test('error: no account', async () => {
  await expect(() =>
    // @ts-expect-error
    signAuthorization(client, {
      contractAddress: wagmiContractConfig.address,
      chainId: 1,
      nonce: 0,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/docs/eip7702/signAuthorization
    Version: viem@x.y.z]
  `)
})
