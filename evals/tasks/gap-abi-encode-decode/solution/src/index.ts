import { AbiFunction } from 'viem/utils'

const transfer = AbiFunction.from(
  'function transfer(address to, uint256 amount) returns (bool)',
)

const balanceOf = AbiFunction.from(
  'function balanceOf(address owner) returns (uint256 balance)',
)

export function example() {
  return {
    balance: AbiFunction.decodeResult(
      balanceOf,
      '0x000000000000000000000000000000000000000000000000000000076bbef763',
    ),
    calldata: AbiFunction.encodeData(transfer, [
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      1_000_000n,
    ]),
  }
}
