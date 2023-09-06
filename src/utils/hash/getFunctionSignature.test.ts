import { expect, test } from 'vitest'

import { getFunctionSignature } from './getFunctionSignature.js'

test('creates function signature', () => {
  expect(getFunctionSignature('_compound(uint256,uint256,uint256)')).toEqual(
    '_compound(uint256,uint256,uint256)',
  )
  expect(
    getFunctionSignature('function _compound(uint256 a, uint256 b, uint256 c)'),
  ).toEqual('_compound(uint256,uint256,uint256)')
  expect(getFunctionSignature('function ownerOf(uint256 tokenId)')).toEqual(
    'ownerOf(uint256)',
  )
  expect(getFunctionSignature('ownerOf(uint256)')).toEqual('ownerOf(uint256)')
  expect(
    getFunctionSignature('processInvestment(address,uint256,bool)'),
  ).toEqual('processInvestment(address,uint256,bool)')
  expect(getFunctionSignature('processAccount(uint256 , address )')).toEqual(
    'processAccount(uint256,address)',
  )
  expect(getFunctionSignature('claimed()')).toEqual('claimed()')
  expect(getFunctionSignature('function claimed()')).toEqual('claimed()')
})

test('creates function signature from `AbiFunction`', () => {
  expect(
    getFunctionSignature({
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
    getFunctionSignature({
      name: 'ownerOf',
      type: 'function',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [],
      stateMutability: 'view',
    }),
  ).toEqual('ownerOf(uint256)')

  expect(
    getFunctionSignature({
      name: 'ownerOf',
      type: 'function',
      inputs: [{ name: '', type: 'uint256' }],
      outputs: [],
      stateMutability: 'view',
    }),
  ).toEqual('ownerOf(uint256)')

  expect(
    getFunctionSignature({
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
    getFunctionSignature({
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
    getFunctionSignature({
      name: 'claimed',
      type: 'function',
      inputs: [],
      outputs: [],
      stateMutability: 'view',
    }),
  ).toEqual('claimed()')

  expect(
    getFunctionSignature({
      inputs: [
        {
          components: [
            {
              internalType: 'uint64',
              name: 'position',
              type: 'uint64',
            },
            {
              internalType: 'address',
              name: 'owner',
              type: 'address',
            },
            {
              internalType: 'enum UsingStratagemsTypes.Color',
              name: 'color',
              type: 'uint8',
            },
            {
              internalType: 'uint8',
              name: 'life',
              type: 'uint8',
            },
          ],
          internalType: 'struct IStratagemsDebug.SimpleCell[]',
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
    getFunctionSignature({
      inputs: [
        { internalType: 'string', name: 'name', type: 'string' },
        { internalType: 'string', name: 'symbol', type: 'string' },
        { internalType: 'uint64', name: 'editionSize', type: 'uint64' },
        { internalType: 'uint16', name: 'royaltyBPS', type: 'uint16' },
        {
          internalType: 'address payable',
          name: 'fundsRecipient',
          type: 'address',
        },
        { internalType: 'address', name: 'defaultAdmin', type: 'address' },
        {
          components: [
            {
              internalType: 'uint104',
              name: 'publicSalePrice',
              type: 'uint104',
            },
            {
              internalType: 'uint32',
              name: 'maxSalePurchasePerAddress',
              type: 'uint32',
            },
            { internalType: 'uint64', name: 'publicSaleStart', type: 'uint64' },
            { internalType: 'uint64', name: 'publicSaleEnd', type: 'uint64' },
            { internalType: 'uint64', name: 'presaleStart', type: 'uint64' },
            { internalType: 'uint64', name: 'presaleEnd', type: 'uint64' },
            {
              internalType: 'bytes32',
              name: 'presaleMerkleRoot',
              type: 'bytes32',
            },
          ],
          internalType: 'struct IERC721Drop.SalesConfiguration',
          name: 'saleConfig',
          type: 'tuple',
        },
        { internalType: 'string', name: 'description', type: 'string' },
        { internalType: 'string', name: 'animationURI', type: 'string' },
        { internalType: 'string', name: 'imageURI', type: 'string' },
      ],
      name: 'createEdition',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }),
  ).toEqual(
    'createEdition(string,string,uint64,uint16,address,address,(uint104,uint32,uint64,uint64,uint64,uint64,bytes32),string,string,string)',
  )

  expect(
    getFunctionSignature({
      inputs: [
        {
          internalType: 'address',
          name: 't',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'ah',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_owner',
          type: 'address',
        },
        {
          components: [
            {
              internalType: 'uint256',
              name: 'maxBid',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'minBid',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'bidWindow',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'tip',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'receiver',
              type: 'address',
            },
          ],
          internalType: 'struct IBidder.Config',
          name: 'cfg',
          type: 'tuple',
        },
      ],
      name: 'clone',
      outputs: [
        {
          internalType: 'address',
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
    getFunctionSignature({
      inputs: [
        { internalType: 'address', name: 'payer', type: 'address' },
        { internalType: 'address', name: 'recipient', type: 'address' },
        { internalType: 'uint256', name: 'tokenAmount', type: 'uint256' },
        { internalType: 'address', name: 'tokenAddress', type: 'address' },
        { internalType: 'uint256', name: 'startTime', type: 'uint256' },
        { internalType: 'uint256', name: 'stopTime', type: 'uint256' },
        { internalType: 'uint8', name: 'nonce', type: 'uint8' },
      ],
      name: 'createStream',
      outputs: [{ internalType: 'address', name: 'stream', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }),
  ).toEqual(
    'createStream(address,address,uint256,address,uint256,uint256,uint8)',
  )
})
