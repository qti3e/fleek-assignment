use neon::prelude::*;

pub mod db;
pub mod error;
pub mod types;
pub mod utils;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

register_module!(mut cx, { cx.export_function("hello", hello) });
