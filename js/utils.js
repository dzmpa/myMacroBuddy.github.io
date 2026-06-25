export function safeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function roundTo(value, decimals = 1) {
  const factor = 10 ** Math.max(0, safeNumber(decimals));
  const roundedValue = Math.round(safeNumber(value) * factor) / factor;

  return Object.is(roundedValue, -0) ? 0 : roundedValue;
}

export function formatInputNumber(
  value,
  { decimals = 1, allowZero = true } = {},
) {
  const roundedValue = roundTo(value, decimals);

  if (!allowZero && roundedValue === 0) {
    return "";
  }

  if (Math.max(0, safeNumber(decimals)) === 0) {
    return String(Math.round(roundedValue));
  }

  return Number(roundedValue.toFixed(decimals)).toString();
}

export function formatDate(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return formatDate(new Date());
  }

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
}

export function clamp(value, min, max) {
  const numericValue = safeNumber(value);
  return Math.min(max, Math.max(min, numericValue));
}

export function uniqueStrings(values = []) {
  return Array.from(
    new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)),
  );
}
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getElementValue(id) {
  return document.getElementById(id)?.value ?? "";
}

export function syncInputValueIfBlank(id, value) {
  const input = document.getElementById(id);
  if (!input || document.activeElement === input) {
    return;
  }
  const isBlank = !input.value || String(input.value).trim() === "";
  if (isBlank) {
    input.value = value;
  }
}
