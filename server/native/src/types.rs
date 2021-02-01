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
    Minute(APIKeyIdentifier, u64),
    Hour(APIKeyIdentifier, u64),
    Day(APIKeyIdentifier, u64),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Metric {
    pub req_count: u64,
    pub bytes_transferred: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogKey {
    pub api_key: APIKeyIdentifier,
    /// One day time frame which is `floor(now(sec) / (3600 * 24))`
    pub time_frame: u64,
}

/// Any event that we log for each API-Key.
#[derive(Debug, Serialize, Deserialize)]
pub enum LogEvent {
    Created { time: Timestamp },
    Disabled { time: Timestamp },
    Enabled { time: Timestamp },
    ProxyReq { time: Timestamp, endpoint: String },
}

impl Default for Metric {
    #[inline(always)]
    fn default() -> Self {
        Metric {
            req_count: 0,
            bytes_transferred: 0,
        }
    }
}
