import { type Address, parseAbi } from 'abitype'
import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'

export type CoinbaseAccount = ContractAccount

export type ToCoinbaseAccountParameters = {
  address?: Address | undefined
  owners: Address[]
  salt?: bigint | undefined
}
export type ToCoinbaseAccountReturnType = CoinbaseAccount

export function toCoinbaseAccount(
  parameters: ToCoinbaseAccountParameters,
): ToCoinbaseAccountReturnType {
  const { owners, salt = 0n } = parameters

  let address: Address | undefined = parameters.address
  let client: Client | undefined = undefined

  const contractAddress = '0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a'

  return toContractAccount({
    get address() {
      if (!address)
        throw new Error(
          '`account.setup()` must be called before accessing `account.address`.',
        )
      return address
    },
    async setup(client_) {
      client = client_
      address = await readContract(client, {
        abi: parseAbi([
          'function getAddress(bytes[], uint256) returns (address)',
        ]),
        address: contractAddress,
        functionName: 'getAddress',
        args: [owners, salt],
      })
      return this as CoinbaseAccount
    },
  })
}

///

export type ContractAccount = {
  address: Address
  setup(client: Client): Promise<ContractAccount>
  type: 'contract'
}

export type ToContractParameters = Omit<ContractAccount, 'type'>
export type ToContractAccountReturnType<
  parameters extends ToContractParameters = ToContractParameters,
> = NoInfer<parameters> & { type: ContractAccount['type'] }

export function toContractAccount<
  const parameters extends ToContractParameters,
>(parameters: parameters): ToContractAccountReturnType<parameters> {
  return Object.assign(parameters, {
    type: 'contract',
  }) as ToContractAccountReturnType<parameters>
}
