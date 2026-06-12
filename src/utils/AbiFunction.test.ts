import { describe, expect, test } from 'vitest'

import * as AbiFunction from './AbiFunction.js'

describe('getSelector', () => {
  test('default', () => {
    expect(AbiFunction.getSelector('_compound(uint256,uint256,uint256)')).toBe(
      '0xf4fbb312',
    )
    expect(
      AbiFunction.getSelector(
        'function _compound(uint256 a, uint256 b, uint256 c)',
      ),
    ).toBe('0xf4fbb312')
    expect(AbiFunction.getSelector('function ownerOf(uint256 tokenId)')).toBe(
      '0x6352211e',
    )
    expect(AbiFunction.getSelector('ownerOf(uint256)')).toBe('0x6352211e')
    expect(
      AbiFunction.getSelector('processInvestment(address,uint256,bool)'),
    ).toBe('0xcf4b8f61')
    expect(AbiFunction.getSelector('processAccount(uint256 , address )')).toBe(
      '0x73933128',
    )
    expect(AbiFunction.getSelector('claimed()')).toBe('0xe834a834')
    expect(AbiFunction.getSelector('function claimed()')).toBe('0xe834a834')
  })

  test('abi item', () => {
    expect(
      AbiFunction.getSelector({
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
    ).toBe('0xf4fbb312')

    expect(
      AbiFunction.getSelector({
        name: '_compound',
        type: 'function',
        inputs: [
          { name: '', type: 'uint256' },
          { name: '', type: 'uint256' },
          { name: '', type: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
      }),
    ).toBe('0xf4fbb312')

    expect(
      AbiFunction.getSelector({
        name: 'ownerOf',
        type: 'function',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'view',
      }),
    ).toBe('0x6352211e')

    expect(
      AbiFunction.getSelector({
        name: 'ownerOf',
        type: 'function',
        inputs: [{ name: '', type: 'uint256' }],
        outputs: [],
        stateMutability: 'view',
      }),
    ).toBe('0x6352211e')

    expect(
      AbiFunction.getSelector({
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
    ).toBe('0xcf4b8f61')

    expect(
      AbiFunction.getSelector({
        name: 'processAccount',
        type: 'function',
        inputs: [
          { name: '', type: 'uint256' },
          { name: '', type: 'address' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
      }),
    ).toBe('0x73933128')

    expect(
      AbiFunction.getSelector({
        name: 'claimed',
        type: 'function',
        inputs: [],
        outputs: [],
        stateMutability: 'view',
      }),
    ).toBe('0xe834a834')

    expect(
      AbiFunction.getSelector({
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
    ).toBe('0xd703f50a')
  })
})
