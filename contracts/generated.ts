export const UUPSUpgradeable = {
  "abi": [
    {
      "type": "function",
      "name": "proxiableUUID",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "upgradeToAndCall",
      "inputs": [
        {
          "name": "newImplementation",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "event",
      "name": "Upgraded",
      "inputs": [
        {
          "name": "implementation",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "UnauthorizedCallContext",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UpgradeFailed",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const SignatureCheckerLib = {
  "abi": [],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea264697066735822122022137f4fca44f033dd558e7b2f478a06979d302ccc075b1ffa6cd0b4ea5f931164736f6c634300081c0033",
    "sourceMap": "1438:25134:29:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;1438:25134:29;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const LibZip = {
  "abi": [],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea2646970667358221220b2eceb8ecff4a0e95c2086a3b66426f11dc09a10e88ab8a9b8b6142a345a9d3b64736f6c634300081c0033",
    "sourceMap": "492:11844:28:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;492:11844:28;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const LibClone = {
  "abi": [
    {
      "type": "error",
      "name": "DeploymentFailed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "ETHTransferFailed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "SaltDoesNotStartWith",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea2646970667358221220506af1be0d65fe904d82c9b1b4fdedcdd3953e31fd5e18af5196d92debd8d90464736f6c634300081c0033",
    "sourceMap": "1796:49207:27:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;1796:49207:27;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const EIP712 = {
  "abi": [
    {
      "type": "function",
      "name": "eip712Domain",
      "inputs": [],
      "outputs": [
        {
          "name": "fields",
          "type": "bytes1",
          "internalType": "bytes1"
        },
        {
          "name": "name",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "version",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "chainId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "extensions",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const Ownable = {
  "abi": [
    {
      "type": "function",
      "name": "cancelOwnershipHandover",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "completeOwnershipHandover",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "result",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ownershipHandoverExpiresAt",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "requestOwnershipHandover",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "event",
      "name": "OwnershipHandoverCanceled",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipHandoverRequested",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "oldOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "AlreadyInitialized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NewOwnerIsZeroAddress",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NoHandoverRequest",
      "inputs": []
    },
    {
      "type": "error",
      "name": "Unauthorized",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const VerifyingPaymaster = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_entryPoint",
          "type": "address",
          "internalType": "contract IEntryPoint"
        },
        {
          "name": "_verifyingSigner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "addStake",
      "inputs": [
        {
          "name": "unstakeDelaySec",
          "type": "uint32",
          "internalType": "uint32"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "deposit",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "entryPoint",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract IEntryPoint"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getDeposit",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getHash",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct PackedUserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "validUntil",
          "type": "uint48",
          "internalType": "uint48"
        },
        {
          "name": "validAfter",
          "type": "uint48",
          "internalType": "uint48"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "parsePaymasterAndData",
      "inputs": [
        {
          "name": "paymasterAndData",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "validUntil",
          "type": "uint48",
          "internalType": "uint48"
        },
        {
          "name": "validAfter",
          "type": "uint48",
          "internalType": "uint48"
        },
        {
          "name": "signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "postOp",
      "inputs": [
        {
          "name": "mode",
          "type": "uint8",
          "internalType": "enum IPaymaster.PostOpMode"
        },
        {
          "name": "context",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "actualGasCost",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "actualUserOpFeePerGas",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "unlockStake",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "validatePaymasterUserOp",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct PackedUserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "userOpHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "maxCost",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "context",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "validationData",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "verifyingSigner",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "withdrawStake",
      "inputs": [
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawTo",
      "inputs": [
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address payable"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "ECDSAInvalidSignature",
      "inputs": []
    },
    {
      "type": "error",
      "name": "ECDSAInvalidSignatureLength",
      "inputs": [
        {
          "name": "length",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "ECDSAInvalidSignatureS",
      "inputs": [
        {
          "name": "s",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x60c060405234801561000f575f5ffd5b5060405161130b38038061130b83398101604081905261002e9161019f565b81338061005557604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b61005e81610080565b50610068816100cf565b6001600160a01b039081166080521660a052506101fd565b5f80546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6040516301ffc9a760e01b8152631313998b60e31b60048201526001600160a01b038216906301ffc9a790602401602060405180830381865afa158015610118573d5f5f3e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061013c91906101d7565b6101885760405162461bcd60e51b815260206004820152601e60248201527f49456e747279506f696e7420696e74657266616365206d69736d617463680000604482015260640161004c565b50565b6001600160a01b0381168114610188575f5ffd5b5f5f604083850312156101b0575f5ffd5b82516101bb8161018b565b60208401519092506101cc8161018b565b809150509250929050565b5f602082840312156101e7575f5ffd5b815180151581146101f6575f5ffd5b9392505050565b60805160a0516110b56102565f395f818161012d015261097101525f8181610255015281816103070152818161039a0152818161058d015281816106220152818161068c0152818161071701526107db01526110b55ff3fe6080604052600436106100e4575f3560e01c80638da5cb5b11610087578063c23a5cea11610057578063c23a5cea1461028b578063c399ec88146102aa578063d0e30db0146102be578063f2fde38b146102c6575f5ffd5b80638da5cb5b146101f957806394d4ad6014610215578063b0d691fe14610244578063bb9fe6bf14610277575f5ffd5b806352b7512c116100c257806352b7512c1461016c5780635829c5f514610199578063715018a6146101c65780637c627b21146101da575f5ffd5b80630396cb60146100e8578063205c2878146100fd57806323d9ac9b1461011c575b5f5ffd5b6100fb6100f6366004610ca5565b6102e5565b005b348015610108575f5ffd5b506100fb610117366004610ce3565b61036c565b348015610127575f5ffd5b5061014f7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b348015610177575f5ffd5b5061018b610186366004610d24565b6103db565b604051610163929190610d6e565b3480156101a4575f5ffd5b506101b86101b3366004610dc4565b6103fe565b604051908152602001610163565b3480156101d1575f5ffd5b506100fb61050d565b3480156101e5575f5ffd5b506100fb6101f4366004610e63565b610520565b348015610204575f5ffd5b505f546001600160a01b031661014f565b348015610220575f5ffd5b5061023461022f366004610ec8565b61053c565b6040516101639493929190610f07565b34801561024f575f5ffd5b5061014f7f000000000000000000000000000000000000000000000000000000000000000081565b348015610282575f5ffd5b506100fb610583565b348015610296575f5ffd5b506100fb6102a5366004610f53565b6105fb565b3480156102b5575f5ffd5b506101b8610675565b6100fb610702565b3480156102d1575f5ffd5b506100fb6102e0366004610f53565b610762565b6102ed6107a4565b604051621cb65b60e51b815263ffffffff821660048201527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690630396cb609034906024015f604051808303818588803b158015610352575f5ffd5b505af1158015610364573d5f5f3e3d5ffd5b505050505050565b6103746107a4565b60405163040b850f60e31b81526001600160a01b038381166004830152602482018390527f0000000000000000000000000000000000000000000000000000000000000000169063205c2878906044015f604051808303815f87803b158015610352575f5ffd5b60605f6103e66107d0565b6103f1858585610840565b915091505b935093915050565b5f83358060208601356104146040880188610f6e565b604051610422929190610fb1565b6040519081900390206104386060890189610f6e565b604051610446929190610fb1565b604051908190039020608089013561046160e08b018b610f6e565b61047091603491601491610fc0565b61047991610fe7565b604080516001600160a01b0390971660208801528601949094526060850192909252608084015260a08084019190915260c08084019290925287013560e0830152860135610100820152466101208201523061014082015265ffffffffffff80861661016083015284166101808201526101a001604051602081830303815290604052805190602001209150509392505050565b6105156107a4565b61051e5f6109f1565b565b6105286107d0565b6105358585858585610a40565b5050505050565b5f80368161054d8560348189610fc0565b81019061055a9190611004565b9094509250858561056d60346040611035565b610578928290610fc0565b949793965094505050565b61058b6107a4565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663bb9fe6bf6040518163ffffffff1660e01b81526004015f604051808303815f87803b1580156105e3575f5ffd5b505af11580156105f5573d5f5f3e3d5ffd5b50505050565b6106036107a4565b60405163611d2e7560e11b81526001600160a01b0382811660048301527f0000000000000000000000000000000000000000000000000000000000000000169063c23a5cea906024015f604051808303815f87803b158015610663575f5ffd5b505af1158015610535573d5f5f3e3d5ffd5b6040516370a0823160e01b81523060048201525f907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa1580156106d9573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906106fd9190611054565b905090565b60405163b760faf960e01b81523060048201527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063b760faf99034906024015f604051808303818588803b158015610663575f5ffd5b61076a6107a4565b6001600160a01b03811661079857604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b6107a1816109f1565b50565b5f546001600160a01b0316331461051e5760405163118cdaa760e01b815233600482015260240161078f565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461051e5760405162461bcd60e51b815260206004820152601560248201527414d95b99195c881b9bdd08115b9d1c9e541bda5b9d605a1b604482015260640161078f565b60605f8080368161085761022f60e08b018b610f6e565b9296509094509250905060408114806108705750604181145b6108e4576040805162461bcd60e51b81526020600482015260248101919091527f566572696679696e675061796d61737465723a20696e76616c6964207369676e60448201527f6174757265206c656e67746820696e207061796d6173746572416e6444617461606482015260840161078f565b5f6109256108f38b87876103fe565b7f19457468657265756d205369676e6564204d6573736167653a0a3332000000005f908152601c91909152603c902090565b90506109668184848080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92019190915250610a7892505050565b6001600160a01b03167f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316146109c8576109aa60018686610aa2565b60405180602001604052805f815250909650965050505050506103f6565b6109d35f8686610aa2565b60408051602081019091525f81529b909a5098505050505050505050565b5f80546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60405162461bcd60e51b815260206004820152600d60248201526c6d757374206f7665727269646560981b604482015260640161078f565b5f5f5f5f610a868686610ad8565b925092509250610a968282610b21565b50909150505b92915050565b5f60d08265ffffffffffff16901b60a08465ffffffffffff16901b85610ac8575f610acb565b60015b60ff161717949350505050565b5f5f5f8351604103610b0f576020840151604085015160608601515f1a610b0188828585610bdd565b955095509550505050610b1a565b505081515f91506002905b9250925092565b5f826003811115610b3457610b3461106b565b03610b3d575050565b6001826003811115610b5157610b5161106b565b03610b6f5760405163f645eedf60e01b815260040160405180910390fd5b6002826003811115610b8357610b8361106b565b03610ba45760405163fce698f760e01b81526004810182905260240161078f565b6003826003811115610bb857610bb861106b565b03610bd9576040516335e2f38360e21b81526004810182905260240161078f565b5050565b5f80807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0841115610c1657505f91506003905082610c9b565b604080515f808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa158015610c67573d5f5f3e3d5ffd5b5050604051601f1901519150506001600160a01b038116610c9257505f925060019150829050610c9b565b92505f91508190505b9450945094915050565b5f60208284031215610cb5575f5ffd5b813563ffffffff81168114610cc8575f5ffd5b9392505050565b6001600160a01b03811681146107a1575f5ffd5b5f5f60408385031215610cf4575f5ffd5b8235610cff81610ccf565b946020939093013593505050565b5f6101208284031215610d1e575f5ffd5b50919050565b5f5f5f60608486031215610d36575f5ffd5b833567ffffffffffffffff811115610d4c575f5ffd5b610d5886828701610d0d565b9660208601359650604090950135949350505050565b604081525f83518060408401528060208601606085015e5f606082850101526060601f19601f8301168401019150508260208301529392505050565b803565ffffffffffff81168114610dbf575f5ffd5b919050565b5f5f5f60608486031215610dd6575f5ffd5b833567ffffffffffffffff811115610dec575f5ffd5b610df886828701610d0d565b935050610e0760208501610daa565b9150610e1560408501610daa565b90509250925092565b5f5f83601f840112610e2e575f5ffd5b50813567ffffffffffffffff811115610e45575f5ffd5b602083019150836020828501011115610e5c575f5ffd5b9250929050565b5f5f5f5f5f60808688031215610e77575f5ffd5b853560038110610e85575f5ffd5b9450602086013567ffffffffffffffff811115610ea0575f5ffd5b610eac88828901610e1e565b9699909850959660408101359660609091013595509350505050565b5f5f60208385031215610ed9575f5ffd5b823567ffffffffffffffff811115610eef575f5ffd5b610efb85828601610e1e565b90969095509350505050565b65ffffffffffff8516815265ffffffffffff8416602082015260606040820152816060820152818360808301375f818301608090810191909152601f909201601f191601019392505050565b5f60208284031215610f63575f5ffd5b8135610cc881610ccf565b5f5f8335601e19843603018112610f83575f5ffd5b83018035915067ffffffffffffffff821115610f9d575f5ffd5b602001915036819003821315610e5c575f5ffd5b818382375f9101908152919050565b5f5f85851115610fce575f5ffd5b83861115610fda575f5ffd5b5050820193919092039150565b80356020831015610a9c575f19602084900360031b1b1692915050565b5f5f60408385031215611015575f5ffd5b61101e83610daa565b915061102c60208401610daa565b90509250929050565b80820180821115610a9c57634e487b7160e01b5f52601160045260245ffd5b5f60208284031215611064575f5ffd5b5051919050565b634e487b7160e01b5f52602160045260245ffdfea2646970667358221220f609959c1f31ede90a209ae5b438376beacec00cac159b57b0f2060d5880508664736f6c634300081c0033",
    "sourceMap": "922:3624:10:-:0;;;1230:141;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;1307:11;950:10:0;;1269:95:11;;1322:31;;-1:-1:-1;;;1322:31:11;;1350:1;1322:31;;;745:51:60;718:18;;1322:31:11;;;;;;;;1269:95;1373:32;1392:12;1373:18;:32::i;:::-;-1:-1:-1;972:41:0::1;1001:11:::0;972:28:::1;:41::i;:::-;-1:-1:-1::0;;;;;1023:24:0;;::::1;;::::0;1330:34:10::1;;::::0;-1:-1:-1;922:3624:10;;2912:187:11;2985:16;3004:6;;-1:-1:-1;;;;;3020:17:11;;;-1:-1:-1;;;;;;3020:17:11;;;;;;3052:40;;3004:6;;;;;;;3052:40;;2985:16;3052:40;2975:124;2912:187;:::o;1173:218:0:-;1271:78;;-1:-1:-1;;;1271:78:0;;-1:-1:-1;;;1271:78:0;;;951:52:60;-1:-1:-1;;;;;1271:47:0;;;;;924:18:60;;1271:78:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;1263:121;;;;-1:-1:-1;;;1263:121:0;;1498:2:60;1263:121:0;;;1480:21:60;1537:2;1517:18;;;1510:30;1576:32;1556:18;;;1549:60;1626:18;;1263:121:0;1296:354:60;1263:121:0;1173:218;:::o;14:144:60:-;-1:-1:-1;;;;;102:31:60;;92:42;;82:70;;148:1;145;138:12;163:431;262:6;270;323:2;311:9;302:7;298:23;294:32;291:52;;;339:1;336;329:12;291:52;371:9;365:16;390:44;428:5;390:44;:::i;:::-;503:2;488:18;;482:25;453:5;;-1:-1:-1;516:46:60;482:25;516:46;:::i;:::-;581:7;571:17;;;163:431;;;;;:::o;1014:277::-;1081:6;1134:2;1122:9;1113:7;1109:23;1105:32;1102:52;;;1150:1;1147;1140:12;1102:52;1182:9;1176:16;1235:5;1228:13;1221:21;1214:5;1211:32;1201:60;;1257:1;1254;1247:12;1201:60;1280:5;1014:277;-1:-1:-1;;;1014:277:60:o;1296:354::-;922:3624:10;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const Receiver = {
  "abi": [
    {
      "type": "fallback",
      "stateMutability": "payable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const ERC4337Factory = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "erc4337",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "createAccount",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getAddress",
      "inputs": [
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "implementation",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initCodeHash",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x60a060405260405161048138038061048183398101604081905261002291610033565b6001600160a01b0316608052610060565b5f60208284031215610043575f5ffd5b81516001600160a01b0381168114610059575f5ffd5b9392505050565b6080516103f661008b5f395f8181608f0152818160ec0152818161011e015261015a01526103f65ff3fe60806040526004361061003e575f3560e01c806321f8a721146100425780635c60da1b1461007e578063db4c545e146100b1578063f14ddffc146100d3575b5f5ffd5b34801561004d575f5ffd5b5061006161005c366004610374565b6100e6565b6040516001600160a01b0390911681526020015b60405180910390f35b348015610089575f5ffd5b506100617f000000000000000000000000000000000000000000000000000000000000000081565b3480156100bc575f5ffd5b506100c5610118565b604051908152602001610075565b6100616100e136600461038b565b610147565b5f6101127f000000000000000000000000000000000000000000000000000000000000000083306101b8565b92915050565b5f6101427f00000000000000000000000000000000000000000000000000000000000000006101d9565b905090565b5f610152828461024d565b5f5f61017f347f000000000000000000000000000000000000000000000000000000000000000086610277565b91509150816101b0578460145263189acdbd60631b5f525f38602460105f855af16101b0573d5f6040513e3d604051fd5b949350505050565b5f5f6101c3856101d9565b90506101d0818585610355565b95945050505050565b604080517fcc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f360609081527f5155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e20768352616009602052601e9390935268603d3d8160223d3973600a52605f60212091525f90915290565b606082901c80156001600160a01b0383169091141761027357630c4549ef5f526004601cfd5b5050565b5f5f6040517fcc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f36060527f5155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e207660405261600960205284601e5268603d3d8160223d3973600a52605f60212060358201523060581b815260ff8153836015820152605581209150813b6103215783605f602188f591508161031c5763301164255f526004601cfd5b610344565b600192508515610344575f385f3889865af16103445763b12d13eb5f526004601cfd5b80604052505f606052935093915050565b5f60ff5f5350603592835260601b60015260155260555f908120915290565b5f60208284031215610384575f5ffd5b5035919050565b5f5f6040838503121561039c575f5ffd5b82356001600160a01b03811681146103b2575f5ffd5b94602093909301359350505056fea26469706673582212202526f3c1c1b42803d246b625bf0feca3540414da5c16228e673a22ae871e237564736f6c634300081c0033",
    "sourceMap": "861:2867:23:-:0;;;1555:78;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;;;;1602:24:23;;;861:2867;;14:290:60;84:6;137:2;125:9;116:7;112:23;108:32;105:52;;;153:1;150;143:12;105:52;179:16;;-1:-1:-1;;;;;224:31:60;;214:42;;204:70;;270:1;267;260:12;204:70;293:5;14:290;-1:-1:-1;;;14:290:60:o;:::-;861:2867:23;;;;;;;;;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const ERC4337 = {
  "abi": [
    {
      "type": "fallback",
      "stateMutability": "payable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "addDeposit",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "cancelOwnershipHandover",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "completeOwnershipHandover",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "delegateExecute",
      "inputs": [
        {
          "name": "delegate",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "eip712Domain",
      "inputs": [],
      "outputs": [
        {
          "name": "fields",
          "type": "bytes1",
          "internalType": "bytes1"
        },
        {
          "name": "name",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "version",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "chainId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "extensions",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "entryPoint",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "execute",
      "inputs": [
        {
          "name": "target",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "executeBatch",
      "inputs": [
        {
          "name": "calls",
          "type": "tuple[]",
          "internalType": "struct ERC4337.Call[]",
          "components": [
            {
              "name": "target",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "value",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "results",
          "type": "bytes[]",
          "internalType": "bytes[]"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getDeposit",
      "inputs": [],
      "outputs": [
        {
          "name": "result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initialize",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "isValidSignature",
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes4",
          "internalType": "bytes4"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "result",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ownershipHandoverExpiresAt",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "proxiableUUID",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "requestOwnershipHandover",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "storageLoad",
      "inputs": [
        {
          "name": "storageSlot",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "storageStore",
      "inputs": [
        {
          "name": "storageSlot",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "storageValue",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "upgradeToAndCall",
      "inputs": [
        {
          "name": "newImplementation",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "validateUserOp",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct ERC4337.UserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callGasLimit",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "verificationGasLimit",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "maxFeePerGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "maxPriorityFeePerGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "userOpHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "missingAccountFunds",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "validationData",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "withdrawDepositTo",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "event",
      "name": "OwnershipHandoverCanceled",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipHandoverRequested",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "oldOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Upgraded",
      "inputs": [
        {
          "name": "implementation",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "AlreadyInitialized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NewOwnerIsZeroAddress",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NoHandoverRequest",
      "inputs": []
    },
    {
      "type": "error",
      "name": "Unauthorized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnauthorizedCallContext",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UpgradeFailed",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const ERC1271 = {
  "abi": [
    {
      "type": "function",
      "name": "eip712Domain",
      "inputs": [],
      "outputs": [
        {
          "name": "fields",
          "type": "bytes1",
          "internalType": "bytes1"
        },
        {
          "name": "name",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "version",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "chainId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "extensions",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isValidSignature",
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes4",
          "internalType": "bytes4"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const UserOperationLib = {
  "abi": [
    {
      "type": "function",
      "name": "PAYMASTER_DATA_OFFSET",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "PAYMASTER_POSTOP_GAS_OFFSET",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "PAYMASTER_VALIDATION_GAS_OFFSET",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x60a76032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106046575f3560e01c806325093e1b14604a578063b29a8ff4146063578063ede3150214606a575b5f5ffd5b6051602481565b60405190815260200160405180910390f35b6051601481565b605160348156fea2646970667358221220ad0a2cd4bc7d535f2e5b5e8266445afebcfd716f668fb80293977b8ab5ba211664736f6c634300081c0033",
    "sourceMap": "282:4714:2:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;282:4714:2;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const IERC1271Wallet = {
  "abi": [
    {
      "type": "function",
      "name": "isValidSignature",
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "magicValue",
          "type": "bytes4",
          "internalType": "bytes4"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const VerifySig = {
  "abi": [
    {
      "type": "function",
      "name": "isValidSig",
      "inputs": [
        {
          "name": "_signer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_hash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b506107008061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610029575f3560e01c806398ef1ed81461002d575b5f5ffd5b61004061003b3660046104e4565b610054565b604051901515815260200160405180910390f35b5f7f649264926492649264926492649264926492649264926492649264926492649261007f8361042c565b036101e9575f6060808480602001905181019061009c91906105c6565b60405192955090935091505f906001600160a01b038516906100bf90859061063d565b5f604051808303815f865af19150503d805f81146100f8576040519150601f19603f3d011682016040523d82523d5f602084013e6100fd565b606091505b50509050876001600160a01b03163b5f0361016457806101645760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610194908b908790600401610653565b602060405180830381865afa1580156101af573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906101d3919061068f565b6001600160e01b03191614945050505050610425565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e906102299087908790600401610653565b602060405180830381865afa158015610244573d5f5f3e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610268919061068f565b6001600160e01b031916149050610425565b81516041146102f15760405162461bcd60e51b815260206004820152603a60248201527f5369676e617475726556616c696461746f72237265636f7665725369676e657260448201527f3a20696e76616c6964207369676e6174757265206c656e677468000000000000606482015260840161015b565b6102f9610443565b50602082015160408084015184518593925f91859190811061031d5761031d6106b6565b016020015160f81c9050601b811480159061033c57508060ff16601c14155b156103af5760405162461bcd60e51b815260206004820152603b60248201527f5369676e617475726556616c696461746f72237265636f7665725369676e657260448201527f3a20696e76616c6964207369676e617475726520762076616c75650000000000606482015260840161015b565b604080515f81526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa15801561040a573d5f5f3e3d5ffd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b5f60208251101561043b575f5ffd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b0381168114610475575f5ffd5b50565b634e487b7160e01b5f52604160045260245ffd5b604051601f8201601f1916810167ffffffffffffffff811182821017156104b5576104b5610478565b604052919050565b5f67ffffffffffffffff8211156104d6576104d6610478565b50601f01601f191660200190565b5f5f5f606084860312156104f6575f5ffd5b833561050181610461565b925060208401359150604084013567ffffffffffffffff811115610523575f5ffd5b8401601f81018613610533575f5ffd5b8035610546610541826104bd565b61048c565b81815287602083850101111561055a575f5ffd5b816020840160208301375f602083830101528093505050509250925092565b5f82601f830112610588575f5ffd5b8151610596610541826104bd565b8181528460208386010111156105aa575f5ffd5b8160208501602083015e5f918101602001919091529392505050565b5f5f5f606084860312156105d8575f5ffd5b83516105e381610461565b602085015190935067ffffffffffffffff8111156105ff575f5ffd5b61060b86828701610579565b925050604084015167ffffffffffffffff811115610627575f5ffd5b61063386828701610579565b9150509250925092565b5f82518060208501845e5f920191825250919050565b828152604060208201525f82518060408401528060208501606085015e5f606082850101526060601f19601f8301168401019150509392505050565b5f6020828403121561069f575f5ffd5b81516001600160e01b031981168114610425575f5ffd5b634e487b7160e01b5f52603260045260245ffdfea2646970667358221220b4b061495245470807cde2d09ef3b01653daa2de2d46974817a458507ded656064736f6c634300081c0033",
    "sourceMap": "285:2507:43:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const Strings = {
  "abi": [
    {
      "type": "error",
      "name": "StringsInsufficientHexLength",
      "inputs": [
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "length",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "StringsInvalidAddressFormat",
      "inputs": []
    },
    {
      "type": "error",
      "name": "StringsInvalidChar",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea2646970667358221220c0150982574161a955ad3901cd24ba4cef040faba933befeaece22697ba2028e64736f6c634300081c0033",
    "sourceMap": "297:16541:14:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;297:16541:14;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const SoladyAccount07 = {
  "abi": [
    {
      "type": "fallback",
      "stateMutability": "payable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "addDeposit",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "cancelOwnershipHandover",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "completeOwnershipHandover",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "delegateExecute",
      "inputs": [
        {
          "name": "delegate",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "eip712Domain",
      "inputs": [],
      "outputs": [
        {
          "name": "fields",
          "type": "bytes1",
          "internalType": "bytes1"
        },
        {
          "name": "name",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "version",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "chainId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "extensions",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "entryPoint",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "execute",
      "inputs": [
        {
          "name": "target",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "executeBatch",
      "inputs": [
        {
          "name": "calls",
          "type": "tuple[]",
          "internalType": "struct ERC4337.Call[]",
          "components": [
            {
              "name": "target",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "value",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "results",
          "type": "bytes[]",
          "internalType": "bytes[]"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getDeposit",
      "inputs": [],
      "outputs": [
        {
          "name": "result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initialize",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "isValidSignature",
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes4",
          "internalType": "bytes4"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "result",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ownershipHandoverExpiresAt",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "proxiableUUID",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "requestOwnershipHandover",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "storageLoad",
      "inputs": [
        {
          "name": "storageSlot",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "storageStore",
      "inputs": [
        {
          "name": "storageSlot",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "storageValue",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "upgradeToAndCall",
      "inputs": [
        {
          "name": "newImplementation",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "validateUserOp",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct ERC4337.PackedUserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "userOpHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "missingAccountFunds",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "validationData",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "withdrawDepositTo",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "event",
      "name": "OwnershipHandoverCanceled",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipHandoverRequested",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "oldOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Upgraded",
      "inputs": [
        {
          "name": "implementation",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "AlreadyInitialized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "FnSelectorNotRecognized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NewOwnerIsZeroAddress",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NoHandoverRequest",
      "inputs": []
    },
    {
      "type": "error",
      "name": "Unauthorized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnauthorizedCallContext",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UpgradeFailed",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x61014060405230608052348015610014575f5ffd5b503060a0524660c052606080610062604080518082018252600d81526c14dbdb18591e5058d8dbdd5b9d609a1b602080830191909152825180840190935260018352603160f81b9083015291565b815160209283012081519183019190912060e0829052610100819052604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f8152938401929092529082015246606082015230608082015260a0902061012052506100cf90506100d4565b610138565b6100de60016100e0565b565b638b78c6d8198054156100fa57630dc149f05f526004601cfd5b6001600160a01b03909116801560ff1b8117909155805f7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08180a350565b60805160a05160c05160e05161010051610120516114a36101865f395f610f4a01525f61100401525f610fde01525f610f8e01525f610f6b01525f8181610685015261075301526114a35ff3fe608060405260043610610138575f3560e01c806384b0196e116100aa578063c399ec881161006e578063c399ec8814610308578063c4d66de81461031c578063cb0fec1f1461032f578063f04e283e1461034d578063f2fde38b14610360578063fee81cf4146103735761013f565b806384b0196e146102605780638da5cb5b14610287578063b0d691fe146102b3578063b10cc728146102d5578063b61d27f6146102f55761013f565b80634a58db19116100fc5780634a58db191461020e5780634d44560d146102165780634f1ef2861461022957806352d1902d1461023c57806354d1f13d14610250578063715018a6146102585761013f565b8063125b14e5146101755780631626ba7e1461018857806319822f7c146101c557806325692962146101e657806334fcd5be146101ee5761013f565b3661013f57005b5f3560e01c63bc197c81811463f23a6e6182141763150b7a028214171561016a57806020526020603cf35b506101736103a6565b005b61017361018336600461106c565b610435565b348015610193575f5ffd5b506101a76101a23660046110ca565b61047c565b6040516001600160e01b031990911681526020015b60405180910390f35b6101d86101d3366004611112565b6104cb565b6040519081526020016101bc565b610173610520565b6102016101fc366004611161565b61056d565b6040516101bc9190611200565b610173610608565b61017361022436600461127e565b61062f565b6101736102373660046112a6565b610683565b348015610247575f5ffd5b506101d8610750565b61017361079a565b6101736107d3565b34801561026b575f5ffd5b506102746107e4565b6040516101bc97969594939291906112dc565b348015610292575f5ffd5b50638b78c6d819545b6040516001600160a01b0390911681526020016101bc565b3480156102be575f5ffd5b506f71727de22e5e9d8baf0edac6f37da03261029b565b6102e86102e33660046112a6565b610844565b6040516101bc9190611372565b6102e8610303366004611384565b6108d4565b348015610313575f5ffd5b506101d8610929565b61017361032a3660046113da565b610962565b34801561033a575f5ffd5b506101d86103493660046113f3565b5490565b61017361035b3660046113da565b61096b565b61017361036e3660046113da565b6109a5565b34801561037e575f5ffd5b506101d861038d3660046113da565b63389a75e1600c9081525f91909152602090205490565b565b366103af573636f35b5f5f5b803682106103c05750610419565b600182019160031981019035185f1a80610409575f1984526002820192356002198301185f1a607f81116103f657600181013886395b6001607f821686010194505050506103b2565b80845350506001820191506103b2565b505f38825f305af490503d5f5f3e80610430573d5ffd5b503d5ff35b336f71727de22e5e9d8baf0edac6f37da03214610454576104546109cb565b815f51602061144e5f395f51905f528114638b78c6d81982141715610477575f38fd5b509055565b5f816104a05761773961ffff8319040284036104a05750637739000160e01b6104c4565b5f6104b4856104af8686610a09565b610a39565b155f03631626ba7e1760e01b9150505b9392505050565b5f336f71727de22e5e9d8baf0edac6f37da032146104fb576040516282b42960e81b815260040160405180910390fd5b816105068585610a6f565b91508015610518575f385f3884335af1505b509392505050565b5f6202a30067ffffffffffffffff164201905063389a75e1600c52335f52806020600c2055337fdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d5f5fa250565b6060336f71727de22e5e9d8baf0edac6f37da0321461058e5761058e6109cb565b6040519050818152806020018260051b81018360051b858337805b8083146105fd57825186016040810135810180356020820185375f38823586602086013586355af16105dd573d5f853e3d84fd5b50508183523d8252602082013d5f823e602093909301923d0191506105a9565b506040525092915050565b6f71727de22e5e9d8baf0edac6f37da0325f38818134855af1813b0261062c575f38fd5b50565b6106376109cb565b5f6f71727de22e5e9d8baf0edac6f37da0329050826014528160345263040b850f60631b5f525f38604460105f855af1813b0261067a573d5f6040513e3d604051fd5b5f603452505050565b7f00000000000000000000000000000000000000000000000000000000000000003081036106b857639f03a0265f526004601cfd5b6106c184610acb565b8360601b60601c93506352d1902d6001525f51602061144e5f395f51905f5280602060016004601d895afa5114610700576355299b496001526004601dfd5b847fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f38a2849055811561074a57604051828482375f388483885af4610748573d5f823e3d81fd5b505b50505050565b5f7f000000000000000000000000000000000000000000000000000000000000000030811461078657639f03a0265f526004601cfd5b5f51602061144e5f395f51905f5291505090565b63389a75e1600c52335f525f6020600c2055337ffa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c925f5fa2565b6107db6109cb565b6103a45f610ad3565b600f60f81b6060805f808083610832604080518082018252600d81526c14dbdb18591e5058d8dbdd5b9d609a1b602080830191909152825180840190935260018352603160f81b9083015291565b97989097965046955030945091925090565b6060336f71727de22e5e9d8baf0edac6f37da03214610865576108656109cb565b505f51602061144e5f395f51905f5254638b78c6d8195460405191838584375f388585895af4610897573d5f843e3d83fd5b3d8352602083013d5f823e3d01604052638b78c6d819545f51602061144e5f395f51905f52548214908314166108cb575f38fd5b50509392505050565b6060336f71727de22e5e9d8baf0edac6f37da032146108f5576108f56109cb565b50604051818382375f38838387895af1610911573d5f823e3d81fd5b3d8152602081013d5f823e3d01604052949350505050565b5f806f71727de22e5e9d8baf0edac6f37da0329050306020526370a082315f526020806024601c845afa601f3d11166020510291505090565b61062c81610b19565b6109736109cb565b63389a75e1600c52805f526020600c20805442111561099957636f5e88185f526004601cfd5b5f905561062c81610ad3565b6109ad6109cb565b8060601b6109c257637448fbae5f526004601cfd5b61062c81610ad3565b638b78c6d819546001600160a01b0316336001600160a01b0316146103a4573330146103a4576040516282b42960e81b815260040160405180910390fd5b818161649261ffff30801c190402818301601f19013503610a3257506040810135016020810190355b9250929050565b5f610a45848484610b71565b80610a565750610a56848484610b8a565b80610a675750610a67848484610dc7565b949350505050565b5f5f610ac2610a81638b78c6d8195490565b610aaf856020527b19457468657265756d205369676e6564204d6573736167653a0a33325f52603c60042090565b610abd61010088018861140a565b610e32565b15949350505050565b61062c6109cb565b638b78c6d81980546001600160a01b039092169182907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3811560ff1b8217905550565b638b78c6d819805415610b3357630dc149f05f526004601cfd5b6001600160a01b03909116801560ff1b8117909155805f7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08180a350565b5f610b7a610f00565b156104c457610a67848484610f34565b5f308015610be9575f5f5f5f5f610b9f6107e4565b506040805186516020978801208183015285519590960194909420606086015260808501929092526001600160a01b031660a084015260c083015260e08201905296505050505050505b6040516002840385013560f01c8060420180860387016119015f52604081602037821582881017896042601e20181715610c54575f94507f983e65e5148e570cd828ead231ee759a8d7958721a768f93bc4483ba005c32de8552886020526040852098505050610d9e565b6d0a8f2e0cac888c2e8c2a6d2cedc560931b8452600e84018360408301823760288185019081525f1901515f1a602914610cbe575f6001858301035b6001820191506029828203515f1a1486831011610c9057508085039450808560408501018337602881830153505b6f07fffffe00000000000001000000000081515f1a1c5b602882515f1a14610cfb57806512010000000183515f1a1c179050600182019150610cd5565b7f20636f6e74656e74732c737472696e67206e616d652c737472696e670000000082527f2076657273696f6e2c75696e7432353620636861696e49642c61646472657373601c8301527f20766572696679696e67436f6e74726163742c627974657333322073616c7429603c830152605c820191508460408401833760408388379084018590038520865260e08620604052600116604201601e20985050909403935b5060405280610db357610db085610f48565b94505b610dbe858585610f34565b95945050505050565b5f3a6104c4573a3a526d378edcd5b5b0a24f5342d8c1048560203a3a388461fffffa503a51610e2657604051631626ba7e3a528160205260408052454561ffff0117805a108388141715610e1757fe5b3a3a6064601c3085fa50506040525b50610a67848484610f34565b5f6001600160a01b03851615610a67576040518260408114610e5c5760418114610e835750610eb8565b60208581013560ff81901c601b0190915285356040526001600160ff1b0316606052610e94565b60408501355f1a6020526040856040375b50845f526020600160805f60015afa5180871860601b3d119250505f606052806040525b81610ef757631626ba7e60e01b80825285600483015260248201604081528460448401528486606485013760208160648701858b5afa90519091141691505b50949350505050565b5f336f71727de22e5e9d8baf0edac6f37da0321480610f2f5750506dd9ecebf3c23529de49815dac1c4c331490565b905090565b5f610a67610f4061105e565b858585610e32565b7f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000030147f000000000000000000000000000000000000000000000000000000000000000046141661103b5750604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f81527f000000000000000000000000000000000000000000000000000000000000000060208201527f00000000000000000000000000000000000000000000000000000000000000009181019190915246606082015230608082015260a090205b6719010000000000005f5280601a5281603a52604260182090505f603a52919050565b5f610f2f638b78c6d8195490565b5f5f6040838503121561107d575f5ffd5b50508035926020909101359150565b5f5f83601f84011261109c575f5ffd5b50813567ffffffffffffffff8111156110b3575f5ffd5b602083019150836020828501011115610a32575f5ffd5b5f5f5f604084860312156110dc575f5ffd5b83359250602084013567ffffffffffffffff8111156110f9575f5ffd5b6111058682870161108c565b9497909650939450505050565b5f5f5f60608486031215611124575f5ffd5b833567ffffffffffffffff81111561113a575f5ffd5b8401610120818703121561114c575f5ffd5b95602085013595506040909401359392505050565b5f5f60208385031215611172575f5ffd5b823567ffffffffffffffff811115611188575f5ffd5b8301601f81018513611198575f5ffd5b803567ffffffffffffffff8111156111ae575f5ffd5b8560208260051b84010111156111c2575f5ffd5b6020919091019590945092505050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b5f602082016020835280845180835260408501915060408160051b8601019250602086015f5b8281101561125757603f198786030184526112428583516111d2565b94506020938401939190910190600101611226565b50929695505050505050565b80356001600160a01b0381168114611279575f5ffd5b919050565b5f5f6040838503121561128f575f5ffd5b61129883611263565b946020939093013593505050565b5f5f5f604084860312156112b8575f5ffd5b6112c184611263565b9250602084013567ffffffffffffffff8111156110f9575f5ffd5b60ff60f81b8816815260e060208201525f6112fa60e08301896111d2565b828103604084015261130c81896111d2565b606084018890526001600160a01b038716608085015260a0840186905283810360c0850152845180825260208087019350909101905f5b81811015611361578351835260209384019390920191600101611343565b50909b9a5050505050505050505050565b602081525f6104c460208301846111d2565b5f5f5f5f60608587031215611397575f5ffd5b6113a085611263565b935060208501359250604085013567ffffffffffffffff8111156113c2575f5ffd5b6113ce8782880161108c565b95989497509550505050565b5f602082840312156113ea575f5ffd5b6104c482611263565b5f60208284031215611403575f5ffd5b5035919050565b5f5f8335601e1984360301811261141f575f5ffd5b83018035915067ffffffffffffffff821115611439575f5ffd5b602001915036819003821315610a32575f5ffdfe360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbca2646970667358221220ecaf3812d6d4ca1b9c60d30de55831b511c397ce1c8e186cdcdf74c25d9532f864736f6c634300081c0033",
    "sourceMap": "118:221:47:-:0;;;1525:4:41;1466:66;;118:221:47;;;;;;;;;-1:-1:-1;2157:4:37;2119:45;;2191:13;2174:30;;2215:18;;2331:23;301:29:47;;;;;;;;;;;-1:-1:-1;;;301:29:47;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;301:29:47;;;;;160:177;2331:23:37;2431:22;;;;;;;2545:25;;;;;;;;;2580:26;;;;2616:32;;;;2828:4;2822:11;;2893:16;2883:27;;2934:12;;;2927:30;;;;2981:12;;;2974:33;3045:9;3038:4;3031:12;;3024:31;3093:9;3086:4;3079:12;;3072:31;3146:4;3133:18;;3184:34;;-1:-1:-1;2895:42:32;;-1:-1:-1;2895:40:32;:42::i;:::-;118:221:47;;3216:379:32;3560:28;3585:1;3560:16;:28::i;:::-;3216:379::o;4883:1190:36:-;-1:-1:-1;;5125:9:36;5119:16;5116:150;;;5171:10;5165:4;5158:24;5243:4;5237;5230:18;5116:150;-1:-1:-1;;;;;5339:26:36;;;5462:16;;5457:3;5453:26;5440:40;;5422:59;;;5339:26;5607:1;5567:38;5607:1;;5556:63;4883:1190;:::o;118:221:47:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const SoladyAccount06 = {
  "abi": [
    {
      "type": "fallback",
      "stateMutability": "payable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "addDeposit",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "cancelOwnershipHandover",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "completeOwnershipHandover",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "delegateExecute",
      "inputs": [
        {
          "name": "delegate",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "eip712Domain",
      "inputs": [],
      "outputs": [
        {
          "name": "fields",
          "type": "bytes1",
          "internalType": "bytes1"
        },
        {
          "name": "name",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "version",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "chainId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "extensions",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "entryPoint",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "execute",
      "inputs": [
        {
          "name": "target",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "executeBatch",
      "inputs": [
        {
          "name": "calls",
          "type": "tuple[]",
          "internalType": "struct ERC4337.Call[]",
          "components": [
            {
              "name": "target",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "value",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "results",
          "type": "bytes[]",
          "internalType": "bytes[]"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getDeposit",
      "inputs": [],
      "outputs": [
        {
          "name": "result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initialize",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "isValidSignature",
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes4",
          "internalType": "bytes4"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "result",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ownershipHandoverExpiresAt",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "proxiableUUID",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "requestOwnershipHandover",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "storageLoad",
      "inputs": [
        {
          "name": "storageSlot",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "storageStore",
      "inputs": [
        {
          "name": "storageSlot",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "storageValue",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "upgradeToAndCall",
      "inputs": [
        {
          "name": "newImplementation",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "validateUserOp",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct ERC4337.UserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callGasLimit",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "verificationGasLimit",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "maxFeePerGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "maxPriorityFeePerGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "userOpHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "missingAccountFunds",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "validationData",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "withdrawDepositTo",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "event",
      "name": "OwnershipHandoverCanceled",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipHandoverRequested",
      "inputs": [
        {
          "name": "pendingOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "oldOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Upgraded",
      "inputs": [
        {
          "name": "implementation",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "AlreadyInitialized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NewOwnerIsZeroAddress",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NoHandoverRequest",
      "inputs": []
    },
    {
      "type": "error",
      "name": "Unauthorized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnauthorizedCallContext",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UpgradeFailed",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x61014060405230608052348015610014575f5ffd5b503060a0524660c052606080610062604080518082018252600d81526c14dbdb18591e5058d8dbdd5b9d609a1b602080830191909152825180840190935260018352603160f81b9083015291565b815160209283012081519183019190912060e0829052610100819052604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f8152938401929092529082015246606082015230608082015260a0902061012052506100cf90506100d4565b610138565b6100de60016100e0565b565b638b78c6d8198054156100fa57630dc149f05f526004601cfd5b6001600160a01b03909116801560ff1b8117909155805f7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08180a350565b60805160a05160c05160e05161010051610120516111cc6101865f395f610a7f01525f610b3901525f610b1301525f610ac301525f610aa001525f81816106d801526107a601526111cc5ff3fe608060405260043610610138575f3560e01c806384b0196e116100aa578063c399ec881161006e578063c399ec881461030c578063c4d66de814610320578063cb0fec1f14610333578063f04e283e14610351578063f2fde38b14610364578063fee81cf4146103775761013f565b806384b0196e146102605780638da5cb5b14610287578063b0d691fe146102b3578063b10cc728146102d9578063b61d27f6146102f95761013f565b80634a58db19116100fc5780634a58db191461020e5780634d44560d146102165780634f1ef2861461022957806352d1902d1461023c57806354d1f13d14610250578063715018a6146102585761013f565b8063125b14e5146101755780631626ba7e1461018857806325692962146101c557806334fcd5be146101cd5780633a871cdd146101ed5761013f565b3661013f57005b5f3560e01c63bc197c81811463f23a6e6182141763150b7a028214171561016a57806020526020603cf35b506101736103a8565b005b610173610183366004610d87565b610437565b348015610193575f5ffd5b506101a76101a2366004610dec565b610482565b6040516001600160e01b031990911681526020015b60405180910390f35b61017361050e565b6101e06101db366004610e34565b61055b565b6040516101bc9190610ed3565b6102006101fb366004610f36565b6105fa565b6040519081526020016101bc565b610173610653565b610173610224366004610fa0565b61067e565b610173610237366004610fc8565b6106d6565b348015610247575f5ffd5b506102006107a3565b6101736107ed565b610173610826565b34801561026b575f5ffd5b50610274610839565b6040516101bc9796959493929190610ffe565b348015610292575f5ffd5b50638b78c6d819545b6040516001600160a01b0390911681526020016101bc565b3480156102be575f5ffd5b50735ff137d4b0fdcd49dca30c7cf57e578a026d278961029b565b6102ec6102e7366004610fc8565b610899565b6040516101bc9190611094565b6102ec6103073660046110ad565b61092d565b348015610317575f5ffd5b50610200610986565b61017361032e366004611103565b6109c3565b34801561033e575f5ffd5b5061020061034d36600461111c565b5490565b61017361035f366004611103565b6109cc565b610173610372366004611103565b610a06565b348015610382575f5ffd5b50610200610391366004611103565b63389a75e1600c9081525f91909152602090205490565b366103b1573636f35b5f5f5b803682106103c2575061041b565b600182019160031981019035185f1a8061040b575f1984526002820192356002198301185f1a607f81116103f857600181013886395b6001607f821686010194505050506103b4565b80845350506001820191506103b4565b505f38825f305af490503d5f5f3e80610432573d5ffd5b503d5ff35b33735ff137d4b0fdcd49dca30c7cf57e578a026d27891461045a5761045a610a2c565b815f5160206111775f395f51905f528114638b78c6d8198214171561047d575f38fd5b509055565b5f6040516060830384016060815f376119015f5260608410866042601e2018176104bf5760608403935080355f528560205260605f2095506104d9565b6020840360208511029350856060526040802095505f6060525b506040525f6104f96104e9610a6a565b6104f287610a7d565b8686610b93565b155f03631626ba7e1760e01b95945050505050565b5f6202a30067ffffffffffffffff164201905063389a75e1600c52335f52806020600c2055337fdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d5f5fa250565b606033735ff137d4b0fdcd49dca30c7cf57e578a026d27891461058057610580610a2c565b6040519050818152806020018260051b81018360051b858337805b8083146105ef57825186016040810135810180356020820185375f38823586602086013586355af16105cf573d5f853e3d84fd5b50508183523d8252602082013d5f823e602093909301923d01915061059b565b506040525092915050565b5f33735ff137d4b0fdcd49dca30c7cf57e578a026d27891461062e576040516282b42960e81b815260040160405180910390fd5b816106398585610c85565b9150801561064b575f385f3884335af1505b509392505050565b735ff137d4b0fdcd49dca30c7cf57e578a026d27895f38818134855af1813b0261067b575f38fd5b50565b610686610a2c565b5f735ff137d4b0fdcd49dca30c7cf57e578a026d27899050826014528160345263040b850f60631b5f525f38604460105f855af1813b026106cd573d5f6040513e3d604051fd5b5f603452505050565b7f000000000000000000000000000000000000000000000000000000000000000030810361070b57639f03a0265f526004601cfd5b61071484610ce1565b8360601b60601c93506352d1902d6001525f5160206111775f395f51905f5280602060016004601d895afa5114610753576355299b496001526004601dfd5b847fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f38a2849055811561079d57604051828482375f388483885af461079b573d5f823e3d81fd5b505b50505050565b5f7f00000000000000000000000000000000000000000000000000000000000000003081146107d957639f03a0265f526004601cfd5b5f5160206111775f395f51905f5291505090565b63389a75e1600c52335f525f6020600c2055337ffa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c925f5fa2565b61082e610a2c565b6108375f610ce9565b565b600f60f81b6060805f808083610887604080518082018252600d81526c14dbdb18591e5058d8dbdd5b9d609a1b602080830191909152825180840190935260018352603160f81b9083015291565b97989097965046955030945091925090565b606033735ff137d4b0fdcd49dca30c7cf57e578a026d2789146108be576108be610a2c565b505f5160206111775f395f51905f5254638b78c6d8195460405191838584375f388585895af46108f0573d5f843e3d83fd5b3d8352602083013d5f823e3d01604052638b78c6d819545f5160206111775f395f51905f5254821490831416610924575f38fd5b50509392505050565b606033735ff137d4b0fdcd49dca30c7cf57e578a026d27891461095257610952610a2c565b50604051818382375f38838387895af161096e573d5f823e3d81fd5b3d8152602081013d5f823e3d01604052949350505050565b5f80735ff137d4b0fdcd49dca30c7cf57e578a026d27899050306020526370a082315f526020806024601c845afa601f3d11166020510291505090565b61067b81610d2f565b6109d4610a2c565b63389a75e1600c52805f526020600c2080544211156109fa57636f5e88185f526004601cfd5b5f905561067b81610ce9565b610a0e610a2c565b8060601b610a2357637448fbae5f526004601cfd5b61067b81610ce9565b638b78c6d819546001600160a01b0316336001600160a01b03161461083757333014610837576040516282b42960e81b815260040160405180910390fd5b5f610a78638b78c6d8195490565b905090565b7f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000030147f0000000000000000000000000000000000000000000000000000000000000000461416610b705750604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f81527f000000000000000000000000000000000000000000000000000000000000000060208201527f00000000000000000000000000000000000000000000000000000000000000009181019190915246606082015230608082015260a090205b6719010000000000005f5280601a5281603a52604260182090505f603a52919050565b6001600160a01b03909316925f8415610c7d57604051845f5260408303610bfa5760208481013560ff81901c601b01825285356040526001600160ff1b0316606052600160805f825afa805187183d1517610bf857505f606052604052506001610c7d565b505b60418303610c3a5760408401355f1a6020526040846040376020600160805f60015afa805187183d1517610c3857505f606052604052506001610c7d565b505b5f60605280604052631626ba7e60e01b80825285600483015260248201604081528460448401528486606485013760208160648701858b5afa9051909114169150505b949350505050565b5f5f610cd8610c97638b78c6d8195490565b610cc5856020527b19457468657265756d205369676e6564204d6573736167653a0a33325f52603c60042090565b610cd3610140880188611133565b610b93565b15949350505050565b61067b610a2c565b638b78c6d81980546001600160a01b039092169182907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3811560ff1b8217905550565b638b78c6d819805415610d4957630dc149f05f526004601cfd5b6001600160a01b03909116801560ff1b8117909155805f7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08180a350565b5f5f60408385031215610d98575f5ffd5b50508035926020909101359150565b5f5f83601f840112610db7575f5ffd5b50813567ffffffffffffffff811115610dce575f5ffd5b602083019150836020828501011115610de5575f5ffd5b9250929050565b5f5f5f60408486031215610dfe575f5ffd5b83359250602084013567ffffffffffffffff811115610e1b575f5ffd5b610e2786828701610da7565b9497909650939450505050565b5f5f60208385031215610e45575f5ffd5b823567ffffffffffffffff811115610e5b575f5ffd5b8301601f81018513610e6b575f5ffd5b803567ffffffffffffffff811115610e81575f5ffd5b8560208260051b8401011115610e95575f5ffd5b6020919091019590945092505050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b5f602082016020835280845180835260408501915060408160051b8601019250602086015f5b82811015610f2a57603f19878603018452610f15858351610ea5565b94506020938401939190910190600101610ef9565b50929695505050505050565b5f5f5f60608486031215610f48575f5ffd5b833567ffffffffffffffff811115610f5e575f5ffd5b84016101608187031215610f70575f5ffd5b95602085013595506040909401359392505050565b80356001600160a01b0381168114610f9b575f5ffd5b919050565b5f5f60408385031215610fb1575f5ffd5b610fba83610f85565b946020939093013593505050565b5f5f5f60408486031215610fda575f5ffd5b610fe384610f85565b9250602084013567ffffffffffffffff811115610e1b575f5ffd5b60ff60f81b8816815260e060208201525f61101c60e0830189610ea5565b828103604084015261102e8189610ea5565b606084018890526001600160a01b038716608085015260a0840186905283810360c0850152845180825260208087019350909101905f5b81811015611083578351835260209384019390920191600101611065565b50909b9a5050505050505050505050565b602081525f6110a66020830184610ea5565b9392505050565b5f5f5f5f606085870312156110c0575f5ffd5b6110c985610f85565b935060208501359250604085013567ffffffffffffffff8111156110eb575f5ffd5b6110f787828801610da7565b95989497509550505050565b5f60208284031215611113575f5ffd5b6110a682610f85565b5f6020828403121561112c575f5ffd5b5035919050565b5f5f8335601e19843603018112611148575f5ffd5b83018035915067ffffffffffffffff821115611162575f5ffd5b602001915036819003821315610de5575f5ffdfe360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbca26469706673582212209e8d7e0e63e201efdc6a0db1c2f7019169682acda5e60ed2772fe747055c1b3e64736f6c634300081c0033",
    "sourceMap": "126:221:46:-:0;;;1520:4:30;1461:66;;126:221:46;;;;;;;;;-1:-1:-1;2157:4:26;2119:45;;2191:13;2174:30;;2215:18;;2331:23;309:29:46;;;;;;;;;;;-1:-1:-1;;;309:29:46;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;309:29:46;;;;;168:177;2331:23:26;2431:22;;;;;;;2545:25;;;;;;;;;2580:26;;;;2616:32;;;;2828:4;2822:11;;2893:16;2883:27;;2934:12;;;2927:30;;;;2981:12;;;2974:33;3045:9;3038:4;3031:12;;3024:31;3093:9;3086:4;3079:12;;3072:31;3146:4;3133:18;;3184:34;;-1:-1:-1;2539:42:22;;-1:-1:-1;2539:40:22;:42::i;:::-;126:221:46;;2860:379:22;3204:28;3229:1;3204:16;:28::i;:::-;2860:379::o;4883:1190:25:-;-1:-1:-1;;5125:9:25;5119:16;5116:150;;;5171:10;5165:4;5158:24;5243:4;5237;5230:18;5116:150;-1:-1:-1;;;;;5339:26:25;;;5462:16;;5457:3;5453:26;5440:40;;5422:59;;;5339:26;5607:1;5567:38;5607:1;;5556:63;4883:1190;:::o;126:221:46:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const SoladyAccountFactory07 = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "erc4337",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createAccount",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getAddress",
      "inputs": [
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "implementation",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initCodeHash",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x60a060405234801561000f575f5ffd5b5060405161048d38038061048d83398101604081905261002e9161003f565b6001600160a01b031660805261006c565b5f6020828403121561004f575f5ffd5b81516001600160a01b0381168114610065575f5ffd5b9392505050565b6080516103f66100975f395f8181608f0152818160ec0152818161011e015261015a01526103f65ff3fe60806040526004361061003e575f3560e01c806321f8a721146100425780635c60da1b1461007e578063db4c545e146100b1578063f14ddffc146100d3575b5f5ffd5b34801561004d575f5ffd5b5061006161005c366004610374565b6100e6565b6040516001600160a01b0390911681526020015b60405180910390f35b348015610089575f5ffd5b506100617f000000000000000000000000000000000000000000000000000000000000000081565b3480156100bc575f5ffd5b506100c5610118565b604051908152602001610075565b6100616100e136600461038b565b610147565b5f6101127f000000000000000000000000000000000000000000000000000000000000000083306101b8565b92915050565b5f6101427f00000000000000000000000000000000000000000000000000000000000000006101d9565b905090565b5f610152828461024d565b5f5f61017f347f000000000000000000000000000000000000000000000000000000000000000086610277565b91509150816101b0578460145263189acdbd60631b5f525f38602460105f855af16101b0573d5f6040513e3d604051fd5b949350505050565b5f5f6101c3856101d9565b90506101d0818585610355565b95945050505050565b604080517fcc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f360609081527f5155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e20768352616009602052601e9390935268603d3d8160223d3973600a52605f60212091525f90915290565b606082901c80156001600160a01b0383169091141761027357630c4549ef5f526004601cfd5b5050565b5f5f6040517fcc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f36060527f5155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e207660405261600960205284601e5268603d3d8160223d3973600a52605f60212060358201523060581b815260ff8153836015820152605581209150813b6103215783605f602188f591508161031c5763301164255f526004601cfd5b610344565b600192508515610344575f385f3889865af16103445763b12d13eb5f526004601cfd5b80604052505f606052935093915050565b5f60ff5f5350603592835260601b60015260155260555f908120915290565b5f60208284031215610384575f5ffd5b5035919050565b5f5f6040838503121561039c575f5ffd5b82356001600160a01b03811681146103b2575f5ffd5b94602093909301359350505056fea26469706673582212200c1c56196dcb1419bfb86447e82b733e679acd2f241fcfb3e5943c87009c9a2d64736f6c634300081c0033",
    "sourceMap": "132:113:45:-:0;;;188:55;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;;;;1602:24:33;;;132:113:45;;14:290:60;84:6;137:2;125:9;116:7;112:23;108:32;105:52;;;153:1;150;143:12;105:52;179:16;;-1:-1:-1;;;;;224:31:60;;214:42;;204:70;;270:1;267;260:12;204:70;293:5;14:290;-1:-1:-1;;;14:290:60:o;:::-;132:113:45;;;;;;;;;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const SoladyAccountFactory06 = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "erc4337",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createAccount",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getAddress",
      "inputs": [
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "implementation",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initCodeHash",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x60a060405234801561000f575f5ffd5b5060405161048d38038061048d83398101604081905261002e9161003f565b6001600160a01b031660805261006c565b5f6020828403121561004f575f5ffd5b81516001600160a01b0381168114610065575f5ffd5b9392505050565b6080516103f66100975f395f8181608f0152818160ec0152818161011e015261015a01526103f65ff3fe60806040526004361061003e575f3560e01c806321f8a721146100425780635c60da1b1461007e578063db4c545e146100b1578063f14ddffc146100d3575b5f5ffd5b34801561004d575f5ffd5b5061006161005c366004610374565b6100e6565b6040516001600160a01b0390911681526020015b60405180910390f35b348015610089575f5ffd5b506100617f000000000000000000000000000000000000000000000000000000000000000081565b3480156100bc575f5ffd5b506100c5610118565b604051908152602001610075565b6100616100e136600461038b565b610147565b5f6101127f000000000000000000000000000000000000000000000000000000000000000083306101b8565b92915050565b5f6101427f00000000000000000000000000000000000000000000000000000000000000006101d9565b905090565b5f610152828461024d565b5f5f61017f347f000000000000000000000000000000000000000000000000000000000000000086610277565b91509150816101b0578460145263189acdbd60631b5f525f38602460105f855af16101b0573d5f6040513e3d604051fd5b949350505050565b5f5f6101c3856101d9565b90506101d0818585610355565b95945050505050565b604080517fcc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f360609081527f5155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e20768352616009602052601e9390935268603d3d8160223d3973600a52605f60212091525f90915290565b606082901c80156001600160a01b0383169091141761027357630c4549ef5f526004601cfd5b5050565b5f5f6040517fcc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f36060527f5155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e207660405261600960205284601e5268603d3d8160223d3973600a52605f60212060358201523060581b815260ff8153836015820152605581209150813b6103215783605f602188f591508161031c5763301164255f526004601cfd5b610344565b600192508515610344575f385f3889865af16103445763b12d13eb5f526004601cfd5b80604052505f606052935093915050565b5f60ff5f5350603592835260601b60015260155260555f908120915290565b5f60208284031215610384575f5ffd5b5035919050565b5f5f6040838503121561039c575f5ffd5b82356001600160a01b03811681146103b2575f5ffd5b94602093909301359350505056fea2646970667358221220112cb9284c6064ca513ddef9bb4e67c8e5ea7a959abe63d7793d21c5506bb43364736f6c634300081c0033",
    "sourceMap": "140:113:44:-:0;;;196:55;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;;;;1602:24:23;;;140:113:44;;14:290:60;84:6;137:2;125:9;116:7;112:23;108:32;105:52;;;153:1;150;143:12;105:52;179:16;;-1:-1:-1;;;;;224:31:60;;214:42;;204:70;;270:1;267;260:12;204:70;293:5;14:290;-1:-1:-1;;;14:290:60:o;:::-;140:113:44;;;;;;;;;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const SignedMath = {
  "abi": [],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea2646970667358221220fa133fd98cd710841873751bdcdb8b5d2223bfb3dddfdd3a073cf3390f0937b964736f6c634300081c0033",
    "sourceMap": "258:2354:20:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;258:2354:20;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const SafeCast = {
  "abi": [
    {
      "type": "error",
      "name": "SafeCastOverflowedIntDowncast",
      "inputs": [
        {
          "name": "bits",
          "type": "uint8",
          "internalType": "uint8"
        },
        {
          "name": "value",
          "type": "int256",
          "internalType": "int256"
        }
      ]
    },
    {
      "type": "error",
      "name": "SafeCastOverflowedIntToUint",
      "inputs": [
        {
          "name": "value",
          "type": "int256",
          "internalType": "int256"
        }
      ]
    },
    {
      "type": "error",
      "name": "SafeCastOverflowedUintDowncast",
      "inputs": [
        {
          "name": "bits",
          "type": "uint8",
          "internalType": "uint8"
        },
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "SafeCastOverflowedUintToInt",
      "inputs": [
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea26469706673582212201cc73bde1a7614c9e1eba7b9e03bc9251d76e97208fa3e1dca4ef5858b1a152164736f6c634300081c0033",
    "sourceMap": "769:34173:19:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;769:34173:19;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const Payable = {
  "abi": [
    {
      "type": "function",
      "name": "pay",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b50605780601a5f395ff3fe608060405260043610601b575f3560e01c80631b9265b814601f575b5f5ffd5b00fea2646970667358221220a20b32773d2a1904e51f2de006a0864ba58ff37caf0cb50ace46500fda8f3c6d64736f6c634300081c0033",
    "sourceMap": "64:57:59:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const Panic = {
  "abi": [],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea2646970667358221220bd8a9fb3915922bfd82cdd3ad6d8de33db667e5d943f65a9da93c6e141bde58a64736f6c634300081c0033",
    "sourceMap": "657:1315:13:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;657:1315:13;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const OffchainLookupExample = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "urls_",
          "type": "string[]",
          "internalType": "string[]"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getAddress",
      "inputs": [
        {
          "name": "name",
          "type": "string",
          "internalType": "string"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAddressWithProof",
      "inputs": [
        {
          "name": "result",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "extraData",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "recoverSigner",
      "inputs": [
        {
          "name": "_ethSignedMessageHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "splitSignature",
      "inputs": [
        {
          "name": "sig",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "r",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "s",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "v",
          "type": "uint8",
          "internalType": "uint8"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "urls",
      "inputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "error",
      "name": "OffchainLookup",
      "inputs": [
        {
          "name": "sender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "urls",
          "type": "string[]",
          "internalType": "string[]"
        },
        {
          "name": "callData",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "callbackFunction",
          "type": "bytes4",
          "internalType": "bytes4"
        },
        {
          "name": "extraData",
          "type": "bytes",
          "internalType": "bytes"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x608060405234801561000f575f5ffd5b50604051610bd3380380610bd383398101604081905261002e91610149565b8051610040905f906020840190610047565b50506103ab565b828054828255905f5260205f2090810192821561008b579160200282015b8281111561008b578251829061007b90826102f1565b5091602001919060010190610065565b5061009792915061009b565b5090565b80821115610097575f6100ae82826100b7565b5060010161009b565b5080546100c39061026d565b5f825580601f106100d2575050565b601f0160209004905f5260205f20908101906100ee91906100f1565b50565b5b80821115610097575f81556001016100f2565b634e487b7160e01b5f52604160045260245ffd5b604051601f8201601f191681016001600160401b038111828210171561014157610141610105565b604052919050565b5f60208284031215610159575f5ffd5b81516001600160401b0381111561016e575f5ffd5b8201601f8101841361017e575f5ffd5b80516001600160401b0381111561019757610197610105565b8060051b6101a760208201610119565b918252602081840181019290810190878411156101c2575f5ffd5b6020850192505b838310156102625782516001600160401b038111156101e6575f5ffd5b8501603f810189136101f6575f5ffd5b60208101516001600160401b0381111561021257610212610105565b610225601f8201601f1916602001610119565b8181526040838301018b1015610239575f5ffd5b8160408401602083015e5f602083830101528085525050506020820191506020830192506101c9565b979650505050505050565b600181811c9082168061028157607f821691505b60208210810361029f57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156102ec57805f5260205f20601f840160051c810160208510156102ca5750805b601f840160051c820191505b818110156102e9575f81556001016102d6565b50505b505050565b81516001600160401b0381111561030a5761030a610105565b61031e81610318845461026d565b846102a5565b6020601f821160018114610350575f83156103395750848201515b5f19600385901b1c1916600184901b1784556102e9565b5f84815260208120601f198516915b8281101561037f578785015182556020948501946001909201910161035f565b508482101561039c57868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b61081b806103b85f395ff3fe608060405234801561000f575f5ffd5b5060043610610055575f3560e01c806302137a3414610059578063796676be1461008957806397aba7f9146100a9578063a7bb5803146100bc578063bf40fac1146100ed575b5f5ffd5b61006c6100673660046103c9565b610100565b6040516001600160a01b0390911681526020015b60405180910390f35b61009c610097366004610435565b610189565b604051610080919061047a565b61006c6100b7366004610532565b61022e565b6100cf6100ca366004610576565b6102a8565b60408051938452602084019290925260ff1690820152606001610080565b61006c6100fb3660046105b0565b610319565b5f808080610110878901896105ef565b9250925092505f610121838361022e565b9050836001600160a01b0316816001600160a01b03161461017d5760405162461bcd60e51b8152602060048201526011602482015270696e76616c6964207369676e617475726560781b60448201526064015b60405180910390fd5b98975050505050505050565b5f8181548110610197575f80fd5b905f5260205f20015f9150905080546101af9061064f565b80601f01602080910402602001604051908101604052809291908181526020018280546101db9061064f565b80156102265780601f106101fd57610100808354040283529160200191610226565b820191905f5260205f20905b81548152906001019060200180831161020957829003601f168201915b505050505081565b5f5f5f5f61023b856102a8565b604080515f8152602081018083528b905260ff8316918101919091526060810184905260808101839052929550909350915060019060a0016020604051602081039080840390855afa158015610293573d5f5f3e3d5ffd5b5050604051601f190151979650505050505050565b5f5f5f83516041146102fc5760405162461bcd60e51b815260206004820152601860248201527f696e76616c6964207369676e6174757265206c656e67746800000000000000006044820152606401610174565b5050506020810151604082015160609092015190925f9190911a90565b5f305f848460405160200161032f929190610687565b6040516020818303038152906040526302137a3460e01b8686604051602001610359929190610687565b60408051601f1981840301815290829052630556f18360e41b825261017495949392916004016106b5565b5f5f83601f840112610394575f5ffd5b50813567ffffffffffffffff8111156103ab575f5ffd5b6020830191508360208285010111156103c2575f5ffd5b9250929050565b5f5f5f5f604085870312156103dc575f5ffd5b843567ffffffffffffffff8111156103f2575f5ffd5b6103fe87828801610384565b909550935050602085013567ffffffffffffffff81111561041d575f5ffd5b61042987828801610384565b95989497509550505050565b5f60208284031215610445575f5ffd5b5035919050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f61048c602083018461044c565b9392505050565b634e487b7160e01b5f52604160045260245ffd5b5f82601f8301126104b6575f5ffd5b813567ffffffffffffffff8111156104d0576104d0610493565b604051601f8201601f19908116603f0116810167ffffffffffffffff811182821017156104ff576104ff610493565b604052818152838201602001851015610516575f5ffd5b816020850160208301375f918101602001919091529392505050565b5f5f60408385031215610543575f5ffd5b82359150602083013567ffffffffffffffff811115610560575f5ffd5b61056c858286016104a7565b9150509250929050565b5f60208284031215610586575f5ffd5b813567ffffffffffffffff81111561059c575f5ffd5b6105a8848285016104a7565b949350505050565b5f5f602083850312156105c1575f5ffd5b823567ffffffffffffffff8111156105d7575f5ffd5b6105e385828601610384565b90969095509350505050565b5f5f5f60608486031215610601575f5ffd5b83356001600160a01b0381168114610617575f5ffd5b925060208401359150604084013567ffffffffffffffff811115610639575f5ffd5b610645868287016104a7565b9150509250925092565b600181811c9082168061066357607f821691505b60208210810361068157634e487b7160e01b5f52602260045260245ffd5b50919050565b60208152816020820152818360408301375f818301604090810191909152601f909201601f19160101919050565b5f60a0820160018060a01b038816835260a0602084015280875480835260c08501915060c08160051b8601019250885f5260205f205f5b828110156107ab5786850360bf1901845281545f90600181811c9082168061071557607f821691505b60208210810361073357634e487b7160e01b5f52602260045260245ffd5b8189526020890181801561074e576001811461076457610790565b60ff198516825283151560051b82019550610790565b5f888152602090205f5b8581101561078a5781548482015260019091019060200161076e565b83019650505b509398505050602095909501945050600191820191016106ec565b5050505082810360408401526107c1818761044c565b6001600160e01b0319861660608501529050828103608084015261017d818561044c56fea2646970667358221220235539559839a5c45bf6f47bdf7c66c983cd93eb0d0a2fe40b30f75ac5dc74fb64736f6c634300081c0033",
    "sourceMap": "64:2006:58:-:0;;;290:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;335:12;;;;:4;;:12;;;;;:::i;:::-;;290:64;64:2006;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;64:2006:58;;;-1:-1:-1;64:2006:58;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;;;;;;;;;;;;;;;14:127:60;75:10;70:3;66:20;63:1;56:31;106:4;103:1;96:15;130:4;127:1;120:15;146:275;217:2;211:9;282:2;263:13;;-1:-1:-1;;259:27:60;247:40;;-1:-1:-1;;;;;302:34:60;;338:22;;;299:62;296:88;;;364:18;;:::i;:::-;400:2;393:22;146:275;;-1:-1:-1;146:275:60:o;426:1590::-;531:6;584:2;572:9;563:7;559:23;555:32;552:52;;;600:1;597;590:12;552:52;627:16;;-1:-1:-1;;;;;655:30:60;;652:50;;;698:1;695;688:12;652:50;721:22;;774:4;766:13;;762:27;-1:-1:-1;752:55:60;;803:1;800;793:12;752:55;830:9;;-1:-1:-1;;;;;851:30:60;;848:56;;;884:18;;:::i;:::-;930:6;927:1;923:14;957:28;981:2;977;973:11;957:28;:::i;:::-;1019:19;;;1063:2;1093:11;;;1089:20;;;1054:12;;;;1121:19;;;1118:39;;;1153:1;1150;1143:12;1118:39;1185:2;1181;1177:11;1166:22;;1197:789;1213:6;1208:3;1205:15;1197:789;;;1286:10;;-1:-1:-1;;;;;1312:35:60;;1309:55;;;1360:1;1357;1350:12;1309:55;1387:20;;1442:2;1434:11;;1430:25;-1:-1:-1;1420:53:60;;1469:1;1466;1459:12;1420:53;1516:2;1508:11;;1502:18;-1:-1:-1;;;;;1536:32:60;;1533:58;;;1571:18;;:::i;:::-;1619:59;1668:2;1643:19;;-1:-1:-1;;1639:33:60;1674:2;1635:42;1619:59;:::i;:::-;1691:25;;;1735:35;1743:17;;;1735:35;1732:48;-1:-1:-1;1729:68:60;;;1793:1;1790;1783:12;1729:68;1847:8;1842:2;1838;1834:11;1829:2;1820:7;1816:16;1810:46;1909:1;1904:2;1893:8;1884:7;1880:22;1876:31;1869:42;1936:7;1931:3;1924:20;;;;1973:2;1968:3;1964:12;1957:19;;1239:2;1234:3;1230:12;1223:19;;1197:789;;;2005:5;426:1590;-1:-1:-1;;;;;;;426:1590:60:o;2021:380::-;2100:1;2096:12;;;;2143;;;2164:61;;2218:4;2210:6;2206:17;2196:27;;2164:61;2271:2;2263:6;2260:14;2240:18;2237:38;2234:161;;2317:10;2312:3;2308:20;2305:1;2298:31;2352:4;2349:1;2342:15;2380:4;2377:1;2370:15;2234:161;;2021:380;;;:::o;2532:518::-;2634:2;2629:3;2626:11;2623:421;;;2670:5;2667:1;2660:16;2714:4;2711:1;2701:18;2784:2;2772:10;2768:19;2765:1;2761:27;2755:4;2751:38;2820:4;2808:10;2805:20;2802:47;;;-1:-1:-1;2843:4:60;2802:47;2898:2;2893:3;2889:12;2886:1;2882:20;2876:4;2872:31;2862:41;;2953:81;2971:2;2964:5;2961:13;2953:81;;;3030:1;3016:16;;2997:1;2986:13;2953:81;;;2957:3;;2623:421;2532:518;;;:::o;3226:1299::-;3346:10;;-1:-1:-1;;;;;3368:30:60;;3365:56;;;3401:18;;:::i;:::-;3430:97;3520:6;3480:38;3512:4;3506:11;3480:38;:::i;:::-;3474:4;3430:97;:::i;:::-;3576:4;3607:2;3596:14;;3624:1;3619:649;;;;4312:1;4329:6;4326:89;;;-1:-1:-1;4381:19:60;;;4375:26;4326:89;-1:-1:-1;;3183:1:60;3179:11;;;3175:24;3171:29;3161:40;3207:1;3203:11;;;3158:57;4428:81;;3589:930;;3619:649;2479:1;2472:14;;;2516:4;2503:18;;-1:-1:-1;;3655:20:60;;;3773:222;3787:7;3784:1;3781:14;3773:222;;;3869:19;;;3863:26;3848:42;;3976:4;3961:20;;;;3929:1;3917:14;;;;3803:12;3773:222;;;3777:3;4023:6;4014:7;4011:19;4008:201;;;4084:19;;;4078:26;-1:-1:-1;;4167:1:60;4163:14;;;4179:3;4159:24;4155:37;4151:42;4136:58;4121:74;;4008:201;-1:-1:-1;;;;4255:1:60;4239:14;;;4235:22;4222:36;;-1:-1:-1;3226:1299:60:o;:::-;64:2006:58;;;;;;",
    "linkReferences": {}
  }
} as const;

export const MessageHashUtils = {
  "abi": [],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea2646970667358221220eaa0039e475787aceb64216e30087bd6695191e332753cc1da4e432e49748c7b64736f6c634300081c0033",
    "sourceMap": "521:3231:16:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;521:3231:16;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const Math = {
  "abi": [],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea26469706673582212208f49e708028f772a0b2fffbfa7be983fb21d53894468cab57a5f56c83f2ebcd064736f6c634300081c0033",
    "sourceMap": "281:29376:18:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;281:29376:18;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const IStakeManager = {
  "abi": [
    {
      "type": "function",
      "name": "addStake",
      "inputs": [
        {
          "name": "_unstakeDelaySec",
          "type": "uint32",
          "internalType": "uint32"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "depositTo",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getDepositInfo",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "info",
          "type": "tuple",
          "internalType": "struct IStakeManager.DepositInfo",
          "components": [
            {
              "name": "deposit",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "staked",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "stake",
              "type": "uint112",
              "internalType": "uint112"
            },
            {
              "name": "unstakeDelaySec",
              "type": "uint32",
              "internalType": "uint32"
            },
            {
              "name": "withdrawTime",
              "type": "uint48",
              "internalType": "uint48"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "unlockStake",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawStake",
      "inputs": [
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawTo",
      "inputs": [
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address payable"
        },
        {
          "name": "withdrawAmount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "Deposited",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "totalDeposit",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "StakeLocked",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "totalStaked",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "unstakeDelaySec",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "StakeUnlocked",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "withdrawTime",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "StakeWithdrawn",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "withdrawAddress",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Withdrawn",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "withdrawAddress",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const ISenderCreator = {
  "abi": [
    {
      "type": "function",
      "name": "createSender",
      "inputs": [
        {
          "name": "initCode",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "sender",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const IPaymaster = {
  "abi": [
    {
      "type": "function",
      "name": "postOp",
      "inputs": [
        {
          "name": "mode",
          "type": "uint8",
          "internalType": "enum IPaymaster.PostOpMode"
        },
        {
          "name": "context",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "actualGasCost",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "actualUserOpFeePerGas",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "validatePaymasterUserOp",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct PackedUserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "userOpHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "maxCost",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "context",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "validationData",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "nonpayable"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const INonceManager = {
  "abi": [
    {
      "type": "function",
      "name": "getNonce",
      "inputs": [
        {
          "name": "sender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "key",
          "type": "uint192",
          "internalType": "uint192"
        }
      ],
      "outputs": [
        {
          "name": "nonce",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "incrementNonce",
      "inputs": [
        {
          "name": "key",
          "type": "uint192",
          "internalType": "uint192"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const IEntryPoint = {
  "abi": [
    {
      "type": "function",
      "name": "addStake",
      "inputs": [
        {
          "name": "_unstakeDelaySec",
          "type": "uint32",
          "internalType": "uint32"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "delegateAndRevert",
      "inputs": [
        {
          "name": "target",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "depositTo",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getDepositInfo",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "info",
          "type": "tuple",
          "internalType": "struct IStakeManager.DepositInfo",
          "components": [
            {
              "name": "deposit",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "staked",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "stake",
              "type": "uint112",
              "internalType": "uint112"
            },
            {
              "name": "unstakeDelaySec",
              "type": "uint32",
              "internalType": "uint32"
            },
            {
              "name": "withdrawTime",
              "type": "uint48",
              "internalType": "uint48"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getNonce",
      "inputs": [
        {
          "name": "sender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "key",
          "type": "uint192",
          "internalType": "uint192"
        }
      ],
      "outputs": [
        {
          "name": "nonce",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getSenderAddress",
      "inputs": [
        {
          "name": "initCode",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getUserOpHash",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct PackedUserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "handleAggregatedOps",
      "inputs": [
        {
          "name": "opsPerAggregator",
          "type": "tuple[]",
          "internalType": "struct IEntryPoint.UserOpsPerAggregator[]",
          "components": [
            {
              "name": "userOps",
              "type": "tuple[]",
              "internalType": "struct PackedUserOperation[]",
              "components": [
                {
                  "name": "sender",
                  "type": "address",
                  "internalType": "address"
                },
                {
                  "name": "nonce",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "initCode",
                  "type": "bytes",
                  "internalType": "bytes"
                },
                {
                  "name": "callData",
                  "type": "bytes",
                  "internalType": "bytes"
                },
                {
                  "name": "accountGasLimits",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "preVerificationGas",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "gasFees",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "paymasterAndData",
                  "type": "bytes",
                  "internalType": "bytes"
                },
                {
                  "name": "signature",
                  "type": "bytes",
                  "internalType": "bytes"
                }
              ]
            },
            {
              "name": "aggregator",
              "type": "address",
              "internalType": "contract IAggregator"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "beneficiary",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "handleOps",
      "inputs": [
        {
          "name": "ops",
          "type": "tuple[]",
          "internalType": "struct PackedUserOperation[]",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "beneficiary",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "incrementNonce",
      "inputs": [
        {
          "name": "key",
          "type": "uint192",
          "internalType": "uint192"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "senderCreator",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract ISenderCreator"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "unlockStake",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawStake",
      "inputs": [
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawTo",
      "inputs": [
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address payable"
        },
        {
          "name": "withdrawAmount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "AccountDeployed",
      "inputs": [
        {
          "name": "userOpHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "sender",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "factory",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "paymaster",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "BeforeExecution",
      "inputs": [],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Deposited",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "totalDeposit",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PostOpRevertReason",
      "inputs": [
        {
          "name": "userOpHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "sender",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "nonce",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "revertReason",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SignatureAggregatorChanged",
      "inputs": [
        {
          "name": "aggregator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "StakeLocked",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "totalStaked",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "unstakeDelaySec",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "StakeUnlocked",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "withdrawTime",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "StakeWithdrawn",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "withdrawAddress",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserOperationEvent",
      "inputs": [
        {
          "name": "userOpHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "sender",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "paymaster",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "nonce",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "success",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        },
        {
          "name": "actualGasCost",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "actualGasUsed",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserOperationPrefundTooLow",
      "inputs": [
        {
          "name": "userOpHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "sender",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "nonce",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserOperationRevertReason",
      "inputs": [
        {
          "name": "userOpHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "sender",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "nonce",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "revertReason",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Withdrawn",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "withdrawAddress",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "DelegateAndRevert",
      "inputs": [
        {
          "name": "success",
          "type": "bool",
          "internalType": "bool"
        },
        {
          "name": "ret",
          "type": "bytes",
          "internalType": "bytes"
        }
      ]
    },
    {
      "type": "error",
      "name": "FailedOp",
      "inputs": [
        {
          "name": "opIndex",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "reason",
          "type": "string",
          "internalType": "string"
        }
      ]
    },
    {
      "type": "error",
      "name": "FailedOpWithRevert",
      "inputs": [
        {
          "name": "opIndex",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "reason",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "inner",
          "type": "bytes",
          "internalType": "bytes"
        }
      ]
    },
    {
      "type": "error",
      "name": "PostOpReverted",
      "inputs": [
        {
          "name": "returnData",
          "type": "bytes",
          "internalType": "bytes"
        }
      ]
    },
    {
      "type": "error",
      "name": "SenderAddressResult",
      "inputs": [
        {
          "name": "sender",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "SignatureValidationFailed",
      "inputs": [
        {
          "name": "aggregator",
          "type": "address",
          "internalType": "address"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const IERC165 = {
  "abi": [
    {
      "type": "function",
      "name": "supportsInterface",
      "inputs": [
        {
          "name": "interfaceId",
          "type": "bytes4",
          "internalType": "bytes4"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const IAggregator = {
  "abi": [
    {
      "type": "function",
      "name": "aggregateSignatures",
      "inputs": [
        {
          "name": "userOps",
          "type": "tuple[]",
          "internalType": "struct PackedUserOperation[]",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "aggregatedSignature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "validateSignatures",
      "inputs": [
        {
          "name": "userOps",
          "type": "tuple[]",
          "internalType": "struct PackedUserOperation[]",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "validateUserOpSignature",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct PackedUserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "sigForUserOp",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const GH434 = {
  "abi": [
    {
      "type": "function",
      "name": "bar",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "baz",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "foo",
      "inputs": [],
      "outputs": [
        {
          "name": "a",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "b",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "pure"
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b5060f48061001b5f395ff3fe6080604052348015600e575f5ffd5b5060043610603a575f3560e01c8063a7916fac14603e578063c2985578146054578063febb0f7e146069575b5f5ffd5b60405162010f2c81526020015b60405180910390f35b6040805161a45581526001602082015201604b565b604080518082019091526002815261686960f01b6020820152604051604b9190602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f8301168401019150509291505056fea2646970667358221220aacbedc3c95682523dcc176ef8bc21d328339571933128505be6e8bfde2e892d64736f6c634300081c0033",
    "sourceMap": "64:280:57:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const Event = {
  "abi": [
    {
      "type": "function",
      "name": "execute",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "event",
      "name": "MessageEmitted",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "data",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b5060d780601a5f395ff3fe608060405260043610601b575f3560e01c80636146195414601f575b5f5ffd5b60256027565b005b336001600160a01b03167f7b2cff6dbed2a9cdb935eb6c46afadba8c4436a7aef48222ff62fce1ece4fcf3345f36604051606293929190606c565b60405180910390a2565b83815260406020820152816040820152818360608301375f818301606090810191909152601f909201601f191601019291505056fea26469706673582212208440482f552480d4e7b0d4864c68002e1ab3fa1fcc88235a49e76df70912dfa864736f6c634300081c0033",
    "sourceMap": "64:202:56:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const ErrorsExample = {
  "abi": [
    {
      "type": "function",
      "name": "assertRead",
      "inputs": [],
      "outputs": [],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "assertWrite",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "complexCustomRead",
      "inputs": [],
      "outputs": [],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "complexCustomWrite",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "divideByZeroRead",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "divideByZeroWrite",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "overflowRead",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "overflowWrite",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "requireRead",
      "inputs": [],
      "outputs": [],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "requireWrite",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "revertRead",
      "inputs": [],
      "outputs": [],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "revertWrite",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "simpleCustomRead",
      "inputs": [],
      "outputs": [],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "simpleCustomReadNoArgs",
      "inputs": [],
      "outputs": [],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "simpleCustomWrite",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "error",
      "name": "ComplexError",
      "inputs": [
        {
          "name": "foo",
          "type": "tuple",
          "internalType": "struct ErrorsExample.Foo",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "bar",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        },
        {
          "name": "message",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "number",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "SimpleError",
      "inputs": [
        {
          "name": "message",
          "type": "string",
          "internalType": "string"
        }
      ]
    },
    {
      "type": "error",
      "name": "SimpleErrorNoArgs",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b5061030f8061001c5f395ff3fe608060405234801561000f575f5ffd5b50600436106100f0575f3560e01c80638de18b9111610093578063c66cf13311610063578063c66cf13314610106578063d44de86614610127578063eb1aba20146100f4578063efbbf9951461013f575f5ffd5b80638de18b91146100fe578063940b8802146101375780639f55870914610137578063a997732e1461012f575f5ffd5b80634a9bc278116100ce5780634a9bc278146101205780634adac6eb14610127578063699389ca1461012057806388452b851461012f575f5ffd5b806304696152146100f45780631515d768146100fe57806324db9ba014610106575b5f5ffd5b6100fc610147565b005b6100fc610151565b61010e6101bb565b60405190815260200160405180910390f35b6100fc5f5ffd5b61010e6101d2565b6100fc6101e2565b6100fc6101fb565b6100fc610243565b61014f61025c565b565b6040805180820182525f815260456020820181815292516336dcc73d60e21b815291516001600160a01b0316600483015291516024820152608060448201526006608482015265313ab3b3b2b960d11b60a4820152606481019190915260c4015b60405180910390fd5b5f604581806101ca8184610270565b949350505050565b5f5f196001826101ca828461028f565b604051631f200c7360e31b81526004016101b2906102b4565b60405162461bcd60e51b815260206004820152601860248201527f54686973206973206120726576657274206d657373616765000000000000000060448201526064016101b2565b6040516333a3b5cd60e11b815260040160405180910390fd5b634e487b7160e01b5f52600160045260245ffd5b5f8261028a57634e487b7160e01b5f52601260045260245ffd5b500490565b808201808211156102ae57634e487b7160e01b5f52601160045260245ffd5b92915050565b602081525f6102ae602083016006815265313ab3b3b2b960d11b60208201526040019056fea26469706673582212201f8f5bd5badd324ca1405d840d90e0bbe1d22774952c867200fb694964a9783e64736f6c634300081c0033",
    "sourceMap": "64:2031:55:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const EnsAvatarTokenUri = {
  "abi": [
    {
      "type": "function",
      "name": "ownerOf",
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "tokenURI",
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b50610bad8061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610034575f3560e01c80636352211e14610038578063c87b56dd1461007c575b5f5ffd5b61005f61004636600461039e565b5073d8da6bf26964af9d7eed9e03e53415d37aa9604590565b6040516001600160a01b0390911681526020015b60405180910390f35b61008f61008a36600461039e565b61009c565b60405161007391906103b5565b6060815f036100b857505060408051602081019091525f815290565b816064036100e25760405180610140016040528061011981526020016106d4610119913992915050565b8160650361010957604051806080016040528060558152602001610ae96055913992915050565b8160660361013357604051806101600160405280610139815260200161059b610139913992915050565b8160670361015a576040518060a00160405280606d815260200161091f606d913992915050565b81606803610181576040518060a001604052806061815260200161040e6061913992915050565b816069036101a8576040518060c00160405280608981526020016108666089913992915050565b81606a036101cf576040518060a00160405280607981526020016107ed6079913992915050565b81606b036101f65760405180606001604052806040815260200161046f6040913992915050565b81606c0361021d576040518060e0016040528060b78152602001610a3260b7913992915050565b8160c803610244576040518060e0016040528060a6815260200161098c60a6913992915050565b8160c90361027b57505060408051808201909152601381527268747470733a2f2f6578616d706c652e636f6d60681b602082015290565b8160ca036102a2576040518060e0016040528060be81526020016104af60be913992915050565b8160cb036102c9576040518060600160405280602381526020016103eb6023913992915050565b8160cc0361030a57505060408051808201909152601b81527f646174613a696d6167652f7376672b786d6c3b757466382c6c656c0000000000602082015290565b8160cd03610331576040518060600160405280603a8152602001610b3e603a913992915050565b8160ce03610358576040518060600160405280602e815260200161056d602e913992915050565b8160cf0361037f5750506040805180820190915260038152621dd85d60ea1b602082015290565b6040518060600160405280603081526020016108ef6030913992915050565b5f602082840312156103ae575f5ffd5b5035919050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f8301168401019150509291505056fe646174613a696d6167652f7376672b786d6c3b757466382c3c7376673e3c2f7376673e646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65776f6749434167496d6c745957646c583356796243493649434a6b595852684f6d6c745957646c4c334e325a797434625777376458526d4f4378735a577769436e303d646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65776f6749434167496d6c745957646c583356796243493649434a3359585169436e30646174613a696d6167652f7376672b786d6c3b6261736536342c50484e325a79423261575633516d393450534977494441674d6a4177494449774d43496764326c6b64476739496a45774d4355694947686c6157646f644430694d5441774a53492b4369416749434138636d566a6443423361575230614430694d5441774a534967614756705a326830505349784d44416c4969426d6157787350534a795a32496f4d4377674d4377674d436b374969382b436a777663335a6e50673d3d516d61386d6e70367856334a3263524e66336d5474683543386e56313143416e636556696e633379386a5362696f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65776f6749434167496d6c745957646c583356796243493649434a6b595852684f6d6c745957646c4c334e325a79743462577737596d467a5a5459304c464249546a4a6165554979595664574d3146744f54525155306c33535552425a3031715158644a52456c3354554e4a5a3251796247746b52326335535770466430314456576c4a523268735956646b623252454d476c4e56454633536c4e4a4b304e705157644a5130453459323157616d5244516a4e685631497759555177615531555158644b55306c6e5955645763466f796144425155306c345455524262456c70516d31685633687a55464e4b65566f795357394e5133646e54554e335a303144617a644a6154677251327033646d4d7a576d35515a7a303949677039646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65776f6749434167496d6c745957646c583356796243493649434a6f64485277637a6f764c326c745957646c637a497562576c756458526c6257566b6157466a5a473475593239744c326c745957646c4c335677624739685a43396a58325a7062477773643138784e4451774c474679587a45324f6a6b735a6c3968645852764c484666595856306279786e58324631644738766332686863475576593239325a58497663334276636e51764e6a49304e54557463326876645851745a6d466a64473979655445744f445935596a6330596a59304e3249344f4441304e574e6859574d354e5459354e545a695a44466d5a6a6775616e426e49677039646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65776f6749434167496d6c745957646c583356796243493649434a5262574534625735774e6e68574d306f7959314a4f5a6a4e745648526f4e554d34626c59784d554e42626d4e6c566d6c75597a4e354f477054596d6c7649677039646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65776f6749434167496d6c745957646c583356796243493649434a7063475a7a4f6938766158426d6379395262574534625735774e6e68574d306f7959314a4f5a6a4e745648526f4e554d34626c59784d554e42626d4e6c566d6c75597a4e354f477054596d6c764967703968747470733a2f2f626f7265646170657961636874636c75622e636f6d2f6170692f6d7574616e74732f30787b69647d646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65776f6749434167496d6c745957646c583356796243493649434a6b595852684f6d6c745957646c4c334e325a797434625777376458526d4f43773863335a6e506a777663335a6e5069494b66513d3d68747470733a2f2f696d61676573322e6d696e7574656d6564696163646e2e636f6d2f696d6167652f75706c6f61642f635f66696c6c2c775f313434302c61725f31363a392c665f6175746f2c715f6175746f2c675f6175746f2f73686170652f636f7665722f73706f72742f36323435352d73686f75742d666163746f7279312d38363962373462363437623838303435636161633935363935366264316666382e6a70677b22696d6167655f75726c223a202268747470733a2f2f696d61676573322e6d696e7574656d6564696163646e2e636f6d2f696d6167652f75706c6f61642f635f66696c6c2c775f313434302c61725f31363a392c665f6175746f2c715f6175746f2c675f6175746f2f73686170652f636f7665722f73706f72742f36323435352d73686f75742d666163746f7279312d38363962373462363437623838303435636161633935363935366264316666382e6a7067227d646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65776f6749434167496d6c745957646c583356796243493649434a6f64485277637a6f764c32563459573177624755755932397449677039697066733a2f2f697066732f516d61386d6e70367856334a3263524e66336d5474683543386e56313143416e636556696e633379386a5362696fa26469706673582212201357124a947d793160134b463cf0d1b5aa9559d721742ff48e6846d5bae4d1f164736f6c634300081c0033",
    "sourceMap": "64:3561:54:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const ERC7821Example = {
  "abi": [
    {
      "type": "fallback",
      "stateMutability": "payable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "execute",
      "inputs": [
        {
          "name": "mode",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "executionData",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "supportsExecutionMode",
      "inputs": [
        {
          "name": "mode",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "OpData",
      "inputs": [
        {
          "name": "opData",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "FnSelectorNotRecognized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnsupportedExecutionMode",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b5061032c8061001c5f395ff3fe60806040526004361061002c575f3560e01c8063d03c79141461006c578063e9ae5c53146100cc57610033565b3661003357005b5f3560e01c63bc197c81811463f23a6e6182141763150b7a028214171561005e57806020526020603cf35b50633c10b94e5f526004601cfd5b348015610077575f5ffd5b506100b861008636600461023a565b690100000000007821000160b09190911c69ffff00000000ffffffff1690811460011b600160481b9190911417151590565b604051901515815260200160405180910390f35b6100df6100da366004610251565b6100e1565b005b690100000000007821000160b084901c69ffff00000000ffffffff1690811460011b600160481b9190911417365f81818461012357637f1812755f526004601cfd5b5085358087016020810194503592505f90604011600286141115610151575050602080860135860190810190355b6101608888888787878761016a565b5050505050505050565b333014610175575f5ffd5b80156101b5577f1fa020930a7dd40507126756f1f4f35de2b38ae31ca040883d321c7a79b8043782826040516101ac9291906102c8565b60405180910390a15b6101c084845f6101c9565b50505050505050565b600582901b5f5b818114610210576020818101918601358601803580153002179181810135916040810135019081019035610207848484848b610217565b505050506101d0565b5050505050565b604051828482375f388483888a5af1610232573d5f823e3d81fd5b505050505050565b5f6020828403121561024a575f5ffd5b5035919050565b5f5f5f60408486031215610263575f5ffd5b83359250602084013567ffffffffffffffff811115610280575f5ffd5b8401601f81018613610290575f5ffd5b803567ffffffffffffffff8111156102a6575f5ffd5b8660208284010111156102b7575f5ffd5b939660209190910195509293505050565b60208152816020820152818360408301375f818301604090810191909152601f909201601f1916010191905056fea2646970667358221220510cedcdd3a65db680cbd24663c1e7e517b35d4e0c232ff2eb41277899131b9564736f6c634300081c0033",
    "sourceMap": "105:482:42:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const ERC7821 = {
  "abi": [
    {
      "type": "fallback",
      "stateMutability": "payable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "execute",
      "inputs": [
        {
          "name": "mode",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "executionData",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "supportsExecutionMode",
      "inputs": [
        {
          "name": "mode",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "error",
      "name": "FnSelectorNotRecognized",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnsupportedExecutionMode",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b506102cc8061001c5f395ff3fe60806040526004361061002c575f3560e01c8063d03c79141461006c578063e9ae5c53146100cc57610033565b3661003357005b5f3560e01c63bc197c81811463f23a6e6182141763150b7a028214171561005e57806020526020603cf35b50633c10b94e5f526004601cfd5b348015610077575f5ffd5b506100b8610086366004610208565b690100000000007821000160b09190911c69ffff00000000ffffffff1690811460011b600160481b9190911417151590565b604051901515815260200160405180910390f35b6100df6100da36600461021f565b6100e1565b005b690100000000007821000160b084901c69ffff00000000ffffffff1690811460011b600160481b9190911417365f81818461012357637f1812755f526004601cfd5b5085358087016020810194503592505f90604011600286141115610151575050602080860135860190810190355b6101608888888787878761016a565b5050505050505050565b8061018a5733301461017a575f5ffd5b61018584845f610197565b61018e565b5f5ffd5b50505050505050565b600582901b5f5b8181146101de5760208181019186013586018035801530021791818101359160408101350190810190356101d5848484848b6101e5565b5050505061019e565b5050505050565b604051828482375f388483888a5af1610200573d5f823e3d81fd5b505050505050565b5f60208284031215610218575f5ffd5b5035919050565b5f5f5f60408486031215610231575f5ffd5b83359250602084013567ffffffffffffffff81111561024e575f5ffd5b8401601f8101861361025e575f5ffd5b803567ffffffffffffffff811115610274575f5ffd5b866020828401011115610285575f5ffd5b93966020919091019550929350505056fea26469706673582212205dfb8bc335f3817080a03b59504d89cd16b63017ff2b43ba1c21719406ce01d064736f6c634300081c0033",
    "sourceMap": "234:7871:34:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const ERC20InvalidTransferEvent = {
  "abi": [
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "Transfer",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "to",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b5060ec8061001b5f395ff3fe6080604052348015600e575f5ffd5b50600436106026575f3560e01c8063a9059cbb14602a575b5f5ffd5b603960353660046083565b603b565b005b604080516001600160a01b03841681526020810183905233917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a25050565b5f5f604083850312156093575f5ffd5b82356001600160a01b038116811460a8575f5ffd5b94602093909301359350505056fea264697066735822122080f39e30f6783380cfc9eec9273d8994bce2a7e6f090394e9afbb5f0739e4ada64736f6c634300081c0033",
    "sourceMap": "64:302:53:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const ECDSA = {
  "abi": [
    {
      "type": "error",
      "name": "ECDSAInvalidSignature",
      "inputs": []
    },
    {
      "type": "error",
      "name": "ECDSAInvalidSignatureLength",
      "inputs": [
        {
          "name": "length",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "ECDSAInvalidSignatureS",
      "inputs": [
        {
          "name": "s",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x60556032600b8282823980515f1a607314602657634e487b7160e01b5f525f60045260245ffd5b305f52607381538281f3fe730000000000000000000000000000000000000000301460806040525f5ffdfea264697066735822122065b9d631a9c4e747e47d7af42c1ecc7a8e3fb5a9ce78ce227581fdb27f39161364736f6c634300081c0033",
    "sourceMap": "344:7470:15:-:0;;;;;;;;;;;;;;;-1:-1:-1;;;344:7470:15;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const DeploylessVerifySig = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_signer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_hash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "isValidSig",
      "inputs": [
        {
          "name": "_signer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_hash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_signature",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    }
  ],
  "bytecode": {
    "object": "0x608060405234801561000f575f5ffd5b5060405161064438038061064483398101604081905261002e916104e0565b5f61003a848484610045565b9050805f526001601ff35b5f7f6492649264926492649264926492649264926492649264926492649264926492610070836103f7565b036101da575f6060808480602001905181019061008d9190610535565b60405192955090935091505f906001600160a01b038516906100b0908590610596565b5f604051808303815f865af19150503d805f81146100e9576040519150601f19603f3d011682016040523d82523d5f602084013e6100ee565b606091505b50509050876001600160a01b03163b5f0361015557806101555760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610185908b9087906004016105ac565b602060405180830381865afa1580156101a0573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906101c491906105e8565b6001600160e01b031916149450505050506103f0565b6001600160a01b0384163b1561026b57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061021a90879087906004016105ac565b602060405180830381865afa158015610235573d5f5f3e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061025991906105e8565b6001600160e01b0319161490506103f0565b81516041146102cf5760405162461bcd60e51b815260206004820152603a60248201525f5160206106245f395f51905f5260448201527f3a20696e76616c6964207369676e6174757265206c656e677468000000000000606482015260840161014c565b6102d761040e565b50602082015160408084015184518593925f9185919081106102fb576102fb61060f565b016020015160f81c9050601b811480159061031a57508060ff16601c14155b1561037a5760405162461bcd60e51b815260206004820152603b60248201525f5160206106245f395f51905f5260448201527f3a20696e76616c6964207369676e617475726520762076616c75650000000000606482015260840161014c565b604080515f81526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103d5573d5f5f3e3d5ffd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b5f602082511015610406575f5ffd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b0381168114610440575f5ffd5b50565b634e487b7160e01b5f52604160045260245ffd5b5f82601f830112610466575f5ffd5b81516001600160401b0381111561047f5761047f610443565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ad576104ad610443565b6040528181528382016020018510156104c4575f5ffd5b8160208501602083015e5f918101602001919091529392505050565b5f5f5f606084860312156104f2575f5ffd5b83516104fd8161042c565b6020850151604086015191945092506001600160401b0381111561051f575f5ffd5b61052b86828701610457565b9150509250925092565b5f5f5f60608486031215610547575f5ffd5b83516105528161042c565b60208501519093506001600160401b0381111561056d575f5ffd5b61057986828701610457565b604086015190935090506001600160401b0381111561051f575f5ffd5b5f82518060208501845e5f920191825250919050565b828152604060208201525f82518060408401528060208501606085015e5f606082850101526060601f19601f8301168401019150509392505050565b5f602082840312156105f8575f5ffd5b81516001600160e01b0319811681146103f0575f5ffd5b634e487b7160e01b5f52603260045260245ffdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572",
    "sourceMap": "178:275:50:-:0;;;226:225;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;305:12;320:38;331:7;340:5;347:10;320;:38::i;:::-;305:53;;401:7;398:1;391:18;433:1;429:2;422:13;658:1911:43;781:4;434:66;1138:27;1154:10;1138:15;:27::i;:::-;:55;1134:674;;1209:22;1245:28;1287:24;1402:10;1374:93;;;;;;;;;;;;:::i;:::-;1501:36;;1325:142;;-1:-1:-1;1325:142:43;;-1:-1:-1;1325:142:43;-1:-1:-1;1483:12:43;;-1:-1:-1;;;;;1501:19:43;;;:36;;1325:142;;1501:36;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1482:55;;;1556:7;-1:-1:-1;;;;;1556:19:43;;1579:1;1556:24;1552:113;;1608:7;1600:50;;;;-1:-1:-1;;;1600:50:43;;2740:2:60;1600:50:43;;;2722:21:60;2779:2;2759:18;;;2752:30;2818:32;2798:18;;;2791:60;2868:18;;1600:50:43;;;;;;;;;1702:60;;-1:-1:-1;;;1702:60:43;;;1782:15;-1:-1:-1;;;;;1702:40:43;;;548:10;;1702:60;;1743:5;;1750:11;;1702:60;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;;;;1702:95:43;;;1679:118;;;;;;;;1134:674;-1:-1:-1;;;;;1822:19:43;;;:23;1818:171;;1884:59;;-1:-1:-1;;;1884:59:43;;;1963:15;-1:-1:-1;;;;;1884:40:43;;;548:10;;1884:59;;1925:5;;1932:10;;1884:59;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;;;;;1884:94:43;;;-1:-1:-1;1861:117:43;;1818:171;2054:10;:17;2075:2;2054:23;2033:128;;;;-1:-1:-1;;;2033:128:43;;3886:2:60;2033:128:43;;;3868:21:60;3925:2;3905:18;;;3898:30;-1:-1:-1;;;;;;;;;;;3944:18:60;;;3937:62;4035:28;4015:18;;;4008:56;4081:19;;2033:128:43;3684:422:60;2033:128:43;2171:22;;:::i;:::-;-1:-1:-1;2275:7:43;;;;2304;;;;;2337:14;;2234:10;;2275:7;2263:9;;2234:10;;2304:7;2337:14;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;2371:2:43;2366:7;;;;;:18;;;2377:1;:7;;2382:2;2377:7;;2366:18;2362:148;;;2400:99;;-1:-1:-1;;;2400:99:43;;4445:2:60;2400:99:43;;;4427:21:60;4484:2;4464:18;;;4457:30;-1:-1:-1;;;;;;;;;;;4503:18:60;;;4496:62;4594:29;4574:18;;;4567:57;4641:19;;2400:99:43;4243:423:60;2362:148:43;2526:25;;;;;;;;;;;;4898::60;;;4971:4;4959:17;;4939:18;;;4932:45;;;;4993:18;;;4986:34;;;5036:18;;;5029:34;;;-1:-1:-1;;;;;2526:36:43;;;:25;;4870:19:60;;2526:25:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;2526:36:43;;2519:43;;;;;;658:1911;;;;;;:::o;2575:215::-;2656:11;2702:2;2687:4;:11;:17;;2679:26;;;;;;-1:-1:-1;2761:11:43;;2751:22;2745:29;;2575:215::o;178:275:50:-;;;;;;;;;;;;;;;;;;-1:-1:-1;178:275:50;;;-1:-1:-1;;178:275:50:o;14:131:60:-;-1:-1:-1;;;;;89:31:60;;79:42;;69:70;;135:1;132;125:12;69:70;14:131;:::o;150:127::-;211:10;206:3;202:20;199:1;192:31;242:4;239:1;232:15;266:4;263:1;256:15;282:722;335:5;388:3;381:4;373:6;369:17;365:27;355:55;;406:1;403;396:12;355:55;433:13;;-1:-1:-1;;;;;458:30:60;;455:56;;;491:18;;:::i;:::-;540:2;534:9;632:2;594:17;;-1:-1:-1;;590:31:60;;;623:2;586:40;582:54;570:67;;-1:-1:-1;;;;;652:34:60;;688:22;;;649:62;646:88;;;714:18;;:::i;:::-;750:2;743:22;774;;;815:19;;;836:4;811:30;808:39;-1:-1:-1;805:59:60;;;860:1;857;850:12;805:59;917:6;910:4;902:6;898:17;891:4;883:6;879:17;873:51;972:1;944:19;;;965:4;940:30;933:41;;;;948:6;282:722;-1:-1:-1;;;282:722:60:o;1009:524::-;1106:6;1114;1122;1175:2;1163:9;1154:7;1150:23;1146:32;1143:52;;;1191:1;1188;1181:12;1143:52;1223:9;1217:16;1242:31;1267:5;1242:31;:::i;:::-;1337:2;1322:18;;1316:25;1385:2;1370:18;;1364:25;1292:5;;-1:-1:-1;1316:25:60;-1:-1:-1;;;;;;1401:30:60;;1398:50;;;1444:1;1441;1434:12;1398:50;1467:60;1519:7;1510:6;1499:9;1495:22;1467:60;:::i;:::-;1457:70;;;1009:524;;;;;:::o;1538:689::-;1652:6;1660;1668;1721:2;1709:9;1700:7;1696:23;1692:32;1689:52;;;1737:1;1734;1727:12;1689:52;1769:9;1763:16;1788:31;1813:5;1788:31;:::i;:::-;1887:2;1872:18;;1866:25;1838:5;;-1:-1:-1;;;;;;1903:30:60;;1900:50;;;1946:1;1943;1936:12;1900:50;1969:60;2021:7;2012:6;2001:9;1997:22;1969:60;:::i;:::-;2075:2;2060:18;;2054:25;1959:70;;-1:-1:-1;2054:25:60;-1:-1:-1;;;;;;2091:32:60;;2088:52;;;2136:1;2133;2126:12;2232:301;2361:3;2399:6;2393:13;2445:6;2438:4;2430:6;2426:17;2421:3;2415:37;2507:1;2471:16;;2496:13;;;-1:-1:-1;2471:16:60;2232:301;-1:-1:-1;2232:301:60:o;2897:487::-;3072:6;3061:9;3054:25;3115:2;3110;3099:9;3095:18;3088:30;3035:4;3147:6;3141:13;3190:6;3185:2;3174:9;3170:18;3163:34;3249:6;3244:2;3236:6;3232:15;3227:2;3216:9;3212:18;3206:50;3305:1;3300:2;3291:6;3280:9;3276:22;3272:31;3265:42;3375:2;3368;3364:7;3359:2;3351:6;3347:15;3343:29;3332:9;3328:45;3324:54;3316:62;;;2897:487;;;;;:::o;3389:290::-;3458:6;3511:2;3499:9;3490:7;3486:23;3482:32;3479:52;;;3527:1;3524;3517:12;3479:52;3553:16;;-1:-1:-1;;;;;;3598:32:60;;3588:43;;3578:71;;3645:1;3642;3635:12;4111:127;4172:10;4167:3;4163:20;4160:1;4153:31;4203:4;4200:1;4193:15;4227:4;4224:1;4217:15",
    "linkReferences": {}
  }
} as const;

export const DeploylessCallViaFactory = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "factory",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "factoryData",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "error",
      "name": "CounterfactualDeployFailed",
      "inputs": [
        {
          "name": "error",
          "type": "bytes",
          "internalType": "bytes"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x608060405234801561000f575f5ffd5b5060405161028638038061028683398101604081905261002e916101b5565b836001600160a01b03163b5f036100dd575f5f836001600160a01b031683604051610059919061023a565b5f604051808303815f865af19150503d805f8114610092576040519150601f19603f3d011682016040523d82523d5f602084013e610097565b606091505b50915091508115806100b157506001600160a01b0386163b155b156100da578060405163101bb98d60e01b81526004016100d19190610250565b60405180910390fd5b50505b5f5f8451602086015f885af16040513d5f823e816100f9573d81fd5b3d81f35b80516001600160a01b0381168114610113575f5ffd5b919050565b634e487b7160e01b5f52604160045260245ffd5b5f82601f83011261013b575f5ffd5b81516001600160401b0381111561015457610154610118565b604051601f8201601f19908116603f011681016001600160401b038111828210171561018257610182610118565b604052818152838201602001851015610199575f5ffd5b8160208501602083015e5f918101602001919091529392505050565b5f5f5f5f608085870312156101c8575f5ffd5b6101d1856100fd565b60208601519094506001600160401b038111156101ec575f5ffd5b6101f88782880161012c565b935050610207604086016100fd565b60608601519092506001600160401b03811115610222575f5ffd5b61022e8782880161012c565b91505092959194509250565b5f82518060208501845e5f920191825250919050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f8301168401019150509291505056fe",
    "sourceMap": "139:792:49:-:0;;;230:694;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;378:2;-1:-1:-1;;;;;370:23:49;;397:1;370:28;366:217;;415:12;429:16;449:7;-1:-1:-1;;;;;449:12:49;462:11;449:25;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;414:60;;;;493:7;492:8;:40;;;-1:-1:-1;;;;;;504:23:49;;;:28;492:40;488:84;;;568:3;541:31;;-1:-1:-1;;;541:31:49;;;;;;;;:::i;:::-;;;;;;;;488:84;400:183;;366:217;683:1;680;673:4;667:11;660:4;654;650:15;647:1;643:2;636:5;631:54;715:4;709:11;756:16;753:1;748:3;733:40;796:7;786:80;;835:16;830:3;823:29;786:80;891:16;886:3;879:29;14:177:60;93:13;;-1:-1:-1;;;;;135:31:60;;125:42;;115:70;;181:1;178;171:12;115:70;14:177;;;:::o;196:127::-;257:10;252:3;248:20;245:1;238:31;288:4;285:1;278:15;312:4;309:1;302:15;328:722;381:5;434:3;427:4;419:6;415:17;411:27;401:55;;452:1;449;442:12;401:55;479:13;;-1:-1:-1;;;;;504:30:60;;501:56;;;537:18;;:::i;:::-;586:2;580:9;678:2;640:17;;-1:-1:-1;;636:31:60;;;669:2;632:40;628:54;616:67;;-1:-1:-1;;;;;698:34:60;;734:22;;;695:62;692:88;;;760:18;;:::i;:::-;796:2;789:22;820;;;861:19;;;882:4;857:30;854:39;-1:-1:-1;851:59:60;;;906:1;903;896:12;851:59;963:6;956:4;948:6;944:17;937:4;929:6;925:17;919:51;1018:1;990:19;;;1011:4;986:30;979:41;;;;994:6;328:722;-1:-1:-1;;;328:722:60:o;1055:724::-;1170:6;1178;1186;1194;1247:3;1235:9;1226:7;1222:23;1218:33;1215:53;;;1264:1;1261;1254:12;1215:53;1287:40;1317:9;1287:40;:::i;:::-;1371:2;1356:18;;1350:25;1277:50;;-1:-1:-1;;;;;;1387:30:60;;1384:50;;;1430:1;1427;1420:12;1384:50;1453:60;1505:7;1496:6;1485:9;1481:22;1453:60;:::i;:::-;1443:70;;;1532:49;1577:2;1566:9;1562:18;1532:49;:::i;:::-;1627:2;1612:18;;1606:25;1522:59;;-1:-1:-1;;;;;;1643:32:60;;1640:52;;;1688:1;1685;1678:12;1640:52;1711:62;1765:7;1754:8;1743:9;1739:24;1711:62;:::i;:::-;1701:72;;;1055:724;;;;;;;:::o;1784:301::-;1913:3;1951:6;1945:13;1997:6;1990:4;1982:6;1978:17;1973:3;1967:37;2059:1;2023:16;;2048:13;;;-1:-1:-1;2023:16:60;1784:301;-1:-1:-1;1784:301:60:o;2090:416::-;2237:2;2226:9;2219:21;2200:4;2269:6;2263:13;2312:6;2307:2;2296:9;2292:18;2285:34;2371:6;2366:2;2358:6;2354:15;2349:2;2338:9;2334:18;2328:50;2427:1;2422:2;2413:6;2402:9;2398:22;2394:31;2387:42;2497:2;2490;2486:7;2481:2;2473:6;2469:15;2465:29;2454:9;2450:45;2446:54;2438:62;;;2090:416;;;;:::o",
    "linkReferences": {}
  }
} as const;

export const DeploylessCallViaBytecode = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "bytecode",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "nonpayable"
    }
  ],
  "bytecode": {
    "object": "0x608060405234801561000f575f5ffd5b5060405161016738038061016783398101604081905261002e91610101565b5f5f8351602085015ff59050803b610044575f5ffd5b5f5f8351602085015f855af16040513d5f823e81610060573d81fd5b3d81f35b634e487b7160e01b5f52604160045260245ffd5b5f82601f830112610087575f5ffd5b81516001600160401b038111156100a0576100a0610064565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100ce576100ce610064565b6040528181528382016020018510156100e5575f5ffd5b8160208501602083015e5f918101602001919091529392505050565b5f5f60408385031215610112575f5ffd5b82516001600160401b03811115610127575f5ffd5b61013385828601610078565b602085015190935090506001600160401b03811115610150575f5ffd5b61015c85828601610078565b915050925092905056fe",
    "sourceMap": "66:665:48:-:0;;;107:622;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;194:10;292:1;281:8;275:15;268:4;258:8;254:19;251:1;243:51;237:57;;329:2;317:15;307:71;;362:1;359;352:12;307:71;488:1;485;478:4;472:11;465:4;459;455:15;452:1;448:2;441:5;436:54;520:4;514:11;561:16;558:1;553:3;538:40;601:7;591:80;;640:16;635:3;628:29;591:80;696:16;691:3;684:29;14:127:60;75:10;70:3;66:20;63:1;56:31;106:4;103:1;96:15;130:4;127:1;120:15;146:722;199:5;252:3;245:4;237:6;233:17;229:27;219:55;;270:1;267;260:12;219:55;297:13;;-1:-1:-1;;;;;322:30:60;;319:56;;;355:18;;:::i;:::-;404:2;398:9;496:2;458:17;;-1:-1:-1;;454:31:60;;;487:2;450:40;446:54;434:67;;-1:-1:-1;;;;;516:34:60;;552:22;;;513:62;510:88;;;578:18;;:::i;:::-;614:2;607:22;638;;;679:19;;;700:4;675:30;672:39;-1:-1:-1;669:59:60;;;724:1;721;714:12;669:59;781:6;774:4;766:6;762:17;755:4;747:6;743:17;737:51;836:1;808:19;;;829:4;804:30;797:41;;;;812:6;146:722;-1:-1:-1;;;146:722:60:o;873:553::-;970:6;978;1031:2;1019:9;1010:7;1006:23;1002:32;999:52;;;1047:1;1044;1037:12;999:52;1074:16;;-1:-1:-1;;;;;1102:30:60;;1099:50;;;1145:1;1142;1135:12;1099:50;1168:60;1220:7;1211:6;1200:9;1196:22;1168:60;:::i;:::-;1274:2;1259:18;;1253:25;1158:70;;-1:-1:-1;1253:25:60;-1:-1:-1;;;;;;1290:32:60;;1287:52;;;1335:1;1332;1325:12;1287:52;1358:62;1412:7;1401:8;1390:9;1386:24;1358:62;:::i;:::-;1348:72;;;873:553;;;;;:::o",
    "linkReferences": {}
  }
} as const;

export const Context = {
  "abi": [],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

export const BatchCallDelegation = {
  "abi": [
    {
      "type": "function",
      "name": "execute",
      "inputs": [
        {
          "name": "calls",
          "type": "tuple[]",
          "internalType": "struct BatchCallDelegation.Call[]",
          "components": [
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "to",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "value",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "event",
      "name": "CallEmitted",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "data",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    }
  ],
  "bytecode": {
    "object": "0x6080604052348015600e575f5ffd5b506103e38061001c5f395ff3fe60806040526004361061001d575f3560e01c8063a6d0ad6114610021575b5f5ffd5b61003461002f366004610176565b610036565b005b5f5b81811015610171575f838383818110610053576100536101e7565b905060200281019061006591906101fb565b61006e906102a2565b90505f81602001516001600160a01b03168260400151835f0151604051610095919061035b565b5f6040518083038185875af1925050503d805f81146100cf576040519150601f19603f3d011682016040523d82523d5f602084013e6100d4565b606091505b50509050806101195760405162461bcd60e51b815260206004820152600d60248201526c18d85b1b081c995d995c9d1959609a1b604482015260640160405180910390fd5b81602001516001600160a01b03167fc19ac7d6ae9cf23179402a936b770e247d2f9c1b36432936b14e4080146aaa3f8360400151845f015160405161015f929190610371565b60405180910390a25050600101610038565b505050565b5f5f60208385031215610187575f5ffd5b823567ffffffffffffffff81111561019d575f5ffd5b8301601f810185136101ad575f5ffd5b803567ffffffffffffffff8111156101c3575f5ffd5b8560208260051b84010111156101d7575f5ffd5b6020919091019590945092505050565b634e487b7160e01b5f52603260045260245ffd5b5f8235605e1983360301811261020f575f5ffd5b9190910192915050565b634e487b7160e01b5f52604160045260245ffd5b6040516060810167ffffffffffffffff8111828210171561025057610250610219565b60405290565b604051601f8201601f1916810167ffffffffffffffff8111828210171561027f5761027f610219565b604052919050565b80356001600160a01b038116811461029d575f5ffd5b919050565b5f606082360312156102b2575f5ffd5b6102ba61022d565b823567ffffffffffffffff8111156102d0575f5ffd5b830136601f8201126102e0575f5ffd5b803567ffffffffffffffff8111156102fa576102fa610219565b61030d601f8201601f1916602001610256565b818152366020838501011115610321575f5ffd5b816020840160208301375f6020838301015280845250505061034560208401610287565b6020820152604092830135928101929092525090565b5f82518060208501845e5f920191825250919050565b828152604060208201525f82518060408401528060208501606085015e5f606082850101526060601f19601f830116840101915050939250505056fea2646970667358221220dce78c472323751a4a2441fc1bb225e47333a2580ecb39a11b2b006b5f777f8664736f6c634300081c0033",
    "sourceMap": "64:550:52:-:0;;;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  }
} as const;

export const BasePaymaster = {
  "abi": [
    {
      "type": "function",
      "name": "addStake",
      "inputs": [
        {
          "name": "unstakeDelaySec",
          "type": "uint32",
          "internalType": "uint32"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "deposit",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "entryPoint",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract IEntryPoint"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getDeposit",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "postOp",
      "inputs": [
        {
          "name": "mode",
          "type": "uint8",
          "internalType": "enum IPaymaster.PostOpMode"
        },
        {
          "name": "context",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "actualGasCost",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "actualUserOpFeePerGas",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "unlockStake",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "validatePaymasterUserOp",
      "inputs": [
        {
          "name": "userOp",
          "type": "tuple",
          "internalType": "struct PackedUserOperation",
          "components": [
            {
              "name": "sender",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initCode",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "callData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "gasFees",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "signature",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "userOpHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "maxCost",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "context",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "validationData",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawStake",
      "inputs": [
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawTo",
      "inputs": [
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address payable"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  }
} as const;

