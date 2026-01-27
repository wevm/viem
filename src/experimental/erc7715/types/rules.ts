import type { OneOf } from '../../../types/utils.js'

/** @internal */
export type BaseRule = {
  data: unknown
  type: string
}

/** @internal */
export type ExpiryRule = {
  type: 'expiry'
  data: {
    /** Unix timestamp when the permission MUST expire. */
    timestamp: number
  }
}

export type Rule = OneOf<BaseRule, ExpiryRule>
