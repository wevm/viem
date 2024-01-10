import { expect, test } from 'vitest'

import { walletClient } from '~test/src/utils.js'

import { watchAsset } from './watchAsset.js'

test('default', async () => {
  expect(
    await watchAsset(walletClient!, {
      type: 'ERC20',
      options: {
        address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        symbol: 'FOO',
        decimals: 18,
        image: 'https://foo.io/token-image.svg',
      },
    }),
  ).toBeTruthy()
})

test('errors: unsupported type', async () => {
  await expect(
    watchAsset(walletClient!, {
      // @ts-expect-error - test
      type: 'ERC721',
      options: {
        address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        symbol: 'FOO',
        decimals: 18,
        image: 'https://foo.io/token-image.svg',
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    Details: Token type ERC721 not supported.
    Version: viem@1.0.2]
  `)
})
