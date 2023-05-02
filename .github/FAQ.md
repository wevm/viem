# FAQ

Frequently asked questions related to viem.

**TL;DR: viem tries to avoid creating unnecessary abstractions on top of existing systems.**

Feel free to add to this document if you notice frequently asked questions that are not covered here.

- [Why are contract function `args` with fully-named inputs represented as unnamed tuple types instead of object types?](#why-are-contract-function-args-with-fully-named-inputs-represented-as-unnamed-tuple-types-instead-of-object-types)
- [Why is a contract function return type returning an array instead of an object?](#why-is-a-contract-function-return-type-returning-an-array-instead-of-an-object)
- [Why doesn't Wallet Client support public actions?](#why-doesnt-wallet-client-support-public-actions)

<br>

---

<br>

## Why are contract function `args` with fully-named inputs represented as unnamed tuple types instead of object types?

Let's look at an example! Suppose I have the following function in my contract:

```sol
function transferFrom(address sender, address recipient, uint256 amount) returns (bool)
```

All the inputs are named (`sender`, `recipient`, and `amount`) so I might be tempted to represent the parameters as the following TypeScript type:

```ts
type Args = {
  sender: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
}
```

This improves developer experience a bit because now I can see the names of the parameters in my editor.

```ts
import { createWalletClient, parseAbi } from 'viem'

const client = createWalletClient(…)
client.writeContract({
  address: '0x…',
  abi: parseAbi([
    'function transferFrom(address sender, address recipient, uint256 amount) returns (bool)',
  ]),
  functionName: 'transferFrom',
  args: {
    sender: '0x…',
    recipient: '0x…',
    amount: 100n,
  },
})
```

However, this only works if all the inputs are named (some compilers will strip names from inputs). If any of the inputs are unnamed, then you'll have to use a tuple instead:

```ts
client.writeContract({
  address: '0x…',
  abi: parseAbi([
    'function transferFrom(address, address, uint256) returns (bool)',
  ]),
  functionName: 'transferFrom',
  args: ['0x…', '0x…', 100n],
})
```

This can get even more complicated when a function has overrides:

```sol
function safeTransferFrom(address, address, uint256)
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)
```

In this case, the type of the overload parameters starts to diverage from each other:

```ts
type Args =
  | [`0x${string}`, `0x${string}`, bigint]
  | {
      from: `0x${string}`;
      to: `0x${string}`;
      tokenId: bigint;
      data: string;
    }
```

If you want to switch between the two overloads in your code, you'll need to completely change the type instead of just adding or removing a single positional argument from the end. (Objects also don't enforce type-level ordering so you can put them in whatever order you want. This would also mean that viem would also need to internally validate order during runtime, adding some extra overhead.)

```diff
client.writeContract({
  address: '0x…',
  abi: parseAbi([
    'function safeTransferFrom(address, address, uint256)',
    'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
  ]),
  functionName: 'safeTransferFrom',
- args: ['0x…', '0x…', 100n],
+ args: {
+   from: '0x…',
+   to: '0x…',
+   tokenId: 100n,
+   data: '0x…',
+ },
})
```

Even though overloads are an edge case, it would be sufficiently [astonishing](https://en.wikipedia.org/wiki/Principle_of_least_astonishment) to come across this behavior. So what's the best way to represent `args`? Well, they are positional at the contract-level so it makes sense to represent them that way in viem too.

Not all is lost when it comes to developer experience though! Tuple types in TypeScript can have [names](https://www.typescriptlang.org/play?ts=4.0.2#example/named-tuples) attached to them:

```ts
type Args = [from: `0x${string}`, to: `0x${string}`, tokenId: bigint]
```

These names show up in your editor so you get nice developer experience when using autocomplete, etc. Unfortunately, TypeScript doesn't support dynamic named tuples right now, but we are watching [this issue](https://github.com/microsoft/TypeScript/issues/44939) closely and once it is implemented, we will add it to viem. In the meantime, hang tight!

<div align="right">
  <a href="#faq">&uarr; back to top</a></b>
</div>

## Why is a contract function return type returning an array instead of an object?

Suppose you ABI looks like this:

```ts
[
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  }
]
```

You might be confused why the following does not return an object:

```ts
import { createPublicClient, parseAbi } from 'viem'

const client = createPublicClient(…)
const res = await client.readContract({
  address: '0x…',
  abi: […], // abi from above
  functionName: 'latestRoundData',
})
res
// ^? const res: [bigint, bigint, bigint, bigint, bigint]
```

This is expected. `"latestRoundData"` `outputs` is an array of types, so you get an array of decoded values as the return type. viem only maps explicitly typed tuples as objects.

If you’d prefer an object as the return type, you could convert the parameters to a tuple and it should still work.

```diff
[
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
+     {
+       components: [
          { name: "roundId", type: "uint80" },
          { name: "answer", type: "int256" },
          { name: "startedAt", type: "uint256" },
          { name: "updatedAt", type: "uint256" },
          { name: "answeredInRound", type: "uint80" },
+       ],
+       type: "tuple",
+     },
    ],
    stateMutability: "view",
    type: "function",
  }
]
```

```ts
import { createPublicClient, parseAbi } from 'viem'

const client = createPublicClient(…)
const res = await client.readContract({
  address: '0x…',
  abi: […], // updated abi from above
  functionName: 'latestRoundData',
})
res
// ^? const res: { roundId: bigint; answer: bigint; startedAt: bigint; updatedAt: bigint; answeredInRound: bigint; }
```

Why does viem follow this approach? Here is the contract function definition for `latestRoundData` with two different return types:

```sol
function latestRoundData() external view
  returns (
    uint80 roundId,
    int256 answer,
    uint256 startedAt,
    uint256 updatedAt,
    uint80 answeredInRound
  );

struct Data {
  uint80 roundId;
  uint256 answer;
  uint256 startedAt;
  uint256 updatedAt;
  uint80 answeredInRound
}

function latestRoundData() external view returns (Data data);
```

The first function returns a set of five items, so viem maps it to an array. The reason why we don't convert it to an object is because things get ambiguous when we come to decode structs. How do you determine the difference between a "return" tuple (first function) and a "struct" tuple (second function).

Another reason is that folks might expect it to be an array (because it is a set of return items). Other libraries, like ethers, mitigates this by returning a hybrid Array/Object type, but that kind of type is not serializable in JavaScript, and viem prefers to not try and "hack" JavaScript types.

<div align="right">
  <a href="#faq">&uarr; back to top</a></b>
</div>

## Why doesn't Wallet Client support public actions?

Wallet Client doesn't support public actions because wallet providers (Injected `window.ethereum`, WalletConnect v2, etc.) may not provide a large majority of "node"/"public" RPC methods like `eth_call`, `eth_newFilter`, `eth_getLogs`, etc. This is because these methods are not required for a wallet provider to function properly. For example, a wallet provider may only support `eth_sendTransaction` and `eth_sign` and nothing else.

<div align="right">
  <a href="#faq">&uarr; back to top</a></b>
</div>