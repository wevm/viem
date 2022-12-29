import { addChain } from 'viem/actions'
import type { WalletClient } from 'viem/clients'
import { celo } from 'viem/chains'

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
