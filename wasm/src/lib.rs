mod js_bindings;

use ethers::{
    prelude::{
        k256::{ecdsa::SigningKey, elliptic_curve::sec1::ToEncodedPoint, PublicKey},
        rand::thread_rng,
    },
    signers::{LocalWallet, Wallet},
    types::{transaction::eip2718::TypedTransaction, Address},
    utils::{hash_message, keccak256},
};
use hex::ToHex;
use js_bindings::JsTransaction;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Account {
    wallet: LocalWallet,
}

#[wasm_bindgen]
impl Account {
    pub fn getAddress(&self) -> String {
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

    pub fn signMessage(&self, message: &str) -> String {
        let hash = hash_message(message);
        let sig = self.wallet.sign_hash(hash);
        let hex = format!("0x{}", sig.to_string());

        hex
    }

    pub fn signTransaction(&self, transaction: JsTransaction) -> String {
        let js_transaction: JsValue = transaction.into();
        let transaction: TypedTransaction = serde_wasm_bindgen::from_value(js_transaction).unwrap();
        let sig = self.wallet.sign_transaction_sync(&transaction);
        let hex = format!("0x{}", sig.to_string());

        hex
    }
}

#[wasm_bindgen]
impl Account {
    pub fn generateRandom() -> Result<Account, JsValue> {
        let wallet = LocalWallet::new(&mut thread_rng());

        Ok(Account { wallet })
    }

    pub fn fromPrivateKey(private_key: &str) -> Result<Account, JsValue> {
        let wallet: Wallet<SigningKey> = private_key.parse().unwrap();

        Ok(Account { wallet })
    }
}
