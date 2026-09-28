// The earliest report shape (wevm/viem#244): a chainless client was the first value
// consumers ever failed to re-export.
import { Client, http } from 'viem'

export const client = Client.create({ transport: http() })
