"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Voucher } from "@/lib/api";
import SectionTitle from "../blocks/SectionTitle";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export default function VoucherList({
  campaignId,
  reloadKey,
}: {
  campaignId: string;
  reloadKey: number;
}) {
  // local UI states
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const pageSize = 50;

  // fetch vouchers with React Query
  const { data: vouchers = [], isLoading } = useQuery<Voucher[]>({
    queryKey: ["vouchers", campaignId, reloadKey],
    queryFn: () => api.listVouchers(campaignId),
    placeholderData: keepPreviousData,
  });

  // filter list by query string
  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return vouchers;
    return vouchers.filter(
      (v) => v.code.includes(q) || v.id.toUpperCase().includes(q)
    );
  }, [vouchers, query]);

  // how many pages we got
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // slice the right page of vouchers
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <div className="card">
      {/* header section: title + search + download csv */}
      <div
        className="row"
        style={{ justifyContent: "space-between", marginBottom: 12 }}
      >
        <SectionTitle>Vouchers ({filtered.length})</SectionTitle>
        <div className="row">
          <input
            className="input"
            placeholder="Search code or id…"
            value={query}
            onChange={(e) => {
              setPage(1); // reset to first page when search changes
              setQuery(e.target.value);
            }}
            style={{ width: 220 }}
          />
          {/* link to download csv directly from backend */}
          <a className="btn btn-ghost" href={api.csvUrl(campaignId)}>
            Download CSV
          </a>
        </div>
      </div>

      {/* conditional render: show loading, empty state or table */}
      {isLoading ? (
        <div className="card">Loading vouchers…</div>
      ) : !filtered.length ? (
        <div className="card">No vouchers match your search.</div>
      ) : (
        <>
          <div className="voucher-list">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((v) => (
                  <tr key={v.id}>
                    <td className="code">{v.code}</td>
                    <td className="muted">{v.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* footer pagination controls */}
          <div className="row" style={{ marginTop: 12 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="badge">
              Page {page} / {pages}
            </span>
            <button
              className="btn btn-ghost"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
