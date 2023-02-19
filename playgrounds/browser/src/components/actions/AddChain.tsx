import type { WalletClient } from 'viem'
import { celo } from 'viem/chains'

export function AddChain({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          await client.addChain(celo)
        }}
      >
        add chain
      </button>
    </div>
  )
}
