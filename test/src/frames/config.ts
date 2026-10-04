import { privateKeyToAccount } from '../../../src/accounts/privateKeyToAccount.js'
import {
  type Account,
  type Address,
  type ClientConfig,
  createClient,
  defineChain,
  http,
  type Transport,
} from '../../../src/index.js'
import * as constants from '../constants.js'
import { rpcUrl } from './prool.js'

export const accounts = [
  privateKeyToAccount(constants.accounts[0].privateKey),
  privateKeyToAccount(constants.accounts[1].privateKey),
] as const

export const chain = defineChain({
  id: 8141,
  name: 'Frame Transactions',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: [rpcUrl] } },
})

export function getClient<
  account extends Account | Address | undefined = undefined,
>(
  options: Partial<
    Pick<
      ClientConfig<Transport, typeof chain, account>,
      'account' | 'transport'
    >
  > = {},
) {
  return createClient({
    cacheTime: 0,
    chain,
    pollingInterval: 100,
    transport: http(rpcUrl),
    ...options,
  })
}
