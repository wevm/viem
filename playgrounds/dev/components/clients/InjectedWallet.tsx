import { createWalletClient, custom } from 'viem/clients'

import { AddChain } from '../actions/AddChain'
import { GetPermissions } from '../actions/GetPermissions'
import { RequestAccountAddresses } from '../actions/RequestAccountAddresses'
import { RequestPermissions } from '../actions/RequestPermissions'
import { SendTransaction } from '../actions/SendTransaction'
import { SwitchChain } from '../actions/SwitchChain'

const client = createWalletClient({
  transport: custom(
    typeof window !== 'undefined'
      ? window.ethereum!
      : { request: async () => null },
  ),
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
      <hr />
      <h3>switch chain</h3>
      <SwitchChain client={client} />
      <hr />
      <h3>get permissions</h3>
      <GetPermissions client={client} />
      <hr />
      <h3>request permissions</h3>
      <RequestPermissions client={client} />
    </div>
  )
}
