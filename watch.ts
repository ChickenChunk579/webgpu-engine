const command = new Deno.Command("deno", {
    args: [
        "run",
        "-A",
        "--unstable-webgpu",
        "./src/main-desktop.ts"
    ],
});

let proc = command.spawn();

console.log("Watching...")

const watcher = Deno.watchFs("./src");
for await (const event of watcher) {
    console.log("Updating...")
    proc.kill();
    proc = command.spawn();
}