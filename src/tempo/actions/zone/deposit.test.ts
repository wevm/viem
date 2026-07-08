import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Client, http } from 'viem/tempo'
import { tempoLocalnet, tempoModerato } from 'viem/chains'

import { deposit } from './deposit.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)

describe('deposit.calls', () => {
  test('default', () => {
    expect(deposit.calls({ amount: 1n, chainId: tempoModerato.id, recipient: account.address, token: '0x20C0000000000000000000000000000000000001', zoneId: 7 })).toMatchInlineSnapshot(`
      [
        {
          "abi": [
            {
              "inputs": [],
              "name": "name",
              "outputs": [
                {
                  "type": "string",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "symbol",
              "outputs": [
                {
                  "type": "string",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "decimals",
              "outputs": [
                {
                  "type": "uint8",
                },
              ],
              "stateMutability": "pure",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "totalSupply",
              "outputs": [
                {
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "quoteToken",
              "outputs": [
                {
                  "type": "address",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "nextQuoteToken",
              "outputs": [
                {
                  "type": "address",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "account",
                  "type": "address",
                },
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "transfer",
              "outputs": [
                {
                  "type": "bool",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "spender",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "approve",
              "outputs": [
                {
                  "type": "bool",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "owner",
                  "type": "address",
                },
                {
                  "name": "spender",
                  "type": "address",
                },
              ],
              "name": "allowance",
              "outputs": [
                {
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "from",
                  "type": "address",
                },
                {
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "transferFrom",
              "outputs": [
                {
                  "type": "bool",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "mint",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "burn",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "currency",
              "outputs": [
                {
                  "type": "string",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "supplyCap",
              "outputs": [
                {
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "paused",
              "outputs": [
                {
                  "type": "bool",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "transferPolicyId",
              "outputs": [
                {
                  "type": "uint64",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "logoURI",
              "outputs": [
                {
                  "type": "string",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newLogoURI",
                  "type": "string",
                },
              ],
              "name": "setLogoURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "from",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "burnBlocked",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
                {
                  "name": "memo",
                  "type": "bytes32",
                },
              ],
              "name": "mintWithMemo",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "amount",
                  "type": "uint256",
                },
                {
                  "name": "memo",
                  "type": "bytes32",
                },
              ],
              "name": "burnWithMemo",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
                {
                  "name": "memo",
                  "type": "bytes32",
                },
              ],
              "name": "transferWithMemo",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "from",
                  "type": "address",
                },
                {
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
                {
                  "name": "memo",
                  "type": "bytes32",
                },
              ],
              "name": "transferFromWithMemo",
              "outputs": [
                {
                  "type": "bool",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newPolicyId",
                  "type": "uint64",
                },
              ],
              "name": "changeTransferPolicyId",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newSupplyCap",
                  "type": "uint256",
                },
              ],
              "name": "setSupplyCap",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "pause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newQuoteToken",
                  "type": "address",
                },
              ],
              "name": "setNextQuoteToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "completeQuoteTokenUpdate",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "PAUSE_ROLE",
              "outputs": [
                {
                  "type": "bytes32",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "UNPAUSE_ROLE",
              "outputs": [
                {
                  "type": "bytes32",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "ISSUER_ROLE",
              "outputs": [
                {
                  "type": "bytes32",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "BURN_BLOCKED_ROLE",
              "outputs": [
                {
                  "type": "bytes32",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "owner",
                  "type": "address",
                },
                {
                  "name": "spender",
                  "type": "address",
                },
                {
                  "name": "value",
                  "type": "uint256",
                },
                {
                  "name": "deadline",
                  "type": "uint256",
                },
                {
                  "name": "v",
                  "type": "uint8",
                },
                {
                  "name": "r",
                  "type": "bytes32",
                },
                {
                  "name": "s",
                  "type": "bytes32",
                },
              ],
              "name": "permit",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "owner",
                  "type": "address",
                },
              ],
              "name": "nonces",
              "outputs": [
                {
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "DOMAIN_SEPARATOR",
              "outputs": [
                {
                  "type": "bytes32",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "distributeReward",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "recipient",
                  "type": "address",
                },
              ],
              "name": "setRewardRecipient",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "claimRewards",
              "outputs": [
                {
                  "type": "uint256",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "optedInSupply",
              "outputs": [
                {
                  "type": "uint128",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "globalRewardPerToken",
              "outputs": [
                {
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "account",
                  "type": "address",
                },
              ],
              "name": "userRewardInfo",
              "outputs": [
                {
                  "components": [
                    {
                      "name": "rewardRecipient",
                      "type": "address",
                    },
                    {
                      "name": "rewardPerToken",
                      "type": "uint256",
                    },
                    {
                      "name": "rewardBalance",
                      "type": "uint256",
                    },
                  ],
                  "type": "tuple",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "account",
                  "type": "address",
                },
              ],
              "name": "getPendingRewards",
              "outputs": [
                {
                  "type": "uint128",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "from",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "Transfer",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "owner",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "spender",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "Approval",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "Mint",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "from",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "Burn",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "from",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "BurnBlocked",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "from",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
                {
                  "indexed": true,
                  "name": "memo",
                  "type": "bytes32",
                },
              ],
              "name": "TransferWithMemo",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "updater",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "newPolicyId",
                  "type": "uint64",
                },
              ],
              "name": "TransferPolicyUpdate",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "updater",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "newSupplyCap",
                  "type": "uint256",
                },
              ],
              "name": "SupplyCapUpdate",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "updater",
                  "type": "address",
                },
                {
                  "name": "isPaused",
                  "type": "bool",
                },
              ],
              "name": "PauseStateUpdate",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "updater",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "nextQuoteToken",
                  "type": "address",
                },
              ],
              "name": "NextQuoteTokenSet",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "updater",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "newQuoteToken",
                  "type": "address",
                },
              ],
              "name": "QuoteTokenUpdate",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "funder",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint256",
                },
              ],
              "name": "RewardDistributed",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "holder",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "recipient",
                  "type": "address",
                },
              ],
              "name": "RewardRecipientSet",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "updater",
                  "type": "address",
                },
                {
                  "name": "newLogoURI",
                  "type": "string",
                },
              ],
              "name": "LogoURIUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "name": "available",
                  "type": "uint256",
                },
                {
                  "name": "required",
                  "type": "uint256",
                },
                {
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "InsufficientBalance",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InsufficientAllowance",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "SupplyCapExceeded",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidSupplyCap",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidPayload",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "PolicyForbids",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidRecipient",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "ContractPaused",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidCurrency",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidQuoteToken",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidAmount",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "NoOptedInSupply",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "Unauthorized",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "ProtectedAddress",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidToken",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "Uninitialized",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidTransferPolicyId",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "PermitExpired",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidSignature",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "LogoURITooLong",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidLogoURI",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "account",
                  "type": "address",
                },
                {
                  "name": "role",
                  "type": "bytes32",
                },
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "type": "bool",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "role",
                  "type": "bytes32",
                },
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "type": "bytes32",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "role",
                  "type": "bytes32",
                },
                {
                  "name": "account",
                  "type": "address",
                },
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "role",
                  "type": "bytes32",
                },
                {
                  "name": "account",
                  "type": "address",
                },
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "role",
                  "type": "bytes32",
                },
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "role",
                  "type": "bytes32",
                },
                {
                  "name": "adminRole",
                  "type": "bytes32",
                },
              ],
              "name": "setRoleAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "role",
                  "type": "bytes32",
                },
                {
                  "indexed": true,
                  "name": "account",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "sender",
                  "type": "address",
                },
                {
                  "name": "hasRole",
                  "type": "bool",
                },
              ],
              "name": "RoleMembershipUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "role",
                  "type": "bytes32",
                },
                {
                  "indexed": true,
                  "name": "newAdminRole",
                  "type": "bytes32",
                },
                {
                  "indexed": true,
                  "name": "sender",
                  "type": "address",
                },
              ],
              "name": "RoleAdminUpdated",
              "type": "event",
            },
            {
              "inputs": [],
              "name": "Unauthorized",
              "type": "error",
            },
          ],
          "address": "0x20C0000000000000000000000000000000000001",
          "args": [
            "0x3F5296303400B56271b476F5A0B9cBF74350D6Ac",
            1n,
          ],
          "data": "0x095ea7b30000000000000000000000003f5296303400b56271b476f5a0b9cbf74350d6ac0000000000000000000000000000000000000000000000000000000000000001",
          "functionName": "approve",
          "to": "0x20C0000000000000000000000000000000000001",
        },
        {
          "abi": [
            {
              "inputs": [
                {
                  "name": "_token",
                  "type": "address",
                },
                {
                  "name": "to",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint128",
                },
                {
                  "name": "memo",
                  "type": "bytes32",
                },
              ],
              "name": "deposit",
              "outputs": [
                {
                  "name": "",
                  "type": "bytes32",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint128",
                },
                {
                  "name": "keyIndex",
                  "type": "uint256",
                },
                {
                  "components": [
                    {
                      "name": "ephemeralPubkeyX",
                      "type": "bytes32",
                    },
                    {
                      "name": "ephemeralPubkeyYParity",
                      "type": "uint8",
                    },
                    {
                      "name": "ciphertext",
                      "type": "bytes",
                    },
                    {
                      "name": "nonce",
                      "type": "bytes12",
                    },
                    {
                      "name": "tag",
                      "type": "bytes16",
                    },
                  ],
                  "name": "encrypted",
                  "type": "tuple",
                },
              ],
              "name": "depositEncrypted",
              "outputs": [
                {
                  "name": "",
                  "type": "bytes32",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "sequencerEncryptionKey",
              "outputs": [
                {
                  "name": "x",
                  "type": "bytes32",
                },
                {
                  "name": "yParity",
                  "type": "uint8",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "encryptionKeyCount",
              "outputs": [
                {
                  "name": "",
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
          ],
          "address": "0x3F5296303400B56271b476F5A0B9cBF74350D6Ac",
          "args": [
            "0x20C0000000000000000000000000000000000001",
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            1n,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
          "data": "0x1e77625f00000000000000000000000020c0000000000000000000000000000000000001000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
          "functionName": "deposit",
          "to": "0x3F5296303400B56271b476F5A0B9cBF74350D6Ac",
        },
      ]
    `)
  })

})

test('error: no account', async () => {
  const client = Client.create({
    chain: tempoLocalnet,
    transport: http(tempo.rpcUrl),
  })

  await expect(
    deposit(client, {
      amount: 1n,
      token: '0x20c0000000000000000000000000000000000000',
      zoneId: 7,
    }),
  ).rejects.toThrow('`account` is required.')
})

test.todo(
  'behavior: deposits tokens into zone via parent chain (blocked: dev node lacks zone portal contracts; `portalAddresses` has no localnet entry)',
)
