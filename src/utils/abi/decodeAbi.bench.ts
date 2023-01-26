import { AbiCoder } from 'ethers/lib/utils'
import { bench, describe } from 'vitest'

import { decodeAbi } from './decodeAbi'

describe('ABI Decode (static struct)', () => {
  bench('viem: `decodeAbi`', () => {
    decodeAbi({
      data: '0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002',
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
    })
  })

  bench('ethers: `AbiCoder.decode`', () => {
    const coder = new AbiCoder()
    coder.decode(
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
      '0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002',
    )
  })
})
