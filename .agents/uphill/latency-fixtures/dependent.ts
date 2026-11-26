/** True non-waterfalls: each function should pass. */

import {
  assertChain,
  getBalance,
  getBlock,
  getChainId,
  getCode,
  getTransactionCount,
  getTransactionReceipt,
  readContract,
  sendTransaction,
  wait,
  waitForTransactionReceipt,
  writeContract,
} from './client.js'

/** The second read takes the first result. */
export async function dataDependency(address: string) {
  const block = await getBlock()
  const balance = await getBalance({ address, blockNumber: block.number })
  return balance
}

/** The dependency passes through a destructured binding and a derived variable. */
export async function derivedDependency(address: string) {
  const { number } = await getBlock()
  const previous = number - 1n
  return await getBalance({ address, blockNumber: previous })
}

/** An early return on the first result saves the second request. */
export async function controlDependency(address: string) {
  const code = await getCode({ address })
  if (!code) return undefined
  const balance = await getBalance({ address })
  return balance
}

/** An assertion on the first result must throw before the second request. */
export async function assertion() {
  const chainId = await getChainId()
  assertChain(chainId)
  const block = await getBlock()
  return block
}

/** A write, then the receipt of its hash. */
export async function sendThenWait(to: string) {
  const hash = await sendTransaction({ to })
  return await waitForTransactionReceipt({ hash })
}

/** A write, then a read of the state it changed. */
export async function writeThenRead(address: string) {
  await writeContract({ address, functionName: 'increment' })
  return await readContract({ address, functionName: 'count' })
}

/** A nonce read, then two sends that must keep their order. */
export async function nonces(address: string, to: string) {
  const nonce = await getTransactionCount({ address })
  await sendTransaction({ to, nonce })
  await sendTransaction({ to, nonce: nonce + 1 })
}

/** A try/catch around one await handles that request's failure on its own. */
export async function tryCatch(address: string) {
  const balance = await getBalance({ address })
  let code: string | undefined
  try {
    code = await getCode({ address })
  } catch {
    code = undefined
  }
  return { balance, code }
}

/** Awaits in `finally` clean up in order. */
export async function finallyBlock(address: string) {
  try {
    return await getBalance({ address })
  } finally {
    await getCode({ address })
    await getBlock()
  }
}

/** A polling loop waits between reads on purpose. */
export async function polling(hash: string) {
  while (true) {
    const receipt = await getTransactionReceipt({ hash })
    if (receipt) return receipt
    await wait(1_000)
  }
}

/** A retry loop stops at the first success. */
export async function retry(address: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = await getCode({ address })
    if (code) return code
  }
  return undefined
}

/** Each iteration reads a cursor the previous one wrote. */
export async function pagination(address: string, pages: number[]) {
  let blockNumber = 0n
  const balances: bigint[] = []
  for (const _ of pages) {
    const balance = await getBalance({ address, blockNumber })
    balances.push(balance)
    blockNumber += balance
  }
  return balances
}

/** Sends in a loop keep their nonce order. */
export async function sendLoop(recipients: string[]) {
  for (const to of recipients) await sendTransaction({ to })
}

/** The second read only runs when the first returns nothing. */
export async function fallback(address: string) {
  return (await getCode({ address })) ?? (await getBalance({ address }))
}

/** Promises started together, then awaited, already run at once. */
export async function alreadyParallel(address: string) {
  const balance = getBalance({ address })
  const code = getCode({ address })
  return { balance: await balance, code: await code }
}

/** One await is not a waterfall. */
export async function single(address: string) {
  return await getBalance({ address })
}

/** The guard tests the first result, so the second read waits for it. */
export async function guardedByResult(address: string) {
  const block = await getBlock()
  const fee = block.baseFeePerGas ?? (await getBalance({ address }))
  return fee
}

/** Two arms of one `?:` never both run. */
export async function exclusiveArms(address: string, useCode: boolean) {
  return useCode ? await getCode({ address }) : await getBalance({ address })
}

/** A hook the caller supplies runs where the caller expects it. */
export async function hook(
  address: string,
  options: { getFeeToken?: (() => Promise<string>) | undefined },
) {
  const balance = await getBalance({ address })
  const feeToken = await options.getFeeToken?.()
  return { balance, feeToken }
}

/** The branch tests the first result, so its read waits for it. */
export async function branchOnResult(address: string) {
  const code = await getCode({ address })
  if (code) {
    const balance = await getBalance({ address })
    return balance
  }
  return 0n
}
