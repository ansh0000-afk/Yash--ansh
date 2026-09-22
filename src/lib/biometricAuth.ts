const KEY = "alpha_ai_biometric_credential";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(value: string) {
  const binary = atob(
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4)
  );

  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export async function biometricAuth() {
  if (
    !window.isSecureContext ||
    !window.PublicKeyCredential ||
    !navigator.credentials
  ) {
    throw new Error("Biometric authentication is not available.");
  }

  const saved = localStorage.getItem(KEY);

  // First-time setup
  if (!saved) {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),

        rp: {
          name: "Alpha AI",
          id: window.location.hostname
        },

        user: {
          id: randomBytes(32),
          name: "alpha-ai-user",
          displayName: "Alpha AI User"
        },

        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 }
        ],

        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },

        timeout: 60000,
        attestation: "none"
      }
    });

    if (!(credential instanceof PublicKeyCredential)) {
      throw new Error("Biometric setup failed.");
    }

    localStorage.setItem(
      KEY,
      bytesToBase64Url(new Uint8Array(credential.rawId))
    );

    return true;
  }

  // Unlock
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),

      rpId: window.location.hostname,

      allowCredentials: [
        {
          type: "public-key",
          id: base64UrlToBytes(saved),
          transports: ["internal"]
        }
      ],

      userVerification: "required",
      timeout: 60000
    }
  });

  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("Biometric verification failed.");
  }

  return true;
}