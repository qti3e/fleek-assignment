use super::bincode::*;
use super::{iterator::*, DB};
use crate::db_schema;
use crate::types::*;

db_schema!((DbKey, DbWriteKey, DbReadKey) {
    /// Store the history of a repository.
    cf LOG(Log:LogKey) -> Vec<LogEvent> {},
    /// Store the usage metrics for each API-Key.
    cf METRICS(Metrics:MetricKey) -> Metric {},
    /// Map each username into the ID of the user who own the username.
    cf USERS(Username:String) -> UserDetail {},
    /// A set of tuples in the form `(UserID, APIKey)` so we can lookup all the API-keys
    /// owned by a user by a prefix lookup.
    cf USER_API_KEYS(UserAPIKeys:(UserID, APIKeyIdentifier)) -> () {},
    /// Map each API-key to the information regarding that key.
    cf API_KEYS(APIKey:APIKeyIdentifier) -> APIKeyDetail {
        /// The first member of APIKeyDetail is a `boolean` called `is_enabled`, this
        /// shorthand can be used to just lookup that first field of data and avoid
        /// deserializing any further fields if we only wish to know the status of
        /// an API-key.
        IsEnabled -> bool;
    }
});
