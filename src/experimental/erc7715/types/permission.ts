import type { Address } from 'abitype'

import type { OneOf } from '../../../types/utils.js'

/** @internal */
export type NativeTokenLimitPermission<amount = bigint> = {
  type: 'native-token-limit'
  data: {
    amount: amount
  }
}

/** @internal */
export type Erc20LimitPermission<amount = bigint> = {
  type: 'erc20-limit'
  data: {
    erc20Address: Address
    amount: amount
  }
}

/** @internal */
export type GasLimitPermission<amount = bigint> = {
  type: 'gas-limit'
  data: {
    amount: amount
  }
}

/** @internal */
export type ContractCallPermission = {
  type: 'contract-call'
  data: unknown
}

/** @internal */
export type RateLimitPermission = {
  type: 'rate-limit'
  data: {
    count: number
    interval: number
  }
}

export type Permission<amount = bigint> = OneOf<
  | NativeTokenLimitPermission<amount>
  | Erc20LimitPermission<amount>
  | GasLimitPermission<amount>
  | ContractCallPermission
  | RateLimitPermission
> & { required?: boolean | undefined }
