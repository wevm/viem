import { expect, test } from 'vitest'

import { hashAbiItem, hashFunction } from './hashFunction.js'

test('hashes functions', () => {
  expect(hashFunction('Transfer(address,address,uint256)')).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(
    hashFunction(
      'Transfer(address indexed from, address indexed to, uint256 amount)',
    ),
  ).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(
    hashFunction(
      'event Transfer(address indexed from, address indexed to, uint256 amount)',
    ),
  ).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(hashFunction('drawNumber()')).toEqual(
    '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
  )
  expect(hashFunction('drawNumber( )')).toEqual(
    '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
  )
  expect(
    hashFunction(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
    ),
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )
  expect(
    hashFunction(
      'ProcessedAccountDividendTracker(uint256 indexed foo, uint256 indexed bar, uint256 baz, uint256 a, bool b, uint256 c, address d)',
    ),
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )
  expect(hashFunction('BlackListMultipleAddresses(address[], bool)')).toEqual(
    '0x170cd84eddb1952bf41adcce9be0e44b66ff38f07cddda1cf64d32708742bd2d',
  )
  expect(hashFunction('checkBatch(bytes)')).toEqual(
    '0x9b6f373667d9cf576e3a17e6aa047c5d864fcb7f41836b11613215db446698d8',
  )
  expect(
    hashFunction(
      'Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
    ),
  ).toBe('0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925')
  expect(
    hashFunction(
      'ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
    ),
  ).toBe('0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31')
  expect(hashFunction('function balanceOf(address owner)')).toBe(
    '0x70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be',
  )
  expect(hashFunction('function ownerOf(uint256 tokenId)')).toBe(
    '0x6352211e6566aa027e75ac9dbf2423197fbd9b82b9d981a3ab367d355866aa1c',
  )
})

test('hashes `AbiFunction`', () => {
  expect(
    hashAbiItem({
      name: 'drawNumber',
      type: 'function',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    }),
  ).toEqual(
    '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
  )

  expect(
    hashAbiItem({
      name: 'BlackListMultipleAddresses',
      type: 'function',
      inputs: [
        { name: 'address[]', type: 'address[]' },
        { name: 'bool', type: 'bool' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    }),
  ).toEqual(
    '0x170cd84eddb1952bf41adcce9be0e44b66ff38f07cddda1cf64d32708742bd2d',
  )

  expect(
    hashAbiItem({
      name: 'checkBatch',
      type: 'function',
      inputs: [{ name: 'bytes', type: 'bytes' }],
      outputs: [],
      stateMutability: 'nonpayable',
    }),
  ).toEqual(
    '0x9b6f373667d9cf576e3a17e6aa047c5d864fcb7f41836b11613215db446698d8',
  )

  expect(
    hashAbiItem({
      name: 'balanceOf',
      type: 'function',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [],
      stateMutability: 'nonpayable',
    }),
  ).toBe('0x70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be')

  expect(
    hashAbiItem({
      name: 'ownerOf',
      type: 'function',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    }),
  ).toBe('0x6352211e6566aa027e75ac9dbf2423197fbd9b82b9d981a3ab367d355866aa1c')
})

test('hashes `AbiEvent`', () => {
  expect(
    hashAbiItem({
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
    hashAbiItem({
      name: 'ProcessedAccountDividendTracker',
      type: 'event',
      inputs: [
        { name: 'lastProcessedIndex', type: 'uint256', indexed: false },
        { name: 'iterationsUntilProcessed', type: 'uint256', indexed: false },
        { name: 'withdrawableDividends', type: 'uint256', indexed: false },
        { name: 'totalDividends', type: 'uint256', indexed: false },
        { name: 'process', type: 'bool', indexed: false },
        { name: 'gas', type: 'uint256', indexed: false },
        { name: 'rewardsToken', type: 'address', indexed: false },
      ],
    }),
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )

  expect(
    hashAbiItem({
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
    hashAbiItem({
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
    hashAbiItem({
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
})
