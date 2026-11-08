import { hashAdminPassword } from "../../lib/blog/admin/password.ts";

async function passwordFromTerminal(): Promise<string> {
  if (!process.stdin.isTTY) {
    let value = "";
    for await (const chunk of process.stdin) {
      value += String(chunk);
      if (Buffer.byteLength(value) > 1026) throw new Error("Password input exceeds 1024 bytes.");
    }
    return value.replace(/\r?\n$/, "");
  }
  process.stderr.write("Admin password (14+ characters, hidden): ");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  return new Promise((resolve, reject) => {
    let value = "";
    function done(error?: Error) {
      process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.off("data", receive); process.stderr.write("\n");
      if (error) reject(error); else resolve(value);
    }
    function receive(chunk: string) {
      for (const character of chunk) {
        if (character === "\u0003") { done(new Error("Cancelled.")); return; }
        if (character === "\r" || character === "\n") { done(); return; }
        if (character === "\u007f" || character === "\b") value = [...value].slice(0, -1).join("");
        else if (character >= " ") value += character;
        if (Buffer.byteLength(value) > 1024) { done(new Error("Password input exceeds 1024 bytes.")); return; }
      }
    }
    process.stdin.on("data", receive);
  });
}

try { process.stdout.write(`${await hashAdminPassword(await passwordFromTerminal())}\n`); }
catch (error) { process.stderr.write(`${error instanceof Error ? error.message : "Unable to hash password."}\n`); process.exitCode = 1; }
