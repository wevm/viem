import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  http,
  Address,
  Hash,
  TransactionReceipt,
  createPublicClient,
  createWalletClient,
  custom,
  parseEther,
  stringify,
} from 'viem'
import { optimismSepolia, sepolia } from 'viem/chains'
import {
  GetTimeToFinalizeReturnType,
  GetTimeToProveReturnType,
  WaitToProveReturnType,
  publicActionsL1,
  publicActionsL2,
  walletActionsL1,
  walletActionsL2,
} from 'viem/op-stack'
import 'viem/window'

export const publicClientL1 = createPublicClient({
  chain: sepolia,
  transport: http(),
}).extend(publicActionsL1())

export const walletClientL1 = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),
}).extend(walletActionsL1())

export const publicClientL2 = createPublicClient({
  chain: optimismSepolia,
  transport: http(),
}).extend(publicActionsL2())

export const walletClientL2 = createWalletClient({
  chain: optimismSepolia,
  transport: custom(window.ethereum!),
}).extend(walletActionsL2())

function Example() {
  const [account, setAccount] = useState<Address>()

  const addressInput = React.createRef<HTMLInputElement>()
  const valueInput = React.createRef<HTMLInputElement>()

  const connect = async () => {
    const [address] = await walletClientL1.requestAddresses()
    setAccount(address)
  }

  ////////////////////////////////////////////////////////////////
  // Step One: Initialize Withdrawal

  const [initializeState, setInitializeState] = useState<
    'idle' | 'preparing' | 'processing' | 'success'
  >('idle')

  const [initializeHash, setInitializeHash] = useState<Hash>()
  const [initializeReceipt, setInitializeReceipt] =
    useState<TransactionReceipt>()

  const initializeTransaction = async () => {
    setInitializeState('preparing')
    const request = await publicClientL1.buildInitiateWithdrawal({
      account,
      to: addressInput.current!.value as Address,
      value: parseEther(valueInput.current!.value as `${number}`),
    })
    const hash = await walletClientL2.initiateWithdrawal(request)
    setInitializeHash(hash)
  }

  useEffect(() => {
    ;(async () => {
      if (!initializeHash) return
      setInitializeState('processing')
      const initializeReceipt = await publicClientL2.waitForTransactionReceipt({
        hash: initializeHash,
      })
      setInitializeReceipt(initializeReceipt)
      setInitializeState('success')
    })()
  }, [initializeHash])

  ////////////////////////////////////////////////////////////////
  // Step Two: Prove Withdrawal

  const [proveState, setProveState] = useState<
    'idle' | 'waiting' | 'ready' | 'preparing' | 'processing' | 'success'
  >('idle')
  const [proveTime, setProveTime] = useState<GetTimeToProveReturnType>()

  const [proveHash, setProveHash] = useState<Hash>()
  const [proveReceipt, setProveReceipt] = useState<TransactionReceipt>()

  const [output, setOutput] = useState<WaitToProveReturnType['output']>()
  const [withdrawal, setWithdrawal] =
    useState<WaitToProveReturnType['withdrawal']>()

  useEffect(() => {
    if (initializeReceipt) {
      ;(async () => {
        setProveState('waiting')
        const proveTime = await publicClientL1.getTimeToProve({
          receipt: initializeReceipt!,
          targetChain: optimismSepolia,
        })
        setProveTime(proveTime)
        const { output, withdrawal } = await publicClientL1.waitToProve({
          receipt: initializeReceipt!,
          targetChain: optimismSepolia,
        })
        setOutput(output)
        setWithdrawal(withdrawal)
        setProveState('ready')
      })()
    }
  }, [initializeReceipt])

  const proveTransaction = async () => {
    if (!output) return
    if (!withdrawal) return
    setProveState('preparing')
    const request = await publicClientL2.buildProveWithdrawal({
      account,
      output,
      withdrawal,
    })
    const hash = await walletClientL1.proveWithdrawal(request)
    setProveHash(hash)
  }

  useEffect(() => {
    ;(async () => {
      if (!proveHash) return
      setProveState('processing')
      const proveReceipt = await publicClientL1.waitForTransactionReceipt({
        hash: proveHash,
      })
      setProveReceipt(proveReceipt)
      setProveState('success')
    })()
  }, [proveHash])

  ////////////////////////////////////////////////////////////////
  // Step Three: Finalize Withdrawal

  const [finalizeState, setFinalizeState] = useState<
    'idle' | 'waiting' | 'ready' | 'preparing' | 'processing' | 'success'
  >('idle')
  const [finalizeTime, setFinalizeTime] =
    useState<GetTimeToFinalizeReturnType>()

  const [finalizeHash, setFinalizeHash] = useState<Hash>()
  const [finalizeReceipt, setFinalizeReceipt] = useState<TransactionReceipt>()

  useEffect(() => {
    if (!withdrawal) return
    if (proveReceipt) {
      ;(async () => {
        setFinalizeState('waiting')
        const finalizeTime = await publicClientL1.getTimeToFinalize({
          withdrawalHash: withdrawal.withdrawalHash,
          targetChain: optimismSepolia,
        })
        setFinalizeTime(finalizeTime)
        await publicClientL1.waitToFinalize({
          withdrawalHash: withdrawal.withdrawalHash,
          targetChain: optimismSepolia,
        })
        setFinalizeState('ready')
      })()
    }
  }, [proveReceipt, withdrawal])

  const finalizeTransaction = async () => {
    if (!account) return
    if (!withdrawal) return
    setFinalizeState('preparing')
    const hash = await walletClientL1.finalizeWithdrawal({
      account,
      withdrawal,
      targetChain: optimismSepolia,
    })
    setFinalizeHash(hash)
  }

  useEffect(() => {
    ;(async () => {
      if (!finalizeHash) return
      setFinalizeState('processing')
      const proveReceipt = await publicClientL1.waitForTransactionReceipt({
        hash: finalizeHash,
      })
      setFinalizeReceipt(proveReceipt)
      setFinalizeState('success')
    })()
  }, [finalizeHash])

  ////////////////////////////////////////////////////////////////

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <input ref={addressInput} placeholder="address" />
        <input ref={valueInput} placeholder="value (ether)" />
        <button
          disabled={
            initializeState === 'processing' || initializeState === 'preparing'
          }
          onClick={initializeTransaction}
        >
          {initializeState === 'preparing'
            ? 'Preparing...'
            : initializeState === 'processing'
              ? 'Processing...'
              : 'Initialize Withdrawal'}
        </button>

        {initializeState === 'success' && (
          <div>
            <div>Initialize Withdrawal Success. L2 Receipt:</div>
            <pre>{stringify(initializeReceipt, null, 2)}</pre>
          </div>
        )}

        {proveState === 'waiting' && (
          <>
            <div>Waiting to prove...</div>
            {proveTime && (
              <>
                <div>
                  Estimated wait time: {proveTime.seconds} seconds (
                  {proveTime.timestamp &&
                    new Date(proveTime.timestamp).toLocaleString()}
                  )
                </div>
                <div>Prove interval: {proveTime.interval}</div>
              </>
            )}
          </>
        )}
        {proveState === 'ready' && <div>Ready to prove.</div>}
        {proveState !== 'idle' && (
          <button
            disabled={
              proveState === 'processing' ||
              proveState === 'preparing' ||
              proveState === 'waiting'
            }
            onClick={proveTransaction}
          >
            {proveState === 'waiting'
              ? 'Waiting...'
              : proveState === 'preparing'
                ? 'Preparing...'
                : proveState === 'processing'
                  ? 'Processing...'
                  : 'Prove Withdrawal'}
          </button>
        )}
        {proveState === 'success' && (
          <div>
            <div>Prove Withdrawal Success. L1 Receipt:</div>
            <pre>{stringify(proveReceipt, null, 2)}</pre>
          </div>
        )}

        {finalizeState === 'waiting' && (
          <>
            <div>Waiting to finalize...</div>
            {finalizeTime && (
              <>
                <div>
                  Estimated wait time: {finalizeTime.seconds} seconds (
                  {finalizeTime.timestamp &&
                    new Date(finalizeTime.timestamp).toLocaleString()}
                  )
                </div>
                <div>Finalize period: {finalizeTime.period}</div>
              </>
            )}
          </>
        )}
        {finalizeState === 'ready' && <div>Ready to finalize.</div>}
        {finalizeState !== 'idle' && (
          <button
            disabled={
              finalizeState === 'processing' ||
              finalizeState === 'preparing' ||
              finalizeState === 'waiting'
            }
            onClick={finalizeTransaction}
          >
            {finalizeState === 'waiting'
              ? 'Waiting...'
              : finalizeState === 'preparing'
                ? 'Preparing...'
                : finalizeState === 'processing'
                  ? 'Processing...'
                  : 'Finalize Withdrawal'}
          </button>
        )}
        {finalizeState === 'success' && (
          <div>
            <div>Finalize Withdrawal Success. L1 Receipt:</div>
            <pre>{stringify(finalizeReceipt, null, 2)}</pre>
          </div>
        )}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
