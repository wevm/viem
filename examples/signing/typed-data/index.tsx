import 'viem/window'
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Account, Hash, createWalletClient, custom, getAccount } from 'viem'

const walletClient = createWalletClient({
  transport: custom(window.ethereum!),
})

function Example() {
  const [account, setAccount] = useState<Account>()
  const [signature, setSignature] = useState<Hash>()

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(getAccount(address))
  }

  const signTypedData = async () => {
    if (!account) return
    const signature = await walletClient.signTypedData({
      account,
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    })
    setSignature(signature)
  }

  if (account)
    return (
      <>
        <div>Connected: {account.address}</div>
        <button onClick={signTypedData}>Sign Typed Data</button>
        {signature && <div>Receipt: {signature}</div>}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
