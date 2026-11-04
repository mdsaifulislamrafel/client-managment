"use client";

import Link from "next/link";
import CrudPage, { ListView } from "@/components/CrudPage";
import { fmtDate, taka, today } from "@/lib/utils";

export default function PackageClients() {
  return (
    <CrudPage
      title="প্যাকেজ ক্লায়েন্ট"
      addLabel="নতুন প্যাকেজ ক্লায়েন্ট"
      resource="package-clients"
      dateField="startDate"
      dateLabel="শুরুর তারিখ"
      fields={[
        { key: "name", label: "নাম", required: true },
        { key: "phone", label: "ফোন নাম্বার" },
        { key: "address", label: "ঠিকানা" },
        {
          key: "packageId",
          label: "প্যাকেজ বাছাই করুন",
          type: "select",
          optionsFrom: "packages",
          onPick: (p) => ({
            packageName: p.name,
            price: p.price,
            duration: p.duration,
            services: p.services,
            charge: p.price,
          }),
        },
        { key: "startDate", label: "শুরুর তারিখ", type: "date", def: today },
        { key: "endDate", label: "শেষ তারিখ", type: "date" },
        { key: "charge", label: "মোট চার্জ (৳)", type: "number" },
        { key: "paid", label: "পেমেন্ট / অ্যাডভান্স (৳)", type: "number" },
        { key: "services", label: "সার্ভিস তালিকা (প্যাকেজ থেকে অটো আসবে, চাইলে বদলান)", type: "list" },
        { key: "deliveryDates", label: "ডেলিভারি ডেট (যেমন: 10/12 — ৪টি পোস্ট)", type: "list" },
        { key: "note", label: "নোট", type: "textarea" },
      ]}
      columns={[
        {
          key: "name",
          label: "ক্লায়েন্ট",
          render: (r) => (
            <>
              <b>{r.name}</b>
              <div className="sub">{r.phone}</div>
              <div className="sub">{r.address}</div>
            </>
          ),
        },
        {
          key: "packageName",
          label: "প্যাকেজ",
          render: (r) => (
            <>
              <b>{r.packageName || "-"}</b>
              <div className="sub">{r.duration}</div>
            </>
          ),
        },
        {
          key: "period",
          label: "মেয়াদ",
          render: (r) => `${fmtDate(r.startDate)} → ${fmtDate(r.endDate)}`,
        },
        { key: "services", label: "সার্ভিস", render: (r) => <ListView items={r.services} /> },
        { key: "deliveryDates", label: "ডেলিভারি ডেট", render: (r) => <ListView items={r.deliveryDates} /> },
        {
          key: "money",
          label: "পেমেন্ট",
          render: (r) => (
            <>
              {taka(r.charge)}
              <div className="sub">
                পেইড {taka(r.paid)} · বাকি {taka((r.charge || 0) - (r.paid || 0))}
              </div>
            </>
          ),
        },
        { key: "note", label: "নোট" },
      ]}
      actions={(r) => (
        <Link className="btn ghost sm" href={`/package-clients/${r._id}/agreement`} target="_blank">
          এগ্রিমেন্ট{r.agreementImages?.length ? " ✔" : ""}
        </Link>
      )}
    />
  );
}
