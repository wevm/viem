import { useState } from 'react'
import 'viem/window'

import { HttpNetwork } from '../components/providers/HttpNetwork'
import { InjectedAccount } from '../components/providers/InjectedAccount'
import { InjectedWallet } from '../components/providers/InjectedWallet'
import { WalletConnectAccount } from '../components/providers/WalletConnectAccount'

export default function Index() {
  const [provider, setProvider] = useState('http-network')
  return (
    <div>
      <h1>viem alpha</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
        <div>
          <input
            type="radio"
            id="http-network"
            name="provider"
            onChange={() => setProvider('http-network')}
            checked={provider === 'http-network'}
          />
          <label htmlFor="http-network">Network: httpProvider</label>
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
      {provider === 'http-network' && <HttpNetwork />}
      {provider === 'injected-wallet' && <InjectedWallet />}
      {provider === 'injected-account' && <InjectedAccount />}
      {provider === 'wc-account' && <WalletConnectAccount />}
    </div>
  )
}
