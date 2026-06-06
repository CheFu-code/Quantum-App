declare const __DEV__: boolean;

const PINNED_BACKEND_HOSTS = new Set([
  "api.chefuinc.com",
  "myaccount.chefuinc.com",
  "quantum.chefuinc.com",
]);

const LOCAL_DEV_HOSTS = new Set(["10.0.2.2", "127.0.0.1", "localhost"]);

export function assertSecureBackendUrl(value: string) {
  const url = new URL(value);

  if (
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    !url.hash &&
    (!url.port || url.port === "443") &&
    PINNED_BACKEND_HOSTS.has(url.hostname)
  ) {
    return;
  }

  if (__DEV__ && url.protocol === "http:" && LOCAL_DEV_HOSTS.has(url.hostname)) {
    return;
  }

  throw new Error("Blocked request to an untrusted Quantum backend.");
}

export async function secureBackendFetch(
  input: string,
  init?: RequestInit,
) {
  assertSecureBackendUrl(input);
  return fetch(input, init);
}
