import { AbiCoder } from 'ethers'
import { bench, describe } from 'vitest'

import { decodeAbiParameters } from './decodeAbiParameters.js'

describe('ABI Decode (static struct)', () => {
  bench('viem: `decodeAbiParameters`', () => {
    decodeAbiParameters(
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
      '0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002',
    )
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
        } as any,
      ],
      '0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac00000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002',
    )
  })
})
