---
head:
  - - meta
    - property: og:title
      content: Why viem
  - - meta
    - name: description
      content: A brief preamble on why we built viem.
  - - meta
    - property: og:description
      content: A brief preamble on why we built viem.

---

# Why viem

The current state of low-level Ethereum interface abstractions lack in at least one of the following four areas: **developer experience**, **stability**, **bundle size** and/or **performance** – it's a quadrilemma.

**viem** is a TypeScript Interface for Ethereum (similar to ethers.js & web3.js), that provides low-level unopinonated & stateless primitives for interacting with Ethereum – with an initial primary focus on EVM Provider, Contract & Network abstractions. It aims to address the quadrilemma by:

- a great **developer experience** through extensive testing, robust APIs, comprehensive documentation and type safety,
- increased **stability** as a result of testing coverage (both behavioral & branch) & type safety,
- slim **bundle size** from not only tree-shaking, but also a minimalistic modular architecture,
- bump in **performance** by only performing long-running asynchronous tasks when required/directed.

Whereas other low-level interfaces provide _lock-in_ to opinions over JSON-RPC & EVM, **viem** wants consumers to be able to _opt-in_ to opinions by providing lightweight, unopinionated, and stateless primitives & building blocks. This means that the consumer can define their own opinionated implementations (ie. [wagmi](https://wagmi.sh)) without the need for workarounds for escape hatches.

**viem** will help developers build with a higher level of accuracy and correctness (through type safety & developer experience). It will also integrate extremely well with [wagmi](https://wagmi.sh) so folks can start using it without much upfront switching cost.
