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
  const serialized = serializeTransaction({
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

  expect(parseTransaction(serialized)).toEqual({
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
    serializeTransaction({
      ...BaseTransaction,
      accessList: [],
      gas: 21001n,
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
    }),
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
    signature
  );
  expect(parseTransaction(serialized)).toEqual({
    ...BaseTransaction,
    accessList: [],
    gas: 21001n,
    maxFeePerGas: parseGwei("2"),
    maxPriorityFeePerGas: parseGwei("2"),
    ...signature,
  });
});

test("parse transaction EIP2930", () => {
  const serialized = serializeTransaction({
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

  expect(parseTransaction(serialized)).toEqual({
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
    serializeTransaction({
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei("2"),
      gas: 21001n,
    }),
    sourceAccount.privateKey
  );

  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei("2"),
      gas: 21001n,
    },
    signature
  );

  expect(parseTransaction(serialized)).toEqual({
    ...BaseTransaction,
    accessList: [],
    gasPrice: parseGwei("2"),
    gas: 21001n,
    ...signature,
  });
});

test("parse legacy transaction", () => {
  const serialized = serializeTransaction({
    ...BaseTransaction,
    gasPrice: parseGwei("2"),
    gas: 21001n,
  });

  expect(parseTransaction(serialized)).toEqual({
    ...BaseTransaction,
    gasPrice: parseGwei("2"),
    gas: 21001n,
  });
});

test("parse signed legacy transaction", () => {
  const signature = signTransaction(
    serializeTransaction({
      ...BaseTransaction,
      gasPrice: parseGwei("2"),
      gas: 21001n,
    }),
    sourceAccount.privateKey
  );

  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      gasPrice: parseGwei("2"),
      gas: 21001n,
    },
    signature
  );

  expect(parseTransaction(serialized)).toEqual({
    ...BaseTransaction,
    gasPrice: parseGwei("2"),
    gas: 21001n,
    r: signature.r,
    s: signature.s,
    v: 37n,
  });
});

test("default values", () => {
  const serialized2930 = serializeTransaction({
    chainId: 1,
    gasPrice: 1n,
    accessList: [],
    to: "0x1234512345123451234512345123451234512345",
  });
  const serialized1559 = serializeTransaction({
    chainId: 1,
    maxFeePerGas: 1n,
    to: "0x1234512345123451234512345123451234512345",
  });

  expect(parseTransaction(serialized1559)).toEqual({
    chainId: 1,
    maxFeePerGas: 1n,
    to: "0x1234512345123451234512345123451234512345",
    data: "0x",
    maxPriorityFeePerGas: 0n,
    value: 0n,
    nonce: 0,
    gas: 0n,
    accessList: [],
  });

  expect(parseTransaction(serialized2930)).toEqual({
    chainId: 1,
    to: "0x1234512345123451234512345123451234512345",
    data: "0x",
    gasPrice: 1n,
    value: 0n,
    nonce: 0,
    gas: 0n,
    accessList: [],
  });
});

test("invalied values", () => {
  expect(() => parseTransaction("0x02")).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"eip1559\\" type transaction.

    Use \`maxFeePerGas\`/\`maxPriorityFeePerGas\` for EIP-1559 compatible networks.

    Version: viem@1.0.2"
  `);

  expect(() => parseTransaction("0x01")).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"eip2930\\" type transaction.

    Use \`gasPrice\` and \`accessList\` for EIP-2930 compatible networks.

    Version: viem@1.0.2"
  `);

  expect(() => parseTransaction("0x")).toThrowErrorMatchingInlineSnapshot(`
    "Transaction object is not a valid \\"legacy\\" type transaction.

    Use \`gasPrice\` for legacy transactions.

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

  expect(() => parseTransaction(serialized1559))
    .toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `);

  expect(() => parseTransaction(serialized2930))
    .toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `);

  expect(() => parseTransaction(serialized1559InvalidKeys))
    .toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123

    Version: viem@1.0.2"
  `);

  expect(() => parseTransaction(serialized2930InvalidKeys))
    .toThrowErrorMatchingInlineSnapshot(`
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

  expect(parseTransaction(encoded)).toEqual({
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

  expect(parseTransaction(withChainId)).toEqual({
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

  expect(parseTransaction(withSignature)).toEqual({
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

  expect(() => parseTransaction(encodedIncorrectChainId))
    .toThrowErrorMatchingInlineSnapshot(`
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

  expect(() => parseTransaction(incorrectChainId))
    .toThrowErrorMatchingInlineSnapshot(`
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

  expect(() => parseTransaction(invalidS)).toThrowErrorMatchingInlineSnapshot(`
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

  expect(() => parseTransaction(invalidS)).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123
    0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe

    Version: viem@1.0.2"
  `);

  expect(() => parseTransaction(s as EIP2930Serialized))
    .toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123
    0x123

    Version: viem@1.0.2"
  `);

  expect(() => parseTransaction(r as EIP1559Serialized))
    .toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123
    0x123

    Version: viem@1.0.2"
  `);
});
