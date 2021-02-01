use neon::prelude::*;
use rand;
use serde::{Deserialize, Serialize};
use sha1::{Digest, Sha1};

pub mod db;
pub mod error;
pub mod types;
pub mod utils;

use db::keys::DbKey;
use db::{keys, DB};
use utils::clock;
use utils::hash::*;

// TODO(qti3e) This is just a prototype, we should separate binding from implementation.
// and yes the code does look ugly because `cargo fmt` is not able to handle macros.

// TODO(qti3e) we can use panic! to throw JS errors. (so calling .unwrap() is ok)

#[inline(always)]
fn hash_password(password: &String) -> Hash20 {
    let mut hasher = Sha1::new();
    hasher.update(password);
    let slice: [u8; 20] = hasher.finalize().into();
    Hash20::from(slice)
}

#[inline(always)]
fn log_key(api_key: types::APIKeyIdentifier) -> types::LogKey {
    types::LogKey {
        api_key,
        time_frame: clock::one_day_frame(),
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct APIKey {
    pub key: types::APIKeyIdentifier,
    pub is_enabled: bool,
    pub name: String,
}

// see index.d.ts for documentation.
declare_types! {
    pub class JsDB for DB {
        init(mut cx) {
            let path: String = cx.argument::<JsString>(0)?.value();
            Ok(DB::open(&path))
        }

        method isAPIKeyEnabled(mut cx) {
            let key: String = cx.argument::<JsString>(0)?.value();
            let key = match key.parse::<types::APIKeyIdentifier>() {
                Ok(t) => t,
                _ => return Ok(cx.boolean(false).upcast())
            };

            let ret = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);
                match db.get(keys::IsEnabled(&key)) {
                    Ok(Some(true)) => true,
                    _ => false
                }
            };

            Ok(cx.boolean(ret).upcast())
        }

        method createNewUser(mut cx) {
            let username: String = cx.argument::<JsString>(0)?.value();
            let password: String = cx.argument::<JsString>(1)?.value();

            let ret = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);
                if let Ok(None) = db.get(keys::UsernameExists(&username)) {
                    // TODO(qti3e) Handle UUID conflict.
                    let uid = rand::random::<types::UserID>();
                    let uid_str = String::from(&uid);
                    let detail = types::UserDetail {
                        uid,
                        password: hash_password(&password)
                    };
                    let mut batch = db.batch();
                    batch.put(keys::Username(&username), &detail);
                    if batch.write().is_ok() {
                        Some(uid_str)
                    } else {
                        None
                    }
                } else {
                    None
                }
            };

            match ret {
                Some(uid) => Ok(cx.string(&uid).upcast()),
                None => Ok(cx.null().upcast())
            }
        }

        method auth(mut cx) {
            let username: String = cx.argument::<JsString>(0)?.value();
            let password: String = cx.argument::<JsString>(1)?.value();

            let ret = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);
                if let Ok(Some(detail)) = db.get(keys::Username(&username)) {
                    if detail.password == hash_password(&password) {
                        Some(String::from(&detail.uid))
                    } else {
                        None
                    }
                } else {
                    None
                }
            };

            match ret {
                Some(uid) => Ok(cx.string(&uid).upcast()),
                None => Ok(cx.null().upcast())
            }
        }

        method queryUserAPIKeys(mut cx) {
            let uid: String = cx.argument::<JsString>(0)?.value();
            let uid = match uid.parse::<types::UserID>() {
                Ok(t) => t,
                _ => return Ok(cx.null().upcast())
            };

            let ret: Vec<APIKey> = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);
                let mut vec: Vec<APIKey> = Vec::new();

                for (_, api) in keys::UserAPIKeys::key_iterator(&db, &uid) {
                    if let Ok(Some(detail)) = db.get(keys::APIKey(&api)) {
                        vec.push(APIKey {
                            key: api,
                            is_enabled: detail.is_enabled,
                            name: detail.name
                        })
                    }
                }

                vec
            };

            let js_array = JsArray::new(&mut cx, ret.len() as u32);
            for (i, obj) in ret.iter().enumerate() {
                let js_object = {
                    let js_object = JsObject::new(&mut cx);

                    let js_key = cx.string(&String::from(&obj.key));
                    js_object.set(&mut cx, "key", js_key)?;

                    let js_is_enabled = cx.boolean(obj.is_enabled);
                    js_object.set(&mut cx, "is_enabled", js_is_enabled)?;

                    let js_name = cx.string(&obj.name);
                    js_object.set(&mut cx, "name", js_name)?;

                    js_object
                };

                js_array.set(&mut cx, i as u32, js_object).unwrap();
            }

            Ok(js_array.upcast())
        }

        method createNewAPIKey(mut cx) {
            let uid: String = cx.argument::<JsString>(0)?.value();
            let name: String = cx.argument::<JsString>(1)?.value();
            let uid = match uid.parse::<types::UserID>() {
                Ok(t) => t,
                _ => return Ok(cx.null().upcast())
            };

            let ret = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);

                let key = rand::random::<types::APIKeyIdentifier>();
                let key_str = String::from(&key);

                let mut batch = db.batch();
                batch.put(keys::UserAPIKeys(&(uid, key)), &());
                batch.put(keys::APIKey(&key), &types::APIKeyDetail {
                    is_enabled: true,
                    owner: uid,
                    name,
                    created: clock::now()
                });
                batch.push(keys::Log(&log_key(key)), &types::LogEvent::Created {
                    time: clock::now(),
                });

                if batch.write().is_ok() {
                    Some(key_str)
                } else {
                    None
                }
            };

            match ret {
                Some(key) => Ok(cx.string(&key).upcast()),
                None => Ok(cx.null().upcast())
            }
        }

        method setStatus(mut cx) {
            let key: String = cx.argument::<JsString>(0)?.value();
            let uid: String = cx.argument::<JsString>(1)?.value();
            let is_enabled: bool = cx.argument::<JsBoolean>(2)?.value();

            let key = match key.parse::<types::APIKeyIdentifier>() {
                Ok(t) => t,
                _ => return Ok(cx.boolean(false).upcast())
            };

            let uid = match uid.parse::<types::UserID>() {
                Ok(t) => t,
                _ => return Ok(cx.boolean(false).upcast())
            };

            let cb = |db: neon::borrow::Ref<&mut DB>| -> error::Result<()> {
                let mut detail = db.get(keys::APIKey(&key))?.ok_or(error::Error::APIKeyNotFound)?;

                if detail.owner != uid {
                    return Err(error::Error::AccessDenied);
                }

                if detail.is_enabled == is_enabled {
                    return Ok(());
                }

                detail.is_enabled = is_enabled;

                // Write the data and log the event.
                let mut batch = db.batch();
                batch.put(keys::APIKey(&key), &detail);
                let ev = if is_enabled {
                    types::LogEvent::Enabled { time: clock::now() }
                } else {
                    types::LogEvent::Disabled { time: clock::now() }
                };
                batch.push(keys::Log(&log_key(key)), &ev);
                batch.write()
            };

            let ret = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);
                cb(db).is_ok()
            };

            Ok(cx.boolean(ret).upcast())
        }

        method logRequest(mut cx) {
            let key: String = cx.argument::<JsString>(0)?.value();
            let endpoint: String = cx.argument::<JsString>(1)?.value();
            let bytes_transferred: u64 = cx.argument::<JsNumber>(3)?.value() as u64;

            let key = match key.parse::<types::APIKeyIdentifier>() {
                Ok(t) => t,
                _ => return Ok(cx.boolean(false).upcast())
            };

            let cb = |db: neon::borrow::Ref<&mut DB>| -> error::Result<()> {
                let mut batch = db.batch();
                batch.push(keys::Log(&log_key(key)), &types::LogEvent::ProxyReq {
                    time: clock::now(),
                    endpoint
                });
                batch.merge(keys::Metrics(&types::MetricKey::Minute(key, clock::one_minute_frame())), &types::Metric {
                    req_count: 1,
                    bytes_transferred
                });
                batch.merge(keys::Metrics(&types::MetricKey::Hour(key, clock::one_hour_frame())), &types::Metric {
                    req_count: 1,
                    bytes_transferred
                });
                batch.merge(keys::Metrics(&types::MetricKey::Day(key, clock::one_day_frame())), &types::Metric {
                    req_count: 1,
                    bytes_transferred
                });
                batch.write()
            };

            let ret = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);
                cb(db).is_ok()
            };

            Ok(cx.boolean(ret).upcast())
        }

        method getLog(mut cx) {
            let key: String = cx.argument::<JsString>(0)?.value();
            let uid: String = cx.argument::<JsString>(1)?.value();

            let key = match key.parse::<types::APIKeyIdentifier>() {
                Ok(t) => t,
                _ => return Ok(cx.null().upcast())
            };

            let uid = match uid.parse::<types::UserID>() {
                Ok(t) => t,
                _ => return Ok(cx.null().upcast())
            };

            let cb = |db: neon::borrow::Ref<&mut DB>| -> error::Result<Vec<types::LogEvent>> {
                let detail = db.get(keys::APIKey(&key))?.ok_or(error::Error::APIKeyNotFound)?;
                if detail.owner != uid {
                    return Err(error::Error::AccessDenied);
                }

                Ok(db.get(keys::Log(&log_key(key)))?.unwrap_or_default())
            };

            let ret = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);
                match cb(db) {
                    Ok(log) => log,
                    _ => return Ok(cx.null().upcast())
                }
            };

            let js_array = JsArray::new(&mut cx, ret.len() as u32);
            for (i, ev) in ret.iter().enumerate() {
                let js_object = {
                    let js_object = JsObject::new(&mut cx);
                    match ev {
                        types::LogEvent::Created {time} => {
                            let js_kind = cx.string("created");
                            js_object.set(&mut cx, "kind", js_kind)?;
                            let js_time = cx.number(*time as f64);
                            js_object.set(&mut cx, "time", js_time)?;
                        },
                        types::LogEvent::Enabled {time} => {
                            let js_kind = cx.string("enabled");
                            js_object.set(&mut cx, "kind", js_kind)?;
                            let js_time = cx.number(*time as f64);
                            js_object.set(&mut cx, "time", js_time)?;
                        },
                        types::LogEvent::Disabled {time} => {
                            let js_kind = cx.string("disabled");
                            js_object.set(&mut cx, "kind", js_kind)?;
                            let js_time = cx.number(*time as f64);
                            js_object.set(&mut cx, "time", js_time)?;
                        },
                        types::LogEvent::ProxyReq {time, endpoint} => {
                            let js_kind = cx.string("req");
                            js_object.set(&mut cx, "kind", js_kind)?;
                            let js_time = cx.number(*time as f64);
                            js_object.set(&mut cx, "time", js_time)?;
                            let js_endpoint = cx.string(endpoint);
                            js_object.set(&mut cx, "endpoint", js_endpoint)?;
                        },
                    }
                    js_object
                };

                js_array.set(&mut cx, i as u32, js_object).unwrap();
            }

            Ok(js_array.upcast())
        }

        method getMetricsSnapshot(mut cx) {
            let key: String = cx.argument::<JsString>(0)?.value();
            let uid: String = cx.argument::<JsString>(1)?.value();

            let key = match key.parse::<types::APIKeyIdentifier>() {
                Ok(t) => t,
                _ => return Ok(cx.null().upcast())
            };

            let uid = match uid.parse::<types::UserID>() {
                Ok(t) => t,
                _ => return Ok(cx.null().upcast())
            };

            let cb = |db: neon::borrow::Ref<&mut DB>| -> error::Result<(types::Metric, types::Metric, types::Metric)> {
                let detail = db.get(keys::APIKey(&key))?.ok_or(error::Error::APIKeyNotFound)?;
                if detail.owner != uid {
                    return Err(error::Error::AccessDenied);
                }

                let min = db.get(keys::Metrics(&types::MetricKey::Minute(key, clock::one_minute_frame())))?.unwrap_or_default();
                let hour = db.get(keys::Metrics(&types::MetricKey::Hour(key, clock::one_hour_frame())))?.unwrap_or_default();
                let day = db.get(keys::Metrics(&types::MetricKey::Day(key, clock::one_day_frame())))?.unwrap_or_default();

                Ok((min, hour, day))
            };

            let ret = {
                let this = cx.this();
                let guard = cx.lock();
                let db = this.borrow(&guard);
                match cb(db) {
                    Ok(log) => {
                        vec![log.0, log.1, log.2]
                    },
                    _ => return Ok(cx.null().upcast())
                }
            };

            let js_array = JsArray::new(&mut cx, ret.len() as u32);
            for (i, metric) in ret.iter().enumerate() {
                let js_object = {
                    let js_object = JsObject::new(&mut cx);
                    let js_req_count = cx.number(metric.req_count as f64);
                    js_object.set(&mut cx, "req_count", js_req_count)?;
                    let js_bytes_transferred = cx.number(metric.bytes_transferred as f64);
                    js_object.set(&mut cx, "bytes_transferred", js_bytes_transferred)?;
                    js_object
                };
                js_array.set(&mut cx, i as u32, js_object).unwrap();
            }

            Ok(js_array.upcast())
        }
    }
}

register_module!(mut cx, { cx.export_class::<JsDB>("DB") });
