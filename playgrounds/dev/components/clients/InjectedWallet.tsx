import { createWalletClient, ethereumProvider } from 'viem/clients'

import { AddChain } from '../actions/AddChain'
import { RequestAccountAddresses } from '../actions/RequestAccountAddresses'
import { SendTransaction } from '../actions/SendTransaction'

const client = createWalletClient({
  transport: ethereumProvider({
    provider:
      typeof window !== 'undefined'
        ? window.ethereum!
        : { request: async () => null },
  }),
})

export function InjectedWallet() {
  if (!client) return null
  return (
    <div>
      <hr />
      <h3>requestAccounts</h3>
      <RequestAccountAddresses client={client} />
      <hr />
      <h3>sendTransaction</h3>
      <SendTransaction client={client} />
      <hr />
      <h3>add chain</h3>
      <AddChain client={client} />
    </div>
  )
}
