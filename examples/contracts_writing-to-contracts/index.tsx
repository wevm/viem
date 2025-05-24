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
  stringify,
} from 'viem'
import { sepolia } from 'viem/chains'
import 'viem/window'
import { wagmiContract } from './contract'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})
const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),
})

type Image = {
  id: number
  name: string
  src: string
}

function decodeUri(uri: string): Image {
  const base64 = uri.split(',')[1]
  const obj = JSON.parse(atob(base64))
  return {
    id: +obj.name.split('#')[1],
    name: obj.name,
    src: obj.image,
  }
}

function Example() {
  const [account, setAccount] = useState<Address>()
  const [hash, setHash] = useState<Hash>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()
  const [image, setImage] = useState<Image>()

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(address)
    walletClient.switchChain({ id: sepolia.id })
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
  }, [hash])

  useEffect(() => {
    ;(async () => {
      if (receipt) {
        const tokenNumber = Number(receipt?.logs?.[0]?.topics?.[3] ?? 1)
        const uri = await publicClient.readContract({
          ...wagmiContract,
          functionName: 'tokenURI',
          args: [BigInt(tokenNumber)],
        })
        const image = decodeUri(uri)
        setImage(image)
      }
    })()
  }, [receipt])

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <button onClick={mint}>Mint</button>
        {receipt && (
          <div>
            Receipt:{' '}
            <pre>
              <code>{stringify(receipt, null, 2)}</code>
            </pre>
          </div>
        )}
        {image && (
          <div>
            <a
              href={`https://sepolia.etherscan.io/nft/${wagmiContract.address}/${image.id}`}
              style={{ display: 'block' }}
              target="_blank"
              rel="noreferrer"
            >
              {image.name}
            </a>
            <img src={image.src} alt={image.name} title={image.name} width={80} />
          </div>
        )}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
