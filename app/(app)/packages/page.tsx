"use client";

import CrudPage, { ListView } from "@/components/CrudPage";
import { taka } from "@/lib/utils";

export default function Packages() {
  return (
    <CrudPage
      title="প্যাকেজ তালিকা"
      addLabel="নতুন প্যাকেজ"
      resource="packages"
      fields={[
        { key: "name", label: "প্যাকেজের নাম", required: true },
        { key: "price", label: "মূল্য (৳)", type: "number" },
        { key: "duration", label: "মেয়াদ", placeholder: "যেমন: ১ মাস" },
        { key: "description", label: "সংক্ষিপ্ত বিবরণ", type: "textarea" },
        { key: "services", label: "এই প্যাকেজে কী কী সার্ভিস থাকবে", type: "list" },
      ]}
      columns={[
        { key: "name", label: "প্যাকেজ", render: (r) => <b>{r.name}</b> },
        { key: "price", label: "মূল্য", render: (r) => taka(r.price) },
        { key: "duration", label: "মেয়াদ" },
        { key: "services", label: "সার্ভিস", render: (r) => <ListView items={r.services} /> },
        { key: "description", label: "বিবরণ" },
      ]}
    />
  );
}
