"use client";

/* -----------------------------------------
   Dashboard Part Imports
----------------------------------------- */
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, type Campaign } from "@/lib/api";
import NotificationBar from "@/components/blocks/NotificationBar";
import ConfirmModal from "@/components/blocks/ConfirmModal";
import CampaignForm from "@/components/campaigns/CampaignForm";
import CampaignTable from "@/components/campaigns/CampaignTable";
import VoucherList from "@/components/vouchers/VoucherPanel";
import ThemeToggle from "@/components/blocks/ThemeToggle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* helper – formats currency safely */
function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function DashboardPage() {
  // local UI state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [notification, setNotification] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const [activePanel, setActivePanel] = useState<
    "dashboard" | "campaigns" | "inspect" | "create"
  >("dashboard");

  const queryClient = useQueryClient();

  // toast helper
  function pushToast(msg: string, type: "success" | "error") {
    setNotification({ msg, type });
    setTimeout(() => setNotification((n) => (n?.msg === msg ? null : n)), 5000);
  }

  // campaigns query (fetch all campaigns)
  const { data: campaigns = [], isLoading: campaignsLoading } =
    useQuery<Campaign[]>({
      queryKey: ["campaigns"],
      queryFn: api.listCampaigns,
    });

  // keep activeId in sync when campaigns change
  useEffect(() => {
    if (campaigns.length) {
      if (!activeId || !campaigns.find((c) => c.id === activeId)) {
        setActiveId(campaigns[0].id);
      }
    } else {
      setActiveId(null);
    }
  }, [campaigns, activeId]);

  // delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCampaign(id),
    onSuccess: (_, id) => {
      if (activeId === id) setActiveId(null);
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      pushToast("Campaign deleted", "success");
    },
    onError: (e: any) => {
      pushToast(`Delete failed: ${e.message}`, "error");
    },
  });

  // generate vouchers mutation
  const generateMutation = useMutation({
    mutationFn: async ({ id, count }: { id: string; count: number }) => {
      const t0 = performance.now();
      const res = await api.createVouchers(id, count);
      const t1 = performance.now();
      return { ...res, ms: Math.round(t1 - t0) };
    },
    onSuccess: (res) => {
      setReloadKey((k) => k + 1); // tell VoucherList to reload
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      pushToast(
        `Generated ${res.created} vouchers in ${res.ms} ms`,
        "success"
      );
    },
    onError: (e: any) => {
      pushToast(`Generate failed: ${e.message}`, "error");
    },
  });

  // open confirm modal
  function askDelete(id: string) {
    setConfirm({ open: true, id });
  }

  // confirm deletion → now uses deleteMutation
  function confirmDelete() {
    if (!confirm.id) return;
    deleteMutation.mutate(confirm.id);
    setConfirm({ open: false });
  }

  // generate vouchers (trigger mutation)
  function handleGenerate(id: string, count: number) {
    if (count > 100000) {
      pushToast("Max 100,000 vouchers", "error");
      return;
    }
    generateMutation.mutate({ id, count });
  }

  // find current campaign
  const activeCampaign = campaigns.find((c) => c.id === activeId) || null;

  return (
    <>
      {/* ---------- App Shell ---------- */}
      <div className="shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <Link href="/" className="brand">
            <Image
              src="/logo.png"
              alt="My Voucher Manager"
              width={180}
              height={40}
              priority
            />
          </Link>

          <nav className="nav">
            <span className="nav-label">Workspace</span>
            <ul>
              {["dashboard", "campaigns", "inspect", "create"].map((panel) => (
                <li
                  key={panel}
                  className={`nav-item ${
                    activePanel === panel ? "nav-active" : ""
                  }`}
                  onClick={() => setActivePanel(panel as typeof activePanel)}
                >
                  <span className="nav-dot" />
                  {panel.charAt(0).toUpperCase() + panel.slice(1)}
                </li>
              ))}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <ThemeToggle />
          </div>
        </aside>

        {/* ---------- Main content ---------- */}
        <div className="main">
          {/* toast container */}
          {notification && (
            <div className="toast-container">
              <NotificationBar
                message={notification.msg}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            </div>
          )}

          {/* ========== DASHBOARD (overview + all panels) ========== */}
          {activePanel === "dashboard" && (
            <>
              {/* quick stats */}
              <section className="overview">
                <div className="stat">
                  <div className="stat-top">
                    <span className="stat-label">Total Campaigns</span>
                    <span className="chip live">LIVE</span>
                  </div>
                  <div className="stat-value">
                    {campaignsLoading ? "…" : campaigns.length}
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-top">
                    <span className="stat-label">Active Campaign</span>
                  </div>
                  <div className="stat-value">
                    {activeCampaign ? activeCampaign.name : "—"}
                  </div>
                  {activeCampaign && (
                    <div className="stat-sub">
                      {activeCampaign.prefix} ·{" "}
                      {formatCurrency(
                        activeCampaign.amount,
                        activeCampaign.currency
                      )}
                    </div>
                  )}
                </div>

                <div className="stat">
                  <div className="stat-top">
                    <span className="stat-label">Currency</span>
                  </div>
                  <div className="stat-value">
                    {activeCampaign ? activeCampaign.currency : "—"}
                  </div>
                </div>
              </section>

              {/* full grid */}
              <main className="grid grid-3">
                {/* create campaign */}
                <section className="panel panel-create">
                  <h2 className="panel-title">Create Campaign</h2>
                  <div className="panel-body">
                    <CampaignForm
                      onCreated={() =>
                        queryClient.invalidateQueries({ queryKey: ["campaigns"] })
                      }
                      pushToast={pushToast}
                    />
                  </div>
                </section>

                {/* campaigns */}
                <section className="panel panel-campaigns">
                  <div className="panel-title-row">
                    <h2 className="panel-title">Campaigns</h2>
                    <span className="panel-sub">
                      {campaigns.length
                        ? `${campaigns.length} total`
                        : "No campaigns yet"}
                    </span>
                  </div>
                  <div className="panel-body">
                    <CampaignTable
                      campaigns={campaigns}
                      onAskDelete={askDelete}
                      onGenerate={handleGenerate}
                    />
                  </div>
                </section>

                {/* inspect */}
                <section className="panel panel-inspect">
                  <h2 className="panel-title">Inspect</h2>
                  <label className="label" htmlFor="campaignSelect">
                    Choose campaign
                  </label>
                  <div className="select-row">
                    <select
                      id="campaignSelect"
                      className="select"
                      value={activeId ?? ""}
                      onChange={(e) => setActiveId(e.target.value)}
                    >
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.prefix} (
                          {formatCurrency(c.amount, c.currency)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="panel-body compact">
                    {activeId ? (
                      <div className="voucher-wrap">
                        <VoucherList
                          campaignId={activeId}
                          reloadKey={reloadKey}
                        />
                      </div>
                    ) : (
                      <div className="empty">
                        <div className="empty-badge">Tip</div>
                        <p>Select a campaign to preview its vouchers.</p>
                      </div>
                    )}
                  </div>
                </section>
              </main>
            </>
          )}

          {/* ========== SINGLE VIEWS ========== */}
          {activePanel === "create" && (
            <section className="panel panel-create">
              <h2 className="panel-title">Create Campaign</h2>
              <div className="panel-body">
                <CampaignForm
                  onCreated={() =>
                    queryClient.invalidateQueries({ queryKey: ["campaigns"] })
                  }
                  pushToast={pushToast}
                />
              </div>
            </section>
          )}

          {activePanel === "campaigns" && (
            <section className="panel panel-campaigns">
              <div className="panel-title-row">
                <h2 className="panel-title">Campaigns</h2>
                <span className="panel-sub">
                  {campaigns.length
                    ? `${campaigns.length} total`
                    : "No campaigns yet"}
                </span>
              </div>
              <div className="panel-body">
                <CampaignTable
                  campaigns={campaigns}
                  onAskDelete={askDelete}
                  onGenerate={handleGenerate}
                />
              </div>
            </section>
          )}

          {activePanel === "inspect" && (
            <section className="panel panel-inspect">
              <h2 className="panel-title">Inspect</h2>
              <label className="label" htmlFor="campaignSelect">
                Choose campaign
              </label>
              <div className="select-row">
                <select
                  id="campaignSelect"
                  className="select"
                  value={activeId ?? ""}
                  onChange={(e) => setActiveId(e.target.value)}
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.prefix} (
                      {formatCurrency(c.amount, c.currency)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="panel-body compact">
                {activeId ? (
                  <div className="voucher-wrap">
                    <VoucherList campaignId={activeId} reloadKey={reloadKey} />
                  </div>
                ) : (
                  <div className="empty">
                    <div className="empty-badge">Tip</div>
                    <p>Select a campaign to preview its vouchers.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* footer */}
          <footer className="credits">
            <span>
              Developed for Transiett AB Assignment by:{" "}
              <a
                href="https://www.amalesija.se"
                target="_blank"
                rel="noopener noreferrer"
                className="cool-link"
              >
                A.Malesija
              </a>
            </span>
          </footer>
        </div>
      </div>

      {/* confirm modal */}
      <ConfirmModal
        open={confirm.open}
        title="Delete this campaign?"
        desc="This will remove the campaign and all its vouchers."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false })}
      />
    </>
  );
}
