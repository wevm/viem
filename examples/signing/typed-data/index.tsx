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
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0x0000000000000000000000000000000000000000',
      },
      types: {
        Name: [
          { name: 'first', type: 'string' },
          { name: 'last', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'Name' },
          { name: 'wallet', type: 'address' },
          { name: 'favoriteColors', type: 'string[3]' },
          { name: 'foo', type: 'uint256' },
          { name: 'bar', type: 'int256' },
          { name: 'age', type: 'uint8' },
          { name: 'isCool', type: 'bool' },
        ],
        Mail: [
          { name: 'timestamp', type: 'uint256' },
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
          { name: 'hash', type: 'bytes' },
        ],
      },
      primaryType: 'Mail',
      message: {
        timestamp: 1234567890n,
        contents: 'Hello, Bob! 🖤',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: {
          name: {
            first: 'Cow',
            last: 'Burns',
          },
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          age: 69,
          foo: 123123123123123123n,
          bar: 12312389712123n,
          favoriteColors: ['red', 'green', 'blue'],
          isCool: false,
        },
        to: {
          name: { first: 'Bob', last: 'Builder' },
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          age: 70,
          foo: 123123123123123123n,
          bar: 12312389712123n,
          favoriteColors: ['orange', 'yellow', 'green'],
          isCool: true,
        },
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
