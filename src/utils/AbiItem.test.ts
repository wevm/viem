import { describe, expect, test } from 'vitest'

import * as AbiItem from './AbiItem.js'

describe('getSignature', () => {
  test('default', () => {
    expect(AbiItem.getSignature('_compound(uint256,uint256,uint256)')).toBe(
      '_compound(uint256,uint256,uint256)',
    )
    expect(
      AbiItem.getSignature(
        'function _compound(uint256 a, uint256 b, uint256 c)',
      ),
    ).toBe('_compound(uint256,uint256,uint256)')
    expect(AbiItem.getSignature('function ownerOf(uint256 tokenId)')).toBe(
      'ownerOf(uint256)',
    )
    expect(AbiItem.getSignature('ownerOf(uint256)')).toBe('ownerOf(uint256)')
    expect(
      AbiItem.getSignature('processInvestment(address,uint256,bool)'),
    ).toBe('processInvestment(address,uint256,bool)')
    expect(AbiItem.getSignature('processAccount(uint256 , address)')).toBe(
      'processAccount(uint256,address)',
    )
    expect(AbiItem.getSignature('claimed()')).toBe('claimed()')
    expect(AbiItem.getSignature('function claimed()')).toBe('claimed()')
  })

  test('abi item (function)', () => {
    expect(
      AbiItem.getSignature({
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
    ).toBe('_compound(uint256,uint256,uint256)')

    expect(
      AbiItem.getSignature({
        name: 'ownerOf',
        type: 'function',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'view',
      }),
    ).toBe('ownerOf(uint256)')

    expect(
      AbiItem.getSignature({
        name: 'ownerOf',
        type: 'function',
        inputs: [{ name: '', type: 'uint256' }],
        outputs: [],
        stateMutability: 'view',
      }),
    ).toBe('ownerOf(uint256)')

    expect(
      AbiItem.getSignature({
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
    ).toBe('processInvestment(address,uint256,bool)')

    expect(
      AbiItem.getSignature({
        name: 'processAccount',
        type: 'function',
        inputs: [
          { name: '', type: 'uint256' },
          { name: '', type: 'address' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
      }),
    ).toBe('processAccount(uint256,address)')

    expect(
      AbiItem.getSignature({
        name: 'claimed',
        type: 'function',
        inputs: [],
        outputs: [],
        stateMutability: 'view',
      }),
    ).toBe('claimed()')

    expect(
      AbiItem.getSignature({
        inputs: [
          {
            components: [
              { name: 'position', type: 'uint64' },
              { name: 'owner', type: 'address' },
              { name: 'color', type: 'uint8' },
              { name: 'life', type: 'uint8' },
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
    ).toBe('forceSimpleCells((uint64,address,uint8,uint8)[])')

    expect(
      AbiItem.getSignature({
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'editionSize', type: 'uint64' },
          { name: 'royaltyBPS', type: 'uint16' },
          { name: 'fundsRecipient', type: 'address' },
          { name: 'defaultAdmin', type: 'address' },
          {
            components: [
              { name: 'publicSalePrice', type: 'uint104' },
              { name: 'maxSalePurchasePerAddress', type: 'uint32' },
              { name: 'publicSaleStart', type: 'uint64' },
              { name: 'publicSaleEnd', type: 'uint64' },
              { name: 'presaleStart', type: 'uint64' },
              { name: 'presaleEnd', type: 'uint64' },
              { name: 'presaleMerkleRoot', type: 'bytes32' },
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
    ).toBe(
      'createEdition(string,string,uint64,uint16,address,address,(uint104,uint32,uint64,uint64,uint64,uint64,bytes32),string,string,string)',
    )

    expect(
      AbiItem.getSignature({
        inputs: [
          { name: 't', type: 'address' },
          { name: 'ah', type: 'address' },
          { name: '_owner', type: 'address' },
          {
            components: [
              { name: 'maxBid', type: 'uint256' },
              { name: 'minBid', type: 'uint256' },
              { name: 'bidWindow', type: 'uint256' },
              { name: 'tip', type: 'uint256' },
              { name: 'receiver', type: 'address' },
            ],
            name: 'cfg',
            type: 'tuple',
          },
        ],
        name: 'clone',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'payable',
        type: 'function',
      }),
    ).toBe(
      'clone(address,address,address,(uint256,uint256,uint256,uint256,address))',
    )

    expect(
      AbiItem.getSignature({
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
    ).toBe(
      'createStream(address,address,uint256,address,uint256,uint256,uint8)',
    )
  })

  test('event signature', () => {
    expect(AbiItem.getSignature('Transfer(address,address,uint256)')).toBe(
      'Transfer(address,address,uint256)',
    )
    expect(
      AbiItem.getSignature(
        'Transfer(address indexed from, address indexed to, uint256 amount)',
      ),
    ).toBe('Transfer(address,address,uint256)')
    expect(
      AbiItem.getSignature(
        'event Transfer(address indexed from, address indexed to, uint256 amount)',
      ),
    ).toBe('Transfer(address,address,uint256)')
    expect(AbiItem.getSignature('drawNumber()')).toBe('drawNumber()')
    expect(AbiItem.getSignature('drawNumber( )')).toBe('drawNumber()')
    expect(
      AbiItem.getSignature(
        'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
      ),
    ).toBe(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
    )
    expect(
      AbiItem.getSignature(
        'ProcessedAccountDividendTracker(uint256 indexed foo, uint256 indexed bar, uint256 baz, uint256 a, bool b, uint256 c, address d)',
      ),
    ).toBe(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
    )
    expect(
      AbiItem.getSignature('BlackListMultipleAddresses(address[], bool)'),
    ).toBe('BlackListMultipleAddresses(address[],bool)')
    expect(AbiItem.getSignature('checkBatch(bytes)')).toBe('checkBatch(bytes)')
    expect(
      AbiItem.getSignature(
        'Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
      ),
    ).toBe('Approval(address,address,uint256)')
    expect(
      AbiItem.getSignature(
        'ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
      ),
    ).toBe('ApprovalForAll(address,address,bool)')
  })

  test('abi item (event)', () => {
    expect(
      AbiItem.getSignature({
        name: 'Transfer',
        type: 'event',
        inputs: [
          { name: 'address', type: 'address', indexed: true },
          { name: 'address', type: 'address', indexed: true },
          { name: 'uint256', type: 'uint256', indexed: false },
        ],
      }),
    ).toBe('Transfer(address,address,uint256)')

    expect(
      AbiItem.getSignature({
        name: 'Transfer',
        type: 'event',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'amount', type: 'uint256', indexed: false },
        ],
      }),
    ).toBe('Transfer(address,address,uint256)')

    expect(
      AbiItem.getSignature({
        name: 'drawNumber',
        type: 'event',
        inputs: [],
      }),
    ).toBe('drawNumber()')

    expect(
      AbiItem.getSignature({
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
    ).toBe(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
    )

    expect(
      AbiItem.getSignature({
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
    ).toBe(
      'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
    )

    expect(
      AbiItem.getSignature({
        name: 'BlackListMultipleAddresses',
        type: 'event',
        inputs: [
          { name: 'addresses', type: 'address[]', indexed: false },
          { name: 'isBlackListed', type: 'bool', indexed: false },
        ],
      }),
    ).toBe('BlackListMultipleAddresses(address[],bool)')

    expect(
      AbiItem.getSignature({
        name: 'checkBatch',
        type: 'event',
        inputs: [{ name: '', type: 'bytes', indexed: false }],
      }),
    ).toBe('checkBatch(bytes)')

    expect(
      AbiItem.getSignature({
        name: 'Approval',
        type: 'event',
        inputs: [
          { name: 'owner', type: 'address', indexed: true },
          { name: 'approved', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: true },
        ],
      }),
    ).toBe('Approval(address,address,uint256)')

    expect(
      AbiItem.getSignature({
        name: 'ApprovalForAll',
        type: 'event',
        inputs: [
          { name: 'owner', type: 'address', indexed: true },
          { name: 'operator', type: 'address', indexed: true },
          { name: 'approved', type: 'bool', indexed: false },
        ],
      }),
    ).toBe('ApprovalForAll(address,address,bool)')

    expect(
      AbiItem.getSignature({
        anonymous: false,
        inputs: [
          { indexed: false, name: 'smolRecipeId', type: 'uint256' },
          {
            components: [
              {
                components: [
                  { name: 'background', type: 'uint24' },
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
              { name: 'smolInputAmount', type: 'uint8' },
            ],
            indexed: false,
            name: 'smolData',
            type: 'tuple',
          },
        ],
        name: 'SmolRecipeAdded',
        type: 'event',
      }),
    ).toBe(
      'SmolRecipeAdded(uint256,((uint24,uint24,uint24,uint24,uint24,uint24,uint24,uint24,uint8,uint8),bool,uint8))',
    )
  })

  test('normalization', () => {
    expect(AbiItem.getSignature('foo()')).toBe('foo()')
    expect(AbiItem.getSignature('bar(uint foo)')).toBe('bar(uint)')
    expect(AbiItem.getSignature('processAccount(uint256 , address )')).toBe(
      'processAccount(uint256,address)',
    )
    expect(AbiItem.getSignature('function bar()')).toBe('bar()')
    expect(AbiItem.getSignature('function  bar( )')).toBe('bar()')
    expect(AbiItem.getSignature('event Bar()')).toBe('Bar()')
    expect(AbiItem.getSignature('function bar(uint foo)')).toBe('bar(uint)')
    expect(AbiItem.getSignature('function bar(uint foo, address baz)')).toBe(
      'bar(uint,address)',
    )
    expect(AbiItem.getSignature('event Barry(uint foo)')).toBe('Barry(uint)')
    expect(AbiItem.getSignature('Barry(uint indexed foo)')).toBe('Barry(uint)')
    expect(AbiItem.getSignature('event Barry(uint indexed foo)')).toBe(
      'Barry(uint)',
    )
    expect(
      AbiItem.getSignature(
        'function _compound(uint256 a, uint256 b, uint256 c)',
      ),
    ).toBe('_compound(uint256,uint256,uint256)')
    expect(AbiItem.getSignature('bar(uint foo, (uint baz))')).toBe(
      'bar(uint,(uint))',
    )
    expect(AbiItem.getSignature('bar(uint foo, (uint baz, bool x))')).toBe(
      'bar(uint,(uint,bool))',
    )
    expect(AbiItem.getSignature('bar(uint foo, (uint baz, bool x) foo)')).toBe(
      'bar(uint,(uint,bool))',
    )
    expect(AbiItem.getSignature('bar(uint[] foo, (uint baz, bool x))')).toBe(
      'bar(uint[],(uint,bool))',
    )
    expect(AbiItem.getSignature('bar(uint[] foo, (uint baz, bool x)[])')).toBe(
      'bar(uint[],(uint,bool)[])',
    )
    expect(AbiItem.getSignature('foo(uint bar) payable returns (uint)')).toBe(
      'foo(uint)',
    )
    expect(
      AbiItem.getSignature(
        'function submitBlocksWithCallbacks(bool isDataCompressed, bytes calldata data, ((uint16,(uint16,uint16,uint16,bytes)[])[], address[])  calldata config)',
      ),
    ).toBe(
      'submitBlocksWithCallbacks(bool,bytes,((uint16,(uint16,uint16,uint16,bytes)[])[],address[]))',
    )
    expect(
      AbiItem.getSignature(
        'function createEdition(string name, string symbol, uint64 editionSize, uint16 royaltyBPS, address fundsRecipient, address defaultAdmin, (uint104 publicSalePrice, uint32 maxSalePurchasePerAddress, uint64 publicSaleStart, uint64 publicSaleEnd, uint64 presaleStart, uint64 presaleEnd, bytes32 presaleMerkleRoot) saleConfig, string description, string animationURI, string imageURI) returns (address)',
      ),
    ).toBe(
      'createEdition(string,string,uint64,uint16,address,address,(uint104,uint32,uint64,uint64,uint64,uint64,bytes32),string,string,string)',
    )
    expect(
      AbiItem.getSignature(
        'function  createEdition(string  name,string symbol,   uint64 editionSize  , uint16   royaltyBPS,     address     fundsRecipient,   address    defaultAdmin, ( uint104   publicSalePrice  ,   uint32 maxSalePurchasePerAddress, uint64 publicSaleStart,   uint64 publicSaleEnd, uint64 presaleStart, uint64 presaleEnd, bytes32 presaleMerkleRoot) saleConfig , string description, string animationURI, string imageURI ) returns (address)',
      ),
    ).toBe(
      'createEdition(string,string,uint64,uint16,address,address,(uint104,uint32,uint64,uint64,uint64,uint64,bytes32),string,string,string)',
    )
  })

  test('error: invalid signature', () => {
    expect(() =>
      AbiItem.getSignature('bar'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[BaseError: Unable to normalize signature.]`,
    )
    expect(() =>
      AbiItem.getSignature('bar(uint foo'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[BaseError: Unable to normalize signature.]`,
    )
    expect(() =>
      AbiItem.getSignature('baruint foo)'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[BaseError: Unable to normalize signature.]`,
    )
    expect(() =>
      AbiItem.getSignature('bar(uint foo, (uint baz)'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[BaseError: Unable to normalize signature.]`,
    )
  })
})

describe('getSignatureHash', () => {
  test('default', () => {
    expect(AbiItem.getSignatureHash('function ownerOf(uint256)')).toBe(
      '0x6352211e6566aa027e75ac9dbf2423197fbd9b82b9d981a3ab367d355866aa1c',
    )
    expect(AbiItem.getSignatureHash('Transfer(address,address,uint256)')).toBe(
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    )
    expect(
      AbiItem.getSignatureHash(
        'Transfer(address indexed from, address indexed to, uint256 amount)',
      ),
    ).toBe('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef')
    expect(
      AbiItem.getSignatureHash(
        'event Transfer(address indexed from, address indexed to, uint256 amount)',
      ),
    ).toBe('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef')
    expect(AbiItem.getSignatureHash('drawNumber()')).toBe(
      '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
    )
    expect(AbiItem.getSignatureHash('drawNumber( )')).toBe(
      '0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26',
    )
    expect(
      AbiItem.getSignatureHash(
        'ProcessedAccountDividendTracker(uint256,uint256,uint256,uint256,bool,uint256,address)',
      ),
    ).toBe('0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a')
    expect(
      AbiItem.getSignatureHash(
        'ProcessedAccountDividendTracker(uint256 indexed foo, uint256 indexed bar, uint256 baz, uint256 a, bool b, uint256 c, address d)',
      ),
    ).toBe('0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a')
    expect(
      AbiItem.getSignatureHash('BlackListMultipleAddresses(address[], bool)'),
    ).toBe('0x170cd84eddb1952bf41adcce9be0e44b66ff38f07cddda1cf64d32708742bd2d')
    expect(AbiItem.getSignatureHash('checkBatch(bytes)')).toBe(
      '0x9b6f373667d9cf576e3a17e6aa047c5d864fcb7f41836b11613215db446698d8',
    )
    expect(
      AbiItem.getSignatureHash(
        'Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
      ),
    ).toBe('0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925')
    expect(
      AbiItem.getSignatureHash(
        'ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
      ),
    ).toBe('0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31')
    expect(AbiItem.getSignatureHash('function balanceOf(address owner)')).toBe(
      '0x70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be',
    )
    expect(AbiItem.getSignatureHash('function ownerOf(uint256 tokenId)')).toBe(
      '0x6352211e6566aa027e75ac9dbf2423197fbd9b82b9d981a3ab367d355866aa1c',
    )
  })

  test('abi item (function)', () => {
    expect(
      AbiItem.getSignatureHash({
        name: 'drawNumber',
        type: 'function',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
      }),
    ).toBe('0xd80ffb20d597d029eb14b9def3d14da7e6d862943d830906185b1b0b576d8f26')

    expect(
      AbiItem.getSignatureHash({
        name: 'BlackListMultipleAddresses',
        type: 'function',
        inputs: [
          { name: 'address[]', type: 'address[]' },
          { name: 'bool', type: 'bool' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
      }),
    ).toBe('0x170cd84eddb1952bf41adcce9be0e44b66ff38f07cddda1cf64d32708742bd2d')

    expect(
      AbiItem.getSignatureHash({
        name: 'checkBatch',
        type: 'function',
        inputs: [{ name: 'bytes', type: 'bytes' }],
        outputs: [],
        stateMutability: 'nonpayable',
      }),
    ).toBe('0x9b6f373667d9cf576e3a17e6aa047c5d864fcb7f41836b11613215db446698d8')

    expect(
      AbiItem.getSignatureHash({
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [],
        stateMutability: 'nonpayable',
      }),
    ).toBe('0x70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be')

    expect(
      AbiItem.getSignatureHash({
        name: 'ownerOf',
        type: 'function',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
      }),
    ).toBe('0x6352211e6566aa027e75ac9dbf2423197fbd9b82b9d981a3ab367d355866aa1c')
  })

  test('abi item (event)', () => {
    expect(
      AbiItem.getSignatureHash({
        name: 'Transfer',
        type: 'event',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'amount', type: 'uint256', indexed: false },
        ],
      }),
    ).toBe('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef')

    expect(
      AbiItem.getSignatureHash({
        name: 'ProcessedAccountDividendTracker',
        type: 'event',
        inputs: [
          { name: 'lastProcessedIndex', type: 'uint256', indexed: false },
          {
            name: 'iterationsUntilProcessed',
            type: 'uint256',
            indexed: false,
          },
          { name: 'withdrawableDividends', type: 'uint256', indexed: false },
          { name: 'totalDividends', type: 'uint256', indexed: false },
          { name: 'process', type: 'bool', indexed: false },
          { name: 'gas', type: 'uint256', indexed: false },
          { name: 'rewardsToken', type: 'address', indexed: false },
        ],
      }),
    ).toBe('0x4a73985b7c9415b88fbbfbb5e2fb377c08586d96f5c42646ecef7e3717587f6a')

    expect(
      AbiItem.getSignatureHash({
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
      AbiItem.getSignatureHash({
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
      AbiItem.getSignatureHash({
        name: 'BlackListMultipleAddresses',
        type: 'event',
        inputs: [
          { name: 'addresses', type: 'address[]', indexed: false },
          { name: 'isBlackListed', type: 'bool', indexed: false },
        ],
      }),
    ).toBe('0x170cd84eddb1952bf41adcce9be0e44b66ff38f07cddda1cf64d32708742bd2d')
  })
})
