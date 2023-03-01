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

The current state of low-level Ethereum interface abstractions lack in at least one of the following four areas: **developer experience**, **stability**, **bundle size** and/or **performance** – a quadrilemma.

As the authors of [wagmi](https://wagmi.sh), a popular React Hook library for Ethereum, we struggled working with the existing low-level TypeScript Ethereum libraries. We wanted to provide the users of wagmi with the best possible developer experience – but we were being limited by the underlying technologies wagmi was built on. We knew an _always_ stable, predictable implementation with a tiny bundle size and performant modules was paramount to interacting the world's largest blockchain ecosystem.

So we created **viem**: a TypeScript Interface for Ethereum that provides low-level stateless primitives for interacting with Ethereum. An alternative to ethers.js and web3.js with a focus on reliability, efficiency and an excellent developer experience.

## Developer Experience

viem delivers a great developer experience through modular and composable APIs, comprehensive documentation, and type safety.

It provides consumers with intuitive building blocks to build their Ethereum apps and libraries. While viem's APIs may be more verbose than alternative libraries – we believe this is the right trade-off as it allows viem's modular building blocks to be easy to move around, change and remove. It also allows the consumer to better comprehend Ethereum concepts and understand _what_ and _why_ certain properties are being passed through. 

We aim to provide extensive API documentation and usage for _every_ module in viem. viem uses a [documentation](https://gist.github.com/zsup/9434452) and [test driven](https://en.wikipedia.org/wiki/Test-driven_development#:~:text=Test%2Ddriven%20development%20(TDD),software%20against%20all%20test%20cases.) development approach to building modules, which leads to predictable and stable APIs.

viem also provides consumers with [strongly typed APIs](/docs/typescript), allowing consumers to get the best possible experience through [autocomplete](https://twitter.com/awkweb/status/1555678944770367493), [type inference](https://twitter.com/jakemoxey/status/1570244174502588417?s=20), as well as static validation. 

## Stability

Stability is a fundamental principle for viem. As the authors of [wagmi](https://wagmi.sh), we have many organizations, large and small, that rely heavily on the library and expect it to be entirely stable for their users.

viem takes the following steps to ensure stability:

- We run our test suite against a forked Ethereum node
- We aim for complete test coverage and test all potential behavioral cases
- We build deterministic and pure APIs

## Bundle Size

Maintaining a low bundle size is critical when building web applications. End users should not be required to download a module of over 100kB in order to interact with Ethereum. On a slow 3G mobile network loading a 100kB library would take at least **two seconds** (plus additional time to establish an HTTP connection).

viem adopts a minimalist modular architecture to achieve a bundle size of 24kB (~300ms loading time on a slow 3G network). Furthermore, viem is tree-shakable, meaning only the modules you use are included in your final bundle.

<div class="h-4"></div>
<img src="/bundle-size.svg" />

## Performance

In addition to the fast load times mentioned above, viem further tunes performance by only executing heavy asynchronous tasks when required and optimized encoding/parsing algorithms. The benchmarks speak for themselves:

<div class="m-auto mt-10 space-y-14 w-10/12">
  <img src="/bench-isaddress.svg" />
  <img src="/bench-parseabi.svg" />
  <img src="/bench-encodeabi.svg" />
</div>


## Opinions & Escape Hatches

Unlike other low-level interfaces that impose opinions on consumers, viem enables consumers to choose their opinions while still maintaining sensible and secure defaults. This allows consumers to create their own opinionated implementations, such as [wagmi](https://wagmi.sh), without the need for tedious workarounds.

---

**viem** will help developers build with a higher level of accuracy and correctness through type safety and developer experience. It will also integrate extremely well with [wagmi](https://wagmi.sh) so folks can start using it without much upfront switching cost.


