import { AbiFunction, Abis } from 'viem/utils'

export function example() {
  return {
    balance: AbiFunction.decodeResult(
      Abis.erc20,
      'balanceOf',
      '0x000000000000000000000000000000000000000000000000000000076bbef763',
    ),
    calldata: AbiFunction.encodeData(Abis.erc20, 'transfer', [
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      1_000_000n,
    ]),
  }
}
