import { useState } from 'react'
import 'viem/window'

import { AlchemyNetwork } from '../components/providers/AlchemyNetwork'
import { InjectedAccount } from '../components/providers/InjectedAccount'
import { InjectedWallet } from '../components/providers/InjectedWallet'
import { WalletConnectAccount } from '../components/providers/WalletConnectAccount'

export default function Index() {
  const [provider, setProvider] = useState('alchemy-network')
  return (
    <div>
      <h1>𝐯𝐢𝐞𝐦 alpha</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
        <div>
          <input
            type="radio"
            id="alchemy-network"
            name="provider"
            onChange={() => setProvider('alchemy-network')}
            checked={provider === 'alchemy-network'}
          />
          <label htmlFor="alchemy-network">Network: alchemyProvider</label>
        </div>
        <div>
          <input
            type="radio"
            id="injected-wallet"
            name="provider"
            onChange={() => setProvider('injected-wallet')}
            checked={provider === 'injected-wallet'}
          />
          <label htmlFor="injected-wallet">Wallet: injectedProvider</label>
        </div>
        <div>
          <input
            type="radio"
            id="injected-account"
            name="provider"
            onChange={() => setProvider('injected-account')}
            checked={provider === 'injected-account'}
          />
          <label htmlFor="injected-account">Account: injectedProvider</label>
        </div>
        <div>
          <input
            type="radio"
            id="wc-account"
            name="provider"
            onChange={() => setProvider('wc-account')}
            checked={provider === 'wc-account'}
          />
          <label htmlFor="wc-account">
            Account: externalProvider (Wallet Connect)
          </label>
        </div>
      </div>
      {provider === 'alchemy-network' && <AlchemyNetwork />}
      {provider === 'injected-wallet' && <InjectedWallet />}
      {provider === 'injected-account' && <InjectedAccount />}
      {provider === 'wc-account' && <WalletConnectAccount />}
    </div>
  )
}
