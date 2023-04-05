import { expect, test } from 'vitest'

import { formatAbiItem } from './formatAbiItem.js'

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
      outputs: [],
      stateMutability: 'nonpayable',
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
        outputs: [],
        stateMutability: 'nonpayable',
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
      outputs: [],
      stateMutability: 'nonpayable',
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
    "\\"constructor\\" is not a valid definition type.
    Valid types: \\"function\\", \\"event\\", \\"error\\"

    Version: viem@1.0.2"
  `)
})
