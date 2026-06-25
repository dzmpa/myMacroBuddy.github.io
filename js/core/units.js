import { safeNumber } from '../utils.js';

// Unit conversion helpers
export function lbsToKg(lbs) {
  return safeNumber(lbs) * 0.45359237;
}

export function kgToLbs(kg) {
  return safeNumber(kg) / 0.45359237;
}

export function ftInToCm(ft, inches) {
  return (safeNumber(ft) * 12 + safeNumber(inches)) * 2.54;
}

export function cmToFtIn(cm) {
  const totalInches = safeNumber(cm) / 2.54;
  return { ft: Math.floor(totalInches / 12), inches: Number((totalInches % 12).toFixed(1)) };
}

export function inToCm(inches) {
  return safeNumber(inches) * 2.54;
}

export function cmToIn(cm) {
  return Number((safeNumber(cm) / 2.54).toFixed(1));
}
