import { expect, test } from 'vitest'

import type { RpcFeeHistory } from '../../types/rpc.js'

import { formatFeeHistory } from './feeHistory.js'

const feeHistory: RpcFeeHistory = {
  baseFeePerGas: [
    '0x27a818102',
    '0x256704d4c',
    '0x2831941e9',
    '0x25fca330e',
    '0x2433d4457',
  ],
  gasUsedRatio: [0.2726281302071925, 0.79851, 0.2803831724987217, 0.3121027],
  oldestBlock: '0xe6e55d',
  reward: [
    ['0x3b9aca00', '0x9502f900', '0x70a6e163e'],
    ['0x3b9aca00', '0x59682f00', '0x11eb2a58b4'],
    ['0x8f13544', '0x77359400', '0xac25db817'],
    ['0x3b9aca00', '0x5a6b9a89', '0x81a6b4ef2'],
  ],
}

test('deserializes fee history', () => {
  expect(formatFeeHistory(feeHistory)).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        10645242114n,
        10040134988n,
        10789405161n,
        10197021454n,
        9718023255n,
      ],
      "gasUsedRatio": [
        0.2726281302071925,
        0.79851,
        0.2803831724987217,
        0.3121027,
      ],
      "oldestBlock": 15131997n,
      "reward": [
        [
          1000000000n,
          2500000000n,
          30239757886n,
        ],
        [
          1000000000n,
          1500000000n,
          76959865012n,
        ],
        [
          150025540n,
          2000000000n,
          46210594839n,
        ],
        [
          1000000000n,
          1517001353n,
          34802978546n,
        ],
      ],
    }
  `)
})
