import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { type Address, type Hash, createWalletClient, custom } from 'viem'
import { goerli } from 'viem/chains'
import 'viem/window'

const walletClient = createWalletClient({
  chain: goerli,
  transport: custom(window.ethereum!),
})

function Example() {
  const [account, setAccount] = useState<Address>()
  const [signature, setSignature] = useState<Hash>()

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(address)
  }

  const signTypedData = async () => {
    if (!account) return
    const signature = await walletClient.signTypedData({
      account,
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0x0000000000000000000000000000000000000000',
      },
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
        <div>Connected: {account}</div>
        <button onClick={signTypedData}>Sign Typed Data</button>
        {signature && <div>Receipt: {signature}</div>}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
