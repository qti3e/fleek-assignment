use std::time::{SystemTime, UNIX_EPOCH};

pub type Timestamp = u128;

/// Return the current unix timestamp.
#[inline]
pub fn now() -> Timestamp {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    duration.as_millis()
}

#[inline]
pub fn one_minute_frame() -> u64 {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let sec = duration.as_secs();
    sec / 60
}

#[inline]
pub fn one_hour_frame() -> u64 {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let sec = duration.as_secs();
    sec / 3600
}

#[inline]
pub fn one_day_frame() -> u64 {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let sec = duration.as_secs();
    sec / (3600 * 24)
}
