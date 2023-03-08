use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TRANSACTION: &'static str = r#"
type Address = `0x${string}`;
type Hex = `0x${string}`;
type AccessList = { address: Address; storageKeys: Hex[] }[]

type LegacyTransaction = {
    from?: Address;
    to?: Address;
    gas?: Hex;
    gasPrice?: Hex;
    value?: Hex;
    data?: Hex;
    nonce?: Hex;
    chainId?: Hex;
}

type EIP1559Transaction = Legacy & {
    accessList?: AccessList;
}

type EIP2930Transaction = {
    from?: Address;
    to?: Address;
    gas?: Hex;
    value?: Hex;
    data?: Hex;
    nonce?: Hex;
    accessList?: AccessList;
    maxPriorityFeePerGas?: Hex;
    maxFeePerGas?: Hex;
    chainId?: Hex;
}

// TODO: Use types from src/types/transaction.ts
type Transaction = LegacyTransaction | EIP1559Transaction | EIP2930Transaction;

// TODO: Use types from src/types/typedData.ts
type TypedData = {
    types: Record<string, Record<string, { name: string; type: string }[]>>;
    domain: {
        name?: string;
        version?: string;
        chainId?: number;
        verifyingContract?: string;
        salt?: string;
    };
    primaryType: string;
    message: Record<string, unknown>;
};

type FromMnemonicOptions = {
    index?: number,
    password?: string,
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(typescript_type = "Transaction")]
    pub type JsTransaction;

    #[wasm_bindgen(typescript_type = "TypedData")]
    pub type JsTypedData;

    #[wasm_bindgen(typescript_type = "FromMnemonicOptions")]
    pub type JsFromMnemonicOptions;
}

#[wasm_bindgen]
pub fn console_log(s: &str) {
    log(s);
}
