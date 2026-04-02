/**
 * Shared Cloudflare Worker binding types for all routes.
 * Import these in any route file that needs typed access to c.env.
 */
export type Bindings = {
    DB: D1Database;
    MEDIA: R2Bucket;
    ENVIRONMENT: string;
    IYZICO_API_KEY?: string;
    IYZICO_SECRET_KEY?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_REDIRECT_URI?: string;
    JWT_SECRET?: string;
    RESEND_API_KEY?: string;
};
