"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JSON_HEADERS, taka, today } from "@/lib/utils";

// ওয়ান টাইম ক্লায়েন্টকে প্যাকেজ সিস্টেমে নেওয়ার বাটন
export default function ConvertButton({ c, reload }: { c: any; reload: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pk, setPk] = useState<any[]>([]);
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) fetch("/api/packages").then((r) => r.json()).then(setPk);
  }, [open]);

  if (c.packageConverted) return <span className="badge yes">প্যাকেজে গেছে</span>;

  async function go() {
    const p = pk.find((x) => x._id === id);
    if (!p) return alert("একটি প্যাকেজ বাছাই করুন");
    setBusy(true);
    const r = await fetch("/api/package-clients", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        name: c.name,
        phone: c.phone,
        address: c.address,
        note: c.note,
        packageId: p._id,
        packageName: p.name,
        price: p.price,
        duration: p.duration,
        services: p.services,
        charge: p.price,
        paid: 0,
        startDate: today(),
        deliveryDates: [],
      }),
    });
    if (!r.ok) {
      setBusy(false);
      return alert("প্যাকেজ ক্লায়েন্ট তৈরি হয়নি");
    }
    await fetch(`/api/clients/${c._id}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ packageConverted: true, status: "প্যাকেজে গেছে" }),
    });
    setBusy(false);
    setOpen(false);
    reload();
    router.push("/package-clients");
  }

  return (
    <>
      <button className="btn sm" onClick={() => setOpen(true)}>
        প্যাকেজে নিন
      </button>
      {open && (
        <div className="ov" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <h3>{c.name} — প্যাকেজ বাছাই করুন</h3>
            <div style={{ margin: "12px 0" }}>
              <select value={id} onChange={(e) => setId(e.target.value)}>
                <option value="">-- প্যাকেজ --</option>
                {pk.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({taka(p.price)})
                  </option>
                ))}
              </select>
              {!pk.length && <p className="sub">আগে &quot;প্যাকেজ তৈরি&quot; ট্যাব থেকে প্যাকেজ বানান।</p>}
            </div>
            <div className="acts" style={{ justifyContent: "flex-end" }}>
              <button className="btn ghost" onClick={() => setOpen(false)}>
                বাতিল
              </button>
              <button className="btn" onClick={go} disabled={busy}>
                {busy ? "অপেক্ষা করুন..." : "নিশ্চিত করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
