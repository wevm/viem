/** True waterfalls: each function should fail. */

import {
  client,
  getBalance,
  getBlock,
  getChainId,
  getCode,
  getGasPrice,
  readContract,
} from './client.js'

/** Two reads in sequence; neither reads the other. */
export async function independentAwaits() {
  const chainId = await getChainId()
  const block = await getBlock()
  return { chainId, block }
}

/** Destructured results and derived values do not feed the later reads. */
export async function destructured(address: string) {
  const { number, hash } = await getBlock()
  const label = `${hash}:${number}`
  const balance = await getBalance({ address })
  const code = await getCode({ address })
  return { label, balance, code }
}

/** Awaits inside one expression run one after the other. */
export async function oneExpression(address: string) {
  return {
    gasPrice: await getGasPrice(),
    balance: await getBalance({ address }),
  }
}

/** An RPC request named by its method, after a check that does not read the first result. */
export async function rpcRequests(address: string) {
  const chainId = await client.request({ method: 'eth_chainId' })
  if (!address) throw new Error('address required')
  const nonce = await client.request({
    method: 'eth_getTransactionCount',
    params: [address],
  })
  return { chainId, nonce }
}

/** A loop whose iterations only read their own item. */
export async function independentLoop(addresses: string[]) {
  const balances: bigint[] = []
  for (const address of addresses) balances.push(await getBalance({ address }))
  return balances
}

/** A counted loop that reads one contract per index. */
export async function countedLoop(address: string, count: number) {
  const values: bigint[] = []
  for (let i = 0; i < count; i++) {
    const value = await readContract({
      address,
      functionName: 'tokenOfOwnerByIndex',
      args: [i],
    })
    values.push(value)
  }
  return values
}

/** A method on an object literal, named `methods.read` in its item. */
export const methods = {
  async read(address: string) {
    const balance = await getBalance({ address })
    const code = await getCode({ address })
    return { balance, code }
  },
}

/** A read guarded by a parameter, not by the first result, can start with it. */
export async function guardedRead(address: string, gas?: bigint) {
  const code = await getCode({ address })
  gas ??= await getGasPrice()
  return { code, gas }
}

/** The first read in a branch that does not test the first result can start with it. */
export async function branchRead(address: string, withBalance: boolean) {
  const chainId = await getChainId()
  if (withBalance) {
    const balance = await getBalance({ address })
    return { chainId, balance }
  }
  return { chainId }
}
