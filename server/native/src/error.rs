use rocksdb;
use std::error;
use std::fmt;

#[derive(Debug)]
pub enum Error {
    DBError(rocksdb::Error),
    AcquireWriteLock,
    AcquireReadLock,
    AcquireLock,
    APIKeyNotFound,
    AccessDenied,
}

impl error::Error for Error {
    fn cause(&self) -> Option<&dyn error::Error> {
        match self {
            Error::DBError(e) => Some(e),
            _ => None,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::DBError(e) => write!(f, "RocksDB: {}", e),
            Error::AcquireWriteLock => write!(f, "Could not acquire the write lock."),
            Error::AcquireReadLock => write!(f, "Could not acquire the read lock."),
            Error::AcquireLock => write!(f, "Could not acquire a lock."),
            Error::APIKeyNotFound => write!(f, "API key not found."),
            Error::AccessDenied => {
                write!(f, "You don't have the permission to perform the action.")
            }
        }
    }
}

pub type Result<T> = std::result::Result<T, Error>;
