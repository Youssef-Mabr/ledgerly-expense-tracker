export const formatMYR = (amount: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
  });
