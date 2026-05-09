import { describe, expect, test } from 'vitest'

import { formatAbiItem, formatAbiParams } from './formatAbiItem.js'

describe('formatAbiItem', () => {
  test('foo()', () => {
    expect(
      // @ts-expect-error
      formatAbiItem({
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      }),
    ).toEqual('foo()')
    expect(
      formatAbiItem({
        inputs: [],
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      }),
    ).toEqual('foo()')
  })

  test('foo(uint256)', () => {
    expect(
      formatAbiItem({
        inputs: [
          {
            name: 'a',
            type: 'uint256',
          },
        ],
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      }),
    ).toEqual('foo(uint256)')
    expect(
      formatAbiItem(
        {
          inputs: [
            {
              name: 'a',
              type: 'uint256',
            },
          ],
          name: 'foo',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        { includeName: true },
      ),
    ).toEqual('foo(uint256 a)')
  })

  test('getVoter((uint256,bool,address,uint256),string[],bytes)', () => {
    expect(
      formatAbiItem({
        inputs: [
          {
            components: [
              {
                name: 'weight',
                type: 'uint256',
              },
              {
                name: 'voted',
                type: 'bool',
              },
              {
                name: 'delegate',
                type: 'address',
              },
              {
                name: 'vote',
                type: 'uint256',
              },
            ],
            name: 'voter',
            type: 'tuple',
          },
          {
            name: 'foo',
            type: 'string[]',
          },
          {
            name: 'bar',
            type: 'bytes',
          },
        ],
        name: 'getVoter',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      }),
    ).toEqual('getVoter((uint256,bool,address,uint256),string[],bytes)')
    expect(
      formatAbiItem(
        {
          inputs: [
            {
              components: [
                {
                  name: 'weight',
                  type: 'uint256',
                },
                {
                  name: 'voted',
                  type: 'bool',
                },
                {
                  name: 'delegate',
                  type: 'address',
                },
                {
                  name: 'vote',
                  type: 'uint256',
                },
              ],
              name: 'voter',
              type: 'tuple',
            },
            {
              name: 'foo',
              type: 'string[]',
            },
            {
              name: 'bar',
              type: 'bytes',
            },
          ],
          name: 'getVoter',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        { includeName: true },
      ),
    ).toEqual(
      'getVoter((uint256 weight, bool voted, address delegate, uint256 vote), string[] foo, bytes bar)',
    )
  })

  test('VoterEvent((uint256,bool,address,uint256),string[],bytes)', () => {
    expect(
      formatAbiItem({
        inputs: [
          {
            components: [
              {
                name: 'weight',
                type: 'uint256',
              },
              {
                name: 'voted',
                type: 'bool',
              },
              {
                name: 'delegate',
                type: 'address',
              },
              {
                name: 'vote',
                type: 'uint256',
              },
            ],
            name: 'voter',
            type: 'tuple',
          },
          {
            name: 'foo',
            type: 'string[]',
          },
          {
            name: 'bar',
            type: 'bytes',
          },
        ],
        name: 'VoterEvent',
        type: 'event',
      }),
    ).toEqual('VoterEvent((uint256,bool,address,uint256),string[],bytes)')
    expect(
      formatAbiItem(
        {
          inputs: [
            {
              components: [
                {
                  name: 'weight',
                  type: 'uint256',
                },
                {
                  name: 'voted',
                  type: 'bool',
                },
                {
                  name: 'delegate',
                  type: 'address',
                },
                {
                  name: 'vote',
                  type: 'uint256',
                },
              ],
              name: 'voter',
              type: 'tuple',
            },
            {
              name: 'foo',
              type: 'string[]',
            },
            {
              name: 'bar',
              type: 'bytes',
            },
          ],
          name: 'VoterEvent',
          type: 'event',
        },
        { includeName: true },
      ),
    ).toEqual(
      'VoterEvent((uint256 weight, bool voted, address delegate, uint256 vote), string[] foo, bytes bar)',
    )
  })

  test('VoterError((uint256,bool,address,uint256),string[],bytes)', () => {
    expect(
      formatAbiItem({
        inputs: [
          {
            components: [
              {
                name: 'weight',
                type: 'uint256',
              },
              {
                name: 'voted',
                type: 'bool',
              },
              {
                name: 'delegate',
                type: 'address',
              },
              {
                name: 'vote',
                type: 'uint256',
              },
            ],
            name: 'voter',
            type: 'tuple',
          },
          {
            name: 'foo',
            type: 'string[]',
          },
          {
            name: 'bar',
            type: 'bytes',
          },
        ],
        name: 'VoterError',
        type: 'error',
      }),
    ).toEqual('VoterError((uint256,bool,address,uint256),string[],bytes)')
  })

  test('error: invalid type', () => {
    expect(() =>
      formatAbiItem({
        inputs: [
          {
            name: 'proposalNames',
            type: 'bytes32[]',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidDefinitionTypeError: "constructor" is not a valid definition type.
      Valid types: "function", "event", "error"

      Version: viem@x.y.z]
    `)
  })
})

describe('formatAbiParams', () => {
  test('default', () => {
    expect(
      formatAbiParams([{ name: 'a', type: 'uint256' }]),
    ).toMatchInlineSnapshot('"uint256"')
    expect(
      formatAbiParams([
        {
          components: [
            {
              name: 'weight',
              type: 'uint256',
            },
            {
              name: 'voted',
              type: 'bool',
            },
            {
              name: 'delegate',
              type: 'address',
            },
            {
              name: 'vote',
              type: 'uint256',
            },
          ],
          name: 'voter',
          type: 'tuple',
        },
        {
          name: 'foo',
          type: 'string[]',
        },
        {
          name: 'bar',
          type: 'bytes',
        },
      ]),
    ).toMatchInlineSnapshot('"(uint256,bool,address,uint256),string[],bytes"')
  })

  test('includeName', () => {
    expect(
      formatAbiParams([{ name: 'a', type: 'uint256' }], { includeName: true }),
    ).toMatchInlineSnapshot('"uint256 a"')
    expect(
      formatAbiParams(
        [
          {
            components: [
              {
                name: 'weight',
                type: 'uint256',
              },
              {
                name: 'voted',
                type: 'bool',
              },
              {
                name: 'delegate',
                type: 'address',
              },
              {
                name: 'vote',
                type: 'uint256',
              },
            ],
            name: 'voter',
            type: 'tuple',
          },
          {
            name: 'foo',
            type: 'string[]',
          },
          {
            name: 'bar',
            type: 'bytes',
          },
        ],
        { includeName: true },
      ),
    ).toMatchInlineSnapshot(
      '"(uint256 weight, bool voted, address delegate, uint256 vote), string[] foo, bytes bar"',
    )
  })
})
