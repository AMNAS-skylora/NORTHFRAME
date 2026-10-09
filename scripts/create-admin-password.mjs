import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
const input = createInterface({ input: process.stdin, output: process.stdout });
console.error(
  "Enter a unique admin password (input is visible in this terminal).",
);
const password = await input.question("Password: ");
input.close();
if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
console.log(
  `ADMIN_PASSWORD_HASH=${salt}:${scryptSync(password, salt, 64).toString("hex")}`,
);
