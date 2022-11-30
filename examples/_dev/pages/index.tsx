import { useState } from 'react'
import 'viem/window'

import { HttpNetwork } from '../components/rpcs/HttpNetwork'
import { InjectedWallet } from '../components/rpcs/InjectedWallet'
import { WalletConnectWallet } from '../components/rpcs/WalletConnectWallet'

export default function Index() {
  const [rpc, setRpc] = useState('http-network')
  return (
    <div>
      <h1>viem alpha</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
        <div>
          <input
            type="radio"
            id="http-network"
            name="rpc"
            onChange={() => setRpc('http-network')}
            checked={rpc === 'http-network'}
          />
          <label htmlFor="http-network">Network: HTTP</label>
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
      {rpc === 'http-network' && <HttpNetwork />}
      {rpc === 'injected-wallet' && <InjectedWallet />}
      {rpc === 'wc-account' && <WalletConnectWallet />}
    </div>
  )
}
