import type { CustomSource, LocalAccount } from '../../accounts/types.js'

export type ZksyncSmartAccount = LocalAccount<'smartAccountZksync'> & {
  sign: NonNullable<CustomSource['sign']>
}
