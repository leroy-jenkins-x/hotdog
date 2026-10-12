declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SESSION_SECRET?: string;
    DEMO_MODE?: string;
    SITE_ORIGIN?: string;
    VK_CLIENT_ID?: string;
    VK_CLIENT_SECRET?: string;
    TELEGRAM_CLIENT_ID?: string;
    TELEGRAM_CLIENT_SECRET?: string;
  }
}
