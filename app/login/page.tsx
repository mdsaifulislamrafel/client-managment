"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JSON_HEADERS } from "@/lib/utils";

export default function Login() {
  const router = useRouter();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ username: u, password: p }),
    });
    setBusy(false);
    if (r.ok) {
      router.replace("/");
      router.refresh();
    } else setErr((await r.json()).error || "লগইন ব্যর্থ");
  }

  return (
    <form className="login" onSubmit={submit}>
      <h2>ক্লাইন্ড ম্যানেজমেন্ট</h2>
      <label className="f">
        <span>ইউজারনেম</span>
        <input value={u} onChange={(e) => setU(e.target.value)} autoFocus required />
      </label>
      <label className="f">
        <span>পাসওয়ার্ড</span>
        <input type="password" value={p} onChange={(e) => setP(e.target.value)} required />
      </label>
      {err && <div className="err">{err}</div>}
      <button className="btn" disabled={busy} style={{ width: "100%" }}>
        {busy ? "অপেক্ষা করুন..." : "লগইন"}
      </button>
    </form>
  );
}
