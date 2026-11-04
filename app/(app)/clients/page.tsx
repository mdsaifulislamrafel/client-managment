"use client";

import Link from "next/link";
import CrudPage from "@/components/CrudPage";
import ConvertButton from "@/components/ConvertButton";
import { fmtDate, taka } from "@/lib/utils";

const STATUS = ["আগ্রহী", "কনফার্ম", "সম্পন্ন", "বাতিল", "প্যাকেজে গেছে"];

export default function Clients() {
  return (
    <CrudPage
      title="ওয়ান টাইম ক্লায়েন্ট"
      addLabel="নতুন ক্লায়েন্ট"
      resource="clients"
      dateField="workDate"
      dateLabel="কাজের তারিখ"
      filter={{ key: "status", label: "স্ট্যাটাস", options: STATUS.map((s) => ({ label: s, value: s })) }}
      fields={[
        { key: "name", label: "নাম", required: true },
        { key: "phone", label: "ফোন নাম্বার" },
        { key: "workType", label: "কাজের ধরন" },
        { key: "address", label: "ঠিকানা / লোকেশন" },
        { key: "workDate", label: "কাজের তারিখ", type: "date" },
        { key: "deliveryDate", label: "ডেলিভারি ডেট", type: "date" },
        { key: "charge", label: "মোট চার্জ (৳)", type: "number" },
        { key: "paid", label: "পেমেন্ট / অ্যাডভান্স (৳)", type: "number" },
        { key: "status", label: "স্ট্যাটাস", type: "select", options: STATUS, def: "আগ্রহী" },
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
            </>
          ),
        },
        {
          key: "workType",
          label: "কাজ / ঠিকানা",
          render: (r) => (
            <>
              {r.workType || "-"}
              <div className="sub">{r.address}</div>
            </>
          ),
        },
        { key: "workDate", label: "কাজের তারিখ", render: (r) => fmtDate(r.workDate) },
        { key: "deliveryDate", label: "ডেলিভারি ডেট", render: (r) => fmtDate(r.deliveryDate) },
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
        { key: "status", label: "স্ট্যাটাস", render: (r) => <span className="badge">{r.status}</span> },
        { key: "note", label: "নোট" },
      ]}
      actions={(r, reload) => (
        <>
          <Link className="btn ghost sm" href={`/clients/${r._id}/agreement`} target="_blank">
            এগ্রিমেন্ট{r.agreementImages?.length ? " ✔" : ""}
          </Link>
          <ConvertButton c={r} reload={reload} />
        </>
      )}
    />
  );
}
