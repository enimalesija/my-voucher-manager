"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Campaign } from "@/lib/api";
import { formatCurrency } from "@/lib/validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CampaignList({
  campaigns,
  activeId,
  setActiveId,
  onUpdated,
  onToast,
  onReload,
}: {
  campaigns: Campaign[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onUpdated: () => void;
  onToast: (t: { msg: string; type: "success" | "error" }) => void;
  onReload: () => void;
}) {
  // keeping track of how many vouchers to generate for each campaign
  const [genCount, setGenCount] = useState<{ [id: string]: number }>({});

  const queryClient = useQueryClient();

  // mutation: delete campaign
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCampaign(id),
    onSuccess: (_data, id) => {
      onToast({ msg: "Campaign deleted 🗑️", type: "success" });
      if (activeId === id) setActiveId(null);

      // invalidate cached list of campaigns
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });

      // keep callback for parent compatibility
      onUpdated();
    },
    onError: (e: any) => {
      onToast({ msg: `Delete failed: ${e.message}`, type: "error" });
    },
  });

  // mutation: generate vouchers
  const generateMutation = useMutation({
    mutationFn: ({ id, count }: { id: string; count: number }) =>
      api.createVouchers(id, count),
    onSuccess: (res) => {
      onToast({
        msg: `Generated ${res.created} vouchers 🎟️`,
        type: "success",
      });

      // refresh vouchers cache
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });

      // keep compatibility
      onReload();
    },
    onError: (e: any) => {
      onToast({ msg: `Generate failed: ${e.message}`, type: "error" });
    },
  });

  // wrapper delete
  function handleDelete(id: string) {
    deleteMutation.mutate(id);
  }

  // wrapper generate
  function handleGenerate(id: string) {
    const count = genCount[id] || 10;
    generateMutation.mutate({ id, count });
  }

  // if no campaigns at all
  if (!campaigns.length) {
    return <div className="card muted">No campaigns yet.</div>;
  }

  return (
    <div className="card">
      <h2 className="section-title">Campaigns</h2>
      <div className="campaign-list">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className={`campaign-card ${activeId === c.id ? "active" : ""}`}
            onClick={() => setActiveId(c.id)} // clicking selects the campaign
          >
            {/* top row: campaign name + validity dates */}
            <div className="row space-between">
              <div>
                <div className="title">{c.name}</div>
                <div className="muted small">
                  {new Date(c.validFrom).toLocaleDateString()} →{" "}
                  {new Date(c.validTo).toLocaleDateString()}
                </div>
              </div>
              {/* prefix shown as badge */}
              <span className="badge">{c.prefix}</span>
            </div>

            {/* bottom row: amount + controls */}
            <div className="row space-between" style={{ marginTop: 8 }}>
              <span>{formatCurrency(c.amount, c.currency)}</span>
              <div className="row">
                {/* input for how many vouchers to generate */}
                <input
                  className="input small"
                  type="number"
                  min={1}
                  max={100000}
                  value={genCount[c.id] || 10}
                  onChange={(e) =>
                    setGenCount({ ...genCount, [c.id]: Number(e.target.value) })
                  }
                  style={{ width: 70 }}
                />
                {/* generate btn */}
                <button
                  className="btn btn-ghost small"
                  onClick={() => handleGenerate(c.id)}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? "…" : "Generate"}
                </button>
                {/* delete btn */}
                <button
                  className="btn btn-ghost small"
                  onClick={() => handleDelete(c.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
