#!/bin/sh
set -e

anvil --host 127.0.0.1 --fork-url "$FORK_URL" --fork-block-number "$FORK_BLOCK" &
pid=$!

for _ in $(seq 1 60); do
  cast block-number --rpc-url http://127.0.0.1:8545 >/dev/null 2>&1 && break
  sleep 1
done

rpc=http://127.0.0.1:8545
usdc=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
usde=0x4c9EDD5852cd905f086C759E8383e09bff1E68B3
weth=0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2
wethUsdc500=0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640
wethUsdc3000=0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8
multicall3=0xcA11bde05977b3631167028862bE2a173976CA11
create2Deployer=0x4e59b44847b379578588920ca78fbf26c0b4956c
ensUniversalResolver=0xeeeeeeee14d718c2b47d9923deab1335e144eeee
whale=0x28C6c06298d514Db089934071355E5743bf21d60
dev0=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
dev1=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
dev2=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
dev3=0x90F79bf6EB2c4f870365E785982E1f101E93b906

cast block latest --rpc-url $rpc >/dev/null

# USDC state graders touch: metadata, supply, balances, allowance, domain,
# and the transfer path from the whale (paused flag + blacklist slots).
cast call $usdc 'name()(string)' --rpc-url $rpc >/dev/null
cast call $usdc 'symbol()(string)' --rpc-url $rpc >/dev/null
cast call $usdc 'decimals()(uint8)' --rpc-url $rpc >/dev/null
cast call $usdc 'totalSupply()(uint256)' --rpc-url $rpc >/dev/null
cast call $usdc 'eip712Domain()' --rpc-url $rpc >/dev/null 2>&1 || true
cast call $usdc "balanceOf(address)(uint256)" $whale --rpc-url $rpc >/dev/null
cast call $usdc "allowance(address,address)(uint256)" $dev1 $dev2 --rpc-url $rpc >/dev/null
cast call $usdc "transfer(address,uint256)(bool)" $dev1 1000000 --from $whale --rpc-url $rpc >/dev/null
cast rpc eth_getProof $usdc '["0x0000000000000000000000000000000000000000000000000000000000000000"]' latest --rpc-url $rpc >/dev/null

# Other contracts graders read.
cast call $usde 'eip712Domain()' --rpc-url $rpc >/dev/null 2>&1 || true
cast balance $weth --rpc-url $rpc >/dev/null
cast call $weth "balanceOf(address)(uint256)" $whale --rpc-url $rpc >/dev/null
cast code $multicall3 --rpc-url $rpc >/dev/null
cast code $create2Deployer --rpc-url $rpc >/dev/null
cast code $ensUniversalResolver --rpc-url $rpc >/dev/null

# Uniswap V3 pool state graders read.
for pool in $wethUsdc500 $wethUsdc3000; do
  cast call $pool 'feeGrowthGlobal0X128()(uint256)' --rpc-url $rpc >/dev/null
  cast call $pool 'liquidity()(uint128)' --rpc-url $rpc >/dev/null
  cast call $pool 'slot0()' --rpc-url $rpc >/dev/null
done

# ENS resolution both ways (warms registry + vitalik.eth resolver records).
cast resolve-name vitalik.eth --rpc-url $rpc >/dev/null 2>&1 || true
cast lookup-address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --rpc-url $rpc >/dev/null 2>&1 || true

# Accounts graders probe (whale, dev accounts, history-free EOAs).
for account in \
  $whale $dev0 $dev1 $dev2 $dev3 \
  0x4242424242424242424242424242424242424242 \
  0x1111000000000000000000000000000000001111 \
  0x09E993fd7D5A600eF78722F4bFb092ea9Af70e8E \
  0xa75ecd00106901c1c37447b2cd889326be03822b \
  0x701dc6864212b700915dd281d9ee0035ce358c04 \
  0xFE4EacD82FD985357229cB97e036DD2FcD921eCA \
  0x41366dc93bfe63fbe8c8df63c88384cc658d4a1c \
  0xeed6529f4c53348fa8f7afaf46d3c2bb1b934998 \
  0x51ab7042d3cbeff0e5c25671e419b1682d29d757 \
  0xc0ffee254729296a45a3885639ac7e10f9d54979 \
  0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045; do
  cast balance "$account" --rpc-url $rpc >/dev/null
  cast nonce "$account" --rpc-url $rpc >/dev/null
  cast code "$account" --rpc-url $rpc >/dev/null
  cast storage "$account" 0 --rpc-url $rpc >/dev/null 2>&1 || true
done

kill $pid
