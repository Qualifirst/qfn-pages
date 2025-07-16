import { createHmac } from 'crypto';

const ALGORITHM = 'sha256';
// The separator can be any character that won't appear in the base64 signature.
const SEPARATOR = '.';

/**
 * Generates a secure, self-expiring token.
 * @param ttlSeconds The time-to-live for the token in seconds.
 * @returns A token string in the format "expirationTimestamp.signature"
 */
export function generateSignedToken(ttlSeconds=300) {
  // 1. Calculate the expiration timestamp (in milliseconds).
  const expiration = Date.now() + ttlSeconds * 1000;

  // 2. Create the signature by hashing the expiration timestamp with the secret key.
  const hmac = createHmac(ALGORITHM, process.env.SIGNED_TOKENS_SECRET);
  hmac.update(String(expiration));
  const signature = hmac.digest('base64url'); // base64url is safe for use in URLs

  // 3. Combine them into a single token string.
  return `${expiration}${SEPARATOR}${signature}`;
}

/**
 * Verifies a signed token and checks if it has expired.
 * @param token The token string from the client.
 * @returns True if the token is valid and not expired, false otherwise.
 */
export function verifySignedToken(token) {
  try {
    // 1. Split the token into its parts.
    const parts = token.split(SEPARATOR);
    if (parts.length !== 2) {
      return false; // Malformed token
    }
    const expirationStr = parts[0];
    const signatureFromClient = parts[1];

    // 2. Recalculate the expected signature on the server side.
    const hmac = createHmac(ALGORITHM, process.env.SIGNED_TOKENS_SECRET);
    hmac.update(expirationStr);
    const expectedSignature = hmac.digest('base64url');

    // 3. Securely compare the signatures. This prevents timing attacks.
    if (expectedSignature !== signatureFromClient) {
      return false; // Invalid signature (tampered token)
    }
    // 4. Check if the token has expired.
    const expiration = parseInt(expirationStr, 10);
    if (Date.now() > expiration) {
      return false; // Token has expired
    }

    // If all checks pass, the token is valid.
    return true;
  } catch (error) {
    // Catch any errors during parsing or comparison.
    return false;
  }
}
