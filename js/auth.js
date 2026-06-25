// ---------------------------------------------------------------------------
// auth.js — Client-side account management for myMacroBuddy
// Passwords are hashed with SHA-256 (Web Crypto API) — never stored in plain text.
// ---------------------------------------------------------------------------

const ACCOUNTS_KEY = "mmb_accounts_v1";
const SESSION_KEY = "mmb_session_v1";
const LEGACY_DATA_KEYS = ["fitnessDataV6", "fitnessDataV5"];

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(password));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

function normalizeUsername(username) {
  return String(username ?? "").trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the per-account IndexedDB / localStorage key.
 * e.g. getAccountStorageKey("john") → "fitnessDataV6:john"
 */
export function getAccountStorageKey(username) {
  return `fitnessDataV6:${normalizeUsername(username)}`;
}

/**
 * Returns the currently logged-in username, or null.
 * Checks sessionStorage first, then localStorage (remember-me).
 */
export function getActiveSession() {
  try {
    return (
      sessionStorage.getItem(SESSION_KEY) ||
      localStorage.getItem(SESSION_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Returns the full account object for the active session, or null.
 */
export function getActiveAccount() {
  const username = getActiveSession();
  if (!username) return null;
  return getAccountByUsername(username);
}

/**
 * Returns the account object for a username, or null.
 */
export function getAccountByUsername(username) {
  const accounts = readAccounts();
  return accounts[normalizeUsername(username)] ?? null;
}

/**
 * True if at least one account has been registered on this device.
 */
export function hasAnyAccounts() {
  return Object.keys(readAccounts()).length > 0;
}

/**
 * True if pre-account (single-user) fitness data exists in the browser.
 */
export function hasLegacyData() {
  return LEGACY_DATA_KEYS.some((key) => {
    try { return !!localStorage.getItem(key); } catch { return false; }
  });
}

/**
 * Returns the raw JSON string of the first legacy data key found, or null.
 */
export function readLegacyData() {
  for (const key of LEGACY_DATA_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return raw;
    } catch {}
  }
  return null;
}

/**
 * Registers a new account. Throws a human-readable Error on validation failure.
 * @returns {string} The normalised username.
 */
export async function registerAccount({ username, password, email, firstName, lastName }) {
  const clean = normalizeUsername(username);

  if (!clean || clean.length < 3)
    throw new Error("Username must be at least 3 characters.");
  if (!/^[a-z0-9_.+-]+$/.test(clean))
    throw new Error("Username can only contain letters, numbers, _, ., + or -.");
  if (!password || String(password).length < 6)
    throw new Error("Password must be at least 6 characters.");
  if (!email || !String(email).includes("@"))
    throw new Error("Please enter a valid email address.");

  const accounts = readAccounts();
  if (accounts[clean])
    throw new Error("That username is already taken. Please choose another.");

  const passwordHash = await hashPassword(password);

  accounts[clean] = {
    username: clean,
    firstName: String(firstName ?? "").trim(),
    lastName: String(lastName ?? "").trim(),
    email: String(email ?? "").trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  writeAccounts(accounts);
  return clean;
}

/**
 * Logs in. Sets session in sessionStorage always, and also in localStorage
 * if rememberMe is true. Throws on invalid credentials.
 * @returns {object} The account info object.
 */
export async function loginAccount(username, password, rememberMe = false) {
  const clean = normalizeUsername(username);
  const accounts = readAccounts();
  const account = accounts[clean];

  if (!account)
    throw new Error("Account not found. Check your username and try again.");

  const hash = await hashPassword(password);
  if (hash !== account.passwordHash)
    throw new Error("Incorrect password. Please try again.");

  try { sessionStorage.setItem(SESSION_KEY, clean); } catch {}

  try {
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, clean);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {}

  return account;
}

/**
 * Clears the active session from both storages.
 */
export function logout() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}
