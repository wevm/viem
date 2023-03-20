import { expect, test } from "vitest";
import { accounts, signTransaction } from "../../_test";
import { serializeTransaction } from "./serializeTransaction";
import { parseGwei, parseEther } from "../unit";
import { parseTransaction } from "./parseTransaction";
import { serializeTransaction as serializeTransactionEthers } from "ethers/lib/utils";
import type {
  EIP1559Serialized,
  EIP2930Serialized,
} from "../../types/transaction";
import { toHex, toRlp } from "../encoding";

const sourceAccount = accounts[0];
const targetAccount = accounts[1];
const data = "0x" as const;

const BaseTransaction = {
  chainId: 1,
  data,
  to: targetAccount.address,
  nonce: 785,
  value: parseEther("1"),
};

test("parse transaction EIP1559", () => {
  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      gas: 21001n,
      accessList: [
        {
          address: "0x1234512345123451234512345123451234512345",
          storageKeys: [
            "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
          ],
        },
      ],
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
    },
    { type: "eip1559" }
  );

  expect(
    parseTransaction({ type: "eip1559", encodedTransaction: serialized })
  ).toEqual({
    ...BaseTransaction,
    gas: 21001n,
    accessList: [
      {
        address: "0x1234512345123451234512345123451234512345",
        storageKeys: [
          "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        ],
      },
    ],
    maxFeePerGas: parseGwei("2"),
    maxPriorityFeePerGas: parseGwei("2"),
  });
});

test("parse signed transaction EIP1559", () => {
  const signature = signTransaction(
    serializeTransaction(
      {
        ...BaseTransaction,
        accessList: [],
        gas: 21001n,
        maxFeePerGas: parseGwei("2"),
        maxPriorityFeePerGas: parseGwei("2"),
      },
      { type: "eip1559" }
    ),
    sourceAccount.privateKey
  );

  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      accessList: [],
      gas: 21001n,
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
    },
    { type: "eip1559", signature }
  );
  expect(
    parseTransaction({ type: "eip1559", encodedTransaction: serialized })
  ).toEqual({
    ...BaseTransaction,
    accessList: [],
    gas: 21001n,
    maxFeePerGas: parseGwei("2"),
    maxPriorityFeePerGas: parseGwei("2"),
    ...signature,
  });
});

test("parse transaction EIP2930", () => {
  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      accessList: [
        {
          address: "0x1234512345123451234512345123451234512345",
          storageKeys: [
            "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
          ],
        },
      ],
      gasPrice: parseGwei("2"),
      gas: 21001n,
    },
    { type: "eip2930" }
  );

  expect(
    parseTransaction({ type: "eip2930", encodedTransaction: serialized })
  ).toEqual({
    ...BaseTransaction,
    accessList: [
      {
        address: "0x1234512345123451234512345123451234512345",
        storageKeys: [
          "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        ],
      },
    ],
    gasPrice: parseGwei("2"),
    gas: 21001n,
  });
});

test("parse signed transaction EIP2930", () => {
  const signature = signTransaction(
    serializeTransaction(
      {
        ...BaseTransaction,
        accessList: [],
        gasPrice: parseGwei("2"),
        gas: 21001n,
      },
      { type: "eip2930" }
    ),
    sourceAccount.privateKey
  );

  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei("2"),
      gas: 21001n,
    },
    { type: "eip2930", signature }
  );

  expect(
    parseTransaction({ type: "eip2930", encodedTransaction: serialized })
  ).toEqual({
    ...BaseTransaction,
    accessList: [],
    gasPrice: parseGwei("2"),
    gas: 21001n,
    ...signature,
  });
});

test("parse legacy transaction", () => {
  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      gasPrice: parseGwei("2"),
      gas: 21001n,
    },
    { type: "legacy" }
  );

  expect(
    parseTransaction({ type: "legacy", encodedTransaction: serialized })
  ).toEqual({
    ...BaseTransaction,
    gasPrice: parseGwei("2"),
    gas: 21001n,
  });
});

test("parse signed legacy transaction", () => {
  const signature = signTransaction(
    serializeTransaction(
      {
        ...BaseTransaction,
        gasPrice: parseGwei("2"),
        gas: 21001n,
      },
      { type: "legacy" }
    ),
    sourceAccount.privateKey
  );

  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      gasPrice: parseGwei("2"),
      gas: 21001n,
    },
    { type: "legacy", signature }
  );

  expect(
    parseTransaction({ type: "legacy", encodedTransaction: serialized })
  ).toEqual({
    ...BaseTransaction,
    gasPrice: parseGwei("2"),
    gas: 21001n,
    r: signature.r,
    s: signature.s,
    v: 37n,
  });
});

test("default values", () => {
  const serialized2930 = serializeTransaction(
    { chainId: 1, to: "0x1234512345123451234512345123451234512345" },
    { type: "eip2930" }
  );
  const serialized1559 = serializeTransaction(
    { chainId: 1, to: "0x1234512345123451234512345123451234512345" },
    { type: "eip1559" }
  );

  expect(
    parseTransaction({ type: "eip1559", encodedTransaction: serialized1559 })
  ).toEqual({
    chainId: 1,
    maxFeePerGas: 0n,
    to: "0x1234512345123451234512345123451234512345",
    data: "0x",
    maxPriorityFeePerGas: 0n,
    value: 0n,
    nonce: 0,
    gas: 0n,
    accessList: [],
  });

  expect(
    parseTransaction({ type: "eip2930", encodedTransaction: serialized2930 })
  ).toEqual({
    chainId: 1,
    to: "0x1234512345123451234512345123451234512345",
    data: "0x",
    gasPrice: 0n,
    value: 0n,
    nonce: 0,
    gas: 0n,
    accessList: [],
  });
});

test("invalied values", () => {
  const serialized2930 = serializeTransaction(
    { chainId: 1, to: "0x1234512345123451234512345123451234512345" },
    { type: "eip2930" }
  );
  const serialized1559 = serializeTransaction(
    { chainId: 1, to: "0x1234512345123451234512345123451234512345" },
    { type: "eip1559" }
  );

  expect(() =>
    parseTransaction({
      type: "eip1559",
      encodedTransaction: serialized2930 as EIP1559Serialized,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"eip1559\\" type transaction.

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "eip2930",
      encodedTransaction: serialized1559 as EIP2930Serialized,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"eip2930\\" type transaction.

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "legacy",
      encodedTransaction: serialized1559,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"legacy\\" type transaction.

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "eip1559",
      encodedTransaction: "0x02",
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"eip1559\\" type transaction.

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "eip2930",
      encodedTransaction: "0x01",
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"eip2930\\" type transaction.

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "legacy",
      encodedTransaction: "0x",
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"legacy\\" type transaction.

    Version: viem@1.0.2"
  `);
});

test("invalid values access list", () => {
  const serialized2930 =
    "0x01e1018080809412345123451234512345123451234512345123458080c5c4820123c0";
  const serialized2930InvalidKeys =
    "0x01f6018080809412345123451234512345123451234512345123458080dad9941234512345123451234512345123451234512345c3820123";

  const serialized1559 =
    "0x02e201808080809412345123451234512345123451234512345123458080c5c4820123c0";
  const serialized1559InvalidKeys =
    "0x02f701808080809412345123451234512345123451234512345123458080dad9941234512345123451234512345123451234512345c3820123";

  expect(() =>
    parseTransaction({
      type: "eip1559",
      encodedTransaction: serialized1559,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "eip2930",
      encodedTransaction: serialized2930,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "eip1559",
      encodedTransaction: serialized1559InvalidKeys,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "eip2930",
      encodedTransaction: serialized2930InvalidKeys,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123

    Version: viem@1.0.2"
  `);
});

test("parse legacy", () => {
  const encoded = toRlp([
    toHex(0),
    toHex(parseGwei("2")),
    toHex(21001n),
    "0x1234512345123451234512345123451234512345",
    toHex(parseEther("1")),
    "0x",
  ]);

  expect(
    parseTransaction({ type: "legacy", encodedTransaction: encoded })
  ).toEqual({
    nonce: 0,
    gasPrice: 2000000000n,
    gas: 21001n,
    to: "0x1234512345123451234512345123451234512345",
    value: 1000000000000000000n,
    data: "0x",
  });

  const withChainId = toRlp([
    toHex(0),
    toHex(parseGwei("2")),
    toHex(21001n),
    "0x1234512345123451234512345123451234512345",
    toHex(parseEther("1")),
    "0x",
    toHex(1),
    "0x",
    "0x",
  ]);

  expect(
    parseTransaction({ type: "legacy", encodedTransaction: withChainId })
  ).toEqual({
    nonce: 0,
    gasPrice: 2000000000n,
    gas: 21001n,
    to: "0x1234512345123451234512345123451234512345",
    value: 1000000000000000000n,
    data: "0x",
    chainId: 1,
  });

  const withSignature = toRlp([
    toHex(0),
    toHex(parseGwei("2")),
    toHex(21001n),
    "0x1234512345123451234512345123451234512345",
    toHex(parseEther("1")),
    "0x",
    toHex(37n),
    "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
    "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
  ]);

  expect(
    parseTransaction({ type: "legacy", encodedTransaction: withSignature })
  ).toEqual({
    nonce: 0,
    gasPrice: 2000000000n,
    gas: 21001n,
    to: "0x1234512345123451234512345123451234512345",
    value: 1000000000000000000n,
    data: "0x",
    chainId: 1,
    v: 37n,
    r: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
    s: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
  });
});

test("invalid chainId", () => {
  const encodedIncorrectChainId = toRlp([
    toHex(0),
    toHex(parseGwei("2")),
    toHex(21001n),
    "0x1234512345123451234512345123451234512345",
    toHex(parseEther("1")),
    "0x",
    toHex(35n),
    "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
    "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
  ]);

  expect(() =>
    parseTransaction({
      type: "legacy",
      encodedTransaction: encodedIncorrectChainId,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Pre EIP-155 transactions not supported.

    Chain ID: 0
    
    Version: viem@1.0.2"
  `);

  const incorrectChainId = toRlp([
    toHex(0),
    toHex(parseGwei("2")),
    toHex(21001n),
    "0x1234512345123451234512345123451234512345",
    toHex(parseEther("1")),
    "0x",
    toHex(0),
    "0x",
    "0x",
  ]);

  expect(() =>
    parseTransaction({
      type: "legacy",
      encodedTransaction: incorrectChainId,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Pre EIP-155 transactions not supported.

    Chain ID: 0
    
    Version: viem@1.0.2"
  `);
});

test("invalid signature hash", () => {
  const invalidS = toRlp([
    toHex(0),
    toHex(parseGwei("2")),
    toHex(21001n),
    "0x1234512345123451234512345123451234512345",
    toHex(parseEther("1")),
    "0x",
    toHex(37n),
    "0x123",
    "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
  ]);

  expect(() =>
    parseTransaction({
      type: "legacy",
      encodedTransaction: invalidS,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123
    0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe

    Version: viem@1.0.2"
  `);

  const s = serializeTransactionEthers(
    { chainId: 1, to: "0x1234512345123451234512345123451234512345", type: 1 },
    {
      r: "0x123",
      s: "0x123",
      v: 28,
    }
  );

  const r = serializeTransactionEthers(
    { chainId: 1, to: "0x1234512345123451234512345123451234512345", type: 2 },
    {
      r: "0x123",
      s: "0x123",
      v: 28,
    }
  );

  expect(() =>
    parseTransaction({
      type: "legacy",
      encodedTransaction: invalidS,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123
    0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "eip2930",
      encodedTransaction: s as EIP2930Serialized,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123
    0x123

    Version: viem@1.0.2"
  `);

  expect(() =>
    parseTransaction({
      type: "eip1559",
      encodedTransaction: r as EIP1559Serialized,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123
    0x123

    Version: viem@1.0.2"
  `);
});
