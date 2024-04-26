import { type Account, signatureToHex } from '../../accounts/index.js'
import { sign } from '../../accounts/utils/sign.js'
import type { Hex } from '../../types/misc.js'
import type {
  SmartAccountParams,
  ToSmartAccountParams,
} from '../accounts/toSmartAccount.js'

export type GenerateSmartAccountParams<
  TWalletAccount extends Account | undefined = Account | undefined,
> = ToSmartAccountParams<TWalletAccount> & {
  secret: Hex
}

export function generateSmartAccountParams({
  address,
  account,
  secret,
}: GenerateSmartAccountParams): SmartAccountParams {
  return {
    address,
    account,
    async sign(payload: Hex) {
      return signatureToHex(await sign({ hash: payload, privateKey: secret }))
    },
  }
}
