// Le signal reste actif pendant la lecture du CORPS, pas seulement des headers.
// AbortSignal.timeout ne conserve pas de timer qui bloque la fin du processus.
export function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const deadline = AbortSignal.timeout(timeoutMs);
  const signal = options.signal ? AbortSignal.any([options.signal, deadline]) : deadline;
  return fetch(url, { ...options, signal });
}
