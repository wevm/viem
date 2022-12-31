import { requestPermissions } from 'viem/actions'
import type { WalletClient } from 'viem/clients'

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
