import { AbiCoder } from 'ethers/lib/utils'
import { bench, describe } from 'vitest'

import { encodeAbi } from './encodeAbi'

describe('ABI Encode', () => {
  bench('viem: `encodeAbi`', () => {
    encodeAbi({
      params: [
        {
          components: [
            {
              components: [
                {
                  internalType: 'uint256',
                  name: 'x',
                  type: 'uint256',
                },
                {
                  internalType: 'bool',
                  name: 'y',
                  type: 'bool',
                },
                {
                  internalType: 'address',
                  name: 'z',
                  type: 'address',
                },
              ],
              internalType: 'struct ABIExample.Foo',
              name: 'foo',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'uint256',
                  name: 'x',
                  type: 'uint256',
                },
                {
                  internalType: 'bool',
                  name: 'y',
                  type: 'bool',
                },
                {
                  internalType: 'address',
                  name: 'z',
                  type: 'address',
                },
              ],
              internalType: 'struct ABIExample.Foo',
              name: 'baz',
              type: 'tuple',
            },
            {
              internalType: 'uint8[2]',
              name: 'x',
              type: 'uint8[2]',
            },
          ],
          internalType: 'struct ABIExample.Bar',
          name: 'barOut',
          type: 'tuple',
        },
      ],
      values: [
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
    })
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
                  internalType: 'uint256',
                  name: 'x',
                  type: 'uint256',
                },
                {
                  internalType: 'bool',
                  name: 'y',
                  type: 'bool',
                },
                {
                  internalType: 'address',
                  name: 'z',
                  type: 'address',
                },
              ],
              internalType: 'struct ABIExample.Foo',
              name: 'foo',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'uint256',
                  name: 'x',
                  type: 'uint256',
                },
                {
                  internalType: 'bool',
                  name: 'y',
                  type: 'bool',
                },
                {
                  internalType: 'address',
                  name: 'z',
                  type: 'address',
                },
              ],
              internalType: 'struct ABIExample.Foo',
              name: 'baz',
              type: 'tuple',
            },
            {
              internalType: 'uint8[2]',
              name: 'x',
              type: 'uint8[2]',
            },
          ],
          internalType: 'struct ABIExample.Bar',
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
})
