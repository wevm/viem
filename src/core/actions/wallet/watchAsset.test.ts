import { expect, test } from 'vitest'
import { Actions } from 'viem'

import * as anvil from '~test/anvil.js'

const client = anvil.getWalletClient(anvil.mainnet)

test('default', async () => {
  expect(
    await Actions.wallet.watchAsset(client, {
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

test('error: unsupported type', async () => {
  await expect(
    Actions.wallet.watchAsset(client, {
      // @ts-expect-error - test
      type: 'ERC721',
      options: {
        address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        symbol: 'FOO',
        decimals: 18,
        image: 'https://foo.io/token-image.svg',
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Token type ERC721 not supported.]`,
  )
})
