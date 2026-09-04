import { describe, expect, test } from 'vitest'
import * as tempo from '~test/tempo.js'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { deposit } from './deposit.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)

describe('deposit.calls', () => {
  test('default', () => {
    expect(
      deposit.calls({
        amount: 1n,
        tempoRefundRecipient: account.address,
        recipient: account.address,
        token: '0x20C0000000000000000000000000000000000001',
        zoneId: 7,
      }),
    ).toMatchInlineSnapshot(`
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
                  "indexed": true,
                  "name": "nonce",
                  "type": "uint64",
                },
                {
                  "name": "threshold",
                  "type": "uint8",
                },
                {
                  "name": "sequencers",
                  "type": "address[]",
                },
              ],
              "name": "SequencerSetUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "name",
                  "type": "string",
                },
                {
                  "name": "symbol",
                  "type": "string",
                },
                {
                  "name": "currency",
                  "type": "string",
                },
              ],
              "name": "TokenEnabled",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "account",
                  "type": "address",
                },
                {
                  "name": "prev",
                  "type": "uint8",
                },
                {
                  "name": "next",
                  "type": "uint8",
                },
              ],
              "name": "RoleUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "name": "accessMode",
                  "type": "bool",
                },
                {
                  "name": "gatewayMode",
                  "type": "bool",
                },
              ],
              "name": "EnforcementModesUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "previousLeader",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "newLeader",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "leaderEpoch",
                  "type": "uint64",
                },
                {
                  "name": "leaderActivationTempoBlock",
                  "type": "uint64",
                },
              ],
              "name": "LeaderUpdated",
              "type": "event",
            },
            {
              "inputs": [],
              "name": "zoneId",
              "outputs": [
                {
                  "type": "uint32",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "admin",
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
              "name": "messenger",
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
              "name": "isAccessEnforced",
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
                  "name": "enforced",
                  "type": "bool",
                },
              ],
              "name": "setAccessMode",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "isGatewayOpen",
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
                  "name": "enforced",
                  "type": "bool",
                },
              ],
              "name": "setGatewayMode",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "account",
                  "type": "address",
                },
                {
                  "name": "role",
                  "type": "uint8",
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
                  "name": "account",
                  "type": "address",
                },
                {
                  "name": "allowed",
                  "type": "bool",
                },
              ],
              "name": "setAllowedAccount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "account",
                  "type": "address",
                },
                {
                  "name": "allowed",
                  "type": "bool",
                },
              ],
              "name": "setGateway",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "account",
                  "type": "address",
                },
                {
                  "name": "allowed",
                  "type": "bool",
                },
              ],
              "name": "setPauseGuardian",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newSequencers",
                  "type": "address[]",
                },
                {
                  "name": "newThreshold",
                  "type": "uint8",
                },
              ],
              "name": "setSequencerSet",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "verifier",
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
              "name": "sequencerSetVersion",
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
              "name": "sequencerThreshold",
              "outputs": [
                {
                  "type": "uint8",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "zoneHeight",
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
              "name": "isSequencer",
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
              "name": "sequencerCount",
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
                  "name": "index",
                  "type": "uint256",
                },
              ],
              "name": "sequencerAt",
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
              "name": "leader",
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
              "name": "leaderEpoch",
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
              "name": "leaderActivationTempoBlock",
              "outputs": [
                {
                  "type": "uint64",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newLeader",
                  "type": "address",
                },
                {
                  "name": "expectedEpoch",
                  "type": "uint64",
                },
              ],
              "name": "setLeader",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "withdrawalBatchIndex",
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
              "name": "blockHash",
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
              "name": "currentDepositQueueHash",
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
              "name": "lastSyncedTempoBlockNumber",
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
              "name": "withdrawalQueueHead",
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
              "name": "withdrawalQueueTail",
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
                  "name": "queueIndex",
                  "type": "uint256",
                },
              ],
              "name": "withdrawalQueueSlot",
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
              "name": "calculateDepositFee",
              "outputs": [
                {
                  "name": "fee",
                  "type": "uint128",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "calculateBouncebackFee",
              "outputs": [
                {
                  "name": "fee",
                  "type": "uint128",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "depositCount",
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
              "name": "lastProcessedDepositNumber",
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
              "name": "FIXED_DEPOSIT_GAS",
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
              "name": "MAX_GAS_FEE_RATE",
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
              "name": "MAX_TOKENS_ENABLED_PER_TEMPO_BLOCK",
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
              "name": "MAX_TOKEN_METADATA_BYTES",
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
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "areDepositsActive",
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
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "tokenConfig",
              "outputs": [
                {
                  "components": [
                    {
                      "name": "enabled",
                      "type": "bool",
                    },
                    {
                      "name": "depositsActive",
                      "type": "bool",
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
                  "name": "zoneId",
                  "type": "uint32",
                },
                {
                  "name": "initialToken",
                  "type": "address",
                },
                {
                  "name": "accessMode",
                  "type": "bool",
                },
                {
                  "name": "gatewayMode",
                  "type": "bool",
                },
                {
                  "name": "allowedAccounts",
                  "type": "address[]",
                },
                {
                  "name": "zoneGateways",
                  "type": "address[]",
                },
                {
                  "name": "admin",
                  "type": "address",
                },
                {
                  "name": "messenger",
                  "type": "address",
                },
                {
                  "name": "sequencers",
                  "type": "address[]",
                },
                {
                  "name": "threshold",
                  "type": "uint8",
                },
                {
                  "name": "verifier",
                  "type": "address",
                },
                {
                  "name": "rpcUrl",
                  "type": "string",
                },
              ],
              "name": "initialize",
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
                  "name": "token",
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
                {
                  "name": "gasLimit",
                  "type": "uint64",
                },
                {
                  "name": "callbackData",
                  "type": "bytes",
                },
              ],
              "name": "deliverWithdrawal",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "MAX_DEPOSITS_PER_TEMPO_BLOCK",
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
              "name": "MAX_WITHDRAWAL_GAS_LIMIT",
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
              "name": "pauseExpiry",
              "outputs": [
                {
                  "type": "uint64",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "capability",
                  "type": "uint8",
                },
              ],
              "name": "abdicationEffectiveAt",
              "outputs": [
                {
                  "type": "uint64",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "name": "token",
                      "type": "address",
                    },
                    {
                      "name": "senderTag",
                      "type": "bytes32",
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
                    {
                      "name": "gasLimit",
                      "type": "uint64",
                    },
                    {
                      "name": "fallbackNonce",
                      "type": "uint64",
                    },
                    {
                      "name": "callbackData",
                      "type": "bytes",
                    },
                    {
                      "name": "encryptedSender",
                      "type": "bytes",
                    },
                  ],
                  "name": "withdrawals",
                  "type": "tuple[]",
                },
                {
                  "name": "remainingQueue",
                  "type": "bytes32",
                },
              ],
              "name": "processWithdrawals",
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
              "name": "resume",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "capability",
                  "type": "uint8",
                },
              ],
              "name": "abdicate",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "tempoBlockNumber",
                  "type": "uint64",
                },
                {
                  "name": "recentTempoBlockNumber",
                  "type": "uint64",
                },
                {
                  "components": [
                    {
                      "name": "prevBlockHash",
                      "type": "bytes32",
                    },
                    {
                      "name": "nextBlockHash",
                      "type": "bytes32",
                    },
                  ],
                  "name": "blockTransition",
                  "type": "tuple",
                },
                {
                  "components": [
                    {
                      "name": "prevProcessedHash",
                      "type": "bytes32",
                    },
                    {
                      "name": "nextProcessedHash",
                      "type": "bytes32",
                    },
                    {
                      "name": "prevDepositNumber",
                      "type": "uint64",
                    },
                    {
                      "name": "nextDepositNumber",
                      "type": "uint64",
                    },
                  ],
                  "name": "depositQueueTransition",
                  "type": "tuple",
                },
                {
                  "name": "withdrawalQueueHash",
                  "type": "bytes32",
                },
                {
                  "name": "verifierConfig",
                  "type": "bytes",
                },
                {
                  "name": "proof",
                  "type": "bytes",
                },
                {
                  "name": "nextZoneHeight",
                  "type": "uint256",
                },
                {
                  "name": "signatures",
                  "type": "bytes[]",
                },
              ],
              "name": "submitBatch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "enableToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "pauseDeposits",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "resumeDeposits",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newZoneGasRate",
                  "type": "uint128",
                },
              ],
              "name": "setZoneGasRate",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newMaxTempoGasRate",
                  "type": "uint128",
                },
              ],
              "name": "setMaxTempoGasRate",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newBouncebackGas",
                  "type": "uint64",
                },
              ],
              "name": "setBouncebackGas",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "newAdmin",
                  "type": "address",
                },
              ],
              "name": "transferAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "acceptAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [],
              "name": "rpcUrl",
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
                  "name": "rpcUrl",
                  "type": "string",
                },
              ],
              "name": "setRpcUrl",
              "outputs": [],
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
                {
                  "name": "tempoRefundRecipient",
                  "type": "address",
                },
              ],
              "name": "deposit",
              "outputs": [
                {
                  "name": "newCurrentDepositQueueHash",
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
                {
                  "name": "tempoRefundRecipient",
                  "type": "address",
                },
              ],
              "name": "depositEncrypted",
              "outputs": [
                {
                  "name": "newCurrentDepositQueueHash",
                  "type": "bytes32",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "x",
                  "type": "bytes32",
                },
                {
                  "name": "yParity",
                  "type": "uint8",
                },
                {
                  "name": "popV",
                  "type": "uint8",
                },
                {
                  "name": "popR",
                  "type": "bytes32",
                },
                {
                  "name": "popS",
                  "type": "bytes32",
                },
              ],
              "name": "setSequencerEncryptionKey",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "isTokenEnabled",
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
              "name": "enabledTokenCount",
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
                  "name": "index",
                  "type": "uint256",
                },
              ],
              "name": "enabledTokenAt",
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
              "name": "tokenEnablementHash",
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
              "name": "zoneGasRate",
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
              "name": "maxTempoGasRate",
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
              "name": "bouncebackGas",
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
              "name": "pendingAdmin",
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
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "owner",
                  "type": "address",
                },
              ],
              "name": "refunds",
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
                {
                  "name": "pubkey",
                  "type": "address",
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
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "index",
                  "type": "uint256",
                },
              ],
              "name": "encryptionKeyAt",
              "outputs": [
                {
                  "components": [
                    {
                      "name": "x",
                      "type": "bytes32",
                    },
                    {
                      "name": "yParity",
                      "type": "uint8",
                    },
                    {
                      "name": "activationBlock",
                      "type": "uint64",
                    },
                  ],
                  "name": "entry",
                  "type": "tuple",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "keyIndex",
                  "type": "uint256",
                },
              ],
              "name": "isEncryptionKeyValid",
              "outputs": [
                {
                  "name": "valid",
                  "type": "bool",
                },
                {
                  "name": "expiresAtBlock",
                  "type": "uint64",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "tempoBlockNumber",
                  "type": "uint64",
                },
              ],
              "name": "encryptionKeyAtBlock",
              "outputs": [
                {
                  "name": "x",
                  "type": "bytes32",
                },
                {
                  "name": "yParity",
                  "type": "uint8",
                },
                {
                  "name": "keyIndex",
                  "type": "uint256",
                },
              ],
              "stateMutability": "view",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "claimRefund",
              "outputs": [
                {
                  "name": "amount",
                  "type": "uint128",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "newCurrentDepositQueueHash",
                  "type": "bytes32",
                },
                {
                  "indexed": true,
                  "name": "sender",
                  "type": "address",
                },
                {
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "netAmount",
                  "type": "uint128",
                },
                {
                  "name": "fee",
                  "type": "uint128",
                },
                {
                  "name": "keyIndex",
                  "type": "uint256",
                },
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
                {
                  "name": "tempoRefundRecipient",
                  "type": "address",
                },
                {
                  "name": "depositNumber",
                  "type": "uint64",
                },
              ],
              "name": "DepositMade",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "DepositsPaused",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "token",
                  "type": "address",
                },
              ],
              "name": "DepositsResumed",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "account",
                  "type": "address",
                },
              ],
              "name": "PortalPaused",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "account",
                  "type": "address",
                },
              ],
              "name": "PortalResumed",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "capability",
                  "type": "uint8",
                },
                {
                  "name": "effectiveAt",
                  "type": "uint64",
                },
              ],
              "name": "AbdicationScheduled",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "name": "rpcUrl",
                  "type": "string",
                },
              ],
              "name": "RpcUrlUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "name": "x",
                  "type": "bytes32",
                },
                {
                  "name": "yParity",
                  "type": "uint8",
                },
                {
                  "name": "pubkey",
                  "type": "address",
                },
                {
                  "name": "keyIndex",
                  "type": "uint256",
                },
                {
                  "name": "activationBlock",
                  "type": "uint64",
                },
              ],
              "name": "SequencerEncryptionKeyUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "withdrawalBatchIndex",
                  "type": "uint64",
                },
                {
                  "indexed": true,
                  "name": "withdrawalQueueIndex",
                  "type": "uint256",
                },
                {
                  "name": "nextProcessedDepositQueueHash",
                  "type": "bytes32",
                },
                {
                  "name": "nextBlockHash",
                  "type": "bytes32",
                },
                {
                  "name": "withdrawalQueueHash",
                  "type": "bytes32",
                },
                {
                  "name": "lastProcessedDepositNumber",
                  "type": "uint64",
                },
              ],
              "name": "BatchSubmitted",
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
                  "indexed": true,
                  "name": "senderTag",
                  "type": "bytes32",
                },
                {
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint128",
                },
                {
                  "name": "callbackSuccess",
                  "type": "bool",
                },
              ],
              "name": "WithdrawalProcessed",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "newCurrentDepositQueueHash",
                  "type": "bytes32",
                },
                {
                  "indexed": true,
                  "name": "fallbackNonce",
                  "type": "uint64",
                },
                {
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint128",
                },
                {
                  "name": "depositNumber",
                  "type": "uint64",
                },
              ],
              "name": "WithdrawalBounceBack",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "tempoRefundRecipient",
                  "type": "address",
                },
                {
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint128",
                },
                {
                  "name": "bouncebackFee",
                  "type": "uint128",
                },
              ],
              "name": "DepositBounceBack",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "tempoRefundRecipient",
                  "type": "address",
                },
                {
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint128",
                },
                {
                  "name": "bouncebackFee",
                  "type": "uint128",
                },
              ],
              "name": "DepositBounceBackPending",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "recipient",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "token",
                  "type": "address",
                },
                {
                  "name": "amount",
                  "type": "uint128",
                },
              ],
              "name": "RefundClaimed",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "name": "zoneGasRate",
                  "type": "uint128",
                },
              ],
              "name": "ZoneGasRateUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "name": "maxTempoGasRate",
                  "type": "uint128",
                },
              ],
              "name": "MaxTempoGasRateUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "name": "bouncebackGas",
                  "type": "uint64",
                },
              ],
              "name": "BouncebackGasUpdated",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "currentAdmin",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "pendingAdmin",
                  "type": "address",
                },
              ],
              "name": "AdminTransferStarted",
              "type": "event",
            },
            {
              "inputs": [
                {
                  "indexed": true,
                  "name": "previousAdmin",
                  "type": "address",
                },
                {
                  "indexed": true,
                  "name": "newAdmin",
                  "type": "address",
                },
              ],
              "name": "AdminTransferred",
              "type": "event",
            },
            {
              "inputs": [],
              "name": "NotSequencer",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "NotAdmin",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "NotPauseAuthority",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "capability",
                  "type": "uint8",
                },
              ],
              "name": "CapabilityAbdicated",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "capability",
                  "type": "uint8",
                },
              ],
              "name": "AbdicationAlreadyScheduled",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "PortalIsPaused",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "NotPendingAdmin",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidProof",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidTempoBlockNumber",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "NotFactory",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "NotSelf",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "AlreadyInitialized",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "MustDelegateCall",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "CallbackRejected",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "TransferFailed",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "ReentrantWithdrawal",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "keyIndex",
                  "type": "uint256",
                },
                {
                  "name": "activationBlock",
                  "type": "uint64",
                },
                {
                  "name": "supersededAtBlock",
                  "type": "uint64",
                },
              ],
              "name": "EncryptionKeyExpired",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "keyIndex",
                  "type": "uint256",
                },
              ],
              "name": "InvalidEncryptionKeyIndex",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "NoEncryptionKeySet",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "blockNumber",
                  "type": "uint64",
                },
              ],
              "name": "NoEncryptionKeyAtBlock",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidEphemeralPubkey",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "actual",
                  "type": "uint256",
                },
                {
                  "name": "expected",
                  "type": "uint256",
                },
              ],
              "name": "InvalidCiphertextLength",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidProofOfPossession",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "DepositTooSmall",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "maximum",
                  "type": "uint64",
                },
              ],
              "name": "TokenEnablementBlockCapacityExceeded",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "TokenMetadataTooLong",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "GasFeeRateTooHigh",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "DepositsNotActive",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "TokenAlreadyEnabled",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "TokenTransferPolicyNotSet",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidDepositTransition",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidSequencerSet",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "SequencerConfigurationUnchanged",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidQuorumCertificate",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "CallbackDidNotReturnToZone",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidBouncebackRecipient",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "TokenNotEnabled",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "maximum",
                  "type": "uint64",
                },
              ],
              "name": "DepositBlockCapacityExceeded",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidCallbackTarget",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "account",
                  "type": "address",
                },
              ],
              "name": "AccountNotAllowed",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "InvalidLeader",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "ActiveLeaderRemoved",
              "type": "error",
            },
            {
              "inputs": [],
              "name": "LeaderAlreadyUpdatedThisBlock",
              "type": "error",
            },
            {
              "inputs": [
                {
                  "name": "expected",
                  "type": "uint64",
                },
                {
                  "name": "actual",
                  "type": "uint64",
                },
              ],
              "name": "StaleLeadershipEpoch",
              "type": "error",
            },
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
                {
                  "name": "tempoRefundRecipient",
                  "type": "address",
                },
              ],
              "name": "deposit",
              "outputs": [
                {
                  "type": "bytes32",
                },
              ],
              "stateMutability": "nonpayable",
              "type": "function",
            },
          ],
          "address": "0x3F5296303400B56271b476F5A0B9cBF74350D6Ac",
          "args": [
            "0x20C0000000000000000000000000000000000001",
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            1n,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          ],
          "data": "0x09a0a23400000000000000000000000020c0000000000000000000000000000000000001000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "functionName": "deposit",
          "to": "0x3F5296303400B56271b476F5A0B9cBF74350D6Ac",
        },
      ]
    `)
  })

  test('custom portal and Tempo refund recipient', () => {
    const portalAddress = '0x0000000000000000000000000000000000000002'
    const calls = deposit.calls({
      amount: 1n,
      tempoRefundRecipient: '0x0000000000000000000000000000000000000003',
      portalAddress,
      recipient: account.address,
      token: '0x20C0000000000000000000000000000000000001',
      zoneId: 7,
    })

    expect(
      calls.map(({ data, functionName, to }) => ({ data, functionName, to })),
    ).toMatchInlineSnapshot(`
      [
        {
          "data": "0x095ea7b300000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001",
          "functionName": "approve",
          "to": "0x20C0000000000000000000000000000000000001",
        },
        {
          "data": "0x09a0a23400000000000000000000000020c0000000000000000000000000000000000001000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003",
          "functionName": "deposit",
          "to": "0x0000000000000000000000000000000000000002",
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
