import { EthereumProvider } from '@walletconnect/ethereum-provider'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  http,
  type Address,
  type Hash,
  type TransactionReceipt,
  createPublicClient,
  createWalletClient,
  custom,
  parseEther,
  stringify,
} from 'viem'
import { mainnet } from 'viem/chains'
import 'viem/window'

const projectId = 'fdb8164b4aa07b46f14e131f5c7c5903'

const provider = await EthereumProvider.init({
  chains: [1],
  projectId,
  showQrModal: true,
})

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(provider),
})

function Example() {
  const [account, setAccount] = useState<Address>()
  const [hash, setHash] = useState<Hash>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()

  const addressInput = React.createRef<HTMLInputElement>()
  const valueInput = React.createRef<HTMLInputElement>()

  const connect = async () => {
    await provider.connect()
    const [address] = await walletClient.getAddresses()
    setAccount(address)
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
        <div>Connected: {account}</div>
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
