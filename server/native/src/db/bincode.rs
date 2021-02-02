//! This module contains serialize and deserialize functions with custom
//! configurations.

#[inline(always)]
pub fn serialize<S: ?Sized + serde::Serialize>(t: &S) -> Vec<u8> {
    bincode::serialize(t).unwrap()
}

#[inline(always)]
pub fn deserialize<T: serde::de::DeserializeOwned>(bytes: &[u8]) -> T {
    bincode::deserialize(bytes).unwrap()
}
