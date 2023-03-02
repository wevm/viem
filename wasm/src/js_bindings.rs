use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TRANSACTION: &'static str = r#"
type Legacy = {
    from: string;
    to: string;
    gas: string;
    gasPrice: string;
    // TODO
}

type EIP1559 = {
    from: string;
    to: string;
    gas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    // TODO
}

type EIP2930 = {
    from: string;
    to: string;
    gas: string;
    gasPrice: string;
    // TODO
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