import type { WalletClient } from 'viem'
import { requestPermissions } from 'viem/wallet'

export function RequestPermissions({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          console.log(await requestPermissions(client, { eth_accounts: {} }))
        }}
      >
        request permissions
      </button>
    </div>
  )
}
