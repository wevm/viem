import { useState } from 'react'
import type { PublicClient } from 'viem'
import type { GetTransactionArgs, GetTransactionResponse } from 'viem/public'
import { getTransaction } from 'viem/public'
import type { Address } from 'viem'

export function GetTransaction({ client }: { client: PublicClient }) {
  return (
    <div>
      <GetTransactionByHash client={client} />
      <GetTransactionByHashAndIndex client={client} />
      <GetTransactionByNumberAndIndex client={client} />
      <GetTransactionByTagAndIndex client={client} />
    </div>
  )
}

function GetTransactionByHash({ client }: { client: PublicClient }) {
  const [transaction, setTransaction] = useState<GetTransactionResponse>()

  const [hash, setHash] = useState<Address>(
    '0x43261d2aa0783f4648cec5c0552f69b6d94e5f1943dea60b9117f0d152a68f11',
  )

  const handleGetTransaction = async () => {
    if (hash) {
      setTransaction(await getTransaction(client, { hash }))
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
          <button onClick={handleGetTransaction}>Get</button>
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

function GetTransactionByHashAndIndex({ client }: { client: PublicClient }) {
  const [transaction, setTransaction] = useState<GetTransactionResponse>()

  const [blockHash, setBlockHash] = useState<Address>(
    '0x5e57b4239379e3b03da75ddb8ef75effd8fb98e641a1177a8c146787f7c062ed',
  )
  const [index, setIndex] = useState<string>('0')

  const handleGetTransaction = async () => {
    if (blockHash && index) {
      setTransaction(
        await getTransaction(client, { blockHash, index: parseInt(index) }),
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
          <button onClick={handleGetTransaction}>Get</button>
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

function GetTransactionByNumberAndIndex({ client }: { client: PublicClient }) {
  const [transaction, setTransaction] = useState<GetTransactionResponse>()

  const [blockNumber, setBlockNumber] = useState<string>('15394198')
  const [index, setIndex] = useState<string>('0')

  const handleGetTransaction = async () => {
    if (blockNumber && index) {
      setTransaction(
        await getTransaction(client, {
          blockNumber: BigInt(blockNumber),
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
          <button onClick={handleGetTransaction}>Get</button>
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

function GetTransactionByTagAndIndex({ client }: { client: PublicClient }) {
  const [transaction, setTransaction] = useState<GetTransactionResponse>()

  const [blockTag, setBlockTag] =
    useState<GetTransactionArgs['blockTag']>('latest')
  const [index, setIndex] = useState<string>('0')

  const handleGetTransaction = async () => {
    if (blockTag && index) {
      setTransaction(
        await getTransaction(client, {
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
              setBlockTag(e.target.value as GetTransactionArgs['blockTag'])
            }
            value={blockTag}
          />
          <input
            placeholder="txn index (0)"
            onChange={(e) => setIndex(e.target.value)}
            value={index}
          />
          <button onClick={handleGetTransaction}>Get</button>
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
