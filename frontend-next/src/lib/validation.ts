// this type is basically all the fields in the create campaign form
export type CampaignFormValues = {
  name: string;
  validFrom: string;
  validTo: string;
  amount: number;
  currency: string;
  prefix: string;
};

// errors for the form – only some fields can have them so i used Partial
export type CampaignFormErrors = Partial<
  Record<"name" | "amount" | "currency" | "prefix" | "date" | "general", string>
>;

// --- Field-level validators ---
// check if currency looks like 3 letters (ISO format basically)
export function validateCurrency(code: string): boolean {
  return /^[A-Za-z]{3}$/.test(code.trim()); // must be 3 chars long
}

// sanitize user input → strip weird chars, keep only letters, uppercase
export function sanitizeCurrencyInput(raw: string): string {
  return raw
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 3);
}

// prefix should be at least 3 chars (otherwise too short)
export function validatePrefix(prefix: string): boolean {
  return prefix.trim().length >= 3;
}

// check amount > 0 and is a real number
export function validateAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0;
}

// simple check: start date must be before end date
export function validateDateRange(from: string, to: string): boolean {
  if (!from || !to) return false;
  return new Date(from).getTime() < new Date(to).getTime();
}

// --- Form-level validator (returns error messages) ---
// runs all the above checks together and collects errors into object
export function validateCampaignForm(
  values: CampaignFormValues
): CampaignFormErrors {
  const errs: CampaignFormErrors = {};

  if (!values.name.trim()) errs.name = "Campaign name is required";
  if (!validateAmount(values.amount))
    errs.amount = "Amount must be greater than 0";
  if (!validateCurrency(values.currency))
    errs.currency = "Currency must be 3 letters (e.g. EUR)";
  if (!validatePrefix(values.prefix))
    errs.prefix = "Prefix must be at least 3 characters";

  if (!values.validFrom || !values.validTo) {
    errs.date = "Both dates are required";
  } else if (!validateDateRange(values.validFrom, values.validTo)) {
    errs.date = "Valid From must be before Valid To";
  }

  return errs;
}

// ---- Formatters ----
// format numbers into nice currency text with fallback if Intl fails
export function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    // if browser doesnt support the currency code, fallback
    return `${amount} ${currency}`;
  }
}
