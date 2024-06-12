import { assertType, describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { celo } from '../../chains/index.js'

import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { Block } from '../../types/block.js'
import { getBlock } from './getBlock.js'

const client = anvilMainnet.getClient()

test('gets latest block', async () => {
  const block = await getBlock(client)
  assertType<Block>(block)
  expect(block).toBeDefined()
  expect(Object.keys(block!)).toMatchInlineSnapshot(`
    [
      "hash",
      "parentHash",
      "sha3Uncles",
      "miner",
      "stateRoot",
      "transactionsRoot",
      "receiptsRoot",
      "logsBloom",
      "difficulty",
      "number",
      "gasLimit",
      "gasUsed",
      "timestamp",
      "totalDifficulty",
      "extraData",
      "mixHash",
      "nonce",
      "baseFeePerGas",
      "withdrawalsRoot",
      "blobGasUsed",
      "excessBlobGas",
      "parentBeaconBlockRoot",
      "uncles",
      "transactions",
      "size",
      "withdrawals",
    ]
  `)
})

test('chain w/ custom block type', async () => {
  const client = createPublicClient({
    chain: celo,
    transport: http(),
  })
  const block = await getBlock(client, {
    blockNumber: 16645775n,
    includeTransactions: true,
  })

  const { extraData: _extraData, transactions, ...rest } = block
  expect(transactions[0]).toMatchInlineSnapshot(`
    {
      "blockHash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
      "blockNumber": 16645775n,
      "chainId": undefined,
      "ethCompatible": false,
      "feeCurrency": null,
      "from": "0x045d685d23e8aa34dc408a66fb408f20dc84d785",
      "gas": 1527520n,
      "gasPrice": 562129081n,
      "gatewayFee": 0n,
      "gatewayFeeRecipient": null,
      "hash": "0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85",
      "input": "0x389ec778",
      "nonce": 714820,
      "r": "0x1c0c8776e2e9d97b9a95435d2c2439d5f634e1afc35a5a0f0bd02093dd4724e0",
      "s": "0xde418ff749f2430a85e60a4b3f81af9f8e2117cffbe32c719b9b784c01be774",
      "to": "0xb86d682b1b6bf20d8d54f55c48f848b9487dec37",
      "transactionIndex": 0,
      "type": "legacy",
      "typeHex": "0x0",
      "v": 84476n,
      "value": 0n,
    }
  `)
  expect(rest).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": null,
      "blobGasUsed": undefined,
      "epochSnarkData": null,
      "excessBlobGas": undefined,
      "gasUsed": 5045322n,
      "hash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
      "logsBloom": "0x02004000004200000000000000800020000000000000400002040000002020000000802000000000000180000001000020800000000000000000000000000000000000000022000260000008000800000000000000000000000000000000000000000008000410002100000140000800000044c00200000000400010000800008800000080000000000010000040000000000000000000000000000000800020028000000100000000000000000000002002881000000000000800020000040020900402020000180000000000000040000800000011020090002000400000200010002000001000000000000080000000000000000000000000000004000000",
      "miner": "0xe267d978037b89db06c6a5fcf82fad8297e290ff",
      "number": 16645775n,
      "parentHash": "0xf6e57c99be5a81167bcb7bdf8d55572235384182c71635857ace2c04d25294ed",
      "randomness": {
        "committed": "0x339714505ecf55eacc2d2568ea53a7424bd0aa40fd710fd6892464d0716da711",
        "revealed": "0xe10b5f01b0376fdc9151f66992f8c1b990083acabc14ec1b04f6a53ad804db88",
      },
      "receiptsRoot": "0xca8aabc507534e45c982aa43e38118fc6f9cf222800e3d703a6e299a2e661f2a",
      "size": 24562n,
      "stateRoot": "0x051c8e40ed3d8afabbad5321a4bb6b9d686a8a62d9b696b3e5a5c769c3623d48",
      "timestamp": 1670896907n,
      "totalDifficulty": 16645776n,
      "transactionsRoot": "0xb293e2c4ce20a9eac253241e750a5592c9d3c1b27bf090d0fc2fa4756a038866",
    }
  `)
})

describe('args: blockNumber', () => {
  test('gets block by block number', async () => {
    const block = await getBlock(client, {
      blockNumber: anvilMainnet.forkBlockNumber - 1n,
    })
    expect(block).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 5240957424n,
        "blobGasUsed": 393216n,
        "difficulty": 0n,
        "excessBlobGas": 393216n,
        "extraData": "0x407273796e636275696c646572",
        "gasLimit": 30000000n,
        "gasUsed": 11497595n,
        "hash": "0x72e938fa6ab225be2ce940db9aea7d670b50b3320b8deaeea1084ab645a1db81",
        "logsBloom": "0x22e3440031939318c880faa0c25882352633a206d040224202804091810ac60182469a32f0938a0862a48ea4c0521149632104a0a88820152c2491b550abea906722520965628b2d2902f53f0000e57cc0150031c4c00c04912468808b2198b046158021a2526a034244f7da81040c4d08110585aec88e44d101045410189809821898480859446e4400200641222a1400cb0c3155e5069c90272052089251589a924fa21894eac4ecb0e2c40c4506c064009c2000bdc9cf0cf0da081c00c2545b1017a605c820615800cc494f20b04c0100180410200071200505139636a062287fa029129215104a0500c4640319101806b56839189650d32020b169806c48",
        "miner": "0x1f9090aae28b8a3dceadf281b0f12828e676c326",
        "mixHash": "0x23d23e04143c24368a9af1defd619523ec85cbb2b2c47a7c136401d6854f26e9",
        "nonce": "0x0000000000000000",
        "number": 19808249n,
        "parentBeaconBlockRoot": "0x10be9dae4e7e8154305b2519976d7b969c8b43eaf979063b435aaaac2853e91b",
        "parentHash": "0x488e72b60d6ce9d7d2864e32d42b2b0dd0c2231def0c8b47c2f73988c4c514bf",
        "receiptsRoot": "0x2d1953e6236896e34a2476aed2e08aa9af2c15783cbfaaf317e78a739ac8ad99",
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 154461n,
        "stateRoot": "0xd5488b1c74e85a8b26eb933f9389899d861e762eced21cc80f13e504dc3ffb01",
        "timestamp": 1714964735n,
        "totalDifficulty": 58750003716598352816469n,
        "transactions": [
          "0x886b09ecc2a01291717ca3171135fb4917c5c263bab02b570b04699c20643bc4",
          "0x7120b9afb1dcbf8a3a937ecfdc3b013a119f3478f78d472390a310a5b9e905ff",
          "0x4f03757c3c98b9703a7d39761391846bb7acb801be84ec75a3e3c98c2bab1527",
          "0x6b1c43619297ae89dd166f7fa376b2ccbe3681878ae4a09fe5534cf36b2e4f3c",
          "0xc3650c2fc3aba9e0d94d62fc74a1c01e5d0b8dad01998237c26f94e4bd781a30",
          "0xdc584c682ef73ea4424b80dc2c9dd107c54f93b6ef2e1ca597633357b6e98ba9",
          "0x0a056e50d949ea37cb9035810d1b4040d6ab05526fc419992f9198521159b333",
          "0x889a5fa247bad5156c5c883f1a2642b26aae8d72258bcc6ba51853983c578ebd",
          "0x39142d069aea564e678103949fe0ea88662a6ff2f9be90888ebfa914a15e4438",
          "0x6b334a8ebc4e399b790230f3506412cbde04b5182a0c0ba8fc0bc05028d68d7a",
          "0x9f596ef1e45866c3b747015108ebf69295d8cdfee2f1740e439cc88b744a35e0",
          "0x111524f0e1cfd9f926e67fad4c133dbe9466857d1811bc3990a6685378d4c3de",
          "0x5c9591b7ece5b1a0c10eff5f206c5b106bdfb9c2a178a00ca4b698fd8239a320",
          "0x640e1df9e769a63406d6ca9221e53055b4def8465abae297ff777a785c3c030b",
          "0x300b18b54017ec6d11f5d64884d5535c74263cd8b5c273a48bd955c4d95aea47",
          "0x17a341742d8bfc4f9f172a7934434a3131ed13b360727bae9e4f783ba567996f",
          "0x11c9b5b8f53783fa96095f51929ecb977fd9b6a68bf79ae4a70dcafde07369c3",
          "0xc0edf72a979fc4da03ac76967b5293d9078c4b51d61245f89d653e6cd36d195e",
          "0xd395eb075cb5f57172dd97fe7d7b8cc0974f84567c5d361e50c2d39de3dd6569",
          "0xec6129b9e3b6508cdada30575bf8d429b4a8be367073f6d32bcbd15487d4b8a5",
          "0xe96ee5f2e20d34465225a91de1804f89f15117d1653b70a52ac46a33dadece5f",
          "0x0b3288bf112cc12d02d2333831e804e34e8e6b725b75a0735159a541c122508c",
          "0x52b440dd26d30776822659935682aa5de3da31e6e009a859be31a25284da9dc3",
          "0xde7fdcfd8c0d7be57c1f71d2389d467224e08c4ccace1cb4ea7d6ee6f5bd08a6",
          "0xc17b020b420ff332f4313b2a7d777b2df05cae5f0f6e7fc0559c47385b29da81",
          "0x70f3cdd5608c3e2d667b92e8e56adc0b2f4d462b4512d400a02e74674e6afd5d",
          "0x066364df37f5b82be59eeef18475ef2af9f0dbca835cc642d034cfe748ef8a32",
          "0x251aacd650669415b8554a8881d4af13485135a81dcaf4a73817e9ff5543fde3",
          "0x45dd302101546019e973d6f5fd94e1bb6a4092cb291124b4405d8056685c4bad",
          "0xbe32376bbbca2fd4bc575cc0e5df6253672dd9c5de91034896c0edc24376e717",
          "0x37c7e6f924bc7ebcb933f488d40f6e2a043cf4bd74ce90922ac19746db51dbdd",
          "0x7c30e408315a0fcf2ec953d2c25a7fcebeabc317bbf127bbb5be79721c9420f1",
          "0x0f3061ca328656a605ff26a218b1fd0f0ea5a4e71f3ed318ba307b879de35b8d",
          "0x64b74a0e2eed40d11513dfefbf153f4c6e91266019ea3ef8f0878c754a9c6aae",
          "0x165128ed51535a1efccb070a6188a8d1fbac544449d412dc9b62607b3f586420",
          "0x3497ede25fd198babd44de6642f9396951b0172359fa6c45242ccedc262c222d",
          "0x207075aa3e281e9b22986cbcc038960308c756f707fa3f0921545a35f309cd58",
          "0x0bfa52656ee48c4a2cb5c57076d4d4650833b5697a06bb2245b2adae7d69e1ee",
          "0xadbede5084444f8ef8a8c6bcf01312d0b11a72f56b41de26edb51b58dd0c38d3",
          "0x6ea0a653ddd85f2d2b0dd945f53370c0d140d99b6dcb2ee6e16a398ff9d04a0f",
          "0x83c461a74443b52c4e6690149b933eb7aa9af0ac84658a14d97ed749aa6e999e",
          "0x556ba7e2f19ba54bbd6e308b0ece1afe017eb0e89b97b547845dc00da6d72da2",
          "0xf6caa833794e2f1ea25cd2e231ee2fd92dac9316079033e0ab0003dbc26e5dab",
          "0x8e2d26bfac2712a17c7314935c970967293c7ccd129dea9eadef292427309535",
          "0xdee9e9a392f23e8d706cf4ba5f818761b62b4ce50c28192a4d2c7f0d14246b61",
          "0x21cddf24ab37dbb7d82cb3cb54fae49761f522cc70587c559e7a451586106757",
          "0xb58f2bea38abb7243c0f80cd7d35e7359a39e6318a09c0d079ae0d36fe750f42",
          "0x0ee5e43ab1d8647c39f6435a49b5e36f3986b665cbadc8a7bafada5a7b1beabe",
          "0x56eb597df46cec3c7c67606244fb3b393f0de1cb0cd0e0be3c5fddfa220062a1",
          "0xf18ade01c2a027594171c1d48ad58833f4a40a77bf81b4c2bcb8ae628d60e64d",
          "0xe90abed6c0fcf2e98d9a84dd6a643e39cdf0a7d79a23b13d18558ce0fab8e724",
          "0xbc9ff1f139c162882587f60851cc8538649d406a9f01a339df7d0f45581b5617",
          "0xf336a9938b5e48413c4995f80e155029e1e628570a08d8e20f642d91199648c2",
          "0x3f62fa7b9944c03a93e274670f2883382b7c1efdb315f3ae9a91097715ee448a",
          "0xb683c8447b94a23618703af9cac43ecec101a182df2b532161ef59037057c96c",
          "0xf9f4670099ba72ef04c34ba7bad0bec88adf3d5d1c1519c880ac29cc75802d91",
          "0x0ea069731f58749dc6129d4d6b74bc370331017ea81e70263a1304bea5d1f014",
          "0xa9088f6899a227bc8594aaaf79776b0de771a357cd7fb8153e2ec4845b3b67bb",
          "0x90a6809a92ac9871e00cefaba384e75afbd88f1d53b73b5c6f01f05ebdf572f4",
          "0xde0459c22b24c2e7c0fd5e06e2fe952d40b454057dd0f7b32443121ce15de5ba",
          "0x44d99905b9c585bfcb1ff319eea43cbee4ad64d7a0788e09297df36d3ad10ea3",
          "0x6b1d138384bea0b361065f0b9ac195af2873f5391b2d7cb17dcbe2e2824c514e",
          "0xc06b8d8dbfd6488fcff8e47b37159953f86922399204029dfd18c94da0d5554d",
          "0x0605f85df25ba83097c4d8ee0583947ba295bbabbcd151db211c64b726b67768",
          "0x304d653a2c6dbb1e146b32748ab7ead4a0801a8534f7b7ab9b2a4a993f7bc0cc",
          "0x703f9941add97054f51081cdb64d4d786be70a3cdd87955deb6ce5b7e92f0bf5",
          "0x06f1d35016a79ff4ce82f2caccdc009cf7efb807e09fe7c9dbc738c4305ee9a0",
          "0xcf05d4c9de973f072b9f3d5f6089c58a15e8d53b99675f1a444c80808e1f2087",
          "0xf6772ac1ea7227f8d81fe10ddbd458143530a51e14ab857aa94d88d0afd840e1",
          "0x24b6e8d1454b414d6c3bb0f6f3a04ecadc510e2093d43cbbb6b300407f82ffc5",
          "0x1ee9b6dedfa32c3334da32d5dc9548c77ada6646199bfdba813d891dcf1b4aa1",
          "0x70861b6746eaaf11cf66b2d14fc90469bc654e4cc7e38e2f041cb706b64b132f",
          "0xf6fa0463ad0bb0f359eb49ad5b28ab1c6587bd108779da34e441b8d3f5d297d3",
          "0x5b208a4193d9678ce46cbbe83e5c020476780841744b7dd284322c256c51300a",
          "0x9cf14ea90029266ccde5bf9977a6e51e99bd2102a15ad579be8e0c45edc540f3",
          "0xabacc99e03c2b8191dbaad009f70975d7155e51bd9dab8056a0864c7f7a7ac09",
          "0x8458773a88d0d36a0d913f8fe75923a89346c81f923cddf4693dbfe422041a02",
          "0x0312207a583b157c3add695d404f4f2021093cf46f9fca25ce1dc8fe82bbe9fe",
          "0x8d113677552a1056fbf23cb34a7dfe10a61b6e34f6595d3ad21fefe0d6296eeb",
          "0x5c5b80281297df047564e3564079b9877200fc734de86103502accb40387864d",
          "0x4dfcc7dea909b4b413d7ab123dce59de27e1e472e189ee96e221e0c0f2d50634",
          "0xe9e0e003e54b806af3d989f633a2eb28adb4a00353e7cd70b49093770613a62b",
          "0x83f7df3cf319d514e35b814a8bb2b34854398cfb5a5e418d5f3dfa0c5a5b406c",
          "0xff172df0803a68ec8da428623cbe399877a06e63e7a730cbfc584279ccf47737",
          "0xb9a96cd2d5b1c3f7fdf1d2836a296ed02fd59bb68faae20954113fc9696d32db",
          "0xf5b61176cc2f9d90efcf5a2eeed36368d13ffe68401fe0ade18d592a65f899e7",
          "0x3322dcd4e6ff20b7c72f23f4c9fee9f53baa7d2393d0b71992e61f693c7893ed",
          "0x1da91f066d71143b15a7863dee249f7089da7e26084fe94ffd10197734ed5cf8",
          "0x09b5a44aca00666af4158463825d350d51788e444c1237d21f91b56e986c7b5a",
          "0x06f9d5ae10a966e1502738a102b38778a74d2416bc5ca9020d06f2a3911bed36",
          "0x407472d6ac7c050b1b50d7e127fd4afc93baaa9aa05326859ad019635917f86c",
          "0x58917b36b255c42258a1d0cc42bdf87c3fca62d1d96761f9cffabc1e48d65fb4",
          "0x1026a95195609813166c184dfe015df00732d02a0b4ca01ea0046db55fdfcfe3",
          "0xc1a38cc40293d632135443e2ba3b637d5f23ae3d0bf067ec475a0ba66e93c99d",
          "0x31d91a5249feca497af2397634cdd80c0acfc8f6bb57bff72395f683d1b93019",
          "0x3808ebfbffa2734e1de1f5d504d36f6c64f6d548562eec5804d13bc22ae2be83",
          "0x39a0695fc2a986f67be9afdccd44d962e4ba1fe63f13330a1d0a934444b6ff94",
          "0x29a575f042ab88dd02dd2f78399fdd77efbbab53783c6eceecff5f28a35b247d",
          "0xaf6987ac88fce69edc21d8a6fd113adda99867ce4ea6996cc487c3c832ca6bd5",
          "0xf0c187bdf68a29625cfcdaf573c441d2967d13e9ebdefe7c36d3bfa2e926b1cb",
          "0xae5a800c97bb7600ab2af45083d80159fbbbcda99c43f721b6b4e58989abed92",
          "0xd1705c20b9eefc74a620772047ef701a2ccc1c9af869a80ed418ddab53aaa2dc",
          "0x2621df68331905591cfb3474a84c92c8e2d247168efe62437b8fdee76dbcdf75",
          "0x25087949b6bb276530c091b29ae27150a53243785e582455965fec82245f5deb",
          "0x150db220b21dbc0b0da30c4fd35f02d82db55bcf006c68eb85a27aa0b4bdabbd",
          "0xeeecd7dd17c5aa37429a2c3b6240e0bc6fb3c5a9f9f8d75a858c3cffc81302a2",
          "0x7d5e548a75361c489d373355e0c826aea4b7f8a15cfb0cc613022b32051c0e59",
          "0x993609d32daa335b1622b16b9f5f058bd4327c8f713159bc5ce6485695961bcd",
          "0xa4dd39b6c610fb931687354f06ee0980af7aed5a13b2108a97f1ef94c78854c3",
          "0x9560602986f1cb583d9c80979a62b9606ffb44dddd82ebf9cd1fb948298b45f2",
          "0x3f1c92bb60be5b3249d216a8a7494793f7fe3765d8dcd6a6696c8529108eeb74",
          "0x125e53eb83d6debbef8bdb8a6193b0e911b77c83de15db0a863e4d874f149588",
          "0x97fdd635bc175e438bcfa4fce1fe7aaaf6141f73924cd06a2401145888c86424",
          "0x2f922d70b9759e4f4ea7a23738736c509f43a7236e31e59d60b015d61cffb9da",
          "0x7334485a076607d55b05f238a64f331e73c70a8d05501399d4a638fb49907557",
          "0x96b9b6ea9ba995a32f40af0e76ac2442d2b3c8ff78eb089c6a7c83e6f81bd0d7",
          "0x4caea43914fc92cfc6d9b9a57765a5aa07a8fca3dc70a6bec7988be9dd9c3955",
          "0x3e370ec9e579c08d98e9d5096f0667931fdbea9bc741f8a674be9697c40443a9",
          "0x2507a512b704b36f9b155127c9e865330051c1f7134b6bf7f3f95c6c6b38e246",
          "0x17424457061b65b6c5579434ec8f88b6c71d7d9629ea6ad5477c0337d4097ce6",
        ],
        "transactionsRoot": "0x5b562b0ace357d4ad0a402a0ccd66992474e445b17ccae8415d610589bf8e85b",
        "uncles": [],
        "withdrawals": [
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b6b1d",
            "index": "0x2a5127b",
            "validatorIndex": "0x4e930",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11ae511",
            "index": "0x2a5127c",
            "validatorIndex": "0x4e931",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b600b",
            "index": "0x2a5127d",
            "validatorIndex": "0x4e932",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b294d",
            "index": "0x2a5127e",
            "validatorIndex": "0x4e933",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b6d16",
            "index": "0x2a5127f",
            "validatorIndex": "0x4e934",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b31e3",
            "index": "0x2a51280",
            "validatorIndex": "0x4e935",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11acef7",
            "index": "0x2a51281",
            "validatorIndex": "0x4e936",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11a2de0",
            "index": "0x2a51282",
            "validatorIndex": "0x4e937",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b484f",
            "index": "0x2a51283",
            "validatorIndex": "0x4e938",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b57af",
            "index": "0x2a51284",
            "validatorIndex": "0x4e939",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11af5b2",
            "index": "0x2a51285",
            "validatorIndex": "0x4e93a",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11a36f4",
            "index": "0x2a51286",
            "validatorIndex": "0x4e93b",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x119867e",
            "index": "0x2a51287",
            "validatorIndex": "0x4e93c",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b632f",
            "index": "0x2a51288",
            "validatorIndex": "0x4e93d",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0xb7ef8bf",
            "index": "0x2a51289",
            "validatorIndex": "0x4e93e",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11bb871",
            "index": "0x2a5128a",
            "validatorIndex": "0x4e93f",
          },
        ],
        "withdrawalsRoot": "0x7ec76a2942b6ad99ff0fc13c65025b3a89413813e5b53dc32599bea4215ca660",
      }
    `)
  })
})

describe('args: blockTag', () => {
  test('gets block by block time (latest)', async () => {
    const block = await getBlock(client, {
      blockTag: 'latest',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "hash",
        "parentHash",
        "sha3Uncles",
        "miner",
        "stateRoot",
        "transactionsRoot",
        "receiptsRoot",
        "logsBloom",
        "difficulty",
        "number",
        "gasLimit",
        "gasUsed",
        "timestamp",
        "totalDifficulty",
        "extraData",
        "mixHash",
        "nonce",
        "baseFeePerGas",
        "withdrawalsRoot",
        "blobGasUsed",
        "excessBlobGas",
        "parentBeaconBlockRoot",
        "uncles",
        "transactions",
        "size",
        "withdrawals",
      ]
    `)
  })

  test('gets block by block time (pending)', async () => {
    const block = await getBlock(client, {
      blockTag: 'pending',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "hash",
        "parentHash",
        "sha3Uncles",
        "miner",
        "stateRoot",
        "transactionsRoot",
        "receiptsRoot",
        "logsBloom",
        "difficulty",
        "number",
        "gasLimit",
        "gasUsed",
        "timestamp",
        "totalDifficulty",
        "extraData",
        "mixHash",
        "nonce",
        "baseFeePerGas",
        "blobGasUsed",
        "excessBlobGas",
        "uncles",
        "transactions",
        "size",
      ]
    `)
  })

  test('gets block by block time (earliest)', async () => {
    const block = await getBlock(client, {
      blockTag: 'earliest',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "hash",
        "parentHash",
        "sha3Uncles",
        "miner",
        "stateRoot",
        "transactionsRoot",
        "receiptsRoot",
        "logsBloom",
        "difficulty",
        "number",
        "gasLimit",
        "gasUsed",
        "timestamp",
        "totalDifficulty",
        "extraData",
        "mixHash",
        "nonce",
        "uncles",
        "transactions",
        "size",
        "baseFeePerGas",
        "blobGasUsed",
        "excessBlobGas",
      ]
    `)
  })
})

describe('args: hash', () => {
  test('gets block by block hash', async () => {
    const initialBlock = await getBlock(client, {
      blockNumber: anvilMainnet.forkBlockNumber,
    })
    const block = await getBlock(client, {
      blockHash: initialBlock!.hash!,
    })
    expect(block).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 5087991129n,
        "blobGasUsed": 131072n,
        "difficulty": 0n,
        "excessBlobGas": 393216n,
        "extraData": "0x6265617665726275696c642e6f7267",
        "gasLimit": 30000000n,
        "gasUsed": 15108959n,
        "hash": "0x33a7971472539aa0ffab0ee330347acd56ca7d2682bfbc80872110ee15e7d8f7",
        "logsBloom": "0x80a715cbad9a534e26a01218c885fc2384c7418ebb08610ce30b692726685230a8d1d4be7c512b1963d50bc3fa9b310512532f52ba86229ee000e6a941fab0a45026e41f4f8a4baa2993f06d4ce308fe84b4026b0b4f8cd4d6445240806750615ed8433dae4e24e01d4183978821ac9f00123297008a2648f269c41f7c98d1059a63ba6aa345d42410d70250213a65761258b78143d4709c100282df6a523a79bec1036e5814f9583cdb81c519d7b70016976e8ae1c98346091840262b154741d999907beade05423823ff7a09cd783c06cd621795d85112bf7ffc0620a1a0da5854e4897c2014ea02f596915c43902c9ca0532193797747712152267d0057cc",
        "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
        "mixHash": "0x0403c5067873bff3108703e127c63a2882509ee91006d921e2955c2420470958",
        "nonce": "0x0000000000000000",
        "number": 19808250n,
        "parentBeaconBlockRoot": "0xed1c13ebb84bf75b852cb3e703f8a7d7c8465a039ce058e2390ece725a54ca47",
        "parentHash": "0x72e938fa6ab225be2ce940db9aea7d670b50b3320b8deaeea1084ab645a1db81",
        "receiptsRoot": "0x649c9570fc198f14fa93c9b3fb0d7bda1f75a2a05761ffd832768841fc274aca",
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 78523n,
        "stateRoot": "0xb821f1259927e7c699f2b06cd550d45e8cb322c06256f17ba36caaec33ae865e",
        "timestamp": 1714964747n,
        "totalDifficulty": 58750003716598352816469n,
        "transactions": [
          "0x12860ead0532b3a4f4aa5f8187d7d0365f6ae93764c8771ac13c6d38560033d6",
          "0xed513dcfd2a4f635bfaa476c78919cdd116090513e73ae6b369fa2012ee5a9b0",
          "0xc72e7c15c972b5e4e2ccde950691426dd5a725cb63fa2e9784df0f98bc4c1751",
          "0x258c636c6d237e14c081c57e7e49043cbc1c81dc7d0b9628ff2c7c6b9a3ffca8",
          "0x0800e07eafdb3c33bacd4511503110953d231342a7c29c88c3706b70210d3079",
          "0x7fb43c8bba50ffaa4e5b679e0bb55213d55def53e86524b50cd929d69d25a11a",
          "0xce5ae725bcf217588fea1f50a5e90b73be01be20a0c280a74992365b84a0e1dc",
          "0x39014032f86eb1c043ecf794e04b2a03127a41a1a65b3ab232705a7bf7ccd3d8",
          "0x54c8ed510339118a344942a487b46d8627c8627f35cd24efd924e5d39a0bbbaf",
          "0x10fe93d2263dd06a9ebf720b2987f07032fe3c4371c8f0c47f92969e19d638b1",
          "0x9126f9bc92a2abcd95c35916d45258490d9743a536fa98b7da0f6bd878aa40c3",
          "0xaf7690eb86ab1e3e0622454477b7048081ad555d398ec7d3ee7ea80e7b7136a5",
          "0x2812d7e89b861cb2b6654ae85728bf046ea1b651d558f984e22df08357958d46",
          "0x0351d36488fb798fd81d65de7adbaed0b3de372ecb1dcfb7722281d4595b27dc",
          "0xc5fa349a9fe36be632e9ee0da47cd1f585cee05027ac7d241a12ca7e59ac01c5",
          "0x9a2e22ac7b57614bc59d69f0cf6d8cd664e625a39b4bd3518fe02174fb36b53e",
          "0x40b80ab435c5d21ac7a8607cd19dd90bae1abfdd45727726a0027c0a6d0f0f40",
          "0x3caf97e1c0d81062c8047bdbac7c427e0c2b4a0bc6f860cc3892ec884444b9b0",
          "0x350bcf3893818beae014118a42a6666559d7ff21ee9824b88a287f0efd734627",
          "0x7588537e4c3f06d40e4efc1a495dbfbe042b6064b81104de82f5ef0987b64cdf",
          "0xbc20d73ee056c066705c7cbe3fea6eb1b7caea7b56ca53fc3298396f1fb70d57",
          "0x2f08911326a2c5c60a7f86ef99084d5b73d2393dfe00622f627459bcdbd62e10",
          "0xfb6055df069e04ae38c2d553f891d3ee6ab9eadec01d5fd8bf0c8b477c7c89af",
          "0xdf7a8624a9d3b9fd3cf65363243b9db1226199e2035cfc9188208f89d7e38cbc",
          "0xb986e24702b5a08144261a64a2e189f872edaaed979082d33f31069cbaf82420",
          "0x472adb3a051dc3dd82db424786c900dc1d87f3803d0ce6502bc709687114f98a",
          "0xdbc480aaba9b60b3b464adf78a4220446775490cabbc5952f1ec57318608a81f",
          "0x7b2770dbe042ad96bf6a91855b635e78c5d027f3798424356d3c45c3002cf499",
          "0x12459c7ce4a983588e168351f2206843a4b11eddda203fd3a6a2d4580f7d23bd",
          "0x9d8b25edb003dc088028133efe714ce235b1f6ee1768cdbd7ff69ada032d4a21",
          "0x370c36c4292fe4d437618e4a045c6fb2c6bc22621411f40ebfb82fcfa2f7b9e0",
          "0x8145af3796c4964e5a6ff964de8ab23b615112ca280ea7beea97753b6c849280",
          "0xefc0bfa3a0c44ef04d36335054a41ede3cc507c759be41a1cfe83b18f5fd129c",
          "0xc79e7863bb792590dd0b3c4622a180bf70f767591eacaad48a0af10930332679",
          "0xf47931c3a313968e1cd137b5067ad1b90c54bccc2ce16ca01318bacada4b4a31",
          "0xd54f767e01c4267be2c0fbe8db9e4d845fda4cb113a3899ada4289480dd5f859",
          "0x2cd97e83ebbd33bc8d7d2d39aa9cdcec1ac261bab1702548ede4ebead14c47e8",
          "0x80c0d28d0ccf69dca51d263e0a4107c8a554c40dfcb207c1eb2c95a07618a5ac",
          "0xe5033b68abcf549b32ca59903c655e12007d96e8dbd53e37d2ee00501d2b7de1",
          "0x4ad9f131b26daf8424a72a58ffdb82014eefdcf4ac1473f504777dab84b87535",
          "0xaca6f6a0a1f94e265d31be0ec2d6b5f7da27e6df40595b067c71ac65eac50e94",
          "0x1d356bf7c11ab24a8b6c51b38b1f822e2deed2c9dc4bba515bfd46e27b20d5ba",
          "0xe58b2851229cfd243981f0e3a10a6b1dc7a9df7e2a5afae1f0e61505e960375c",
          "0x931c4dacb13e711a8578f02df6df51a381cfb05fa81da5f766638952910a3286",
          "0xb199838a7add300d484e03f452a09c7cdb0afb0e7c67e5884367b9c8a674d182",
          "0x2110462201aee32e8d9ddb5c9dd9513592ffde32382da1aabf007630ccf77ea1",
          "0xf5ac56284d6d4aa75fa67ccfc58a5658d2cae41d01f412cdab962e91276e06a0",
          "0x4ec6f73e1245c247ff6868795b7f0b6789f6a9342c8580b7f9a80d34c3959c6b",
          "0xcf77dbfe46f7c12dd9f8042e4b86e7c28a519f1a833cc30f4b581418a3440103",
          "0xd4ad311394d0d0a06be4bb32f85ee6f5f6b5f2a688b252e4fb89c3dc374b8bd6",
          "0x5f998e622a5ecdd34ac52e89cac0e8959e734a4afb850c18b7829a4c1c30fde6",
          "0xac150958348194a84cf894631ecca299cc1ba46b92d36222906f1695d45ff127",
          "0x029101258e3a0d66780f2ec8a6c74e93f1f574466af72a771bf4452ed4a36f58",
          "0x9d986ebbcfae4e31be2aa5fa5c7f2fcd7f0856ca6521a7e397b7a2bbc48d8ba4",
          "0xc39c67e7efb378137a47dec994ac018f3b9674a1fd0dcb2c8d39ed41c8655206",
          "0x9a416e3dd237f7f9b5c696197f18a53390f52fe2971658f284704167365c9e35",
          "0xe9305e739cf066fd8e1468dd25f460db18f33b8ea171c95a9c424c5aa7e3c235",
          "0x8832a517ca2deb2a66b5e0681fe0c85c5c1af12aeb94d50b531a264ae1eb9e33",
          "0xa9f74c7b27928f1e4b6344889e22939409d07a602619b62903c5776120e0a558",
          "0xa10590ec01af9f837be9d6b3ad688acbdbbb3fc8b03bc2cfd9248ba20c6c64ea",
          "0x4ed77d7ad8b1ac8fdf1bab5e03a8d8c73687b8a7788b8040a0c1bdce2931f0d4",
          "0x406705bbec19171a8d5699522732698255b122a495bb4141e2c11605972495f5",
          "0x0847427ddcdae27ed2029ecfc9a0fd27cdd919c5648ae715b8c25f336a3f92d4",
          "0x6256806522d5dfd39f9a7fd8a2aef44c73a555c24a3fac6ab1570771e641a05e",
          "0xfe1a5fa2b637212e86d593b3d7ae041babad31b866d054e901f2ff33c468e418",
          "0x6a9576201f7c85a2c327581f30702e94d2a350caef89c8400d9569aa91951bfe",
          "0x5f77b63367a427cc620ca5e3a660b1dde2beb5ca98e56adfd55a4861ae14e1b5",
          "0xe31b66b16d8a41d32dc6f422502bdee12bc747d9314b1856b4b4bc9cb3dd9403",
          "0x3531698211550e8674966e596c678f8953e58b304ed7811c4fe663b7b9c7cffd",
          "0xeb2c5a76791d6ff1c11bf730253658f51daeb00906e394b47aea835c9fdba77b",
          "0x86d1ddc92753c1c1f0302a690d2063c6e0dfd2d6862c592274fd7905efa49eec",
          "0xfc574ead986bf97b1f8a2f238d88727f3d4a72046c63f83290fb37dba3201b5c",
          "0x325936f0be7ea6043238e77bd1bdeabccd759967879908fd627f72727518931e",
          "0x20364ae1ea8b9801894ffe225d7d976f80e7362dab1f5a7130d25243b8889eec",
          "0x279735ea4729dc90a118266648a2feebce7ca64cb1afa9545e19ea13da0cf83b",
          "0x0fa0f631fd043dacfc8d46a5928abeecad3f78364b82e7186c60875837bdbbbd",
          "0x4bc7e1074376aa78335f8b4b8f62e9292cace9dae0aed6d26a203a03cddd4109",
          "0x775e28757ae6e072cd3b81d85e4de4bc924b69341585ffa644898fd954808aa0",
          "0xd08f902819d47dd5b7d2d34273aea34562d7d3e6e696087625a6654055ef655f",
          "0x4f11a66edea360f5f27f462a11f93d817cee7a870c9449814f96dbd155cc5bc8",
          "0xbc4798ebf06e8de6f41f3266e38eba95c4fb1a26476bb1e33029d8cdb7036a24",
          "0x4b1cf02ef289636671481e8364afc84bc79cc1f196c75d59bcd8e6442190e9e3",
          "0x08e9a2c505d6975f87dbb3fd680a748bc3a10894a6c05d045d7cead1311daa50",
          "0x9c18c613880668be568156190381fc36662369e49e8a436243eaaeeb5caf42b0",
          "0xe935bd3ef799f26b7efcb0796fcd6762aa2736b6241a5ddd4de90ff9acb5600a",
          "0xa2dac6abd420580dbe113c0c64190f731519f3ad51f37426c377022aeb9ddc44",
          "0x3b20edf7281bf115eea7287643f68ddf70b464baa26ab493e906a8b4cc0bd183",
          "0x6bba175b959f2af9fe4d89a92e55e259ee7ca98207739ff9e86ddf8f1a90fc75",
          "0xcc34030e9d69b6f7813ee9647cde4ab4bd23fb3c4cd76dd1d3b0a9b5b72b124d",
          "0xaf28bbd7c9eea390ecf90b0ba6cd7074bbfd202956b80a411a72a29bf1d0a065",
          "0x8126d643814b5d013674ead269132aa4b223074afcd406ad0d7ca07d598b3e52",
          "0x781de3d23e65f4f7369b07795ad1f1237b53d8f054a2d58aa24eadb7e42ee07d",
          "0xd01c2a8c4020ac9faced0d25476622ea82030ffeeb7c69ffeec6004827c70f07",
          "0x133d37de851fbbc8f6496519012e4ae17d60e3ac58c8987d4de3142161b8dc6b",
          "0xcd21c5e94e1362390688c541be600a53f318a299e7fba155fe032e61a85c87db",
          "0x1a03c128b6b6a4348f56ebf4076f5c051ecd22f0c3534216fb02b1bc33a0602c",
          "0xbb486632d0c2fb6fab0a17a0b39258695f9a178f5e27e9a72c36df76cc1263d8",
          "0xa59bb99d7c0becdc070c02ea453409dda451b5e6c66ca42a081d01607691c68e",
          "0x6b8701f8bf6a5bf853cfe765d5d86153cecbbd46c41e6afb81d26d1e79031cfe",
          "0x8399c2f547d7abfb99dbc586250134b57e46577f7a2e55e9c7c2618e56239292",
          "0xd37d12d8518dc02e8b3cbb5fa0b59f56fe6c0a70805c755ffff6b74edfcae2f4",
          "0x765ea9c689e67f4f773e4058a2fea01edf70da6db50064507e684877394aa502",
          "0x89675014845e26847ef059d21ea4af749975a7ec3f4a6976e6c6e8c53b0b145c",
          "0x2ffd985bbae3b9ff11f8451b8bb19515a449115abdfab09474515d1cdc5ce124",
          "0xc6c58abde0a22e572bf6e16180dc968f02dc3afa3d15d0aa8f4215e42f757a62",
          "0x37b84f52321c2d4c81efec686237f125b770a2a3c103a684d63ed590e90431b7",
          "0x3706bc60b4a99c01097c06f39512247448abdb0d15f5f609220811da018ae17e",
          "0x7d2eab2fec674e1c7e370eeb167ecb74029c0a232f1235e845963fc7d3dda954",
          "0xd4c6ab4c94c53e5aadfee12542526d55630690ee7e8402a5c992a000950be6fb",
          "0x3d0517ea747fc46a1af3e8bd66a5e9c1baec849a3e8d6ec8c0cfe065a42cccf3",
          "0xcfd5693a2101852aec988e057da93871f453f758cecdd38b9194652dbd9b9c25",
          "0xc097c97e4acc5360de98e4d72af55333c05d154eac3424059e7848d32013e025",
          "0x7527429baf457ba3644188a75a109960ae0d845449386ad4aa8e5581cd7b1a41",
          "0x061e3b2a4c0cd6490993ea94fd4e7563d362585af12bb3458952b752426886ce",
          "0xf9af3398ad3edde0ca7f4603e5851d302f39b617e4aa1eb3568392bf5144bcf4",
          "0x7f478c943917b27a3441d42ddce13838efe3926ed6ca87e812be441501b37016",
          "0x94f5ebf04e6d04d89dca2643daa02439833b153460d3f33de578047d0f04ff8e",
          "0x2e03c81dc609ccbf0e91b6b67b79f3088028b736679de46f51caafbc9dd6a488",
          "0xfc6472d85609fbbb6ac8dec4bf069f51d3a96f59f163738e38724aefcb5d9423",
          "0xf70cfd8d0721b13b8e75c8aa24e6fa984576b1916fa14edc932fc8f53132d9df",
          "0xbf6190304df41dafe26113b37dc45a9812ccfe9ee40a1dfb97bf85e71c5e9829",
          "0xa59cffc13207fe46b3c41ff728f3e1fe8172492854208ed6ee34485a4a452638",
          "0xa0447569ee667995ccdf4edbe77abbb9e499741b7d084928a2cd4fec010ae3af",
          "0x38de793ad609ad9774dc298e1b3050eb022858125e22640ac6f4ba4713004320",
          "0xd83b345b4a6cc0ce214d987ba4a39d2f981ee7e54bba697138cb9a2e3f354a31",
          "0xc58657f3919410d504d0b3e16cd8baa1a38a2405b490a288eb64635c86038848",
          "0xf49b53d2c68f855bbb828109d66cf75952fa16d6d21a6aa8fe04cba4ae54e91a",
          "0x98559bbb58decddbfddb8f074e4e681fda52ee5e41d9b230af4ad054c6b05448",
          "0x0cda4b71587108b814822df6e4ee65e466716c634c5a080c87bb9c92d0a01304",
          "0xb5dc2541610f061f46d81ad092e7222a85bc6d208044b8d57ba2381334901536",
          "0x6de7c83368dacd692c865fb42fcca63ade071e98717cb62424bdd256f1368d26",
          "0xc553a57130c5877337bbae3150b497fff994a1150494911659c1fca1cc8aabd6",
          "0x9fa1899b30b6da8079838aa0b597ed5a48a1182006b28053babafab8ac3b796d",
          "0x545d5046aa19ce6f402e93bd77d0c29f9ae58f07856ace50e91e9fdcb15b0bee",
          "0x6a8698facdbed4b6659ad745fd4eb434bc129cecaffad99c3f08f4d688b1df02",
          "0xeb1269ed5c9a4945c0725be8b986212057a19bf9127c8252949270a3e1996f1a",
          "0xf4792b8be1496300e500d7a702b4ae2824c14d5f438604fdfe94388867c7c9c5",
          "0x64c6a2e4cea7d4784d12677704549df5bb8b27ebeabe41891781b9a641430848",
          "0x45bda137a2426603437ad1e393bfc93855c84c9eb116299640f842ae15beb46a",
          "0x77374a47adc133e93d9661b8ce8e672a343cd5a2b2a079034de69211a0ab0893",
        ],
        "transactionsRoot": "0x17429d391ba2a1d033a60a9bdb2899a1c06e25747fcb4c9bc8476c3c72cc357a",
        "uncles": [],
        "withdrawals": [
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b7ed9",
            "index": "0x2a5128b",
            "validatorIndex": "0x4e940",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b37eb",
            "index": "0x2a5128c",
            "validatorIndex": "0x4e941",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x1c7ee99",
            "index": "0x2a5128d",
            "validatorIndex": "0x4e942",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11aab91",
            "index": "0x2a5128e",
            "validatorIndex": "0x4e943",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11a6e72",
            "index": "0x2a5128f",
            "validatorIndex": "0x4e944",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b2baf",
            "index": "0x2a51290",
            "validatorIndex": "0x4e945",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11bd042",
            "index": "0x2a51291",
            "validatorIndex": "0x4e946",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11a9593",
            "index": "0x2a51292",
            "validatorIndex": "0x4e947",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11ad611",
            "index": "0x2a51293",
            "validatorIndex": "0x4e948",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b8446",
            "index": "0x2a51294",
            "validatorIndex": "0x4e949",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x119349e",
            "index": "0x2a51295",
            "validatorIndex": "0x4e94a",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11ad839",
            "index": "0x2a51296",
            "validatorIndex": "0x4e94b",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11a9715",
            "index": "0x2a51297",
            "validatorIndex": "0x4e94c",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b820b",
            "index": "0x2a51298",
            "validatorIndex": "0x4e94d",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11aad2b",
            "index": "0x2a51299",
            "validatorIndex": "0x4e94e",
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": "0x11b090a",
            "index": "0x2a5129a",
            "validatorIndex": "0x4e94f",
          },
        ],
        "withdrawalsRoot": "0x158cc8e8a444e3f70658da20714882c73b2c8932eb09b691271da474471d137b",
      }
    `)
  })

  test('args: includeTransactions', async () => {
    const block = await getBlock(client, {
      blockNumber: anvilMainnet.forkBlockNumber,
      includeTransactions: true,
    })
    expect(typeof block.transactions[0] === 'object').toBe(true)
  })
})

test('non-existent block: throws if block number does not exist', async () => {
  await expect(
    getBlock(client, {
      blockNumber: 69420694206942n,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [BlockNotFoundError: Block at number "69420694206942" could not be found.

    Version: viem@x.y.z]
  `)
})

test('non-existent block: throws if block hash does not exist', async () => {
  await expect(
    getBlock(client, {
      blockHash:
        '0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722',
    }),
  ).rejects.toMatchInlineSnapshot(`
    [BlockNotFoundError: Block at hash "0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722" could not be found.

    Version: viem@x.y.z]
  `)
})
