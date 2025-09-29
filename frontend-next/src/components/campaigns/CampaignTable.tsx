"use client";

import { useState } from "react";
import type { Campaign } from "@/lib/api";
import { formatCurrency } from "@/lib/validation";

function CampaignRow({
  c,
  onAskDelete,
  onGenerate,
}: {
  c: Campaign;
  onAskDelete: (id: string) => void;
  onGenerate: (id: string, count: number) => void;
}) {
  const [count, setCount] = useState(10);

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 700 }}>{c.name}</div>
        <div className="muted" style={{ fontSize: 13 }}>
          {new Date(c.validFrom).toLocaleString()} ⬇{" "}
          {new Date(c.validTo).toLocaleString()}
        </div>
      </td>

      <td>{formatCurrency(c.amount, c.currency)}</td>
      <td>
        <span className="badge">{c.prefix}</span>
      </td>

      <td colSpan={2}>
        <div
          className="row"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            paddingTop: 10,
            justifyContent: "flex-end",
          }}
        >
          <input
            className="input"
            style={{ width: 95, marginRight: "auto" }}
            type="number"
            min={1}
            max={100000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: 95 }}
            onClick={() => onGenerate(c.id, count)}
          >
            Generate
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ width: 95 }}
            onClick={() => onAskDelete(c.id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CampaignTable({
  campaigns,
  onAskDelete,
  onGenerate,
}: {
  campaigns: Campaign[];
  onAskDelete: (id: string) => void;
  onGenerate: (id: string, count: number) => void;
}) {
  if (!campaigns.length) {
    return <div className="badge">No campaigns yet.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Amount</th>
            <th>Prefix</th>
            <th>Vouchers</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <CampaignRow
              key={c.id}
              c={c}
              onAskDelete={onAskDelete}
              onGenerate={onGenerate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
