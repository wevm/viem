import type { WalletClient } from 'viem'
import { celo } from 'viem/chains'
import { addChain } from 'viem/wallet'

export function AddChain({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          await addChain(client, celo)
        }}
      >
        add chain
      </button>
    </div>
  )
}
