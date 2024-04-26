import { sign, signatureToHex } from '../../accounts/index.js'
import type { Hex } from '../../types/misc.js'
import { concat } from '../../utils/index.js'
import type {
  SmartAccountParams,
  ToSmartAccountParams,
} from '../accounts/toSmartAccount.js'

export type GenerateMultisigSmartAccountParams = ToSmartAccountParams & {
  secrets: Hex[]
}

export function generateMultisigSmartAccountParams({
  address,
  secrets,
}: GenerateMultisigSmartAccountParams): SmartAccountParams {
  return {
    address,
    async signPayload(payload: Hex) {
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
