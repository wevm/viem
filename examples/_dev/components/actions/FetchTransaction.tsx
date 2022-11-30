import { useState } from 'react'
import {
  FetchTransactionArgs,
  FetchTransactionResponse,
  fetchTransaction,
} from 'viem/actions'
import { NetworkRpc } from 'viem/rpcs'
import { Address } from 'viem/utils'

export function FetchTransaction({ rpc }: { rpc: NetworkRpc }) {
  return (
    <div>
      <FetchTransactionByHash rpc={rpc} />
      <FetchTransactionByHashAndIndex rpc={rpc} />
      <FetchTransactionByNumberAndIndex rpc={rpc} />
      <FetchTransactionByTagAndIndex rpc={rpc} />
    </div>
  )
}

function FetchTransactionByHash({ rpc }: { rpc: NetworkRpc }) {
  const [transaction, setTransaction] = useState<FetchTransactionResponse>()

  const [hash, setHash] = useState<Address>(
    '0x43261d2aa0783f4648cec5c0552f69b6d94e5f1943dea60b9117f0d152a68f11',
  )

  const handleFetchTransaction = async () => {
    if (hash) {
      setTransaction(await fetchTransaction(rpc, { hash }))
    }
  }

  return (
    <details>
      <summary>txn hash</summary>
      <div>
        <div>
          <input
            placeholder="block hash (0x123)"
            onChange={(e) => setHash(e.target.value as Address)}
            value={hash}
          />
          <button onClick={handleFetchTransaction}>Fetch</button>
        </div>
        <div>
          {JSON.stringify(
            transaction,
            (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            4,
          )}
        </div>
      </div>
    </details>
  )
}

function FetchTransactionByHashAndIndex({ rpc }: { rpc: NetworkRpc }) {
  const [transaction, setTransaction] = useState<FetchTransactionResponse>()

  const [blockHash, setBlockHash] = useState<Address>(
    '0x5e57b4239379e3b03da75ddb8ef75effd8fb98e641a1177a8c146787f7c062ed',
  )
  const [index, setIndex] = useState<string>('0')

  const handleFetchTransaction = async () => {
    if (blockHash && index) {
      setTransaction(
        await fetchTransaction(rpc, { blockHash, index: parseInt(index) }),
      )
    }
  }

  return (
    <details>
      <summary>block hash + index</summary>
      <div>
        <div>
          <input
            placeholder="block hash (0x123)"
            onChange={(e) => setBlockHash(e.target.value as Address)}
            value={blockHash}
          />
          <input
            placeholder="txn index (0)"
            onChange={(e) => setIndex(e.target.value)}
            value={index}
          />
          <button onClick={handleFetchTransaction}>Fetch</button>
        </div>
        <div>
          {JSON.stringify(
            transaction,
            (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            4,
          )}
        </div>
      </div>
    </details>
  )
}

function FetchTransactionByNumberAndIndex({ rpc }: { rpc: NetworkRpc }) {
  const [transaction, setTransaction] = useState<FetchTransactionResponse>()

  const [blockNumber, setBlockNumber] = useState<string>('15394198')
  const [index, setIndex] = useState<string>('0')

  const handleFetchTransaction = async () => {
    if (blockNumber && index) {
      setTransaction(
        await fetchTransaction(rpc, {
          blockNumber: parseInt(blockNumber),
          index: parseInt(index),
        }),
      )
    }
  }

  return (
    <details>
      <summary>block number + index</summary>
      <div>
        <div>
          <input
            placeholder="block number (15394198)"
            onChange={(e) => setBlockNumber(e.target.value)}
            value={blockNumber}
          />
          <input
            placeholder="txn index (0)"
            onChange={(e) => setIndex(e.target.value)}
            value={index}
          />
          <button onClick={handleFetchTransaction}>Fetch</button>
        </div>
        <div>
          {JSON.stringify(
            transaction,
            (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            4,
          )}
        </div>
      </div>
    </details>
  )
}

function FetchTransactionByTagAndIndex({ rpc }: { rpc: NetworkRpc }) {
  const [transaction, setTransaction] = useState<FetchTransactionResponse>()

  const [blockTag, setBlockTag] =
    useState<FetchTransactionArgs['blockTag']>('latest')
  const [index, setIndex] = useState<string>('0')

  const handleFetchTransaction = async () => {
    if (blockTag && index) {
      setTransaction(
        await fetchTransaction(rpc, {
          blockTag,
          index: parseInt(index),
        }),
      )
    }
  }

  return (
    <details>
      <summary>block tag + index</summary>
      <div>
        <div>
          <input
            placeholder="block tag (latest)"
            onChange={(e) =>
              setBlockTag(e.target.value as FetchTransactionArgs['blockTag'])
            }
            value={blockTag}
          />
          <input
            placeholder="txn index (0)"
            onChange={(e) => setIndex(e.target.value)}
            value={index}
          />
          <button onClick={handleFetchTransaction}>Fetch</button>
        </div>
        <div>
          {JSON.stringify(
            transaction,
            (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            4,
          )}
        </div>
      </div>
    </details>
  )
}
