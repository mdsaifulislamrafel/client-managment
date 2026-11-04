"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import PrintHeader from "./PrintHeader";
import { fmtDate, JSON_HEADERS } from "@/lib/utils";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "date" | "number" | "select" | "yesno" | "list" | "checklist" | "url";
  options?: string[];
  optionsFrom?: string; // অন্য রিসোর্স থেকে ড্রপডাউন (যেমন packages)
  onPick?: (item: any) => Record<string, any>; // ড্রপডাউন বাছাই করলে অন্য ফিল্ড অটো-ফিল
  required?: boolean;
  full?: boolean;
  def?: any;
  placeholder?: string;
};
export type Col = { key: string; label: string; render?: (r: any) => ReactNode };
export type Filter = { key: string; label: string; options: { label: string; value: string }[] };

type Props = {
  title: string;
  addLabel: string;
  resource: string;
  fields: Field[];
  columns: Col[];
  dateField?: string;
  dateLabel?: string;
  filter?: Filter;
  filterDefault?: string;
  actions?: (r: any, reload: () => void) => ReactNode;
};

export function ListView({ items, check }: { items?: any[]; check?: boolean }) {
  if (!items?.length) return <>-</>;
  return (
    <ul className="lv">
      {items.map((x, i) => (
        <li key={i}>{check ? (x.done ? "✅ " : "⬜ ") + x.text : x}</li>
      ))}
    </ul>
  );
}

function ListInput({ value, onChange, check }: { value: any[]; onChange: (v: any[]) => void; check: boolean }) {
  const [t, setT] = useState("");
  const add = () => {
    if (!t.trim()) return;
    onChange([...value, check ? { text: t.trim(), done: false } : t.trim()]);
    setT("");
  };
  const upd = (i: number, patch: any) =>
    onChange(value.map((x, j) => (j === i ? (check ? { ...x, ...patch } : patch.text) : x)));
  return (
    <div>
      {value.map((v, i) => (
        <div className="row" key={i}>
          {check && (
            <input type="checkbox" checked={!!v.done} onChange={(e) => upd(i, { done: e.target.checked })} />
          )}
          <input value={check ? v.text : v} onChange={(e) => upd(i, { text: e.target.value })} />
          <button type="button" className="btn danger sm" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <div className="row">
        <input
          value={t}
          placeholder="নতুন আইটেম লিখে Enter চাপুন"
          onChange={(e) => setT(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn ghost sm" onClick={add}>
          + যোগ
        </button>
      </div>
    </div>
  );
}

export default function CrudPage(p: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookups, setLookups] = useState<Record<string, any[]>>({});
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [flt, setFlt] = useState(p.filterDefault ?? "");
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/${p.resource}`)
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [p.resource]);

  useEffect(() => {
    load();
    p.fields.forEach((f) => {
      if (f.optionsFrom)
        fetch(`/api/${f.optionsFrom}`)
          .then((r) => r.json())
          .then((d) => setLookups((l) => ({ ...l, [f.optionsFrom!]: d })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blank = () =>
    Object.fromEntries(
      p.fields.map((f) => [
        f.key,
        typeof f.def === "function"
          ? f.def()
          : f.def ?? (f.type === "list" || f.type === "checklist" ? [] : f.type === "yesno" ? false : ""),
      ])
    );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (s && !JSON.stringify(r).toLowerCase().includes(s)) return false;
      if (p.filter && flt && String(r[p.filter.key] ?? "") !== flt) return false;
      if (p.dateField) {
        const d = String(r[p.dateField] || "").slice(0, 10);
        if (from && (!d || d < from)) return false;
        if (to && (!d || d > to)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, from, to, flt]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { ...form };
    p.fields.forEach((f) => {
      if (f.type === "number") body[f.key] = Number(body[f.key] || 0);
    });
    const r = await fetch(form._id ? `/api/${p.resource}/${form._id}` : `/api/${p.resource}`, {
      method: form._id ? "PATCH" : "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (r.ok) {
      setForm(null);
      load();
    } else alert((await r.json()).error || "সেভ হয়নি");
  }

  async function remove(r: any) {
    if (!confirm("এটি মুছে ফেলবেন? আর ফেরত আনা যাবে না।")) return;
    await fetch(`/api/${p.resource}/${r._id}`, { method: "DELETE" });
    load();
  }

  const input = (f: Field) => {
    const v = form[f.key];
    const set = (x: any) => setForm((s: any) => ({ ...s, [f.key]: x }));
    switch (f.type) {
      case "textarea":
        return <textarea rows={3} value={v ?? ""} onChange={(e) => set(e.target.value)} />;
      case "yesno":
        return (
          <select value={v ? "yes" : "no"} onChange={(e) => set(e.target.value === "yes")}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        );
      case "list":
      case "checklist":
        return <ListInput value={v || []} onChange={set} check={f.type === "checklist"} />;
      case "select":
        if (f.optionsFrom) {
          const L = lookups[f.optionsFrom] || [];
          return (
            <select
              value={v ?? ""}
              onChange={(e) => {
                const it = L.find((x) => x._id === e.target.value);
                setForm((s: any) => ({ ...s, [f.key]: e.target.value, ...(it && f.onPick ? f.onPick(it) : {}) }));
              }}
            >
              <option value="">-- নির্বাচন করুন --</option>
              {L.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
          );
        }
        return (
          <select value={v ?? ""} onChange={(e) => set(e.target.value)}>
            {f.options!.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text"}
            required={f.required}
            placeholder={f.placeholder}
            value={v ?? ""}
            onChange={(e) => set(e.target.value)}
          />
        );
    }
  };

  const range = from || to ? ` (${from ? fmtDate(from) : "শুরু"} – ${to ? fmtDate(to) : "আজ পর্যন্ত"})` : "";
  const filterText = p.filter && flt ? ` — ${p.filter.options.find((o) => o.value === flt)?.label}` : "";

  return (
    <div className="wrap">
      {/* স্ক্রিন UI */}
      <div className="noprint">
        <div className="head">
          <h2>{p.title}</h2>
          <div className="acts">
            <button className="btn ghost" onClick={() => window.print()}>
              🖨 লিস্ট প্রিন্ট
            </button>
            <button className="btn" onClick={() => setForm(blank())}>
              + {p.addLabel}
            </button>
          </div>
        </div>

        <div className="bar">
          <label className="grow">
            <span>খুঁজুন</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="নাম, ফোন, নোট..." />
          </label>
          {p.filter && (
            <label>
              <span>{p.filter.label}</span>
              <select value={flt} onChange={(e) => setFlt(e.target.value)}>
                <option value="">সব</option>
                {p.filter.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {p.dateField && (
            <>
              <label>
                <span>{p.dateLabel || "তারিখ"} থেকে</span>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                <span>পর্যন্ত</span>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              {(from || to) && (
                <button
                  className="btn ghost"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                >
                  ফিল্টার মুছুন
                </button>
              )}
            </>
          )}
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                {p.columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  {p.columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(r) : r[c.key] || "-"}</td>
                  ))}
                  <td>
                    <div className="acts">
                      {p.actions?.(r, load)}
                      <button className="btn ghost sm" onClick={() => setForm({ ...r })}>
                        এডিট
                      </button>
                      <button className="btn danger sm" onClick={() => remove(r)}>
                        মুছুন
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty">
              {loading ? "লোড হচ্ছে..." : `কিছু পাওয়া যায়নি। "+ ${p.addLabel}" চেপে প্রথমটি যোগ করুন।`}
            </div>
          )}
        </div>
        <p className="sub">মোট {filtered.length} টি</p>
      </div>

      {/* প্রিন্ট লেআউট (লোগো, কোম্পানি তথ্য, ওয়াটারমার্ক সহ) */}
      <div className="printonly paper">
        <PrintHeader title={`${p.title}${filterText}${range}`} />
        <table>
          <thead>
            <tr>
              <th>#</th>
              {p.columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r._id}>
                <td>{i + 1}</td>
                {p.columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(r) : r[c.key] || "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pfoot">
          <span>মোট: {filtered.length} টি</span>
          <span>প্রিন্টের তারিখ: {new Date().toLocaleDateString("en-GB")}</span>
        </div>
      </div>

      {/* ফর্ম মডাল */}
      {form && (
        <div className="ov noprint" onMouseDown={(e) => e.target === e.currentTarget && setForm(null)}>
          <form className="modal" onSubmit={save}>
            <h3>{form._id ? "তথ্য এডিট" : p.addLabel}</h3>
            <div className="grid">
              {p.fields.map((f) => {
                const isList = f.type === "list" || f.type === "checklist";
                const Tag: any = isList ? "div" : "label";
                return (
                  <Tag key={f.key} className={`f ${f.full || isList || f.type === "textarea" ? "full" : ""}`}>
                    <span>
                      {f.label}
                      {f.required && " *"}
                    </span>
                    {input(f)}
                  </Tag>
                );
              })}
            </div>
            <div className="acts" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn ghost" onClick={() => setForm(null)}>
                বাতিল
              </button>
              <button className="btn" disabled={saving}>
                {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
