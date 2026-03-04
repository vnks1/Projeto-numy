import numeral from "numeral";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDate(value: string | null) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

export function formatSource(source: string) {
  return source || "-";
}

function uppercaseAbbreviation(value: string) {
  return value.replace(/[kmbt]$/i, (suffix) => suffix.toUpperCase());
}

export function formatMetric(value: number, mode: "full" | "compact" = "full") {
  if (mode === "compact") {
    return uppercaseAbbreviation(numeral(value).format("0.[00]a"));
  }

  return new Intl.NumberFormat("pt-BR").format(value);
}
