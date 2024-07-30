import { expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../../test/src/abis.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { verifyAuthorization } from '../utils/verifyAuthorization.js'
import { signAuthorization } from './signAuthorization.js'

const account = privateKeyToAccount(accounts[0].privateKey)
const client = anvilMainnet.getClient()

test('default', async () => {
  const authorization = await signAuthorization(client, {
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
      "r": "0x623129c9fcc520bee4b19fbb5148b178d67e1c854d2baee0e64cd518aad5549f",
      "s": "0x17997fb5ef9d7521c09f0208b1082a9fecbeabdad90ef0a806a50d1b9c7b5d66",
      "v": 27n,
      "yParity": 0,
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

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 663,
      "r": "0x404f631fefa94a5e20bb3ff52c42819458cd22b87d1ef70dec58c25d6e66f8ce",
      "s": "0x008bc0eda66ad52158222eaa71c98c58caa1d55b47a0e3392d44ef2d3b367d71",
      "v": 28n,
      "yParity": 1,
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

test('behavior: partial authorization: no chainId + nonce', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 663,
      "r": "0x404f631fefa94a5e20bb3ff52c42819458cd22b87d1ef70dec58c25d6e66f8ce",
      "s": "0x008bc0eda66ad52158222eaa71c98c58caa1d55b47a0e3392d44ef2d3b367d71",
      "v": 28n,
      "yParity": 1,
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

test('behavior: partial authorization: no nonce', async () => {
  const authorization = await signAuthorization(client, {
    account,
    contractAddress: wagmiContractConfig.address,
    chainId: 10,
  })

  expect(authorization).toMatchInlineSnapshot(
    `
    {
      "chainId": 10,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 663,
      "r": "0xdc9b286e23b81b03d49dd9f7bd82fe1dd9ba91f1e9f9d7e340d215a5aa2a8f5c",
      "s": "0x1e7ec0cd82d5bdaa45f15ef86b18fb57dd75d4704ee523d2f81eb5e9358182a7",
      "v": 27n,
      "yParity": 0,
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

test('behavior: partial authorization: no chainId', async () => {
  const authorization = await signAuthorization(client, {
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
      "r": "0x79f827582eb2f1cb09889d2a4d365e02e11d4d30317a678e101465d9bf33292f",
      "s": "0x0b2a927f020bed06ecca09b244abd7b6e59f8d7022f81f66893fd0a2624c0859",
      "v": 28n,
      "yParity": 1,
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

test('behavior: hoisted account on client', async () => {
  const client = anvilMainnet.getClient({ account })
  const authorization = await signAuthorization(client, {
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
      "r": "0x623129c9fcc520bee4b19fbb5148b178d67e1c854d2baee0e64cd518aad5549f",
      "s": "0x17997fb5ef9d7521c09f0208b1082a9fecbeabdad90ef0a806a50d1b9c7b5d66",
      "v": 27n,
      "yParity": 0,
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

test('behavior: no client chain', async () => {
  const client = anvilMainnet.getClient({ chain: false })
  const authorization = await signAuthorization(client, {
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
      "r": "0x623129c9fcc520bee4b19fbb5148b178d67e1c854d2baee0e64cd518aad5549f",
      "s": "0x17997fb5ef9d7521c09f0208b1082a9fecbeabdad90ef0a806a50d1b9c7b5d66",
      "v": 27n,
      "yParity": 0,
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

    Docs: https://viem.sh/experimental/eip7702/signAuthorization
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

    Docs: https://viem.sh/experimental/eip7702/signAuthorization#account
    Version: viem@x.y.z]
  `)
})
