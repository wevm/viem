use std::str::FromStr;

use ethers::types::Address;
use serde::Deserialize;

pub fn deserialize_stringified_address<'de, D>(deserializer: D) -> Result<Address, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    let address = Address::from_str(&s).unwrap();
    Ok(address)
}