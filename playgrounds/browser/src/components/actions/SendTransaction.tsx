import { WalletClient, parseEther } from 'viem'
import { goerli } from 'viem/chains'

export function SendTransaction({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          const [address] = await client.getAddresses()
          await client.sendTransaction({
            account: address,
            chain: goerli,
            to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            value: parseEther('0.0001'),
          })
        }}
      >
        send it
      </button>
    </div>
  )
}
