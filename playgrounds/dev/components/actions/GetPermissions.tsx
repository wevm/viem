import { getPermissions } from 'viem/actions'
import type { WalletClient } from 'viem/clients'

export function GetPermissions({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          console.log(await getPermissions(client))
        }}
      >
        get permissions
      </button>
    </div>
  )
}
