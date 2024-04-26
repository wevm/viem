import { signatureToHex } from '../../accounts/index.js'
import { sign } from '../../accounts/utils/sign.js'
import type { Hex } from '../../types/misc.js'
import type {
  SmartAccountParams,
  ToSmartAccountParams,
} from '../accounts/toSmartAccount.js'

export type GenerateSinglesigSmartAccountParams = ToSmartAccountParams & {
  secret: Hex
}
export function generateSinglesigSmartAccountParams({
  address,
  secret,
}: GenerateSinglesigSmartAccountParams): SmartAccountParams {
  return {
    address,
    async signPayload(payload: Hex) {
      return signatureToHex(await sign({ hash: payload, privateKey: secret }))
    },
  }
}
