"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import {
  sanitizeCurrencyInput,
  validateCampaignForm,
  type CampaignFormValues,
  type CampaignFormErrors,
} from "@/lib/validation";
import type { Campaign } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CampaignForm({
  onCreated,
  pushToast,
}: {
  onCreated: (c: Campaign) => void;
  pushToast: (m: string, t: "success" | "error") => void;
}) {
  // local state for each input in the form
  const [name, setName] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [amount, setAmount] = useState<number>(100); 
  const [currency, setCurrency] = useState("SEK"); 
  const [prefix, setPrefix] = useState("DISCOUNT"); 
  const [errors, setErrors] = useState<CampaignFormErrors>({}); 

  // access queryClient --> lets us invalidate cache later
  const queryClient = useQueryClient();

  // mutation for creating a campaign
  const createMutation = useMutation({
    mutationFn: (values: Omit<Campaign, "id">) => api.createCampaign(values),
    onSuccess: (created) => {
      // invalidate cache so campaigns refresh everywhere
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });

      // still notify parent directly (keeps compatibility with DashboardPage)
      onCreated(created);

      // reset inputs
      setName("");
      setValidFrom("");
      setValidTo("");
      setAmount(100);
      setCurrency("SEK");
      setPrefix("DISCOUNT");

      pushToast("Campaign created", "success");
    },
    onError: (e: any) => {
      let msg = "Create failed";
      if (e?.error) msg = e.error;
      else if (e?.message) msg = e.message;
      else {
        try {
          msg = JSON.stringify(e);
        } catch {
          msg = String(e);
        }
      }
      pushToast(msg, "error");
    },
  });

  // handle submit
  async function submit() {
    const values: CampaignFormValues = {
      name,
      validFrom,
      validTo,
      amount,
      currency,
      prefix,
    };

    // validate before hitting backend
    const errs = validateCampaignForm(values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      pushToast("Please fix the highlighted fields", "error");
      return;
    }

    setErrors({});
    createMutation.mutate({
      name: values.name.trim(),
      validFrom: new Date(values.validFrom).toISOString(),
      validTo: new Date(values.validTo).toISOString(),
      amount: values.amount,
      currency: values.currency.toUpperCase(),
      prefix: values.prefix.toUpperCase(),
    });
  }

  return (
    <div className="card">
      {errors.general && <div className="error-banner">{errors.general}</div>}

      <div className="grid grid-2">
        {/* campaign name */}
        <div>
          <label className="label" htmlFor="campaign-name">
            Name
          </label>
          <input
            id="campaign-name"
            className={`input ${errors.name ? "input-error" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Transiett Campaign"
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>

        {/* amount */}
        <div>
          <label className="label" htmlFor="campaign-amount">
            Amount
          </label>
          <input
            id="campaign-amount"
            className={`input ${errors.amount ? "input-error" : ""}`}
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          {errors.amount && <div className="error-text">{errors.amount}</div>}
        </div>

        {/* currency */}
        <div>
          <label className="label" htmlFor="campaign-currency">
            Currency (ISO)
          </label>
          <input
            id="campaign-currency"
            className={`input ${errors.currency ? "input-error" : ""}`}
            value={currency}
            onChange={(e) => setCurrency(sanitizeCurrencyInput(e.target.value))}
            placeholder="SEK"
            inputMode="text"
            autoCapitalize="characters"
            maxLength={3}
          />
          {errors.currency && (
            <div className="error-text">{errors.currency}</div>
          )}
        </div>

        {/* prefix */}
        <div>
          <label className="label" htmlFor="campaign-prefix">
            Prefix
          </label>
          <input
            id="campaign-prefix"
            className={`input ${errors.prefix ? "input-error" : ""}`}
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="DISCOUNT"
          />
          {errors.prefix && <div className="error-text">{errors.prefix}</div>}
        </div>

        {/* validFrom */}
        <div>
          <label className="label" htmlFor="campaign-validFrom">
            Valid From
          </label>
          <input
            id="campaign-validFrom"
            className={`input ${errors.date ? "input-error" : ""}`}
            type="datetime-local"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </div>

        {/* validTo */}
        <div>
          <label className="label" htmlFor="campaign-validTo">
            Valid To
          </label>
          <input
            id="campaign-validTo"
            className={`input ${errors.date ? "input-error" : ""}`}
            type="datetime-local"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
          />
          {errors.date && <div className="error-text">{errors.date}</div>}
        </div>
      </div>

      {/* submit button */}
      <div className="row" style={{ textAlign: "center" }}>
        <button
          className="btn btn-primary"
          disabled={createMutation.isPending}
          onClick={submit}
        >
          {createMutation.isPending ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </div>
  );
}
