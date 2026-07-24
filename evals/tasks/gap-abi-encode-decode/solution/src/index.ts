import { AbiFunction, type Address, type Hex } from 'viem/utils'

const transfer = AbiFunction.from(
  'function transfer(address to, uint256 amount) returns (bool)',
)

const balanceOf = AbiFunction.from(
  'function balanceOf(address owner) returns (uint256 balance)',
)

export function encodeTransferData(
  options: encodeTransferData.Options,
): Hex.Hex {
  const { amount, to } = options
  return AbiFunction.encodeData(transfer, [to, amount])
}

export declare namespace encodeTransferData {
  type Options = {
    amount: bigint
    to: Address.Address
  }
}

export function decodeBalanceResult(
  options: decodeBalanceResult.Options,
): bigint {
  return AbiFunction.decodeResult(balanceOf, options.data)
}

export declare namespace decodeBalanceResult {
  type Options = {
    data: Hex.Hex
  }
}
