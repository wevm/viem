import {
  type GenerateMultisigSmartAccountParams,
  generateMultisigSmartAccountParams,
} from '../utils/generateMultisigSmartAccountParams.js'
import { type SmartAccount, toSmartAccount } from './toSmartAccount.js'

export type MultisigToSmartAccountParams = GenerateMultisigSmartAccountParams

export function multisigToSmartAccount({
  address,
  secrets,
}: MultisigToSmartAccountParams): SmartAccount {
  return toSmartAccount(
    generateMultisigSmartAccountParams({ address, secrets }),
  )
}
