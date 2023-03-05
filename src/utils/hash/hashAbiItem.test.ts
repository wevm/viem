import { expect, test } from 'vitest'

import { hashAbiItem } from './hashAbiItem'

test('hashes functions', () => {
  expect(hashAbiItem('Transfer(address,address,uint256)', 'event')).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(
    hashAbiItem(
      'Transfer(address indexed from, address indexed to, uint256 amount)',
      'event',
    ),
  ).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(
    hashAbiItem(
      'event Transfer(address indexed from, address indexed to, uint256 amount)',
      'event',
    ),
  ).toEqual(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  )
  expect(hashAbiItem('drawNumber()', 'function')).toEqual(
    '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
  )
  expect(
    hashAbiItem(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
      'event',
    ),
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )
  expect(
    hashAbiItem(
      'ProcessedAccountDividendTracker(uint256 indexed foo, uint256 indexed bar, uint256 baz, uint256 a, bool b, uint256 c, address d)',
      'event',
    ),
  ).toEqual(
    '0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a',
  )
  expect(
    hashAbiItem('BlackListMultipleAddresses(address[], bool)', 'event'),
  ).toEqual(
    '0x170cd84eddb1952bf41adcce9be0e44b66ff38f07cddda1cf64d32708742bd2d',
  )
  expect(hashAbiItem('checkBatch(bytes)', 'function')).toEqual(
    '0x9b6f373667d9cf576e3a17e6aa047c5d864fcb7f41836b11613215db446698d8',
  )
  expect(
    hashAbiItem(
      'Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
      'event',
    ),
  ).toBe('0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925')
  expect(
    hashAbiItem(
      'ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
      'event',
    ),
  ).toBe('0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31')
  expect(hashAbiItem('function balanceOf(address owner)', 'function')).toBe(
    '0x70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be',
  )
  expect(hashAbiItem('function ownerOf(uint256 tokenId)', 'function')).toBe(
    '0x6352211e6566aa027e75ac9dbf2423197fbd9b82b9d981a3ab367d355866aa1c',
  )
})
