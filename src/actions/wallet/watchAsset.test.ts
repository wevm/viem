import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { watchAsset } from './watchAsset.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  expect(
    await watchAsset(client!, {
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
    watchAsset(client!, {
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
    '[Error: Token type ERC721 not supported.]',
  )
})
