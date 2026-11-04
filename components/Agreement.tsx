"use client";

import { ReactNode, useEffect, useState } from "react";
import PrintHeader from "./PrintHeader";
import { COMPANY, PACKAGE_TERMS, TERMS } from "@/lib/company";
import { fmtDate, JSON_HEADERS, taka } from "@/lib/utils";

const tint = (rgb: string, a = 0.1) => `rgba(${rgb},${a})`;

// ফোনের বড় ছবি আপলোডের আগে ছোট করে নেওয়া
async function shrink(f: File): Promise<Blob> {
  const bmp = await createImageBitmap(f);
  const s = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(b || f), "image/jpeg", 0.85));
}

export default function Agreement({ kind, id }: { kind: "clients" | "package-clients"; id: string }) {
  const [j, setJ] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const isPkg = kind === "package-clients";

  const load = () =>
    fetch(`/api/${kind}/${id}`)
      .then((r) => r.json())
      .then(setJ);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchImages = (agreementImages: any[]) =>
    fetch(`/api/${kind}/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify({ agreementImages }) });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const imgs = [...(j.agreementImages || [])];
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", await shrink(f), "agreement.jpg");
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (r.ok) imgs.push(await r.json());
      else alert((await r.json()).error || "আপলোড ব্যর্থ");
    }
    await patchImages(imgs);
    setBusy(false);
    load();
  }

  async function del(img: any) {
    if (!confirm("ছবিটি মুছে ফেলবেন?")) return;
    await fetch("/api/upload", { method: "DELETE", headers: JSON_HEADERS, body: JSON.stringify({ publicId: img.publicId }) });
    await patchImages(j.agreementImages.filter((x: any) => x.publicId !== img.publicId));
    load();
  }

  if (!j) return <p style={{ padding: 20 }}>Loading...</p>;
  if (j.error) return <p style={{ padding: 20 }}>পাওয়া যায়নি</p>;

  const due = (j.charge || 0) - (j.paid || 0);
  const today = new Date().toLocaleDateString("en-GB");

  const rows: [string, ReactNode][] = isPkg
    ? [
        ["Package", <b key="p">{j.packageName || "-"}</b>],
        ["Duration", `${fmtDate(j.startDate)} → ${fmtDate(j.endDate)}${j.duration ? ` (${j.duration})` : ""}`],
        [
          "Services Included",
          j.services?.length ? (
            <ol key="s" style={{ margin: 0, paddingLeft: 16 }}>
              {j.services.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          ) : (
            "-"
          ),
        ],
        [
          "Delivery Dates",
          j.deliveryDates?.length ? (
            <ul key="d" style={{ margin: 0, paddingLeft: 16 }}>
              {j.deliveryDates.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            "-"
          ),
        ],
        ["Delivery Method", "Via Google Drive link"],
      ]
    : [
        ["Service", <b key="s">{j.workType || "-"}</b>],
        ["Work Date", fmtDate(j.workDate)],
        ["Location", j.address || "-"],
        ["Delivery Date", `${fmtDate(j.deliveryDate)} — Via Google Drive link`],
      ];

  const box = (label: string, value: number, rgb: string, color: string) => (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "8px 6px",
        borderRadius: 10,
        background: tint(rgb, 0.12),
        border: `1px solid ${tint(rgb, 0.45)}`,
      }}
    >
      <div style={{ fontSize: 12, color }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{taka(value)}</div>
    </div>
  );

  const terms = isPkg ? PACKAGE_TERMS : TERMS;

  return (
    <>
      <div className="noprint" style={{ textAlign: "center", marginTop: 10 }}>
        <button className="btn" onClick={() => window.print()}>
          🖨 এগ্রিমেন্ট প্রিন্ট (A4)
        </button>
      </div>

      <div className="paper">
        <PrintHeader title={isPkg ? "Package Service Agreement" : "Service Agreement"} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#4b5563", marginBottom: 8 }}>
          <span>
            📅 Date: <b>{today}</b>
          </span>
          <span>
            🔖 Reference: <b>{String(j._id).slice(-6).toUpperCase()}</b>
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: tint("67,56,202", 0.08), borderLeft: "4px solid #4338ca" }}>
            <div style={{ fontSize: 11, color: "#4338ca", fontWeight: 700 }}>Service Provider</div>
            <b>{COMPANY.name}</b>
            <br />
            {COMPANY.phone}
            <br />
            {COMPANY.website}
          </div>
          <div style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: tint("5,150,105", 0.08), borderLeft: "4px solid #059669" }}>
            <div style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>Client</div>
            <b>{j.name}</b>
            <br />
            Phone: {j.phone || "-"}
            {j.address && (
              <>
                <br />
                Address: {j.address}
              </>
            )}
          </div>
        </div>

        <p style={{ margin: "10px 0 6px" }}>Both parties agree to the following work details and terms:</p>

        <table>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <th style={{ width: "26%", background: tint("67,56,202", 0.1), color: "#3730a3", textAlign: "left" }}>{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 10, margin: "12px 0" }}>
          {box("Total Charge", j.charge || 0, "67,56,202", "#3730a3")}
          {box("Paid / Advance", j.paid || 0, "5,150,105", "#047857")}
          {box("Due Balance", due, due > 0 ? "220,38,38" : "5,150,105", due > 0 ? "#b91c1c" : "#047857")}
        </div>

        {j.note && (
          <p style={{ background: tint("245,158,11", 0.12), padding: "6px 10px", borderRadius: 8, margin: "0 0 8px" }}>
            <b>Note:</b> {j.note}
          </p>
        )}

        <div style={{ background: tint("245,158,11", 0.1), border: "1px solid rgba(245,158,11,.4)", borderRadius: 10, padding: "8px 14px" }}>
          <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 4 }}>📋 Terms and Conditions</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, columnCount: 2, columnGap: 22 }}>
            {terms.map((t) => (
              <li key={t} style={{ marginBottom: 3, breakInside: "avoid" }}>
                {t}
              </li>
            ))}
          </ol>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 56, gap: 40 }}>
          <div style={{ flex: 1, borderTop: "2px solid #4338ca", paddingTop: 4, textAlign: "center" }}>
            Client Signature
            <br />
            <small>{j.name}</small>
          </div>
          <div style={{ flex: 1, borderTop: "2px solid #4338ca", paddingTop: 4, textAlign: "center" }}>
            Service Provider Signature
            <br />
            <small>{COMPANY.name}</small>
          </div>
        </div>
      </div>

      {/* সাইন করা এগ্রিমেন্টের ছবি — প্রিন্টে আসবে না */}
      <div className="panel noprint">
        <h3>সাইন করা এগ্রিমেন্টের ছবি (প্রমাণ)</h3>
        <p className="sub">ক্লায়েন্ট ও অফিস সাইন করার পর পেপারের ছবি তুলে এখানে আপলোড করুন।</p>
        <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => onFiles(e.target.files)} />
        {busy && <p className="sub">আপলোড হচ্ছে...</p>}
        <div className="shots">
          {(j.agreementImages || []).map((img: any) => (
            <div className="s" key={img.publicId}>
              <a href={img.url} target="_blank" rel="noreferrer">
                <img src={img.url} alt="Signed agreement" />
              </a>
              <button className="btn danger sm" onClick={() => del(img)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
