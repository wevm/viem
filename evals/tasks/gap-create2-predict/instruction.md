Our release pipeline publishes the same contract to many chains and must know
the contract's address before the deployment transaction is ever sent.

Implement `deployDeterministic` in `src/index.ts`. It receives a Viem client
bound to the funded deployment account first and an options object containing
a contract's creation bytecode and 32-byte salt. It must:

1. Compute locally (before sending anything) the CREATE2 address the contract
   will live at when deployed through the deterministic deployer contract at
   `0x4e59b44847b379578588920ca78fbf26c0b4956c`. That deployer creates the
   contract with the CREATE2 opcode, so the resulting address depends on the
   deployer's own address, the salt, and the creation bytecode.
2. Deploy through the deployer: send it a transaction whose calldata is the
   32-byte salt immediately followed by the creation bytecode, funded by the
   client account whose private key is
   `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`, and
   wait until it is included.
3. Confirm the contract's code exists on chain, then return
   `{ predicted, deployed }`: `predicted` is the locally computed address and
   `deployed` is the address the code actually lives at.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
