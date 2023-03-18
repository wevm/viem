import 'viem/window'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Account,
  Address,
  Hash,
  TransactionReceipt,
  createWalletClient,
  createPublicClient,
  custom,
  getAccount,
  http,
  parseEther,
  stringify,
} from 'viem'
import { goerli } from 'viem/chains'

const publicClient = createPublicClient({
  chain: goerli,
  transport: http(),
})
const walletClient = createWalletClient({
  chain: goerli,
  transport: custom(window.ethereum!),
})

function Example() {
  const [account, setAccount] = useState<Account>()
  const [hash, setHash] = useState<Hash>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()

  const addressInput = React.createRef<HTMLInputElement>()
  const valueInput = React.createRef<HTMLInputElement>()

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(getAccount(address))
  }

  const sendTransaction = async () => {
    if (!account) return
    const hash = await walletClient.sendTransaction({
      account,
      to: addressInput.current!.value as Address,
      value: parseEther(valueInput.current!.value as `${number}`),
    })
    setHash(hash)
  }

  useEffect(() => {
    ;(async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        setReceipt(receipt)
      }
    })()
  }, [hash])

  if (account)
    return (
      <>
        <div>Connected: {account.address}</div>
        <input ref={addressInput} placeholder="address" />
        <input ref={valueInput} placeholder="value (ether)" />
        <button onClick={sendTransaction}>Send</button>
        {receipt && (
          <div>
            Receipt:{' '}
            <pre>
              <code>{stringify(receipt, null, 2)}</code>
            </pre>
          </div>
        )}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
