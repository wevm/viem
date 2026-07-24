#!/bin/bash
cd /app
mkdir -p /logs/verifier

build=0
types=0
runtime=0
idioms=1

if npm run build >/logs/verifier/build.log 2>&1; then build=1; fi

mkdir -p /app/__eval__
cp /tests/EVAL.ts /app/__eval__/index.test.ts
cat >/app/__eval__/shims.d.ts <<'EOF'
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: string): string
  export function readdirSync(
    path: string,
    options: { recursive: true },
  ): string[]
}

declare const Buffer: {
  from(value: string, encoding: string): {
    toString(encoding: string): string
  }
}

declare module 'node:http' {
  type Response = {
    end(value: string): void
    writeHead(status: number, headers: Record<string, string>): void
  }

  type Server = {
    address(): { port: number } | string | null
    close(): void
    listen(port: number, host: string, callback: () => void): void
  }

  export function createServer(
    handler: (
      request: AsyncIterable<string>,
      response: Response,
    ) => Promise<void> | void,
  ): Server
}
EOF
cat >/app/__eval__/tsconfig.json <<'EOF'
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true
  },
  "include": ["../src", "./index.test.ts", "./shims.d.ts"]
}
EOF
if npx tsc -p /app/__eval__/tsconfig.json >/logs/verifier/types.log 2>&1; then types=1; fi
if npx vitest run __eval__/index.test.ts >/logs/verifier/vitest.log 2>&1; then runtime=1; fi

deny="createPublicClient|createWalletClient|createTestClient|from ['\"]viem/(actions|accounts|account-abstraction|experimental|ens|siwe|nonce)|(^|[^.[:alnum:]_])parseEther\(|(^|[^.[:alnum:]_])formatEther\(|getContract\(|readContract|writeContract|waitForTransactionReceipt|privateKeyToAccount|\.getBlockNumber\(|rpcUrls\.default|from ['\"]ox(/[^'\"]*)?['\"]"
if grep -rE "$deny" src/ >/logs/verifier/idioms.log 2>&1; then idioms=0; fi

reward=0
if [ "$build" = "1" ] && [ "$types" = "1" ] && [ "$runtime" = "1" ]; then reward=1; fi

echo "build=$build types=$types runtime=$runtime v3_idioms=$idioms reward=$reward"
cat >/logs/verifier/reward.json <<EOF
{"reward": $reward, "build": $build, "types": $types, "runtime": $runtime, "v3_idioms": $idioms}
EOF
