/**
 * Edge-compatible JWT sign/verify using Web Crypto API.
 * No external dependencies — works on Cloudflare Workers.
 */

function base64UrlEncode(data: string): string {
    return btoa(data)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/");
    return atob(padded);
}

async function getKey(secret: string, usage: string[]): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        usage
    );
}

export async function signJwt(
    payload: Record<string, any>,
    secret: string,
    expiresInSeconds = 86400 // 24 hours
): Promise<string> {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));

    const now = Math.floor(Date.now() / 1000);
    const fullPayload = base64UrlEncode(
        JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds })
    );

    const key = await getKey(secret, ["sign"]);
    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(`${header}.${fullPayload}`)
    );

    const sig = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
    return `${header}.${fullPayload}.${sig}`;
}

export async function verifyJwt(
    token: string,
    secret: string
): Promise<Record<string, any> | null> {
    try {
        const [header, payload, sig] = token.split(".");
        if (!header || !payload || !sig) return null;

        const key = await getKey(secret, ["verify"]);
        const encoder = new TextEncoder();

        const sigBinary = base64UrlDecode(sig);
        const sigArray = new Uint8Array(sigBinary.length);
        for (let i = 0; i < sigBinary.length; i++) {
            sigArray[i] = sigBinary.charCodeAt(i);
        }

        const valid = await crypto.subtle.verify(
            "HMAC",
            key,
            sigArray,
            encoder.encode(`${header}.${payload}`)
        );

        if (!valid) return null;

        const decoded = JSON.parse(base64UrlDecode(payload));

        // Check expiration
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}
