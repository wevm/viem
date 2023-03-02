import { Address } from 'abitype'
import { Account } from 'wasm-wallet'

const account = Account.generateRandom()

const address = account.getAddress()
const messageSig = account.signMessage('wagmi')
const txnSig = account.signTransaction({
  from: address as Address,
  to: '0x0000000000000000000000000000000000000000',
  gas: '0x123',
  maxFeePerGas: '0x69420',
  maxPriorityFeePerGas: '0x420',
  chainId: '0x1',
  nonce: '0x0',
  value: '0x0',
})

console.log('address: ', address)
console.log('message sig: ', messageSig)
console.log('txn sig: ', txnSig)
