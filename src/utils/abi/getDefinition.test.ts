import { expect, test } from 'vitest'

import { getDefinition } from './getDefinition'

test('foo()', () => {
  expect(
    // @ts-expect-error
    getDefinition({
      name: 'foo',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    }),
  ).toEqual('foo()')
  expect(
    getDefinition({
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
    getDefinition({
      inputs: [
        {
          internalType: 'uint256',
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
})

test('getVoter((uint256,bool,address,uint256),string[],bytes)', () => {
  expect(
    getDefinition({
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'weight',
              type: 'uint256',
            },
            {
              internalType: 'bool',
              name: 'voted',
              type: 'bool',
            },
            {
              internalType: 'address',
              name: 'delegate',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'vote',
              type: 'uint256',
            },
          ],
          internalType: 'struct Ballot.Voter',
          name: 'voter',
          type: 'tuple',
        },
        {
          internalType: 'string[]',
          name: 'foo',
          type: 'string[]',
        },
        {
          internalType: 'bytes',
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
})

test('VoterEvent((uint256,bool,address,uint256),string[],bytes)', () => {
  expect(
    getDefinition({
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'weight',
              type: 'uint256',
            },
            {
              internalType: 'bool',
              name: 'voted',
              type: 'bool',
            },
            {
              internalType: 'address',
              name: 'delegate',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'vote',
              type: 'uint256',
            },
          ],
          internalType: 'struct Ballot.Voter',
          name: 'voter',
          type: 'tuple',
        },
        {
          internalType: 'string[]',
          name: 'foo',
          type: 'string[]',
        },
        {
          internalType: 'bytes',
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
})

test('VoterError((uint256,bool,address,uint256),string[],bytes)', () => {
  expect(
    getDefinition({
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'weight',
              type: 'uint256',
            },
            {
              internalType: 'bool',
              name: 'voted',
              type: 'bool',
            },
            {
              internalType: 'address',
              name: 'delegate',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'vote',
              type: 'uint256',
            },
          ],
          internalType: 'struct Ballot.Voter',
          name: 'voter',
          type: 'tuple',
        },
        {
          internalType: 'string[]',
          name: 'foo',
          type: 'string[]',
        },
        {
          internalType: 'bytes',
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
    getDefinition({
      inputs: [
        {
          internalType: 'bytes32[]',
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

    Docs: https://viem.sh/docs/contract/getDefinition

    Version: viem@1.0.2"
  `)
})
