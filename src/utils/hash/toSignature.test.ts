import { expect, test } from 'vitest'

import { toSignature } from './toSignature.js'

test('creates function signature', () => {
  expect(toSignature('_compound(uint256,uint256,uint256)')).toEqual(
    '_compound(uint256,uint256,uint256)',
  )
  expect(
    toSignature('function _compound(uint256 a, uint256 b, uint256 c)'),
  ).toEqual('_compound(uint256,uint256,uint256)')
  expect(toSignature('function ownerOf(uint256 tokenId)')).toEqual(
    'ownerOf(uint256)',
  )
  expect(toSignature('ownerOf(uint256)')).toEqual('ownerOf(uint256)')
  expect(toSignature('processInvestment(address,uint256,bool)')).toEqual(
    'processInvestment(address,uint256,bool)',
  )
  expect(toSignature('processAccount(uint256 , address)')).toEqual(
    'processAccount(uint256,address)',
  )
  expect(toSignature('claimed()')).toEqual('claimed()')
  expect(toSignature('function claimed()')).toEqual('claimed()')
})

test('creates function signature from `AbiFunction`', () => {
  expect(
    toSignature({
      name: '_compound',
      type: 'function',
      inputs: [
        { name: 'a', type: 'uint256' },
        { name: 'b', type: 'uint256' },
        { name: 'c', type: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    }),
  ).toEqual('_compound(uint256,uint256,uint256)')

  expect(
    toSignature({
      name: 'ownerOf',
      type: 'function',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [],
      stateMutability: 'view',
    }),
  ).toEqual('ownerOf(uint256)')

  expect(
    toSignature({
      name: 'ownerOf',
      type: 'function',
      inputs: [{ name: '', type: 'uint256' }],
      outputs: [],
      stateMutability: 'view',
    }),
  ).toEqual('ownerOf(uint256)')

  expect(
    toSignature({
      name: 'processInvestment',
      type: 'function',
      inputs: [
        { name: '', type: 'address' },
        { name: '', type: 'uint256' },
        { name: '', type: 'bool' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    }),
  ).toEqual('processInvestment(address,uint256,bool)')

  expect(
    toSignature({
      name: 'processAccount',
      type: 'function',
      inputs: [
        { name: '', type: 'uint256' },
        { name: '', type: 'address' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    }),
  ).toEqual('processAccount(uint256,address)')

  expect(
    toSignature({
      name: 'claimed',
      type: 'function',
      inputs: [],
      outputs: [],
      stateMutability: 'view',
    }),
  ).toEqual('claimed()')

  expect(
    toSignature({
      inputs: [
        {
          components: [
            {
              name: 'position',
              type: 'uint64',
            },
            {
              name: 'owner',
              type: 'address',
            },
            {
              name: 'color',
              type: 'uint8',
            },
            {
              name: 'life',
              type: 'uint8',
            },
          ],

          name: 'cells',
          type: 'tuple[]',
        },
      ],
      name: 'forceSimpleCells',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    }),
  ).toEqual('forceSimpleCells((uint64,address,uint8,uint8)[])')

  expect(
    toSignature({
      inputs: [
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'editionSize', type: 'uint64' },
        { name: 'royaltyBPS', type: 'uint16' },
        {
          name: 'fundsRecipient',
          type: 'address',
        },
        { name: 'defaultAdmin', type: 'address' },
        {
          components: [
            {
              name: 'publicSalePrice',
              type: 'uint104',
            },
            {
              name: 'maxSalePurchasePerAddress',
              type: 'uint32',
            },
            { name: 'publicSaleStart', type: 'uint64' },
            { name: 'publicSaleEnd', type: 'uint64' },
            { name: 'presaleStart', type: 'uint64' },
            { name: 'presaleEnd', type: 'uint64' },
            {
              name: 'presaleMerkleRoot',
              type: 'bytes32',
            },
          ],

          name: 'saleConfig',
          type: 'tuple',
        },
        { name: 'description', type: 'string' },
        { name: 'animationURI', type: 'string' },
        { name: 'imageURI', type: 'string' },
      ],
      name: 'createEdition',
      outputs: [{ name: '', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }),
  ).toEqual(
    'createEdition(string,string,uint64,uint16,address,address,(uint104,uint32,uint64,uint64,uint64,uint64,bytes32),string,string,string)',
  )

  expect(
    toSignature({
      inputs: [
        {
          name: 't',
          type: 'address',
        },
        {
          name: 'ah',
          type: 'address',
        },
        {
          name: '_owner',
          type: 'address',
        },
        {
          components: [
            {
              name: 'maxBid',
              type: 'uint256',
            },
            {
              name: 'minBid',
              type: 'uint256',
            },
            {
              name: 'bidWindow',
              type: 'uint256',
            },
            {
              name: 'tip',
              type: 'uint256',
            },
            {
              name: 'receiver',
              type: 'address',
            },
          ],

          name: 'cfg',
          type: 'tuple',
        },
      ],
      name: 'clone',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'payable',
      type: 'function',
    }),
  ).toEqual(
    'clone(address,address,address,(uint256,uint256,uint256,uint256,address))',
  )

  expect(
    toSignature({
      inputs: [
        { name: 'payer', type: 'address' },
        { name: 'recipient', type: 'address' },
        { name: 'tokenAmount', type: 'uint256' },
        { name: 'tokenAddress', type: 'address' },
        { name: 'startTime', type: 'uint256' },
        { name: 'stopTime', type: 'uint256' },
        { name: 'nonce', type: 'uint8' },
      ],
      name: 'createStream',
      outputs: [{ name: 'stream', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }),
  ).toEqual(
    'createStream(address,address,uint256,address,uint256,uint256,uint8)',
  )
})

test('creates event signature', () => {
  expect(
    toSignature('Transfer(address,address,uint256)'),
  ).toMatchInlineSnapshot('"Transfer(address,address,uint256)"')
  expect(
    toSignature(
      'Transfer(address indexed from, address indexed to, uint256 amount)',
    ),
  ).toMatchInlineSnapshot('"Transfer(address,address,uint256)"')
  expect(
    toSignature(
      'event Transfer(address indexed from, address indexed to, uint256 amount)',
    ),
  ).toMatchInlineSnapshot('"Transfer(address,address,uint256)"')
  expect(toSignature('drawNumber()')).toMatchInlineSnapshot('"drawNumber()"')
  expect(toSignature('drawNumber( )')).toMatchInlineSnapshot('"drawNumber()"')
  expect(
    toSignature(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
    ),
  ).toMatchInlineSnapshot(
    '"ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)"',
  )
  expect(
    toSignature(
      'ProcessedAccountDividendTracker(uint256 indexed foo, uint256 indexed bar, uint256 baz, uint256 a, bool b, uint256 c, address d)',
    ),
  ).toMatchInlineSnapshot(
    '"ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)"',
  )
  expect(
    toSignature('BlackListMultipleAddresses(address[], bool)'),
  ).toMatchInlineSnapshot('"BlackListMultipleAddresses(address[],bool)"')
  expect(toSignature('checkBatch(bytes)')).toMatchInlineSnapshot(
    '"checkBatch(bytes)"',
  )
  expect(
    toSignature(
      'Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
    ),
  ).toMatchInlineSnapshot('"Approval(address,address,uint256)"')
  expect(
    toSignature(
      'ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
    ),
  ).toMatchInlineSnapshot('"ApprovalForAll(address,address,bool)"')
})

test('creates event signature for `AbiEvent`', () => {
  expect(
    toSignature({
      name: 'Transfer',
      type: 'event',
      inputs: [
        { name: 'address', type: 'address', indexed: true },
        { name: 'address', type: 'address', indexed: true },
        { name: 'uint256', type: 'uint256', indexed: false },
      ],
    }),
  ).toMatchInlineSnapshot('"Transfer(address,address,uint256)"')

  expect(
    toSignature({
      name: 'Transfer',
      type: 'event',
      inputs: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false },
      ],
    }),
  ).toMatchInlineSnapshot('"Transfer(address,address,uint256)"')

  expect(
    toSignature({
      name: 'drawNumber',
      type: 'event',
      inputs: [],
    }),
  ).toMatchInlineSnapshot('"drawNumber()"')

  expect(
    toSignature({
      name: 'drawNumber',
      type: 'event',
      inputs: [],
    }),
  ).toMatchInlineSnapshot('"drawNumber()"')

  expect(
    toSignature({
      name: 'ProcessedAccountDividendTracker',
      type: 'event',
      inputs: [
        { name: 'uint256', type: 'uint256', indexed: false },
        { name: 'uint256', type: 'uint256', indexed: false },
        { name: 'uint256', type: 'uint256', indexed: false },
        { name: 'uint256', type: 'uint256', indexed: false },
        { name: 'bool', type: 'bool', indexed: false },
        { name: 'uint256', type: 'uint256', indexed: false },
        { name: 'address', type: 'address', indexed: false },
      ],
    }),
  ).toMatchInlineSnapshot(
    '"ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)"',
  )

  expect(
    toSignature({
      name: 'ProcessedAccountDividendTracker',
      type: 'event',
      inputs: [
        { name: 'foo', type: 'uint256', indexed: true },
        { name: 'bar', type: 'uint256', indexed: true },
        { name: 'baz', type: 'uint256', indexed: false },
        { name: 'a', type: 'uint256', indexed: false },
        { name: 'b', type: 'bool', indexed: false },
        { name: 'c', type: 'uint256', indexed: false },
        { name: 'd', type: 'address', indexed: false },
      ],
    }),
  ).toMatchInlineSnapshot(
    '"ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)"',
  )

  expect(
    toSignature({
      name: 'BlackListMultipleAddresses',
      type: 'event',
      inputs: [
        { name: 'addresses', type: 'address[]', indexed: false },
        { name: 'isBlackListed', type: 'bool', indexed: false },
      ],
    }),
  ).toMatchInlineSnapshot('"BlackListMultipleAddresses(address[],bool)"')

  expect(
    toSignature({
      name: 'checkBatch',
      type: 'event',
      inputs: [{ name: '', type: 'bytes', indexed: false }],
    }),
  ).toMatchInlineSnapshot('"checkBatch(bytes)"')

  expect(
    toSignature({
      name: 'Approval',
      type: 'event',
      inputs: [
        { name: 'owner', type: 'address', indexed: true },
        { name: 'approved', type: 'address', indexed: true },
        { name: 'tokenId', type: 'uint256', indexed: true },
      ],
    }),
  ).toMatchInlineSnapshot('"Approval(address,address,uint256)"')

  expect(
    toSignature({
      name: 'ApprovalForAll',
      type: 'event',
      inputs: [
        { name: 'owner', type: 'address', indexed: true },
        { name: 'operator', type: 'address', indexed: true },
        { name: 'approved', type: 'bool', indexed: false },
      ],
    }),
  ).toMatchInlineSnapshot('"ApprovalForAll(address,address,bool)"')

  expect(
    toSignature({
      anonymous: false,
      inputs: [
        {
          indexed: false,

          name: 'smolRecipeId',
          type: 'uint256',
        },
        {
          components: [
            {
              components: [
                {
                  name: 'background',
                  type: 'uint24',
                },
                { name: 'body', type: 'uint24' },
                { name: 'clothes', type: 'uint24' },
                { name: 'mouth', type: 'uint24' },
                { name: 'glasses', type: 'uint24' },
                { name: 'hat', type: 'uint24' },
                { name: 'hair', type: 'uint24' },
                { name: 'skin', type: 'uint24' },
                { name: 'gender', type: 'uint8' },
                { name: 'headSize', type: 'uint8' },
              ],

              name: 'smol',
              type: 'tuple',
            },
            { name: 'exists', type: 'bool' },
            {
              name: 'smolInputAmount',
              type: 'uint8',
            },
          ],
          indexed: false,

          name: 'smolData',
          type: 'tuple',
        },
      ],
      name: 'SmolRecipeAdded',
      type: 'event',
    }),
  ).toMatchInlineSnapshot(
    '"SmolRecipeAdded(uint256,((uint24,uint24,uint24,uint24,uint24,uint24,uint24,uint24,uint8,uint8),bool,uint8))"',
  )
})
