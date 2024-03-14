# Blob Transactions [Sending your first Blob Transaction with Viem.]

Blob Transactions are a new type of transaction in Ethereum (introduced in [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844)) that allows you to broadcast BLObs (Binary Large Objects) to the Ethereum network. Blob Transactions are like any other transaction, but with the added ability to carry a payload of Blobs. Blobs are extremely larger than regular calldata (~128kB), however unlike regular calldata, they are not accessible on the EVM. The EVM can only view the commitments of the blobs. Blobs are also transient, and only last for 4096 epochs (approx. 18 days).

To read more on Blob Transactions and EIP-4844, check out these resources: 

- [EIP-4844 Spec](https://eips.ethereum.org/EIPS/eip-4844)
- [EIP-4844 Website](https://www.eip4844.com/#faq)
- [EIP-4844 FAQ](https://notes.ethereum.org/@vbuterin/proto_danksharding_faq#Proto-Danksharding-FAQ)

In this guide, we will walk you through how to send your first Blob Transaction with Viem.

::::steps

## Set up Client

We will first set up our Viem Client. 

Let's create a `client.ts` file that holds our Client.

```ts twoslash [client.ts] filename="client.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const account = privateKeyToAccount('0x...')

export const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})
```

## Install KZG bindings

Next, we will need to install some KZG bindings. KZG will be used to compute the commitments of the blobs, and generate proofs from the blobs & commitments. The commitments and proofs are needed to serialize and sign the Blob Transaction before we send it off.

A couple of KZG implementations we recommend are:
- [c-kzg](https://github.com/ethereum/c-kzg-4844): Node.js bindings to c-kzg.
- [kzg-wasm](https://github.com/ethereumjs/kzg-wasm): WebAssembly bindings to c-kzg.

:::code-group

```bash [npm]
npm i c-kzg
# or
npm i kzg-wasm
```

```bash [pnpm]
pnpm i c-kzg
# or
pnpm i kzg-wasm
```

```bash [bun]
bun i c-kzg
# or
bun i kzg-wasm
```

:::

## Set up KZG interface

After that, we will need to hook up the KZG bindings to Viem.

Let's create a `kzg.ts` file that holds our KZG interface.

:::code-group

```ts twoslash [kzg.ts] filename="kzg.ts"
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

export const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)
```

```ts twoslash [client.ts]
// [!include client.ts]
```

:::

## Send Blob Transaction

Now that we have our Client and KZG interface set up, we can send our first Blob Transaction.

For demonstration purposes, we will construct a blob with a simple string: `"hello world"`, and send it to the zero address.

:::code-group

```ts twoslash [example.ts]
import { parseGwei, stringToHex, toBlobs } from 'viem'
import { account, client } from './client'
import { kzg } from './kzg'

const blobs = toBlobs({ data: stringToHex('hello world') })

const hash = await client.sendTransaction({
  blobs,
  kzg,
  maxFeePerBlobGas: parseGwei('30'),
  to: '0x0000000000000000000000000000000000000000',
})
```

```ts twoslash [kzg.ts]
// [!include kzg.ts]
```

```ts twoslash [client.ts]
// [!include client.ts]
```

:::

::::

## That's it!

You've just sent your first Blob Transaction with Viem. 

With the `hash` you received in Step 4, you can now track your Blob Transaction on a blob explorer like [Blobscan](https://blobscan.com/).
