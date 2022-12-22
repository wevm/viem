import { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Sidebar = {
  '/docs/': [
    {
      text: 'Introduction',
      items: [
        { text: 'Why viem', link: '/docs/introduction' },
        { text: 'Getting Started', link: '/docs/getting-started' },
      ],
    },
    {
      text: 'Clients & Transports',
      items: [
        { text: 'Introduction', link: '/docs/clients/intro' },
        { text: 'Public Client', link: '/docs/clients/public' },
        { text: 'Wallet Client', link: '/docs/clients/wallet' },
        { text: 'Test Client', link: '/docs/clients/test' },
        {
          text: 'Transports',
          items: [
            {
              text: 'HTTP',
              link: '/docs/clients/transports/http',
            },
            {
              text: 'WebSocket',
              link: '/docs/clients/transports/websocket',
            },
            {
              text: 'Ethereum Provider (EIP-1193)',
              link: '/docs/clients/transports/ethereum-provider',
            },
          ],
        },
      ],
    },
    {
      text: 'Public Actions',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'Introduction 🚧', link: '/docs/actions/public/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'fetchBalance',
              link: '/docs/actions/public/fetchBalance',
            },
            {
              text: 'fetchTransactionCount',
              link: '/docs/actions/public/fetchTransactionCount',
            },
          ],
        },
        {
          text: 'Block',
          items: [
            { text: 'fetchBlock', link: '/docs/actions/public/fetchBlock' },
            {
              text: 'fetchBlockNumber',
              link: '/docs/actions/public/fetchBlockNumber',
            },
            {
              text: 'fetchBlockTransactionCount 🚧',
              link: '/docs/actions/public/fetchBlockTransactionCount',
            },
            {
              text: 'watchBlockNumber',
              link: '/docs/actions/public/watchBlockNumber',
            },
            {
              text: 'watchBlocks',
              link: '/docs/actions/public/watchBlocks',
            },
          ],
        },
        {
          text: 'Chain',
          items: [
            { text: 'fetchChain 🚧', link: '/docs/actions/public/fetchChain' },
          ],
        },
        {
          text: 'Client',
          items: [
            {
              text: 'fetchClientVersion 🚧',
              link: '/docs/actions/public/fetchClientVersion',
            },
            {
              text: 'fetchListeningStatus 🚧',
              link: '/docs/actions/public/fetchListeningStatus',
            },
            {
              text: 'fetchPeerCount 🚧',
              link: '/docs/actions/public/fetchPeerCount',
            },
          ],
        },
        {
          text: 'Fee',
          items: [
            {
              text: 'fetchFeeHistory 🚧',
              link: '/docs/actions/public/fetchFeeHistory',
            },
            {
              text: 'fetchGasEstimate 🚧',
              link: '/docs/actions/public/fetchGasEstimate',
            },
            {
              text: 'fetchGasPrice 🚧',
              link: '/docs/actions/public/fetchGasPrice',
            },
            {
              text: 'watchGasPrice 🚧',
              link: '/docs/actions/public/watchGasPrice',
            },
          ],
        },
        {
          text: 'Filters & Logs',
          items: [
            {
              text: 'createBlockFilter 🚧',
              link: '/docs/actions/public/createBlockFilter',
            },
            {
              text: 'createFilter 🚧',
              link: '/docs/actions/public/createFilter',
            },
            {
              text: 'createPendingTransactionFilter 🚧',
              link: '/docs/actions/public/createPendingTransactionFilter',
            },
            {
              text: 'fetchFilterChanges 🚧',
              link: '/docs/actions/public/fetchFilterChanges',
            },
            {
              text: 'fetchFilterLogs 🚧',
              link: '/docs/actions/public/fetchFilterLogs',
            },
            { text: 'fetchLogs 🚧', link: '/docs/actions/public/fetchLogs' },
            {
              text: 'uninstallFilter 🚧',
              link: '/docs/actions/public/uninstallFilter',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            { text: 'call 🚧', link: '/docs/actions/public/call' },
            {
              text: 'fetchTransaction',
              link: '/docs/actions/public/fetchTransaction',
            },
            {
              text: 'fetchTransactionReceipt',
              link: '/docs/actions/public/fetchTransactionReceipt',
            },
            {
              text: 'sendRawTransaction 🚧',
              link: '/docs/actions/public/sendRawTransaction',
            },
            {
              text: 'waitForTransactionReceipt',
              link: '/docs/actions/public/waitForTransactionReceipt',
            },
            {
              text: 'watchPendingTransactions 🚧',
              link: '/docs/actions/public/watchPendingTransactions',
            },
          ],
        },
      ],
    },
    {
      text: 'Wallet Actions',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/actions/wallet/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'fetchAccounts 🚧',
              link: '/docs/actions/wallet/fetchAccounts',
            },
            {
              text: 'requestAccounts',
              link: '/docs/actions/wallet/requestAccounts',
            },
          ],
        },
        {
          text: 'Assets',
          items: [
            {
              text: 'watchAsset 🚧',
              link: '/docs/actions/wallet/watchAsset',
            },
          ],
        },
        {
          text: 'Chain',
          items: [
            {
              text: 'addChain 🚧',
              link: '/docs/actions/wallet/addChain',
            },
            {
              text: 'switchChain 🚧',
              link: '/docs/actions/wallet/switchChain',
            },
          ],
        },
        {
          text: 'Data',
          items: [
            {
              text: 'signMessage 🚧',
              link: '/docs/actions/wallet/signMessage',
            },
            {
              text: 'signTypedData 🚧',
              link: '/docs/actions/wallet/signTypedData',
            },
          ],
        },
        {
          text: 'Permissions',
          items: [
            {
              text: 'fetchPermissions 🚧',
              link: '/docs/actions/wallet/fetchPermissions',
            },
            {
              text: 'requestPermissions 🚧',
              link: '/docs/actions/wallet/requestPermissions',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            {
              text: 'sendTransaction',
              link: '/docs/actions/wallet/sendTransaction',
            },
            {
              text: 'signTransaction 🚧',
              link: '/docs/actions/wallet/signTransaction',
            },
          ],
        },
      ],
    },
    {
      text: 'Test Actions',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'Introduction 🚧', link: '/docs/actions/test/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'impersonateAccount',
              link: '/docs/actions/test/impersonateAccount',
            },
            { text: 'setBalance', link: '/docs/actions/test/setBalance' },
            { text: 'setCode', link: '/docs/actions/test/setCode' },
            { text: 'setNonce', link: '/docs/actions/test/setNonce' },
            {
              text: 'setStorageAt',
              link: '/docs/actions/test/setStorageAt',
            },
            {
              text: 'stopImpersonatingAccount',
              link: '/docs/actions/test/stopImpersonatingAccount',
            },
          ],
        },
        {
          text: 'Block',
          items: [
            { text: 'getAutomine', link: '/docs/actions/test/getAutomine' },
            {
              text: 'increaseTime',
              link: '/docs/actions/test/increaseTime',
            },
            { text: 'mine', link: '/docs/actions/test/mine' },
            {
              text: 'removeBlockTimestampInterval',
              link: '/docs/actions/test/removeBlockTimestampInterval',
            },
            { text: 'setAutomine', link: '/docs/actions/test/setAutomine' },
            {
              text: 'setIntervalMining',
              link: '/docs/actions/test/setIntervalMining',
            },
            {
              text: 'setBlockTimestampInterval',
              link: '/docs/actions/test/setBlockTimestampInterval',
            },
            {
              text: 'setBlockGasLimit',
              link: '/docs/actions/test/setBlockGasLimit',
            },
            {
              text: 'setNextBlockBaseFeePerGas',
              link: '/docs/actions/test/setNextBlockBaseFeePerGas',
            },
            {
              text: 'setNextBlockTimestamp',
              link: '/docs/actions/test/setNextBlockTimestamp',
            },
          ],
        },
        {
          text: 'Node',
          items: [
            { text: 'setCoinbase', link: '/docs/actions/test/setCoinbase' },
            {
              text: 'setMinGasPrice',
              link: '/docs/actions/test/setMinGasPrice',
            },
          ],
        },
        {
          text: 'Settings',
          items: [
            { text: 'reset', link: '/docs/actions/test/reset' },
            {
              text: 'setLoggingEnabled',
              link: '/docs/actions/test/setLoggingEnabled',
            },
            { text: 'setRpcUrl', link: '/docs/actions/test/setRpcUrl' },
          ],
        },
        {
          text: 'State',
          items: [
            { text: 'revert', link: '/docs/actions/test/revert' },
            { text: 'snapshot', link: '/docs/actions/test/snapshot' },
          ],
        },
        {
          text: 'Transaction',
          items: [
            {
              text: 'dropTransaction',
              link: '/docs/actions/test/dropTransaction',
            },
            {
              text: 'enableTraces',
              link: '/docs/actions/test/enableTraces',
            },
            {
              text: 'fetchTxpoolContent',
              link: '/docs/actions/test/fetchTxpoolContent',
            },
            {
              text: 'fetchTxpoolStatus',
              link: '/docs/actions/test/fetchTxpoolStatus',
            },
            {
              text: 'inspectTxpool',
              link: '/docs/actions/test/inspectTxpool',
            },
            {
              text: 'sendUnsignedTransaction',
              link: '/docs/actions/test/sendUnsignedTransaction',
            },
          ],
        },
      ],
    },
    {
      text: 'Contract 🚧',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'deployContract 🚧',
          link: '/docs/contract/deployContract',
        },
        {
          text: 'getContract 🚧',
          link: '/docs/contract/getContract',
        },
        {
          text: 'Actions',
          items: [
            {
              text: 'callContract 🚧',
              link: '/docs/contract/callContract',
            },
            {
              text: 'fetchContractCode 🚧',
              link: '/docs/contract/fetchContractCode',
            },
            {
              text: 'fetchContractStorage 🚧',
              link: '/docs/contract/fetchContractStorage',
            },
            {
              text: 'multicall 🚧',
              link: '/docs/contract/multicall',
            },
            {
              text: 'readContract 🚧',
              link: '/docs/contract/readContract',
            },
            {
              text: 'writeContract 🚧',
              link: '/docs/contract/writeContract',
            },
            {
              text: 'watchContractEvent 🚧',
              link: '/docs/contract/watchContractEvent',
            },
          ],
        },
        {
          text: 'Encoding',
          items: [
            {
              text: 'decodeDeploy 🚧',
              link: '/docs/abi/decodeDeploy',
            },
            {
              text: 'decodeEventLog 🚧',
              link: '/docs/abi/decodeEventLog',
            },
            {
              text: 'decodeFunctionArgs 🚧',
              link: '/docs/abi/decodeFunctionArgs',
            },
            {
              text: 'decodeFunctionError 🚧',
              link: '/docs/abi/decodeFunctionError',
            },
            {
              text: 'decodeFunctionResult 🚧',
              link: '/docs/abi/decodeFunctionResult',
            },
            {
              text: 'encodeDeploy 🚧',
              link: '/docs/abi/encodeDeploy',
            },
            {
              text: 'encodeEventLog 🚧',
              link: '/docs/abi/encodeEventLog',
            },
            {
              text: 'encodeFunctionArgs 🚧',
              link: '/docs/abi/encodeFunctionArgs',
            },
            {
              text: 'encodeFunctionError 🚧',
              link: '/docs/abi/encodeFunctionError',
            },
            {
              text: 'encodeFunctionResult 🚧',
              link: '/docs/abi/encodeFunctionArgs',
            },
          ],
        },
      ],
    },
    {
      text: 'ENS 🚧',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Actions',
          items: [
            { text: 'fetchEnsAddress 🚧', link: '/docs/ens/fetchEnsAddress' },
            { text: 'fetchEnsAvatar 🚧', link: '/docs/ens/fetchEnsAvatar' },
            {
              text: 'fetchEnsCoinAddress 🚧',
              link: '/docs/ens/fetchEnsCoinAddress',
            },
            { text: 'fetchEnsContent 🚧', link: '/docs/ens/fetchEnsContent' },
            { text: 'fetchEnsCover 🚧', link: '/docs/ens/fetchEnsCover' },
            { text: 'fetchEnsName 🚧', link: '/docs/ens/fetchEnsName' },
            {
              text: 'fetchEnsResolver 🚧',
              link: '/docs/ens/fetchEnsResolver',
            },
            {
              text: 'fetchEnsTextRecord 🚧',
              link: '/docs/ens/fetchEnsTextRecord',
            },
          ],
        },
        {
          text: 'Utilities',
          items: [
            { text: 'namehash 🚧', link: '/docs/ens/namehash' },
            { text: 'labelhash 🚧', link: '/docs/ens/labelhash' },
          ],
        },
      ],
    },
    {
      text: 'Utilities',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Addresses',
          items: [
            {
              text: 'getAddress 🚧',
              link: '/docs/utilities/getAddress',
            },
            {
              text: 'getContractAddress 🚧',
              link: '/docs/utilities/getContractAddress',
            },
            {
              text: 'isAddress 🚧',
              link: '/docs/utilities/isAddress',
            },
            {
              text: 'isAddressEqual 🚧',
              link: '/docs/utilities/isAddressEqual',
            },
          ],
        },
        {
          text: 'Encoding',
          items: [
            {
              text: 'decodeBase58 🚧',
              link: '/docs/utilities/decodeBase58',
            },
            {
              text: 'decodeBase64 🚧',
              link: '/docs/utilities/decodeBase64',
            },
            {
              text: 'decodeRlp 🚧',
              link: '/docs/utilities/decodeRlp',
            },
            {
              text: 'encodeBase58 🚧',
              link: '/docs/utilities/encodeBase58',
            },
            {
              text: 'encodeBase64 🚧',
              link: '/docs/utilities/encodeBase64',
            },
            {
              text: 'encodeRlp 🚧',
              link: '/docs/utilities/encodeRlp',
            },
          ],
        },
        {
          text: 'Number',
          items: [
            {
              text: 'hexToNumber 🚧',
              link: '/docs/utilities/hexToNumber',
            },
            {
              text: 'numberToHex 🚧',
              link: '/docs/utilities/numberToHex',
            },
          ],
        },
        {
          text: 'Hash',
          items: [
            {
              text: 'id 🚧',
              link: '/docs/utilities/id',
            },
            {
              text: 'hashMessage 🚧',
              link: '/docs/utilities/hashMessage',
            },
            {
              text: 'keccak256 🚧',
              link: '/docs/utilities/keccak256',
            },
            {
              text: 'sha256 🚧',
              link: '/docs/utilities/sha256',
            },
            {
              text: 'sha512 🚧',
              link: '/docs/utilities/sha512',
            },
          ],
        },
        {
          text: 'String',
          items: [
            {
              text: 'bytesToString 🚧',
              link: '/docs/utilities/bytesToString',
            },
            {
              text: 'formatBytes32String 🚧',
              link: '/docs/utilities/formatBytes32String',
            },
            {
              text: 'parseBytes32String 🚧',
              link: '/docs/utilities/parseBytes32String',
            },
            {
              text: 'stringToBytes 🚧',
              link: '/docs/utilities/stringToBytes',
            },
          ],
        },
        {
          text: 'Units',
          items: [
            {
              text: 'formatEther',
              link: '/docs/utilities/formatEther',
            },
            {
              text: 'formatGwei',
              link: '/docs/utilities/formatGwei',
            },
            {
              text: 'formatUnit',
              link: '/docs/utilities/formatUnit',
            },
            {
              text: 'parseEther',
              link: '/docs/utilities/parseEther',
            },
            {
              text: 'parseGwei',
              link: '/docs/utilities/parseGwei',
            },
            {
              text: 'parseUnit',
              link: '/docs/utilities/parseUnit',
            },
          ],
        },
      ],
    },
  ],
}
