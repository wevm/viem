import { bench, describe } from 'vitest'

import { erc20Abi } from '../../constants/abis.js'
import type { Hex } from '../../types/misc.js'
import { decodeEventLog } from './decodeEventLog.js'

const transferTopic =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const word = (n: bigint) => n.toString(16).padStart(64, '0')
const topic = (i: number) =>
  `0x${word((BigInt(i + 1) * 0x9e3779b97f4a7c15n) ** 2n)
    .slice(-40)
    .padStart(64, '0')}` as Hex

const logs = Array.from({ length: 500 }, (_, i) => ({
  data: `0x${word(BigInt(i))}` as Hex,
  topics: [transferTopic, topic(i), topic(i * 7 + 3)] as [Hex, ...Hex[]],
}))

describe('decodeEventLog (500 ERC-20 logs)', () => {
  bench('viem: `decodeEventLog`', () => {
    for (const log of logs) decodeEventLog({ abi: erc20Abi, ...log })
  })
})
