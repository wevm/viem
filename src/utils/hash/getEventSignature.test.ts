import { expect, test } from 'vitest'

import { getEventSignature } from './getEventSignature.js'

test('creates event signature', () => {
  expect(
    getEventSignature('Transfer(address,address,uint256)'),
  ).toMatchInlineSnapshot('"Transfer(address,address,uint256)"')
  expect(
    getEventSignature(
      'Transfer(address indexed from, address indexed to, uint256 amount)',
    ),
  ).toMatchInlineSnapshot('"Transfer(address,address,uint256)"')
  expect(
    getEventSignature(
      'event Transfer(address indexed from, address indexed to, uint256 amount)',
    ),
  ).toMatchInlineSnapshot('"Transfer(address,address,uint256)"')
  expect(getEventSignature('drawNumber()')).toMatchInlineSnapshot(
    '"drawNumber()"',
  )
  expect(getEventSignature('drawNumber( )')).toMatchInlineSnapshot(
    '"drawNumber()"',
  )
  expect(
    getEventSignature(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
    ),
  ).toMatchInlineSnapshot(
    '"ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)"',
  )
  expect(
    getEventSignature(
      'ProcessedAccountDividendTracker(uint256 indexed foo, uint256 indexed bar, uint256 baz, uint256 a, bool b, uint256 c, address d)',
    ),
  ).toMatchInlineSnapshot(
    '"ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)"',
  )
  expect(
    getEventSignature('BlackListMultipleAddresses(address[], bool)'),
  ).toMatchInlineSnapshot('"BlackListMultipleAddresses(address[],bool)"')
  expect(getEventSignature('checkBatch(bytes)')).toMatchInlineSnapshot(
    '"checkBatch(bytes)"',
  )
  expect(
    getEventSignature(
      'Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
    ),
  ).toMatchInlineSnapshot('"Approval(address,address,uint256)"')
  expect(
    getEventSignature(
      'ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
    ),
  ).toMatchInlineSnapshot('"ApprovalForAll(address,address,bool)"')
})

test('creates event signature for `AbiEvent`', () => {
  expect(
    getEventSignature({
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
    getEventSignature({
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
    getEventSignature({
      name: 'drawNumber',
      type: 'event',
      inputs: [],
    }),
  ).toMatchInlineSnapshot('"drawNumber()"')

  expect(
    getEventSignature({
      name: 'drawNumber',
      type: 'event',
      inputs: [],
    }),
  ).toMatchInlineSnapshot('"drawNumber()"')

  expect(
    getEventSignature({
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
    getEventSignature({
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
    getEventSignature({
      name: 'BlackListMultipleAddresses',
      type: 'event',
      inputs: [
        { name: 'addresses', type: 'address[]', indexed: false },
        { name: 'isBlackListed', type: 'bool', indexed: false },
      ],
    }),
  ).toMatchInlineSnapshot('"BlackListMultipleAddresses(address[],bool)"')

  expect(
    getEventSignature({
      name: 'checkBatch',
      type: 'event',
      inputs: [{ name: '', type: 'bytes', indexed: false }],
    }),
  ).toMatchInlineSnapshot('"checkBatch(bytes)"')

  expect(
    getEventSignature({
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
    getEventSignature({
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
    getEventSignature({
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'smolRecipeId',
          type: 'uint256',
        },
        {
          components: [
            {
              components: [
                {
                  internalType: 'uint24',
                  name: 'background',
                  type: 'uint24',
                },
                { internalType: 'uint24', name: 'body', type: 'uint24' },
                { internalType: 'uint24', name: 'clothes', type: 'uint24' },
                { internalType: 'uint24', name: 'mouth', type: 'uint24' },
                { internalType: 'uint24', name: 'glasses', type: 'uint24' },
                { internalType: 'uint24', name: 'hat', type: 'uint24' },
                { internalType: 'uint24', name: 'hair', type: 'uint24' },
                { internalType: 'uint24', name: 'skin', type: 'uint24' },
                { internalType: 'uint8', name: 'gender', type: 'uint8' },
                { internalType: 'uint8', name: 'headSize', type: 'uint8' },
              ],
              internalType: 'struct Smol',
              name: 'smol',
              type: 'tuple',
            },
            { internalType: 'bool', name: 'exists', type: 'bool' },
            {
              internalType: 'uint8',
              name: 'smolInputAmount',
              type: 'uint8',
            },
          ],
          indexed: false,
          internalType: 'struct Transmolgrifier.SmolData',
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
