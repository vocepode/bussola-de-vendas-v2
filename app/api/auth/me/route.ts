import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../../../../server/db";
import { toAuthMeUser } from "../../../../server/auth-user";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await db.getUserBySessionToken(token) : null;

  return NextResponse.json(toAuthMeUser(user), { status: 200 });
}
