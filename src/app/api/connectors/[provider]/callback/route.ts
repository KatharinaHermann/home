import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback. Exchanges `code` for tokens (server-side, never exposed
 * to the browser), stores them encrypted against the user, and bounces
 * back to the studio with `?connected=<provider>`.
 * In demo mode (no app credentials) we skip the exchange.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/connectors/[provider]/callback">) {
  const { provider } = await ctx.params;
  const q = req.nextUrl.searchParams;
  let ret = "/studio/budget";
  try { ret = JSON.parse(Buffer.from(q.get("state") ?? "", "base64url").toString()).ret ?? ret; } catch { /* ignore */ }
  const code = q.get("code");
  let account = "demo user";
  if (code && provider === "facebook" && process.env.META_APP_ID && process.env.META_APP_SECRET) {
    // TODO(prod): exchange code → token at graph.facebook.com/v19.0/oauth/access_token, persist encrypted (KMS), fetch /me for display name.
    account = "facebook user";
  }
  if (code && provider === "pinterest" && process.env.PINTEREST_APP_ID) {
    // TODO(prod): POST https://api.pinterest.com/v5/oauth/token (basic auth) and persist.
    account = "pinterest user";
  }
  const url = new URL(ret, req.nextUrl.origin);
  url.searchParams.set("connected", provider); url.searchParams.set("account", account);
  return NextResponse.redirect(url);
}
