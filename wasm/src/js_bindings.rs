use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TRANSACTION: &'static str = r#"
type Address = `0x${string}`;
type Hex = `0x${string}`;
type AccessList = Array<{ address: Address; storageKeys: Array<Hex> }>

type Legacy = {
    from?: Address;
    to?: Address;
    gas?: Hex;
    gasPrice?: Hex;
    value?: Hex;
    data?: Hex;
    nonce?: Hex;
    chainId?: Hex;
}

type EIP1559 = Legacy & {
    accessList?: AccessList;
}

type EIP2930 = {
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

type Transaction = Legacy | EIP1559 | EIP2930;
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(typescript_type = "Transaction")]
    pub type JsTransaction;
}

#[wasm_bindgen]
pub fn console_log(s: &str) {
    log(s);
}