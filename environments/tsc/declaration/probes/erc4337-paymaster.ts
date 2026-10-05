import { http, PaymasterClient } from 'viem/erc4337'

export const paymasterClient = PaymasterClient.create({
  transport: http('https://paymaster.example'),
})
