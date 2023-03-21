import { generateMnemonic as generateMnemonic_ } from '@scure/bip39'

export function generateMnemonic(wordlist: string[]): string {
  return generateMnemonic_(wordlist)
}
