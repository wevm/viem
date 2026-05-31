---
description: Sets up and returns a KZG interface.
---

# setupKzg

Sets up and defines a [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844) compatible [KZG interface](https://notes.ethereum.org/@vbuterin/proto_danksharding_faq#How-%E2%80%9Ccomplicated%E2%80%9D-and-%E2%80%9Cnew%E2%80%9D-is-KZG). The KZG interface is used in the blob transaction signing process to generate KZG commitments & proofs.

`setupKzg` accepts a KZG interface that implements three functions:

- `loadTrustedSetup`: A function to initialize the KZG trusted setup.
- `blobToKzgCommitment`: A function that takes a blob and returns it's KZG commitment.
- `computeBlobKzgProof`: A function that takes a blob and it's commitment, and returns the KZG proof.

A couple of KZG implementations we recommend are:
- [c-kzg](https://github.com/ethereum/c-kzg-4844): Node.js bindings to c-kzg.
- [kzg-wasm](https://github.com/ethereumjs/kzg-wasm): WebAssembly bindings to c-kzg.

## Import

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"c3d5ad7b32d80065edc16eae98c44d709017b7516e86f4afe4003a00118143f6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvODDSCsAaQBeAc0ZZmpZgFtZZOIl4BlWfOUqACpp17ScCrw1p8huGlLswK7oZNzFqgBKpqRgACrYMAA6YOzaWBCkaNKmASqUIFAQIgiIIH5wvPK8zGBQvKQhYIXMvAoAWgDivJ40pPzMIjAAdBlozCq5yMggdDpYrLhUAAazaHAxcQlJvABUJYUi5gKkENq8AOQiALQA1qoHi/GJycAp/tsAvjt7h0TsMNqXsdcrd9rMTxgWRhUiCNwwKB+eRWZy8Z78Xb7A7vT4AekgsG+MREkjcvHOKl4AF57mZVIwtqoHACgSCwRCoalYfhuDFZtMQABdLlUNyaBiIACcVEmXmcSAAHFR+qQVLI8DIHqoMhxgUgAAxUET4axiMhIIWPXkgXGwPBLG68O5K8lEhFIt4fL4ZXT9JCgOg0aoSMB4eYgR6PIA==="}
import { setupKzg } from 'viem'
```

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"a7d3581c58a13f17e09bb7e8789ea3c82c160bdea41e24fd11c04f34dee13a48","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BLAWywlLQAIBjAaQC8A5pRBw0AQw5IAjACYqAGxhhBafEgAsVCaUEwGiEHyEiFjMLkQAGKt3yTx3GuURyAvhXTZLBYmRE09HgAFOJm4nAAlJwAZgCuYE6MEGCccPpxWAKCwVgOzPpkcIicAMoZWUIACvmFpHAUnHlqJWKk5oKRJeVomdkAShmkYAAq3gA6YCxsHGkV2SJQENwIhj1wnJmc4mBQnKRDYBvinLwAWgDinObOMY4wAHQB4oKryMggdOKsSiIABgC0HBJtN2FwAFTbDbGQSxUgQZicADk3AAtABrIRIkGsMGcYBzXqVWFuOEI5FERgwZjYqa42YE5jicwWNAjUhxMQwKA9TI1NScUkxeGIpGU6kAekgsFpk24KTEnExsIAvIS+kJgjDGkyWfp2ZyaDyKvz8JFJgC/iAALrWqhiSQGADMAE5FMpVOpEAAObSSPQGUTzEyKcyWaS2eykRzOJAujxeHB4QgkcjaOiB0LhKI8BVcXVgVkGrnGomm1podoqHEzfPMwv6jkl3lYU0iB1SRAAdgjICUKjUSFkTr9un0eALRabRpbbdDFiHkYcTn8iHjnmo3mTfjT1AzeHlRy4ypKC3tOgMcl7/c9SBH1H948MytMYc0S+jK5cADYE5uk4YKb+OmQSGFmjARNE6REtkuS1M4xRlMGgg1NGBQIY0zT4BWVadN0yGDL0wxjDgNZ4tBGrCFQSwrHg6ybFg2y7PshzHKclzXGAtz3E8fqvEg7yfLQ3xYL8VCWkCZGzJCEQ8NkZKimiyq0qCDLqsSgoKRSVI0lJXCMvWU6Gtys7iAKQoitpkrSjAsqJHmSpCJwaoUcSWrZDqhmNsZpZ8mZZoWgCNp2qIF4yLIXbugOXq+g+Y6Bq5Z59m+iBaEYUYxqu7gbpgAG+KmAT7oYqlcDC7Zha4TrflFt6paOAYHklZgLnV6XLrGiCyNIf65T4QG7oEmZhBBOaHoqk7ec2Jr+ThHR6ZwE1stOJnTYO56OjIGjyH2HqDp1946A1hiLcWM6reo86WGldjtauEVuCF8qwEw9IQlCclOcK5IohiWLzQSiVORZ33irpdK1viC1eUtPmmeZWlijpUrQLZkxyg5yrOepsHalDeow1NZb+ZEIjoeISCgBmyhwMkYB4ECIBuG4QA="}
// @noErrors
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)
```

### Trusted Setups

As seen above, when you set up your KZG interface, you will need to provide a trusted setup file. You can either import a trusted setup via the [`viem/node` entrypoint](#viemnode-entrypoint) (if you're using an engine that supports Node.js' `node:fs` module), or you can directly import the trusted setup `.json` via the [`viem/trusted-setups` entrypoint](#viemtrusted-setups-entrypoint).

Viem exports the following trusted setups:

- `mainnet.json`: For Ethereum Mainnet & it's Testnets (Sepolia, Goerli, etc).
- `minimal.json`: For low-resource local dev testnets, and spec-testing.

The trusted setup files are retrieved from the Ethereum [consensus-specs repository](https://github.com/ethereum/consensus-specs/tree/dev/presets).

#### `viem/node` Entrypoint

Viem exports **paths to the trusted setup** via the `viem/node` entrypoint, designed to be used with `setupKzg`. 

```ts
import {
  mainnetTrustedSetupPath,
  minimalTrustedSetupPath,
} from 'viem/node'
```

#### `viem/trusted-setups` Entrypoint

Alternatively, you can directly import the **contents of the trusted setup** file from the `viem/trusted-setups` entrypoint.

```ts
import mainnetTrustedSetup from 'viem/trusted-setups/mainnet.json'
import minimalTrustedSetup from 'viem/trusted-setups/minimal.json'
```

## Returns

`Kzg`

The KZG interface.

## Parameters

### kzg

- **Type:** `Kzg & { loadTrustedSetup(path: string): void }`

The [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844) compatible [KZG interface](https://notes.ethereum.org/@vbuterin/proto_danksharding_faq#How-%E2%80%9Ccomplicated%E2%80%9D-and-%E2%80%9Cnew%E2%80%9D-is-KZG).

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"c6dc0472b83ef621ce1206991432a692c1ec543e7a85547363e5b3706abbba81","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BLAWywlLQAIBjAaQC8A5pRBw0AQw5IAjACYqAGxhhBafEgAsVCaUEwGiEHyEiFjMLkQAGKt3yTx3GuURyAvhXTZLBYmRE09HgAFOJm4nAAlJwAZgCuYE6MEGCccPpxWAKCwVgOzPpkcIicAMoZWUIACvmFpHAUnHlqJWKk5oKRJeVomdkAShmkYAAq3gA6YCxsHGkV2SJQENwIhj1wnJmc4mBQnKRDYBvinLwAWgDinObOMY4wAHQB4oKryMggdOKsSiIABgC0HBJtN2FwAFTbDbGQSxUgQZicADk3AAtABrIRIkGsMGcYBzXqVWFuOEI5FERgwZjYqa42YE5jicwWNAjUhxMQwKA9TI1NScUkxeGIpGU6kAekgsFpk24KTEnExsIAvIS+kJgjDGkyWfp2ZyaDyKvz8JFJgC/iAALrWqhiSQGACsADZFMpVOpEAAObSSPQGUTzEyKcyWaS2eykRzOJAATg8XhweEIJHI2jogdC4SiPAVXF1YFZBq5xqJptaaHaKhxMwLzKL+o5pd5WFNIgdUh9vpAShUaiQsgAzH7dPo8IXi82ja326GLIPIw4nP5EAnPNRvCm/OnqJm8PKjlxlSUFvadAZpEOe33PUgR9R/ePDMrTGHNEvoyuXC7E5vk4Yqb+BmQSGNmjARNE6REtkuS1M4xRlMGgg1NGBQIY0zT4JW1adN0yGDL0wxjDgtZ4tBGrCFQSwrHg6ybFg2y7PshzHKclzXGAtz3E8fqvEg7yfLQ3xYL8VCWkCZGzJCEQ8NkZKimiyq0qCDLqsSgoKRSVI0lJXCMg2U6Gtys7iAKQoitpkrSjAsqJPmSpCJwaoUcSWrZDqhlNsZZZ8mZZoWgCNp2qIF4yBoWi9h6A4+qOAZ4K5Z69u+iCRXYy6xq4sh/pgAG+GmAT7oYqlcDCHZha4rruv2XqRTo8WGGV86WE6n4xqu2UbrlPhAbugRZmEEG5oeiqTt5LYmv5OEdHpnBjWy04mZNA7no6MjehGUU1YOD71c+IDzSWM7LeozVIG6RhRu1LjZSF8qwEw9IQlCclOcK5IohiWKcBKEqcMgACE90wLEyyctas0EolTkWR94q6XSdb4nNXkLT5pnmVpYo6VK0C2ZMcoOcqznqbBkycK9giNL9/1A3joPcOD5Mo3qaMTeW/mTJEIjoeISCgJmyhwMkYB4ECIBuG4QA==="}
// @noErrors
import * as cKzg from 'c-kzg' // [!code focus]
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(
  cKzg, // [!code focus]
  mainnetTrustedSetupPath
)
```

### path

- **Type:** `string`

The path to the trusted setup file. 

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"910d47c28aaaf355021183afd177435c3d00dc58ae80ad735e2ee1d35c6b2cbf","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BLAWywlLQAIBjAaQC8A5pRBw0AQw5IAjACYqAGxhhBafEgAsVCaUEwGiEHyEiFjMLkQAGKt3yTx3GuURyAvhXTZLBYmRE09HgAFOJm4nAAlJwAZgCuYE6MEGCccPpxWAKCwVgOzPpkcIicAMoZWUIACvmFpHAUnHlqJWKk5oKRJeVomdkAShmkYAAq3gA6YCxsHGkV2SJQENwIhj1wnJmc4mBQnKRDYBvinLwAWgDinObOMY4wAHQB4oKryMggdOKsSiIABgC0HBJtN2FwAFTbDbGQSxUgQZicADk3AAtABrIRIkGsMGcYBzXqVWFuOEI5FERgwZjYqa42YE5jicwWNAjUhxMQwKA9TI1NScUkxeGIpGU6kAekgsFpk24KTEnExsIAvIS+kJgjDGkyWfp2ZyaDyKvz8JFJgC/iAALrWqhiSQGADMAE5FMpVOpEAAObSSPQGUTzEyKcyWaS2eykRzOJAujxeHB4QgkcjaOiB0LhKI8BVcXVgVkGrnGomm1podoqHEzfPMwv6jkl3lYU0iB1SRAAdgjICUKjUSFkTr9un0eALRabRpbbdDFiHkYcTn8iHjnmo3mTfjT1AzeHlRy4ypKC3tOgM0idvr7HsHiBH1H948MytMYc0S+jK5cADYE5uSaGCm/jpkEhhZowETROkRLZLktTOMUZTBoINTRgUSGNM0+AVlWnTdKhgy9MMYw4DWeKwRqwhUEsKx4OsmxYNsuz7IcxynJc1xgLc9xPH6rxIO8ny0N8WC/FQlpAhRsyQhEPDZGSoposqtKggy6rEoKSkUlSNIyVwjL1lOhrcrO4gCkKIq6ZK0owLKiR5kqQicGqVHElq2Q6sZjamaWfIWWaFoAjadqiBeMgaFot4Dl6N46AGeDuWefYfog0V2MusauLIAGYEBvipgE+6GOpXAwu2EWuAArL+7qxZ+T5joGFXzpY1VfjGq65Ru+U+CBu6BJmYRQTmh6KpOvnNiagV4R0BmcJNbLTmZM2DuejoyL+HUxZ6Q6PglL4gEtxYzmt6htUgdVGFGXUuLlYXyrATD0hCUIKS5wrkiiGJYgtBLJS5VnfeK+l0rW+KLT5y1+eZlk6WKelStA9mcBKEqcMgACET0wLEyyctakxyk5yquZp8GTJwH2CI0VNQ3qMPTWWgVoxj2O4/j3CE5MkQiJh4hIKAGbKHAyRgHgQIgG4bhAA=="}
// @noErrors
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node' // [!code focus]

const kzg = setupKzg(
  cKzg, 
  mainnetTrustedSetupPath // [!code focus]
)
```

