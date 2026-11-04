"use client";

import { COMPANY } from "@/lib/company";

export default function PrintHeader({ title }: { title: string }) {
  return (
    <>
      <div className="watermark" />
      <div className="phead">
        <img
          src={COMPANY.logo}
          alt=""
          className="plogo"
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
        <div>
          <h1>{COMPANY.name}</h1>
          {COMPANY.tagline && <div>{COMPANY.tagline}</div>}
          <div>
            📞 {COMPANY.phone} &nbsp; 🌐 {COMPANY.website}
            {COMPANY.email && <> &nbsp; ✉ {COMPANY.email}</>}
          </div>
          {COMPANY.address && <div>📍 {COMPANY.address}</div>}
        </div>
      </div>
      <h2 className="ptitle">{title}</h2>
    </>
  );
}
