"use client";

import CrudPage, { ListView } from "@/components/CrudPage";
import { fmtDate } from "@/lib/utils";

export default function Projects() {
  return (
    <CrudPage
      title="চলমান কাজের তালিকা"
      addLabel="নতুন প্রজেক্ট"
      resource="projects"
      dateField="deliveryDate"
      dateLabel="ডেলিভারি ডেট"
      filter={{
        key: "delivered",
        label: "ডেলিভারি",
        options: [
          { label: "No — চলমান", value: "false" },
          { label: "Yes — ডেলিভারড", value: "true" },
        ],
      }}
      filterDefault="false"
      fields={[
        { key: "title", label: "প্রজেক্টের নাম", required: true },
        { key: "clientName", label: "ক্লায়েন্টের নাম" },
        { key: "deliveryDate", label: "ডেলিভারি ডেট", type: "date" },
        { key: "status", label: "স্ট্যাটাস", type: "select", options: ["Pending", "Working", "Review", "Completed"], def: "Pending" },
        { key: "delivered", label: "ডেলিভারি হয়েছে?", type: "yesno" },
        { key: "deliveryLink", label: "ডেলিভারি লিংক", type: "url", placeholder: "https://drive.google.com/..." },
        { key: "note", label: "নোট", type: "textarea" },
        { key: "tasks", label: "কাজের বিবরণ (কী কী হলো)", type: "checklist" },
      ]}
      columns={[
        {
          key: "title",
          label: "প্রজেক্ট",
          render: (r) => (
            <>
              <b>{r.title}</b>
              {r.clientName && <div className="sub">{r.clientName}</div>}
            </>
          ),
        },
        { key: "deliveryDate", label: "ডেলিভারি ডেট", render: (r) => fmtDate(r.deliveryDate) },
        { key: "status", label: "স্ট্যাটাস", render: (r) => <span className="badge">{r.status}</span> },
        {
          key: "delivered",
          label: "ডেলিভারি",
          render: (r) => (
            <>
              <span className={`badge ${r.delivered ? "yes" : "no"}`}>{r.delivered ? "Yes" : "No"}</span>
              {r.deliveryLink && (
                <div>
                  <a href={r.deliveryLink} target="_blank" rel="noreferrer">
                    {r.deliveryLink}
                  </a>
                </div>
              )}
            </>
          ),
        },
        { key: "tasks", label: "কাজের বিবরণ", render: (r) => <ListView items={r.tasks} check /> },
        { key: "note", label: "নোট" },
      ]}
    />
  );
}
