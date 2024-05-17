import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { type Address, createWalletClient, custom, parseEther } from 'viem'
import { goerli } from 'viem/chains'
import 'viem/window'

const walletClient = createWalletClient({
  chain: goerli,
  transport: custom(window.ethereum!),
})

function Example() {
  const [account, setAccount] = useState<Address>()

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(address)
  }

  const sendTransaction = async () => {
    if (!account) return
    await walletClient.sendTransaction({
      account,
      to: '0x0000000000000000000000000000000000000000',
      value: parseEther('0.000001'),
    })
  }

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <button onClick={sendTransaction}>Send Transaction</button>
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
