import { Account } from 'wasm-wallet'

const account = Account.generateRandom()
const signature = account.signMessage('wagmi')

console.log('account', account.getAddress())
console.log('hash', signature)
