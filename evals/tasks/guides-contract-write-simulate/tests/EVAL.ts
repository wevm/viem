import { readFileSync, readdirSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { transferToken } from '../src/index.ts'

// Dev account 0 deploys the token; the constructor mints it the full supply.
const holder = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const supply = 1_000_000_000_000_000_000_000_000_000n // minted by constructor

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

// Minimal ERC-20 with a (string name, string symbol, uint8 decimals)
// constructor; mints the full supply to the deployer. Solidity 0.8 checked
// arithmetic makes over-balance transfers revert.
const tokenBytecode =
  '0x608060405234801561000f575f80fd5b50604051620008f7380380620008f783398101604081905261003091610170565b5f61003b848261026b565b506001610048838261026b565b506002805460ff191660ff83161790556b033b2e3c9fd0803ce80000006003819055335f81815260046020908152604080832085905551938452919290917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a350505061032a565b634e487b7160e01b5f52604160045260245ffd5b5f82601f8301126100dc575f80fd5b81516001600160401b03808211156100f6576100f66100b9565b604051601f8301601f19908116603f0116810190828211818310171561011e5761011e6100b9565b816040528381526020925086602085880101111561013a575f80fd5b5f91505b8382101561015b578582018301518183018401529082019061013e565b5f602085830101528094505050505092915050565b5f805f60608486031215610182575f80fd5b83516001600160401b0380821115610198575f80fd5b6101a4878388016100cd565b945060208601519150808211156101b9575f80fd5b506101c6868287016100cd565b925050604084015160ff811681146101dc575f80fd5b809150509250925092565b600181811c908216806101fb57607f821691505b60208210810361021957634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561026657805f5260205f20601f840160051c810160208510156102445750805b601f840160051c820191505b81811015610263575f8155600101610250565b50505b505050565b81516001600160401b03811115610284576102846100b9565b6102988161029284546101e7565b8461021f565b602080601f8311600181146102cb575f84156102b45750858301515b5f19600386901b1c1916600185901b178555610322565b5f85815260208120601f198616915b828110156102f9578886015182559484019460019091019084016102da565b508582101561031657878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b6105bf80620003385f395ff3fe608060405234801561000f575f80fd5b5060043610610090575f3560e01c8063313ce56711610063578063313ce567146100ff57806370a082311461011e57806395d89b411461013d578063a9059cbb14610145578063dd62ed3e14610158575f80fd5b806306fdde0314610094578063095ea7b3146100b257806318160ddd146100d557806323b872dd146100ec575b5f80fd5b61009c610182565b6040516100a991906103fe565b60405180910390f35b6100c56100c0366004610465565b61020d565b60405190151581526020016100a9565b6100de60035481565b6040519081526020016100a9565b6100c56100fa36600461048d565b610279565b60025461010c9060ff1681565b60405160ff90911681526020016100a9565b6100de61012c3660046104c6565b60046020525f908152604090205481565b61009c610363565b6100c5610153366004610465565b610370565b6100de6101663660046104e6565b600560209081525f928352604080842090915290825290205481565b5f805461018e90610517565b80601f01602080910402602001604051908101604052809291908181526020018280546101ba90610517565b80156102055780601f106101dc57610100808354040283529160200191610205565b820191905f5260205f20905b8154815290600101906020018083116101e857829003601f168201915b505050505081565b335f8181526005602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906102679086815260200190565b60405180910390a35060015b92915050565b6001600160a01b0383165f9081526005602090815260408083203384529091528120805483919083906102ad908490610563565b90915550506001600160a01b0384165f90815260046020526040812080548492906102d9908490610563565b90915550506001600160a01b0383165f9081526004602052604081208054849290610305908490610576565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161035191815260200190565b60405180910390a35060019392505050565b6001805461018e90610517565b335f90815260046020526040812080548391908390610390908490610563565b90915550506001600160a01b0383165f90815260046020526040812080548492906103bc908490610576565b90915550506040518281526001600160a01b0384169033907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90602001610267565b5f602080835283518060208501525f5b8181101561042a5785810183015185820160400152820161040e565b505f604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b0381168114610460575f80fd5b919050565b5f8060408385031215610476575f80fd5b61047f8361044a565b946020939093013593505050565b5f805f6060848603121561049f575f80fd5b6104a88461044a565b92506104b66020850161044a565b9150604084013590509250925092565b5f602082840312156104d6575f80fd5b6104df8261044a565b9392505050565b5f80604083850312156104f7575f80fd5b6105008361044a565b915061050e6020840161044a565b90509250929050565b600181811c9082168061052b57607f821691505b60208210810361054957634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52601160045260245ffd5b818103818111156102735761027361054f565b808201808211156102735761027361054f56fea264697066735822122082d8c56bc7763fa6e0b834b753d19bc4aff201712d635fbc15afc900749de91b64736f6c63430008170033'

// abi.encode('Sim Test Token', 'SIM', 18)
const constructorArgs =
  '000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000e53696d205465737420546f6b656e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000353494d0000000000000000000000000000000000000000000000000000000000'

// JSON-RPC-level failure; never retried unless the fork upstream hiccuped.
class RpcError extends Error {}

// Upstream fork rate limits (429) surface as JSON-RPC "Fork Error"s.
const forkTransient = /Too many request|429|rate limit|Fork Error/i

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function rpcOnce(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new RpcError(error.message)
  return result
}

// Retry any network-level failure (ENOTFOUND, fetch failed, socket drops)
// under full-suite docker load. Non-transient RPC errors rethrow immediately.
async function rpc(method: string, params: unknown[]) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await rpcOnce(method, params)
    } catch (error) {
      if (error instanceof RpcError && !forkTransient.test(error.message))
        throw error
      if (attempt >= 10) throw error
      await sleep(1_000)
    }
  }
}

// Deadline-based polling; transient errors count as not-yet-mined.
async function getMinedReceipt(hash: string) {
  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    const receipt = await rpc('eth_getTransactionReceipt', [hash]).catch(
      (error) => {
        if (error instanceof RpcError && !forkTransient.test(error.message))
          throw error
        return null
      },
    )
    if (receipt) return receipt
    await sleep(500)
  }
  throw new Error(`no receipt for ${hash}`)
}

// Automine mines each accepted send immediately; recover a lost hash by
// scanning recent blocks for the sender transaction with the captured nonce.
async function findTxHash(from: string, nonce: bigint) {
  const latest = BigInt(await rpc('eth_blockNumber', []))
  const floor = latest > 32n ? latest - 32n : 0n
  for (let n = latest; n >= floor; n--) {
    const block = await rpc('eth_getBlockByNumber', [
      `0x${n.toString(16)}`,
      true,
    ])
    for (const tx of block?.transactions ?? [])
      if (
        tx.from.toLowerCase() === from.toLowerCase() &&
        BigInt(tx.nonce) === nonce
      )
        return tx.hash as string
  }
  return null
}

// Non-idempotent: send once, then confirm via the sender's pending nonce.
// Re-send only when the node provably never received the transaction.
async function send(tx: { from: string } & Record<string, unknown>) {
  const deadline = Date.now() + 120_000
  for (;;) {
    const nonce = BigInt(
      await rpc('eth_getTransactionCount', [tx.from, 'pending']),
    )
    try {
      return (await rpcOnce('eth_sendTransaction', [tx])) as string
    } catch (error) {
      if (error instanceof RpcError && !forkTransient.test(error.message))
        throw error
      for (let i = 0; i < 5; i++) {
        await sleep(1_000)
        const now = BigInt(
          await rpc('eth_getTransactionCount', [tx.from, 'pending']),
        )
        if (now > nonce) {
          const hash = await findTxHash(tx.from, nonce)
          if (hash) return hash
        }
      }
      if (Date.now() > deadline) throw error
    }
  }
}

async function deployToken() {
  const hash = await send({
    from: holder,
    data: tokenBytecode + constructorArgs,
  })
  const receipt = await getMinedReceipt(hash)
  if (receipt.status !== '0x1' || !receipt.contractAddress)
    throw new Error('token deployment failed')
  return receipt.contractAddress as `0x${string}`
}

async function balanceOf(token: string, owner: string) {
  const data = `0x70a08231${owner.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: token, data }, 'latest']))
}

async function nonceOf(address: string) {
  return BigInt(await rpc('eth_getTransactionCount', [address, 'latest']))
}

function sources() {
  return readdirSync('src', { recursive: true })
    .filter((file) => String(file).endsWith('.ts'))
    .map((file) => readFileSync(`src/${file}`, 'utf8'))
    .join('\n')
}

test('uses viem', () => {
  expect(sources()).toMatch(/from ['"]viem/)
}, 90_000)

test('simulates, writes, and balances shift exactly', async () => {
  const token = await deployToken()
  const amount = 12_345_000_000_000_000_000n

  expect(await balanceOf(token, holder)).toBe(supply)
  expect(await balanceOf(token, recipient)).toBe(0n)

  const { simulated, receipt } = await transferToken(client, {
    amount,
    to: recipient,
    token,
  })

  // ERC-20 `transfer` returns true; the simulation must surface it.
  expect(simulated).toBe(true)
  expect(receipt.status).toBe('success')

  // The receipt must correspond to a mined transfer to the token.
  const mined = await getMinedReceipt(receipt.transactionHash)
  expect(mined.status).toBe('0x1')
  expect(mined.from.toLowerCase()).toBe(holder.toLowerCase())
  expect(mined.to.toLowerCase()).toBe(token.toLowerCase())

  expect(await balanceOf(token, holder)).toBe(supply - amount)
  expect(await balanceOf(token, recipient)).toBe(amount)
}, 180_000)

test('a reverting transfer propagates and broadcasts nothing', async () => {
  const token = await deployToken()
  const nonceBefore = await nonceOf(holder)

  // Exceeds the holder balance, so the dry run reverts.
  await expect(
    transferToken(client, {
      amount: supply + 1n,
      to: recipient,
      token,
    }),
  ).rejects.toThrow()

  expect(await nonceOf(holder)).toBe(nonceBefore)
  expect(await balanceOf(token, holder)).toBe(supply)
  expect(await balanceOf(token, recipient)).toBe(0n)
}, 180_000)
