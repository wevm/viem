import { useState } from 'react'
import 'viem/window'

import { HttpPublic } from './components/clients/HttpPublic'
import { InjectedWallet } from './components/clients/InjectedWallet'

export function App() {
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
          <label htmlFor="injected-wallet">Wallet: Injected</label>
        </div>
      </div>
      {rpc === 'http-public' && <HttpPublic />}
      {rpc === 'injected-wallet' && <InjectedWallet />}
    </div>
  )
}
