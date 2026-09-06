import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth entry point per provider. When the provider's app credentials are
 * configured we redirect to the real consent screen; otherwise we fall
 * through to a demo callback so the flow can be exercised end-to-end.
 *
 *  facebook      Meta Login (OAuth 2) → scopes: public_profile, email,
 *                pages_messaging (Messenger threads). Marketplace search
 *                itself has no public API — see ARCHITECTURE.md.
 *  pinterest     Pinterest API v5 → scopes: boards:read, pins:read
 *  amazon        Login with Amazon + PA-API (search); orders via session
 *  ikea          no public OAuth; availability via partner feed
 *  kleinanzeigen no public OAuth; companion extension
 */
const PROVIDERS: Record<string, { url?: (state: string, redirect: string) => string | null }> = {
  facebook: {
    url: (state, redirect) => process.env.META_APP_ID
      ? `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirect)}&state=${state}&scope=public_profile,email,pages_messaging`
      : null,
  },
  pinterest: {
    url: (state, redirect) => process.env.PINTEREST_APP_ID
      ? `https://www.pinterest.com/oauth/?client_id=${process.env.PINTEREST_APP_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=boards:read,pins:read&state=${state}`
      : null,
  },
  amazon: {
    url: (state, redirect) => process.env.AMAZON_LWA_CLIENT_ID
      ? `https://www.amazon.com/ap/oa?client_id=${process.env.AMAZON_LWA_CLIENT_ID}&scope=profile&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&state=${state}`
      : null,
  },
  ikea: {}, kleinanzeigen: {},
};

export async function GET(req: NextRequest, ctx: RouteContext<"/api/connectors/[provider]/authorize">) {
  const { provider } = await ctx.params;
  const cfg = PROVIDERS[provider];
  if (!cfg) return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  const ret = req.nextUrl.searchParams.get("return") ?? "/studio/budget";
  const state = Buffer.from(JSON.stringify({ ret, t: Date.now() })).toString("base64url");
  const redirect = `${req.nextUrl.origin}/api/connectors/${provider}/callback`;
  const real = cfg.url?.(state, redirect);
  if (real) return NextResponse.redirect(real);
  // demo mode: simulate consent
  return NextResponse.redirect(`${redirect}?demo=1&state=${state}`);
}
