import { AbiCoder } from 'ethers'
import { bench, describe } from 'vitest'

import { address } from '~test/src/constants.js'

import { encodeAbiParameters } from './encodeAbiParameters.js'

describe('ABI Encode', () => {
  bench('viem: `encodeAbiParameters`', () => {
    encodeAbiParameters(
      [
        {
          components: [
            {
              components: [
                {
                  name: 'x',
                  type: 'uint256',
                },
                {
                  name: 'y',
                  type: 'bool',
                },
                {
                  name: 'z',
                  type: 'address',
                },
              ],
              name: 'foo',
              type: 'tuple',
            },
            {
              components: [
                {
                  name: 'x',
                  type: 'uint256',
                },
                {
                  name: 'y',
                  type: 'bool',
                },
                {
                  name: 'z',
                  type: 'address',
                },
              ],
              name: 'baz',
              type: 'tuple',
            },
            {
              name: 'x',
              type: 'uint8[2]',
            },
          ],
          name: 'barOut',
          type: 'tuple',
        },
      ],
      [
        {
          foo: {
            x: 420n,
            y: true,
            z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          },
          baz: {
            x: 69n,
            y: false,
            z: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
          },
          x: [1, 2],
        },
      ],
    )
  })

  bench('ethers: `AbiCoder.encode`', () => {
    const coder = new AbiCoder()
    coder.encode(
      [
        {
          components: [
            {
              components: [
                {
                  name: 'x',
                  type: 'uint256',
                },
                {
                  name: 'y',
                  type: 'bool',
                },
                {
                  name: 'z',
                  type: 'address',
                },
              ],
              name: 'foo',
              type: 'tuple',
            },
            {
              components: [
                {
                  name: 'x',
                  type: 'uint256',
                },
                {
                  name: 'y',
                  type: 'bool',
                },
                {
                  name: 'z',
                  type: 'address',
                },
              ],
              name: 'baz',
              type: 'tuple',
            },
            {
              name: 'x',
              type: 'uint8[2]',
            },
          ],
          name: 'barOut',
          type: 'tuple',
        },
      ] as any,
      [
        {
          foo: {
            x: 420n,
            y: true,
            z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          },
          baz: {
            x: 69n,
            y: false,
            z: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
          },
          x: [1, 2],
        },
      ],
    )
  })
})

describe('Seaport function', () => {
  bench('viem: `encodeAbi`', () => {
    encodeAbiParameters(
      [
        {
          components: [
            { name: 'offerer', type: 'address' },
            { name: 'zone', type: 'address' },
            {
              components: [
                {
                  name: 'itemType',
                  type: 'uint8',
                },
                { name: 'token', type: 'address' },
                {
                  name: 'identifierOrCriteria',
                  type: 'uint256',
                },
                {
                  name: 'startAmount',
                  type: 'uint256',
                },
                { name: 'endAmount', type: 'uint256' },
              ],

              name: 'offer',
              type: 'tuple[]',
            },
            {
              components: [
                {
                  name: 'itemType',
                  type: 'uint8',
                },
                { name: 'token', type: 'address' },
                {
                  name: 'identifierOrCriteria',
                  type: 'uint256',
                },
                {
                  name: 'startAmount',
                  type: 'uint256',
                },
                { name: 'endAmount', type: 'uint256' },
                {
                  name: 'recipient',
                  type: 'address',
                },
              ],

              name: 'consideration',
              type: 'tuple[]',
            },
            {
              name: 'orderType',
              type: 'uint8',
            },
            { name: 'startTime', type: 'uint256' },
            { name: 'endTime', type: 'uint256' },
            { name: 'zoneHash', type: 'bytes32' },
            { name: 'salt', type: 'uint256' },
            { name: 'conduitKey', type: 'bytes32' },
            { name: 'counter', type: 'uint256' },
          ],

          name: 'orders',
          type: 'tuple[]',
        },
      ],
      [
        [
          {
            conduitKey:
              '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
            consideration: [
              {
                endAmount: 420n,
                identifierOrCriteria: 69n,
                itemType: 10,
                recipient: address.vitalik,
                startAmount: 6n,
                token: address.burn,
              },
              {
                endAmount: 141n,
                identifierOrCriteria: 55n,
                itemType: 16,
                recipient: address.vitalik,
                startAmount: 15n,
                token: address.burn,
              },
            ],
            counter: 1234123123n,
            endTime: 123123123123n,
            offer: [
              {
                endAmount: 420n,
                identifierOrCriteria: 69n,
                itemType: 10,
                startAmount: 6n,
                token: address.burn,
              },
              {
                endAmount: 11n,
                identifierOrCriteria: 515n,
                itemType: 10,
                startAmount: 6n,
                token: address.usdcHolder,
              },
              {
                endAmount: 123123n,
                identifierOrCriteria: 55555511n,
                itemType: 10,
                startAmount: 111n,
                token: address.vitalik,
              },
            ],
            offerer: address.vitalik,
            orderType: 10,
            salt: 1234123123n,
            startTime: 123123123123n,
            zone: address.vitalik,
            zoneHash:
              '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
          },
          {
            conduitKey:
              '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
            consideration: [
              {
                endAmount: 420n,
                identifierOrCriteria: 69n,
                itemType: 10,
                recipient: address.vitalik,
                startAmount: 6n,
                token: address.burn,
              },
              {
                endAmount: 141n,
                identifierOrCriteria: 55n,
                itemType: 16,
                recipient: address.vitalik,
                startAmount: 15n,
                token: address.burn,
              },
            ],
            counter: 1234123123n,
            endTime: 123123123123n,
            offer: [
              {
                endAmount: 420n,
                identifierOrCriteria: 69n,
                itemType: 10,
                startAmount: 6n,
                token: address.burn,
              },
              {
                endAmount: 11n,
                identifierOrCriteria: 515n,
                itemType: 10,
                startAmount: 6n,
                token: address.usdcHolder,
              },
              {
                endAmount: 123123n,
                identifierOrCriteria: 55555511n,
                itemType: 10,
                startAmount: 111n,
                token: address.vitalik,
              },
            ],
            offerer: address.vitalik,
            orderType: 10,
            salt: 1234123123n,
            startTime: 123123123123n,
            zone: address.vitalik,
            zoneHash:
              '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
          },
        ],
      ],
    )
  })

  bench('ethers: `AbiCoder.encode`', () => {
    const coder = new AbiCoder()
    coder.encode(
      [
        {
          components: [
            { name: 'offerer', type: 'address' },
            { name: 'zone', type: 'address' },
            {
              components: [
                {
                  name: 'itemType',
                  type: 'uint8',
                },
                { name: 'token', type: 'address' },
                {
                  name: 'identifierOrCriteria',
                  type: 'uint256',
                },
                {
                  name: 'startAmount',
                  type: 'uint256',
                },
                { name: 'endAmount', type: 'uint256' },
              ],

              name: 'offer',
              type: 'tuple[]',
            },
            {
              components: [
                {
                  name: 'itemType',
                  type: 'uint8',
                },
                { name: 'token', type: 'address' },
                {
                  name: 'identifierOrCriteria',
                  type: 'uint256',
                },
                {
                  name: 'startAmount',
                  type: 'uint256',
                },
                { name: 'endAmount', type: 'uint256' },
                {
                  name: 'recipient',
                  type: 'address',
                },
              ],

              name: 'consideration',
              type: 'tuple[]',
            },
            {
              name: 'orderType',
              type: 'uint8',
            },
            { name: 'startTime', type: 'uint256' },
            { name: 'endTime', type: 'uint256' },
            { name: 'zoneHash', type: 'bytes32' },
            { name: 'salt', type: 'uint256' },
            { name: 'conduitKey', type: 'bytes32' },
            { name: 'counter', type: 'uint256' },
          ],

          name: 'orders',
          type: 'tuple[]',
        },
      ] as any,
      [
        [
          {
            conduitKey:
              '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
            consideration: [
              {
                endAmount: 420n,
                identifierOrCriteria: 69n,
                itemType: 10,
                recipient: address.vitalik,
                startAmount: 6n,
                token: address.burn,
              },
              {
                endAmount: 141n,
                identifierOrCriteria: 55n,
                itemType: 16,
                recipient: address.vitalik,
                startAmount: 15n,
                token: address.burn,
              },
            ],
            counter: 1234123123n,
            endTime: 123123123123n,
            offer: [
              {
                endAmount: 420n,
                identifierOrCriteria: 69n,
                itemType: 10,
                startAmount: 6n,
                token: address.burn,
              },
              {
                endAmount: 11n,
                identifierOrCriteria: 515n,
                itemType: 10,
                startAmount: 6n,
                token: address.usdcHolder,
              },
              {
                endAmount: 123123n,
                identifierOrCriteria: 55555511n,
                itemType: 10,
                startAmount: 111n,
                token: address.vitalik,
              },
            ],
            offerer: address.vitalik,
            orderType: 10,
            salt: 1234123123n,
            startTime: 123123123123n,
            zone: address.vitalik,
            zoneHash:
              '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
          },
          {
            conduitKey:
              '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
            consideration: [
              {
                endAmount: 420n,
                identifierOrCriteria: 69n,
                itemType: 10,
                recipient: address.vitalik,
                startAmount: 6n,
                token: address.burn,
              },
              {
                endAmount: 141n,
                identifierOrCriteria: 55n,
                itemType: 16,
                recipient: address.vitalik,
                startAmount: 15n,
                token: address.burn,
              },
            ],
            counter: 1234123123n,
            endTime: 123123123123n,
            offer: [
              {
                endAmount: 420n,
                identifierOrCriteria: 69n,
                itemType: 10,
                startAmount: 6n,
                token: address.burn,
              },
              {
                endAmount: 11n,
                identifierOrCriteria: 515n,
                itemType: 10,
                startAmount: 6n,
                token: address.usdcHolder,
              },
              {
                endAmount: 123123n,
                identifierOrCriteria: 55555511n,
                itemType: 10,
                startAmount: 111n,
                token: address.vitalik,
              },
            ],
            offerer: address.vitalik,
            orderType: 10,
            salt: 1234123123n,
            startTime: 123123123123n,
            zone: address.vitalik,
            zoneHash:
              '0x511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511aaa511a',
          },
        ],
      ],
    )
  })
})
