import { Actions, type Client } from 'viem'
import type { Hex } from 'viem/utils'

export async function getFirstPendingHash(
  client: Client.Client,
): Promise<Hex.Hex> {
  return new Promise((resolve, reject) => {
    const watch = Actions.transaction.watchPending(client)
    watch.onTransactions(([hash]) => {
      if (!hash) return
      watch.off()
      resolve(hash)
    })
    watch.onError((error) => {
      watch.off()
      reject(error)
    })
  })
}
