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
import { goerli, optimismGoerli } from 'viem/chains'
import {
  getL2TransactionHashes,
  publicActionsL2,
  walletActionsL1,
} from 'viem/op-stack'
import 'viem/window'

export const publicClientL1 = createPublicClient({
  chain: goerli,
  transport: http(),
})

export const walletClientL1 = createWalletClient({
  chain: goerli,
  transport: custom(window.ethereum!),
}).extend(walletActionsL1())

export const publicClientL2 = createPublicClient({
  chain: optimismGoerli,
  transport: http(),
}).extend(publicActionsL2())

function Example() {
  const [account, setAccount] = useState<Address>()
  const [l1Hash, setL1Hash] = useState<Hash>()
  const [l1Receipt, setL1Receipt] = useState<TransactionReceipt>()
  const [l2Receipt, setL2Receipt] = useState<TransactionReceipt>()
  const [state, setState] = useState<
    'idle' | 'preparing' | 'processingL1' | 'processingL2' | 'success'
  >('idle')

  const addressInput = React.createRef<HTMLInputElement>()
  const valueInput = React.createRef<HTMLInputElement>()

  const connect = async () => {
    const [address] = await walletClientL1.requestAddresses()
    setAccount(address)
  }

  const depositTransaction = async () => {
    setState('preparing')
    const request = await publicClientL2.buildDepositTransaction({
      account,
      mint: parseEther(valueInput.current!.value as `${number}`),
      to: addressInput.current!.value as Address,
    })
    const hash = await walletClientL1.depositTransaction(request)
    setL1Hash(hash)
  }

  useEffect(() => {
    ;(async () => {
      if (!l1Hash) return
      setState('processingL1')
      const receipt = await publicClientL1.waitForTransactionReceipt({
        hash: l1Hash,
      })
      setL1Receipt(receipt)
    })()
  }, [l1Hash])

  useEffect(() => {
    ;(async () => {
      if (!l1Receipt) return
      setState('processingL2')
      const [l2Hash] = getL2TransactionHashes(l1Receipt)
      const receipt = await publicClientL2.waitForTransactionReceipt({
        hash: l2Hash,
      })
      setL2Receipt(receipt)
      setState('success')
    })()
  }, [l1Receipt])

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <input ref={addressInput} placeholder="address" />
        <input ref={valueInput} placeholder="value (ether)" />
        <button
          disabled={
            state === 'preparing' ||
            state === 'processingL1' ||
            state === 'processingL2'
          }
          onClick={depositTransaction}
        >
          {state === 'preparing'
            ? 'Preparing...'
            : state === 'processingL1' || state === 'processingL2'
              ? 'Processing...'
              : 'Deposit'}
        </button>

        {state === 'processingL1' && <div>Processing L1 transaction...</div>}
        {l1Receipt && (
          <div>
            L1 Receipt:{' '}
            <pre>
              <code>{stringify(l1Receipt, null, 2)}</code>
            </pre>
          </div>
        )}

        {state === 'processingL2' && <div>Processing L2 transaction...</div>}
        {l2Receipt && (
          <div>
            L2 Receipt:{' '}
            <pre>
              <code>{stringify(l2Receipt, null, 2)}</code>
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
