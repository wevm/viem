import {
  type GenerateSinglesigSmartAccountParams,
  generateSinglesigSmartAccountParams,
} from '../utils/generateSinglesigSmartAccountParams.js'
import { type SmartAccount, toSmartAccount } from './toSmartAccount.js'

export type SinglesigSmartAccountParams = GenerateSinglesigSmartAccountParams

export function singlesigToSmartAccount({
  address,
  secret,
}: SinglesigSmartAccountParams): SmartAccount {
  return toSmartAccount(
    generateSinglesigSmartAccountParams({ address, secret }),
  )
}
