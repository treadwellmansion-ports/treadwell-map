import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Identifies this build (the git commit on Vercel). It is baked into both
    // the page and the /api/version route, so a kiosk that loaded an older page
    // can tell a newer one has been published. A fixed value off Vercel (not a
    // timestamp): a value that changes on every evaluation makes the dev server
    // treat every module as changed and reload the page in a loop.
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  },
};

export default nextConfig;
