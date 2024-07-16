import * as React from 'react'
import ReactDOM from 'react-dom/client'
import {
  http,
  type Hex,
  type SmartAccount,
  createBundlerClient,
  createPublicClient,
  createWalletClient,
  parseEther,
} from 'viem'
import {
  type P256Credential,
  coinbase,
  createWebAuthnCredential,
  privateKeyToAccount,
  toSmartAccount,
  toWebAuthnAccount,
} from 'viem/accounts'
import { sepolia } from 'viem/chains'
import 'viem/window'

const client = createPublicClient({
  chain: sepolia,
  transport: http(import.meta.env.VITE_RPC_URL),
})
const walletClient = createWalletClient({
  account: privateKeyToAccount(import.meta.env.VITE_ACCOUNT_PRIVATE_KEY as Hex),
  chain: sepolia,
  transport: http(import.meta.env.VITE_RPC_URL),
})
const bundlerClient = createBundlerClient({
  chain: sepolia,
  client,
  transport: http(import.meta.env.VITE_BUNDLER_RPC_URL),
})

function Example() {
  const [account, setAccount] = React.useState<SmartAccount>()
  const [credential, setCredential] = React.useState<P256Credential>(() =>
    JSON.parse(localStorage.getItem('credential') || 'null'),
  )

  const [prefundHash, setPrefundHash] = React.useState<Hex>()
  const [hash, setHash] = React.useState<Hex>()
  const [userOpHash, setUserOpHash] = React.useState<Hex>()

  React.useEffect(() => {
    if (!credential) return
    toSmartAccount({
      client,
      implementation: coinbase({
        owners: [toWebAuthnAccount({ credential })],
      }),
    }).then(setAccount)
  }, [credential])

  const createCredential = async () => {
    const credential = await createWebAuthnCredential({
      name: 'Wallet',
    })
    localStorage.setItem('credential', JSON.stringify(credential))
    setCredential(credential)
  }

  const prefund = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!account) return

    const formData = new FormData(event.currentTarget)
    const value = formData.get('value') as string

    const hash = await walletClient.sendTransaction({
      to: account.address,
      value: parseEther(value),
    })
    setPrefundHash(hash)
  }

  const sendTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!account) return

    const formData = new FormData(event.currentTarget)
    const to = formData.get('to') as `0x${string}`
    const value = formData.get('value') as string

    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to,
          value: parseEther(value),
        },
      ],
    })
    setUserOpHash(hash)

    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
      hash,
    })
    setHash(receipt.transactionHash)
  }

  if (!credential)
    return <button onClick={createCredential}>Create credential</button>
  if (!account) return <p>Loading...</p>

  return (
    <>
      <h2>Account</h2>
      <p>Address: {account?.address}</p>

      <h2>Fund Account</h2>
      <form onSubmit={prefund}>
        <input name="value" placeholder="Amount (ETH)" />
        <button type="submit">Fund</button>
        {prefundHash && <p>Transaction Hash: {prefundHash}</p>}
      </form>

      <h2>Send User Operation</h2>
      <form onSubmit={sendTransaction}>
        <input name="to" placeholder="Address" />
        <input name="value" placeholder="Amount (ETH)" />
        <button type="submit">Send</button>
        {userOpHash && <p>User Operation Hash: {userOpHash}</p>}
        {hash && <p>Transaction Hash: {hash}</p>}
      </form>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
