import { type Account, sign, signatureToHex } from '../../accounts/index.js'
import type { Hex } from '../../types/misc.js'
import { concat } from '../../utils/index.js'
import type {
  SmartAccountParams,
  ToSmartAccountParams,
} from '../accounts/toSmartAccount.js'

export type GenerateMultisigSmartAccountParams<
  TWalletAccount extends Account | undefined = Account | undefined,
> = ToSmartAccountParams<TWalletAccount, true> & {
  secrets: Hex[]
}

export function generateMultisigSmartAccountParams({
  address,
  account,
  secrets,
}: GenerateMultisigSmartAccountParams): SmartAccountParams {
  return {
    address,
    account,
    async sign(payload: Hex) {
      if (!secrets || secrets.length < 2) {
        throw new Error(
          'Multiple keys are required for multisig transaction signing!',
        )
      }

      const signatures = await Promise.all(
        secrets.map(async (secret) => {
          return signatureToHex(
            await sign({ hash: payload, privateKey: secret }),
          )
        }),
      )

      return concat(signatures)
    },
  }
}
