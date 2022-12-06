import { useState } from 'react'
import 'viem/window'

import { HttpPublic } from '../components/clients/HttpPublic'
import { InjectedWallet } from '../components/clients/InjectedWallet'
import { WalletConnectWallet } from '../components/clients/WalletConnectWallet'

export default function Index() {
  const [rpc, setRpc] = useState('http-public')
  return (
    <div>
      <h1>viem alpha</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
        <div>
          <input
            type="radio"
            id="http-public"
            name="rpc"
            onChange={() => setRpc('http-public')}
            checked={rpc === 'http-public'}
          />
          <label htmlFor="http-public">Public: HTTP</label>
        </div>
        <div>
          <input
            type="radio"
            id="injected-wallet"
            name="rpc"
            onChange={() => setRpc('injected-wallet')}
            checked={rpc === 'injected-wallet'}
          />
          <label htmlFor="injected-wallet">Wallet: External (Injected)</label>
        </div>
        <div>
          <input
            type="radio"
            id="wc-account"
            name="rpc"
            onChange={() => setRpc('wc-account')}
            checked={rpc === 'wc-account'}
          />
          <label htmlFor="wc-account">Wallet: External (Wallet Connect)</label>
        </div>
      </div>
      {rpc === 'http-public' && <HttpPublic />}
      {rpc === 'injected-wallet' && <InjectedWallet />}
      {rpc === 'wc-account' && <WalletConnectWallet />}
    </div>
  )
}
