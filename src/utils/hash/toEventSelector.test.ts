import { expect, test } from 'vitest'

import { toEventSelector } from './toEventSelector.js'

test('creates event signature', () => {
  expect(toEventSelector('Transfer(address,address,uint256)')).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(
    toEventSelector(
      'Transfer(address indexed from, address indexed to, uint256 amount)',
    ),
  ).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(
    toEventSelector(
      'event Transfer(address indexed from, address indexed to, uint256 amount)',
    ),
  ).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(toEventSelector('drawNumber()')).toEqual(
    '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
  )
  expect(toEventSelector('drawNumber( )')).toEqual(
    '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
  )
  expect(
    toEventSelector(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
    ),
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )
  expect(
    toEventSelector(
      'ProcessedAccountDividendTracker(uint256 indexed foo, uint256 indexed bar, uint256 baz, uint256 a, bool b, uint256 c, address d)',
    ),
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )
  expect(
    toEventSelector('BlackListMultipleAddresses(address[], bool)'),
  ).toEqual(
    '0x170cd84eddb1952bf41adcce9be0e44b66ff38f07cddda1cf64d32708742bd2d',
  )
  expect(toEventSelector('checkBatch(bytes)')).toEqual(
    '0x9b6f373667d9cf576e3a17e6aa047c5d864fcb7f41836b11613215db446698d8',
  )
  expect(
    toEventSelector(
      'Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
    ),
  ).toBe('0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925')
  expect(
    toEventSelector(
      'ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
    ),
  ).toBe('0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31')
})

test('creates event signature for `AbiEvent`', () => {
  expect(
    toEventSelector({
      name: 'Transfer',
      type: 'event',
      inputs: [
        { name: 'address', type: 'address', indexed: true },
        { name: 'address', type: 'address', indexed: true },
        { name: 'uint256', type: 'uint256', indexed: false },
      ],
    }),
  ).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )

  expect(
    toEventSelector({
      name: 'Transfer',
      type: 'event',
      inputs: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false },
      ],
    }),
  ).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )

  expect(
    toEventSelector({
      name: 'drawNumber',
      type: 'event',
      inputs: [],
    }),
  ).toEqual(
    '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
  )

  expect(
    toEventSelector({
      name: 'drawNumber',
      type: 'event',
      inputs: [],
    }),
  ).toEqual(
    '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
  )

  expect(
    toEventSelector({
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
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )

  expect(
    toEventSelector({
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
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )

  expect(
    toEventSelector({
      name: 'BlackListMultipleAddresses',
      type: 'event',
      inputs: [
        { name: 'addresses', type: 'address[]', indexed: false },
        { name: 'isBlackListed', type: 'bool', indexed: false },
      ],
    }),
  ).toEqual(
    '0x170cd84eddb1952bf41adcce9be0e44b66ff38f07cddda1cf64d32708742bd2d',
  )

  expect(
    toEventSelector({
      name: 'checkBatch',
      type: 'event',
      inputs: [{ name: '', type: 'bytes', indexed: false }],
    }),
  ).toEqual(
    '0x9b6f373667d9cf576e3a17e6aa047c5d864fcb7f41836b11613215db446698d8',
  )

  expect(
    toEventSelector({
      name: 'Approval',
      type: 'event',
      inputs: [
        { name: 'owner', type: 'address', indexed: true },
        { name: 'approved', type: 'address', indexed: true },
        { name: 'tokenId', type: 'uint256', indexed: true },
      ],
    }),
  ).toBe('0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925')

  expect(
    toEventSelector({
      name: 'ApprovalForAll',
      type: 'event',
      inputs: [
        { name: 'owner', type: 'address', indexed: true },
        { name: 'operator', type: 'address', indexed: true },
        { name: 'approved', type: 'bool', indexed: false },
      ],
    }),
  ).toBe('0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31')

  expect(
    toEventSelector({
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
  ).toBe('0x2cc6298312f9877815b420162c5268cf83c13ba43ac9ac9af8ac68611ce6752e')
})
