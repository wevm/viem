import { describe, expect, test } from 'vitest'

import { formatEventSignature } from './formatEventSignature.js'

describe('formatEventSignature', () => {
  test('empty event', () => {
    expect(
      formatEventSignature({
        inputs: [],
        name: 'Foo',
        type: 'event',
      }),
    ).toEqual('Foo()')
  })

  test('Transfer(indexed address,indexed address,uint256)', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: true,
            name: 'from',
            type: 'address',
          },
          {
            indexed: true,
            name: 'to',
            type: 'address',
          },
          {
            indexed: false,
            name: 'value',
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      }),
    ).toEqual('Transfer(indexed address,indexed address,uint256)')
  })

  test('CreateStream(indexed address,(uint128,uint128,uint40),bool)', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: true,
            name: 'streamId',
            type: 'address',
          },
          {
            components: [
              {
                name: 'deposit',
                type: 'uint128',
              },
              {
                name: 'withdrawn',
                type: 'uint128',
              },
              {
                name: 'refunded',
                type: 'uint40',
              },
            ],
            indexed: false,
            name: 'amounts',
            type: 'tuple',
          },
          {
            indexed: false,
            name: 'cancelable',
            type: 'bool',
          },
        ],
        name: 'CreateStream',
        type: 'event',
      }),
    ).toEqual('CreateStream(indexed address,(uint128,uint128,uint40),bool)')
  })

  test('indexed tuple', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            components: [
              {
                name: 'x',
                type: 'uint256',
              },
              {
                name: 'y',
                type: 'uint256',
              },
            ],
            indexed: true,
            name: 'point',
            type: 'tuple',
          },
        ],
        name: 'PointEvent',
        type: 'event',
      }),
    ).toEqual('PointEvent(indexed (uint256,uint256))')
  })

  test('tuple array', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            components: [
              {
                name: 'x',
                type: 'uint256',
              },
              {
                name: 'y',
                type: 'uint256',
              },
            ],
            indexed: false,
            name: 'points',
            type: 'tuple[]',
          },
        ],
        name: 'PointsEvent',
        type: 'event',
      }),
    ).toEqual('PointsEvent((uint256,uint256)[])')
  })

  test('indexed tuple array', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            components: [
              {
                name: 'x',
                type: 'uint256',
              },
              {
                name: 'y',
                type: 'uint256',
              },
            ],
            indexed: true,
            name: 'points',
            type: 'tuple[]',
          },
        ],
        name: 'PointsEvent',
        type: 'event',
      }),
    ).toEqual('PointsEvent(indexed (uint256,uint256)[])')
  })

  test('mixed types', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: true,
            name: 'streamId',
            type: 'uint256',
          },
          {
            indexed: false,
            name: 'sender',
            type: 'address',
          },
          {
            indexed: true,
            name: 'recipient',
            type: 'address',
          },
          {
            indexed: true,
            name: 'asset',
            type: 'address',
          },
          {
            components: [
              {
                name: 'deposit',
                type: 'uint128',
              },
              {
                name: 'withdrawn',
                type: 'uint128',
              },
              {
                name: 'refunded',
                type: 'uint128',
              },
            ],
            indexed: false,
            name: 'amounts',
            type: 'tuple',
          },
          {
            indexed: true,
            name: 'broker',
            type: 'address',
          },
          {
            indexed: false,
            name: 'transferable',
            type: 'bool',
          },
          {
            indexed: false,
            name: 'cancelable',
            type: 'bool',
          },
          {
            components: [
              {
                name: 'start',
                type: 'uint40',
              },
              {
                name: 'cliff',
                type: 'uint40',
              },
              {
                name: 'end',
                type: 'uint40',
              },
            ],
            indexed: false,
            name: 'timestamps',
            type: 'tuple',
          },
          {
            indexed: false,
            name: 'shape',
            type: 'address',
          },
        ],
        name: 'CreateLockupLinearStream',
        type: 'event',
      }),
    ).toEqual(
      'CreateLockupLinearStream(indexed uint256,address,indexed address,indexed address,(uint128,uint128,uint128),indexed address,bool,bool,(uint40,uint40,uint40),address)',
    )
  })

  test('all non-indexed', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: false,
            name: 'a',
            type: 'uint256',
          },
          {
            indexed: false,
            name: 'b',
            type: 'address',
          },
          {
            indexed: false,
            name: 'c',
            type: 'bool',
          },
        ],
        name: 'AllNonIndexed',
        type: 'event',
      }),
    ).toEqual('AllNonIndexed(uint256,address,bool)')
  })

  test('all indexed', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: true,
            name: 'a',
            type: 'uint256',
          },
          {
            indexed: true,
            name: 'b',
            type: 'address',
          },
          {
            indexed: true,
            name: 'c',
            type: 'bool',
          },
        ],
        name: 'AllIndexed',
        type: 'event',
      }),
    ).toEqual('AllIndexed(indexed uint256,indexed address,indexed bool)')
  })

  test('no spaces after commas', () => {
    const result = formatEventSignature({
      inputs: [
        {
          indexed: true,
          name: 'a',
          type: 'address',
        },
        {
          indexed: false,
          name: 'b',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'c',
          type: 'bool',
        },
      ],
      name: 'NoSpaces',
      type: 'event',
    })

    expect(result).not.toContain(', ')
    expect(result).toEqual('NoSpaces(indexed address,uint256,indexed bool)')
  })

  test('single parameter event', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: false,
            name: 'value',
            type: 'uint256',
          },
        ],
        name: 'Bar',
        type: 'event',
      }),
    ).toEqual('Bar(uint256)')
  })

  test('deeply nested tuples with arrays', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            components: [
              {
                name: 'id',
                type: 'uint256',
              },
              {
                components: [
                  {
                    name: 'value',
                    type: 'uint128',
                  },
                  {
                    components: [
                      {
                        name: 'addr',
                        type: 'address',
                      },
                      {
                        name: 'amount',
                        type: 'uint256',
                      },
                    ],
                    name: 'inner',
                    type: 'tuple',
                  },
                ],
                name: 'middle',
                type: 'tuple[]',
              },
            ],
            indexed: false,
            name: 'outer',
            type: 'tuple',
          },
          {
            indexed: true,
            name: 'sender',
            type: 'address',
          },
        ],
        name: 'DeepNested',
        type: 'event',
      }),
    ).toEqual(
      'DeepNested((uint256,(uint128,(address,uint256))[]),indexed address)',
    )
  })

  test('event with bytes and string types', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: true,
            name: 'id',
            type: 'bytes32',
          },
          {
            indexed: false,
            name: 'data',
            type: 'bytes',
          },
          {
            indexed: false,
            name: 'message',
            type: 'string',
          },
        ],
        name: 'DataEvent',
        type: 'event',
      }),
    ).toEqual('DataEvent(indexed bytes32,bytes,string)')
  })

  test('event with all primitive types', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: true,
            name: 'u256',
            type: 'uint256',
          },
          {
            indexed: false,
            name: 'i256',
            type: 'int256',
          },
          {
            indexed: true,
            name: 'addr',
            type: 'address',
          },
          {
            indexed: false,
            name: 'flag',
            type: 'bool',
          },
          {
            indexed: false,
            name: 'data',
            type: 'bytes',
          },
          {
            indexed: false,
            name: 'text',
            type: 'string',
          },
          {
            indexed: true,
            name: 'hash',
            type: 'bytes32',
          },
        ],
        name: 'AllTypes',
        type: 'event',
      }),
    ).toEqual(
      'AllTypes(indexed uint256,int256,indexed address,bool,bytes,string,indexed bytes32)',
    )
  })

  test('ERC1155 TransferBatch event', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            indexed: true,
            name: 'operator',
            type: 'address',
          },
          {
            indexed: true,
            name: 'from',
            type: 'address',
          },
          {
            indexed: true,
            name: 'to',
            type: 'address',
          },
          {
            indexed: false,
            name: 'ids',
            type: 'uint256[]',
          },
          {
            indexed: false,
            name: 'values',
            type: 'uint256[]',
          },
        ],
        name: 'TransferBatch',
        type: 'event',
      }),
    ).toEqual(
      'TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])',
    )
  })

  test('fixed-size tuple array', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            components: [
              {
                name: 'id',
                type: 'uint256',
              },
              {
                name: 'value',
                type: 'uint256',
              },
            ],
            indexed: false,
            name: 'items',
            type: 'tuple[3]',
          },
          {
            indexed: true,
            name: 'sender',
            type: 'address',
          },
        ],
        name: 'FixedBatch',
        type: 'event',
      }),
    ).toEqual('FixedBatch((uint256,uint256)[3],indexed address)')
  })

  test('tuple with mixed array types', () => {
    expect(
      formatEventSignature({
        inputs: [
          {
            components: [
              {
                name: 'staticArray',
                type: 'uint256[5]',
              },
              {
                name: 'dynamicArray',
                type: 'address[]',
              },
              {
                name: 'nestedArray',
                type: 'uint256[][]',
              },
            ],
            indexed: false,
            name: 'arrays',
            type: 'tuple',
          },
        ],
        name: 'ArraysInTuple',
        type: 'event',
      }),
    ).toEqual('ArraysInTuple((uint256[5],address[],uint256[][]))')
  })
})
