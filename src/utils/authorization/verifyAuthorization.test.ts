import { expect, test } from 'vitest'
import { wagmiContractConfig } from '~test/abis.js'
import { accounts } from '~test/constants.js'
import { signAuthorization } from '../../accounts/utils/signAuthorization.js'
import { verifyAuthorization } from './verifyAuthorization.js'

test('default', async () => {
  const authorization = await signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization,
    }),
  ).toBe(true)
})

test('args: address (alias)', async () => {
  const authorization = await signAuthorization({
    address: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization,
    }),
  ).toBe(true)
})

test('args: signature', async () => {
  const authorization = {
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  } as const
  const signature = await signAuthorization({
    ...authorization,
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization,
      signature,
    }),
  ).toBe(true)
})

test('behavior: yParity not 0 or 1', async () => {
  const authorization = await signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
    privateKey: accounts[0].privateKey,
  })

  // EIP-7702 rejects a `yParity` of 27 or 28, even when `yParity - 27` recovers the signer.
  const results = await Promise.all(
    [0, 1, 2, 27, 28, 255].map(async (yParity) => [
      yParity,
      await verifyAuthorization({
        address: accounts[0].address,
        authorization: { ...authorization, v: undefined, yParity },
      }),
    ]),
  )

  expect(results).toMatchInlineSnapshot(`
    [
      [
        0,
        true,
      ],
      [
        1,
        false,
      ],
      [
        2,
        false,
      ],
      [
        27,
        false,
      ],
      [
        28,
        false,
      ],
      [
        255,
        false,
      ],
    ]
  `)
})
