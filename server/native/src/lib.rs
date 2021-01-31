use neon::prelude::*;
use serde_json::from_str;
use rand;

pub mod db;
pub mod error;
pub mod types;
pub mod utils;

use db::{DB, keys};

// see index.d.ts for documentation.
declare_types! {
    pub class JsDB for DB {
        init(mut cx) {
            let path: String = cx.argument::<JsString>(0)?.value();
            Ok(DB::open(&path))
        }

        method isAPIKeyEnabled(mut cx) {
            let key: String = cx.argument::<JsString>(0)?.value();
            let key = match from_str::<types::APIKeyIdentifier>(&key) {
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
            let uid = rand::random::<types::UserID>();

            Ok(cx.string(&String::from(&uid)).upcast())
        }
    }
}

register_module!(mut cx, {
    cx.export_class::<JsDB>("DB")
});
