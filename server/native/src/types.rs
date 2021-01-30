use crate::utils::{clock::Timestamp, hash::*};
use serde::{Deserialize, Serialize};

/// A random 20-byte sequence that is exposed to the public and used by users in their
/// requests.
pub type APIKeyIdentifier = Hash20;

//// UUID for each user registered in the website.
pub type UserID = Hash16;

#[derive(Debug, Serialize, Deserialize)]
pub struct APIKeyDetail {
    pub is_enabled: bool,
    pub owner: UserID,
    pub name: String,
    pub created: Timestamp,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserDetail {
    pub uid: UserID,
    pub password: Hash20,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum MetricKey {
    Minute(APIKeyIdentifier, Timestamp),
    Hour(APIKeyIdentifier, Timestamp),
    Day(APIKeyIdentifier, Timestamp),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Metric {
    pub req_count: u64,
    pub bandwidth_usage: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogKey {
    pub api_key: APIKeyIdentifier,
    pub time_frame: Timestamp,
}

/// Any event that we log for each API-Key.
#[derive(Debug, Serialize, Deserialize)]
pub enum LogEvent {
    Created { time: Timestamp },
    Disabled { time: Timestamp },
    Enabled { time: Timestamp },
    ProxyReq { time: Timestamp, endpoint: String },
}
