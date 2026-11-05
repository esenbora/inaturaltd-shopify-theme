import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The security headers live in `proxy.ts` rather than here, because the CSP
  // carries a per-request nonce and this file is static.

  // Drop `X-Powered-By: Next.js`. It tells an attacker which framework and
  // therefore which CVE list to work through, and buys us nothing.
  poweredByHeader: false,
};

export default nextConfig;
