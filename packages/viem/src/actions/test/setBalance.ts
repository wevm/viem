import { TestProvider } from '../../providers/test/createTestProvider'
import { Address } from '../../types/ethereum-provider'
import { numberToHex } from '../../utils'

export type SetBalanceArgs = {
  /** The account address. */
  address: Address
  /** Amount (in wei) to set */
  value: bigint
}

export async function setBalance(
  provider: TestProvider,
  { address, value }: SetBalanceArgs,
) {
  return await provider.request({
    method: `${provider.id}_setBalance`,
    params: [address, numberToHex(value)],
  })
}
