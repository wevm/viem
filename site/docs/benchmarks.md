---
head:
  - - meta
    - property: og:title
      content: Benchmarks
  - - meta
    - name: description
      content: Benchmarks of viem.
  - - meta
    - property: og:description
      content: Benchmarks of viem.
---

# Benchmarks

```bash
❯ pnpm bench

BENCH  Summary

viem: `getEnsAddress` > Get ENS Name
  7.02x faster than ethers: `resolveName`
  40.03x faster than ethers@6: `resolveName`

viem: `getEnsName` > Get ENS Name
  9.21x faster than ethers: `lookupAddress`
  75.32x faster than ethers@6: `lookupAddress`

viem: `sendTransaction` > Send Transaction
  5.31x faster than ethers@5: `sendTransaction`
  18.75x faster than ethers@6: `sendTransaction`

viem: `call` > Call
  3.09x faster than ethers@5: `call`
  23.52x faster than ethers@6: `call`

viem: `getBlock` > Get Block
  3.71x faster than ethers@5: `getBlock`
  26.51x faster than ethers@6: `getBlock`

viem: `getBlockNumber` > Get Block Number
  4.63x faster than ethers@6: `getBlockNumber`
  90973.46x faster than ethers@5: `getBlockNumber`

viem: `getGasPrice` > Get Gas Price
  4.53x faster than ethers@5: `getGasPrice`

viem: `getTransaction` > Get Transaction
  4.23x faster than ethers@5: `getTransaction`
  32.05x faster than ethers@6: `getTransaction`

viem: `getTransactionReceipt` > Get Transaction Receipt
  3.49x faster than ethers@5: `getTransactionReceipt`
  26.18x faster than ethers@6: `getTransactionReceipt`

viem: `simulateContract` > Simulate Contract
  2.98x faster than ethers@5: `callStatic`
  18.08x faster than ethers@6: `callStatic`

viem: isAddress > Is Address
  35.98x faster than ethers@5: isAddress
  79.00x faster than ethers@6: isAddress

viem: `decodeAbiParameters` > ABI Decode (static struct)
  2.14x faster than ethers@5: `AbiCoder.decode`
  3.41x faster than ethers@6: `AbiCoder.decode`

viem: `encodeAbiParameters` > ABI Encode
  8.78x faster than ethers@5: `AbiCoder.encode`

viem: `encodeAbi` > Seaport function
  6.87x faster than ethers@5: `AbiCoder.encode`

viem: `encodePacked` > Encode Packed ABI
  3.99x faster than ethers@5: `solidityPack`
  16.60x faster than ethers@6: `solidityPacked`

viem: `padHex` > Pad Hex
  3.85x faster than ethers@6: `zeroPadValue`
  13.93x faster than ethers@5: `hexZeroPad`

viem: `padBytes` > Pad Bytes
  1.11x faster than ethers@5: `zeroPad`
  2.82x faster than ethers@6: `zeroPadValue`

viem: `bytesToHex` > Bytes to Hex
  1.03x faster than ethers@6: `hexlify`
  1.20x faster than ethers@5: `hexlify`

viem: `bytesToString` > Bytes to String
  1.24x faster than ethers@6: `toUtf8String`
  1.54x faster than ethers@5: `toUtf8String`

viem: `fromRlp` > RLP Decoding (128 bytes)
  1.06x faster than ethers: `decodeRlp`
  1.28x faster than ethers: `RLP.decode`

viem: `fromRlp` > RLP Decoding (nested array of > 56 bytes)
  1.40x faster than ethers@6: `decodeRlp`
  1.71x faster than ethers@5: `RLP.decode`

viem: `stringToHex` > String to Hex
  1.23x faster than ethers@6: `hexlify`
  1.71x faster than ethers@5: `hexlify`

viem: `bytesToHex` > Bytes to Hex
  1.35x faster than ethers@6: `bytesToHex`
  1.56x faster than ethers@5: `hexlify`

viem: `toRlp` > RLP Encoding (128 bytes)
  1.06x faster than ethers@6: `encodeRlp`
  1.34x faster than ethers@5: `RLP.encode`

ethers@6: `encodeRlp` > RLP Encoding (nested array of 128 bytes)
  1.01x faster than viem: `toRlp`
  1.21x faster than ethers@5: `RLP.encode`

viem: `normalize` > Normalize ENS name
  3.09x faster than @adraffy/ens-normalize: `ens_normalize`

viem: `formatUnits` > Format Unit
  7.98x faster than ethers@6: `formatUnits`
  26.59x faster than ethers@5: `formatUnits`

viem: `parseUnits` > Parse Unit
  5.89x faster than ethers@6: `parseUnits`
  10.40x faster than ethers@5: `parseUnits`
```