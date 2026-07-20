import { AbiEvent, AbiParameters } from 'ox'
import type { Hex, TransactionReceipt } from 'ox'

const blockHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
const sender = '0x4200000000000000000000000000000000000007'
const target = '0x25ace71c97b33cc4729cf772ae268934f7ab5fa1'

const messagePassed = AbiEvent.from(
  'event MessagePassed(uint256 indexed nonce, address indexed sender, address indexed target, uint256 value, uint256 gasLimit, bytes data, bytes32 withdrawalHash)',
)
const topics = AbiEvent.encode(messagePassed, {
  nonce: 0n,
  sender,
  target,
}).topics.map((topic) => {
  if (typeof topic !== 'string') throw new Error('Invalid event topic.')
  return topic
})

export function getReceipt(
  options: Pick<
    TransactionReceipt.TransactionReceipt,
    'blockNumber' | 'logs' | 'transactionHash'
  >,
): TransactionReceipt.TransactionReceipt {
  return {
    blockHash,
    blockNumber: options.blockNumber,
    contractAddress: null,
    cumulativeGasUsed: 0n,
    effectiveGasPrice: 0n,
    from: sender,
    gasUsed: 0n,
    logs: options.logs,
    logsBloom: '0x',
    status: 'success',
    to: target,
    transactionHash: options.transactionHash,
    transactionIndex: 0,
    type: 'eip1559',
  }
}

export function getWithdrawalReceipt(
  options: getWithdrawalReceipt.Options,
): TransactionReceipt.TransactionReceipt {
  return getReceipt({
    blockNumber: options.blockNumber,
    logs: [
      {
        address: '0x4200000000000000000000000000000000000016',
        blockHash,
        blockNumber: options.blockNumber,
        data: AbiParameters.encode(
          [
            { type: 'uint256' },
            { type: 'uint256' },
            { type: 'bytes' },
            { type: 'bytes32' },
          ],
          [0n, 21_000n, '0x', options.withdrawalHash],
        ),
        logIndex: 0,
        removed: false,
        topics,
        transactionHash: options.transactionHash,
        transactionIndex: 0,
      },
    ],
    transactionHash: options.transactionHash,
  })
}

export declare namespace getWithdrawalReceipt {
  type Options = {
    blockNumber: bigint
    transactionHash: Hex.Hex
    withdrawalHash: Hex.Hex
  }
}
