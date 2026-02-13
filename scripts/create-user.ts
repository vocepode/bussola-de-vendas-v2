import "dotenv/config";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "../server/db";
import crypto from "node:crypto";

function sha256Prefix(value: string): string {
  // Sem PII nos logs: só prefixo do hash.
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 10);
}

async function main() {
  const email = process.env.CREATE_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.CREATE_USER_PASSWORD;
  const role = (process.env.CREATE_USER_ROLE?.trim() || "admin") as "admin" | "user";

  if (!email || !password) {
    throw new Error(
      "Defina CREATE_USER_EMAIL e CREATE_USER_PASSWORD para criar o usuário (não salvamos senha no repo)."
    );
  }

  const db = await getDb();
  if (!db) {
    throw new Error("DATABASE_URL não configurada (crie .env na raiz com DATABASE_URL=...)");
  }

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "create-user-1",
      hypothesisId: "H13",
      location: "scripts/create-user.ts:main",
      message: "Create user started",
      data: { emailHash: sha256Prefix(email), role },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing[0].id));

    console.log(`[create-user] Usuário atualizado: ${email}`);

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "create-user-1",
        hypothesisId: "H14",
        location: "scripts/create-user.ts:update",
        message: "User updated",
        data: { emailHash: sha256Prefix(email) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    return;
  }

  const [row] = await db
    .insert(users)
    .values({
      email,
      name: "Daniel",
      passwordHash,
      role,
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    })
    .returning({ id: users.id });

  console.log(`[create-user] Usuário criado: ${email} (id=${row?.id ?? "?"})`);

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "create-user-1",
      hypothesisId: "H15",
      location: "scripts/create-user.ts:insert",
      message: "User created",
      data: { emailHash: sha256Prefix(email), userId: row?.id ?? null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log
}

main().catch((err) => {
  console.error("[create-user] Falhou:", err);
  process.exitCode = 1;
});

