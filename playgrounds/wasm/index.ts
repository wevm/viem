import { Address } from 'abitype'
import { Account } from 'wasm-wallet'

//
;(async () => {
  const account = Account.generateRandom()
  // const account = Account.fromPrivateKey(
  //   // This is a test private key. ;)
  //   '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  // )
  // const account = Account.fromMnemonic(
  //   'test test test test test test test test test test test junk',
  // )

  const address = account.getAddress()
  const messageSig = account.signMessage('wagmi')
  const txnSig = account.signTransaction({
    from: address as Address,
    to: '0x0000000000000000000000000000000000000000',
    gas: '0x123123123',
    gasPrice: '0x123',
    nonce: '0x69',
    chainId: '0x1',
    value: '0x1',
  })
  const typedDataSig = await account.signTypedData({
    domain: {
      name: 'Ether Mail',
      version: '0x1',
      chainId: '0x1',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  })

  console.log('address: ', address)
  console.log('message sig: ', messageSig)
  console.log('txn sig: ', txnSig)
  console.log('typed data sig: ', typedDataSig)
})()
