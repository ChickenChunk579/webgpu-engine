import Platform from "./platform-desktop.ts"

import run from "./main.ts";

alert("Waiting for renderdoc... [PID: " + Deno.pid + "]")
// deno-lint-ignore no-explicit-any
run(Platform as any);