export async function readBodyText(response, timeoutMs, maxBytes) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;
  const deadline = Date.now() + timeoutMs;
  try {
    while (true) {
      let timer;
      const remainingMs = Math.max(1, deadline - Date.now());
      const result = await Promise.race([
        reader.read(),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`response body timeout after ${timeoutMs}ms`)), remainingMs); }),
      ]).finally(() => clearTimeout(timer));
      if (result.done) break;
      const value = result.value;
      const remaining = Math.max(0, maxBytes - bytes);
      if (remaining) body += decoder.decode(value.subarray(0, remaining), { stream: true });
      bytes += value.byteLength;
      if (bytes >= maxBytes) { await reader.cancel(); return `${body}\n[body_read_error] response body exceeded ${maxBytes} bytes`; }
    }
    return body + decoder.decode();
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    return `${body}\n[body_read_error] ${error instanceof Error ? error.message : String(error)}`;
  }
}

export const transportErrorCount = entries => entries.filter(entry => entry.http_status === 0 || entry.http_status >= 500 || entry.body_error === true).length;
