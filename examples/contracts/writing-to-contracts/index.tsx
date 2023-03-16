import 'viem/window'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Account,
  Hash,
  TransactionReceipt,
  createWalletClient,
  createPublicClient,
  custom,
  getAccount,
  http,
  stringify,
} from 'viem'
import { goerli } from 'viem/chains'
import { wagmiContract } from './contract'

const publicClient = createPublicClient({
  chain: goerli,
  transport: http(),
})
const walletClient = createWalletClient({
  transport: custom(window.ethereum!),
})

function Example() {
  const [account, setAccount] = useState<Account>()
  const [hash, setHash] = useState<Hash>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(getAccount(address))
  }

  const mint = async () => {
    if (!account) return
    const { request } = await publicClient.simulateContract({
      ...wagmiContract,
      functionName: 'mint',
      account,
    })
    const hash = await walletClient.writeContract(request)
    setHash(hash)
  }

  useEffect(() => {
    ;(async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        setReceipt(receipt)
      }
    })()
  }, [hash, publicClient])

  if (account)
    return (
      <>
        <div>Connected: {account.address}</div>
        <button onClick={mint}>Mint</button>
        {receipt && (
          <>
            <div>
              Receipt:{' '}
              <pre>
                <code>{stringify(receipt, null, 2)}</code>
              </pre>
            </div>
          </>
        )}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
