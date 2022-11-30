import { createWalletRpc, external } from 'viem/rpcs'

import { RequestAccountAddresses } from '../actions/RequestAccountAddresses'
import { SendTransaction } from '../actions/SendTransaction'

const rpc = createWalletRpc(
  external({
    provider:
      typeof window !== 'undefined' ? window.ethereum : { request: () => null },
  }),
)

export function InjectedWallet() {
  if (!rpc) return null
  return (
    <div>
      <hr />
      <h3>requestAccountAddresses</h3>
      <RequestAccountAddresses rpc={rpc} />
      <hr />
      <h3>sendTransaction</h3>
      <SendTransaction rpc={rpc} />
    </div>
  )
}
