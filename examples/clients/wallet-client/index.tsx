import 'viem/window'
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Address, createWalletClient, custom, parseEther } from 'viem'

const walletClient = createWalletClient({
  transport: custom(window.ethereum!),
})

function Example() {
  const [account, setAccount] = useState<Address>()

  const connect = async () => {
    const accounts = await walletClient.requestAccounts()
    setAccount(accounts[0])
  }

  const sendTransaction = async () => {
    await walletClient.sendTransaction({
      from: account!,
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
