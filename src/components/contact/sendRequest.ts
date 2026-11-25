/** Sends a form to the server. True when it arrived. */
export async function sendRequest(fd: FormData, extra: Record<string, unknown>) {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), phone: fd.get("phone"), email: fd.get("email"), website: fd.get("website"), ...extra }),
      signal: AbortSignal.timeout(15000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
