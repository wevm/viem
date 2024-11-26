import { beforeAll, describe, expect, test } from 'vitest'

import { ensPublicResolverConfig } from '~test/src/abis.js'
import { address } from '~test/src/constants.js'
import { deployEnsAvatarTokenUri } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'

import { namehash } from '../../utils/ens/namehash.js'
import { impersonateAccount } from '../test/impersonateAccount.js'
import { mine } from '../test/mine.js'
import { writeContract } from '../wallet/writeContract.js'

import { reset } from '../test/reset.js'
import { getEnsAvatar } from './getEnsAvatar.js'

const client = anvilMainnet.getClient()

beforeAll(async () => {
  await impersonateAccount(client, {
    address: address.vitalik,
  })
  await reset(client, {
    blockNumber: 19_258_213n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
})

test.each([
  {
    // no avatar
    record: '',
    expected: null,
  },
  {
    // uri: https
    record:
      'https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg',
    expected:
      'https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg',
  },
  {
    // uri: https (valid image Content-Type)
    record:
      'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200',
    expected:
      'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200',
  },
  {
    // uri: https (invalid image Content-Type)
    record: 'https://example.com',
    expected: null,
  },
  {
    // uri: https metadata json
    record: 'https://boredapeyachtclub.com/api/mutants/1',
    expected: null,
  },
  {
    // uri: svg base64
    record:
      'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2IoMCwgMCwgMCk7Ii8+Cjwvc3ZnPg==',
    expected:
      'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2IoMCwgMCwgMCk7Ii8+Cjwvc3ZnPg==',
  },
  {
    // uri: svg utf8
    record: 'data:image/svg+xml;utf8,<svg></svg>',
    expected: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
  },
  {
    // uri: invalid utf8
    record: 'data:image/svg+xml;utf8,lel',
    expected: null,
  },
  {
    // uri: ipfs
    record: 'ipfs://ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
    expected:
      'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
  },
  {
    // uri: ipfs metadata
    record: 'ipfs://QmNpHFmk4GbJxDon2r2soYpwmrKaz1s6QfGMnBJtjA2ESd/1',
    expected: null,
  },
  {
    // uri: ipfs (no prefix)
    record: 'Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
    expected:
      'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
  },
  {
    // invalid avatar record
    record: 'wat',
    expected: null,
  },
])('$record -> $expected', async ({ record, expected }) => {
  await setEnsAvatar(record)
  await expect(
    getEnsAvatar(client, {
      name: 'vitalik.eth',
    }),
  ).resolves.toEqual(expected)
})

describe('eip155:1 string (erc721)', () => {
  test.each([
    {
      tokenId: '69',
      expected:
        'https://ipfs.io/ipfs/QmbUCe7JMPsG39FRaLaJ9VwSKrE74PzEb1s4DKuEkARepS',
    },
    {
      tokenId: '100',
      expected:
        'https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg',
    },
    {
      tokenId: '101',
      expected: null,
    },
    {
      tokenId: '102',
      expected:
        'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2IoMCwgMCwgMCk7Ii8+Cjwvc3ZnPg==',
    },
    {
      tokenId: '103',
      expected: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    },
    {
      tokenId: '104',
      expected: null,
    },
    {
      tokenId: '105',
      expected:
        'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
    },
    {
      tokenId: '106',
      expected:
        'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
    },
    {
      tokenId: '107',
      expected: null,
    },
  ])('$tokenId -> $expected', async ({ tokenId, expected }) => {
    const { contractAddress } = await deployEnsAvatarTokenUri()
    await setEnsAvatar(`eip155:1/erc721:${contractAddress}/${tokenId}`)
    await expect(
      getEnsAvatar(client, {
        name: 'vitalik.eth',
      }),
    ).resolves.toEqual(expected)
  })
})

describe('args: gateways', async () => {
  test.each([
    {
      // uri: ipfs
      record: 'ipfs://ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
      expected:
        'https://gateway.pinata.cloud/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
    },
    {
      // uri: ipfs (no prefix)
      record: 'Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
      expected:
        'https://gateway.pinata.cloud/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio',
    },
  ])('$record -> $expected', async ({ record, expected }) => {
    await setEnsAvatar(record)
    await expect(
      getEnsAvatar(client, {
        name: 'vitalik.eth',
        assetGatewayUrls: { ipfs: 'https://gateway.pinata.cloud' },
      }),
    ).resolves.toEqual(expected)
  })
})

async function setEnsAvatar(avatar: string) {
  await writeContract(client, {
    ...ensPublicResolverConfig,
    account: address.vitalik,
    functionName: 'setText',
    args: [namehash('vitalik.eth'), 'avatar', avatar],
  })
  await mine(client, { blocks: 1 })
}
