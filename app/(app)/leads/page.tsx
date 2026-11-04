"use client";

import CrudPage from "@/components/CrudPage";
import { fmtDate, today } from "@/lib/utils";

export default function Leads() {
  return (
    <CrudPage
      title="সম্ভাব্য ক্লায়েন্টের তালিকা"
      addLabel="নতুন সম্ভাব্য ক্লায়েন্ট"
      resource="leads"
      dateField="date"
      dateLabel="আসার তারিখ"
      fields={[
        { key: "name", label: "নাম", required: true },
        { key: "phone", label: "ফোন নাম্বার" },
        { key: "interest", label: "কী কাজের জন্য এসেছে / করতে ইচ্ছুক" },
        { key: "date", label: "অফিসে আসার তারিখ", type: "date", def: today },
        { key: "note", label: "নোট", type: "textarea" },
      ]}
      columns={[
        { key: "date", label: "তারিখ", render: (r) => fmtDate(r.date) },
        { key: "name", label: "নাম", render: (r) => <b>{r.name}</b> },
        { key: "phone", label: "ফোন" },
        { key: "interest", label: "কাজের ধরন" },
        { key: "note", label: "নোট" },
      ]}
    />
  );
}
