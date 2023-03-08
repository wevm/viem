mod js_bindings;

use ethers::{
    prelude::{
        k256::{ecdsa::SigningKey, elliptic_curve::sec1::ToEncodedPoint, PublicKey},
        rand::thread_rng,
    },
    signers::{coins_bip39::English, LocalWallet, MnemonicBuilder, Signer, Wallet},
    types::{
        transaction::{eip2718::TypedTransaction, eip712::TypedData},
        Address,
    },
    utils::{hash_message, keccak256},
};
use hex::ToHex;
use js_bindings::{JsTransaction, JsTypedData, JsFromMnemonicOptions};
use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Account {
    wallet: LocalWallet,
}

#[wasm_bindgen]
impl Account {
    #[wasm_bindgen(js_name = getAddress)]
    pub fn get_address(&self) -> String {
        let verifying_key = self.wallet.signer().verifying_key();
        let public_key = PublicKey::from(&verifying_key)
            .to_encoded_point(false)
            .to_bytes();
        let hash = keccak256(&public_key[1..]);
        let address = format!(
            "0x{}",
            Address::from_slice(&hash[12..]).encode_hex::<String>()
        );

        address
    }

    #[wasm_bindgen(js_name = signMessage)]
    pub fn sign_message(&self, message: &str) -> String {
        let hash = hash_message(message);
        let sig = self.wallet.sign_hash(hash);
        let hex = format!("0x{}", sig.to_string());

        hex
    }

    #[wasm_bindgen(js_name = signTransaction)]
    pub fn sign_transaction(&self, transaction: JsTransaction) -> String {
        let js_transaction: JsValue = transaction.into();
        let transaction: TypedTransaction = serde_wasm_bindgen::from_value(js_transaction).unwrap();
        let sig = self.wallet.sign_transaction_sync(&transaction);
        let rlp = transaction.rlp_signed(&sig);
        let hex = format!("0x{}", rlp.encode_hex::<String>());

        hex
    }

    #[wasm_bindgen(js_name = signTypedData)]
    pub async fn sign_typed_data(&self, typed_data: JsTypedData) -> String {
        let js_typed_data: JsValue = typed_data.into();
        let typed_data: TypedData = serde_wasm_bindgen::from_value(js_typed_data).unwrap();
        let sig = self.wallet.sign_typed_data(&typed_data).await.unwrap();
        let hex = format!("0x{}", sig.to_string());

        hex
    }
}

#[derive(Serialize, Deserialize)]
pub struct MnemonicOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    index: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    password: Option<String>,
}

#[wasm_bindgen]
impl Account {
    #[wasm_bindgen(js_name = generateRandom)]
    pub fn generate_random() -> Result<Account, JsValue> {
        let wallet = LocalWallet::new(&mut thread_rng());

        Ok(Account { wallet })
    }

    #[wasm_bindgen(js_name = fromPrivateKey)]
    pub fn from_private_key(private_key: &str) -> Result<Account, JsValue> {
        let wallet: Wallet<SigningKey> = private_key.parse().unwrap();

        Ok(Account { wallet })
    }

    #[wasm_bindgen(js_name = fromMnemonic)]
    pub fn from_mnemonic(mnemonic: &str, opts: Option<JsFromMnemonicOptions>) -> Result<Account, JsValue> {
        let mut builder = MnemonicBuilder::<English>::default()
            .phrase(mnemonic);

        if let Some(options) = opts {
            let js_options: JsValue = options.into();
            let options: MnemonicOptions = serde_wasm_bindgen::from_value(js_options).unwrap();
            if let Some(index) = options.index {
                builder = builder.index(index).unwrap();
            }
            if let Some(password) = options.password {
                builder = builder.password(password.as_str());
            }
        }
        
        let wallet = builder.build().unwrap();
        Ok(Account { wallet })
    }
}
