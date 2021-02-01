//! This module contains serialize and deserialize functions with custom
//! configurations.

use bincode::Options;

#[inline(always)]
pub fn serialize<S: ?Sized + serde::Serialize>(t: &S) -> Vec<u8> {
    bincode::DefaultOptions::new().serialize(t).unwrap()
}

#[inline(always)]
pub fn deserialize<T: serde::de::DeserializeOwned>(bytes: &[u8]) -> T {
    bincode::DefaultOptions::new().deserialize_from(bytes).unwrap()
}
