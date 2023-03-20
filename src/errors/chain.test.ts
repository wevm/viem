import { expect, test } from "vitest";
import { mainnet } from "../chains";
import { ChainDoesNotSupportContract, InvalidChainIdError } from "./chain";

test("ChainDoesNotSupportContract", () => {
  expect(
    new ChainDoesNotSupportContract({
      chain: mainnet,
      contract: { name: "ensUniversalResolver" },
    })
  ).toMatchInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Ethereum" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The chain does not have the contract "ensUniversalResolver" configured.

    Version: viem@1.0.2]
  `);
  expect(
    new ChainDoesNotSupportContract({
      chain: mainnet,
      contract: { name: "ensUniversalResolver", blockCreated: 16172161 },
    })
  ).toMatchInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Ethereum" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The chain does not have the contract "ensUniversalResolver" configured.

    Version: viem@1.0.2]
  `);
  expect(
    new ChainDoesNotSupportContract({
      blockNumber: 16172160n,
      chain: mainnet,
      contract: { name: "ensUniversalResolver", blockCreated: 16172161 },
    })
  ).toMatchInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Ethereum" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The contract "ensUniversalResolver" was not deployed until block 16172161 (current block 16172160).

    Version: viem@1.0.2]
  `);

  expect(new InvalidChainIdError({ chainId: 0 })).toMatchInlineSnapshot(`
  [InvalidChainIdError: Pre EIP-155 transactions not supported.
  
  Chain ID: 0
  
  Version: viem@1.0.2]
`);
});
