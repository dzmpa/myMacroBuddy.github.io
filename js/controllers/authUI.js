import { state, setState } from "../state.js";
import { loginAccount, registerAccount, logout, getAccountStorageKey, hasAnyAccounts, hasLegacyData, readLegacyData } from "../auth.js";
import { importBackupPayload } from "../storage.js";
import { lbsToKg, ftInToCm } from "../core/units.js";
import { safeNumber } from "../utils.js";
import { bootApp } from "../main.js"; // Need to import bootApp from main.js

export let authRegUnitMode = "metric";

export function applyAuthRegUnitMode(mode) {
  authRegUnitMode = mode === "imperial" ? "imperial" : "metric";
  const isImperial = authRegUnitMode === "imperial";

  const metricBtn = document.getElementById("authRegUnitMetric");
  const imperialBtn = document.getElementById("authRegUnitImperial");
  if (metricBtn) {
    metricBtn.classList.toggle("bg-emerald-500", !isImperial);
    metricBtn.classList.toggle("text-slate-950", !isImperial);
    metricBtn.classList.toggle("bg-slate-800", isImperial);
    metricBtn.classList.toggle("text-slate-300", isImperial);
  }
  if (imperialBtn) {
    imperialBtn.classList.toggle("bg-emerald-500", isImperial);
    imperialBtn.classList.toggle("text-slate-950", isImperial);
    imperialBtn.classList.toggle("bg-slate-800", !isImperial);
    imperialBtn.classList.toggle("text-slate-300", !isImperial);
  }

  const weightLabel = document.getElementById("authRegWeightLabel");
  const weightInput = document.getElementById("authRegWeight");
  if (weightLabel) weightLabel.textContent = isImperial ? "Weight (lbs)" : "Weight (kg)";
  if (weightInput) weightInput.placeholder = isImperial ? "160" : "72";

  const cmWrap = document.getElementById("authRegHeightCmWrap");
  const impWrap = document.getElementById("authRegHeightImperialWrap");
  if (cmWrap) cmWrap.classList.toggle("hidden", isImperial);
  if (impWrap) impWrap.classList.toggle("hidden", !isImperial);
}

export function showAuthTab(tab) {
  const loginPanel = document.getElementById("authLoginPanel");
  const regPanel = document.getElementById("authRegisterPanel");
  const loginBtn = document.getElementById("authTabLoginBtn");
  const regBtn = document.getElementById("authTabRegisterBtn");

  const isLogin = tab === "login";
  loginPanel?.classList.toggle("hidden", !isLogin);
  regPanel?.classList.toggle("hidden", isLogin);

  if (loginBtn) {
    loginBtn.classList.toggle("bg-emerald-500", isLogin);
    loginBtn.classList.toggle("text-slate-950", isLogin);
    loginBtn.classList.toggle("text-slate-400", !isLogin);
    loginBtn.setAttribute("aria-selected", String(isLogin));
  }
  if (regBtn) {
    regBtn.classList.toggle("bg-emerald-500", !isLogin);
    regBtn.classList.toggle("text-slate-950", !isLogin);
    regBtn.classList.toggle("text-slate-400", isLogin);
    regBtn.setAttribute("aria-selected", String(!isLogin));
  }
}

export function showAuthError(panelId, message) {
  const el = document.getElementById(panelId);
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

export function clearAuthError(panelId) {
  const el = document.getElementById(panelId);
  if (el) el.classList.add("hidden");
}

export function setAuthButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading
    ? (btnId === "authLoginSubmitBtn" ? "Signing in…" : "Creating account…")
    : (btnId === "authLoginSubmitBtn" ? "Sign in" : "Create account & get started");
}

export function readAuthRegFormHeight() {
  if (authRegUnitMode === "imperial") {
    return ftInToCm(
      safeNumber(document.getElementById("authRegHeightFt")?.value),
      safeNumber(document.getElementById("authRegHeightIn")?.value),
    );
  }
  return safeNumber(document.getElementById("authRegHeight")?.value);
}

export function updateUserBadge(account) {
  const badge = document.getElementById("userSessionBadge");
  const initial = document.getElementById("userAvatarInitial");
  const name = document.getElementById("userDisplayName");
  if (!badge || !account) return;
  const displayName = [account.firstName, account.lastName].filter(Boolean).join(" ") || account.username;
  if (initial) initial.textContent = displayName.charAt(0).toUpperCase();
  if (name) name.textContent = displayName;
  badge.classList.remove("hidden");
}

export function dismissAuthOverlay() {
  const overlay = document.getElementById("authOverlay");
  const appRoot = document.getElementById("appRoot");
  if (overlay) overlay.classList.add("hidden");
  if (appRoot) appRoot.classList.remove("hidden");
}

export async function handleAuthLogin(setActiveStorageKeyFn, loadFromStorageFn) {
  clearAuthError("authLoginError");
  const username = document.getElementById("authLoginUsername")?.value ?? "";
  const password = document.getElementById("authLoginPassword")?.value ?? "";
  const remember = document.getElementById("authLoginRemember")?.checked ?? false;

  setAuthButtonLoading("authLoginSubmitBtn", true);
  try {
    const account = await loginAccount(username, password, remember);
    const activeStorageKey = getAccountStorageKey(account.username);
    setActiveStorageKeyFn(activeStorageKey);

    let stored = null;
    try { stored = await loadFromStorageFn(activeStorageKey); } catch {}
    if (stored) setState(stored);

    await bootApp(account);
  } catch (err) {
    showAuthError("authLoginError", err.message);
  } finally {
    setAuthButtonLoading("authLoginSubmitBtn", false);
  }
}

export async function handleAuthRegister(setActiveStorageKeyFn) {
  clearAuthError("authRegError");

  const username = document.getElementById("authRegUsername")?.value ?? "";
  const email = document.getElementById("authRegEmail")?.value ?? "";
  const password = document.getElementById("authRegPassword")?.value ?? "";
  const passwordConfirm = document.getElementById("authRegPasswordConfirm")?.value ?? "";
  const firstName = document.getElementById("authRegFirstName")?.value ?? "";
  const lastName = document.getElementById("authRegLastName")?.value ?? "";
  const gender = document.getElementById("authRegGender")?.value ?? "";
  const age = safeNumber(document.getElementById("authRegAge")?.value);
  const goal = document.getElementById("authRegGoal")?.value ?? "maintenance";
  const activityLevel = document.getElementById("authRegActivity")?.value ?? "";
  const remember = document.getElementById("authRegRemember")?.checked ?? true;
  const importLegacy = document.getElementById("authImportLegacy")?.checked ?? false;

  // Client-side validation
  if (password !== passwordConfirm) {
    showAuthError("authRegError", "Passwords do not match.");
    return;
  }
  if (!gender) {
    showAuthError("authRegError", "Please select your gender.");
    return;
  }
  if (!age || age < 10) {
    showAuthError("authRegError", "Please enter a valid age.");
    return;
  }
  if (!activityLevel) {
    showAuthError("authRegError", "Please select your activity level.");
    return;
  }

  const weightRaw = safeNumber(document.getElementById("authRegWeight")?.value);
  const weightKg = authRegUnitMode === "imperial" ? lbsToKg(weightRaw) : weightRaw;
  const heightCm = readAuthRegFormHeight();

  if (!weightKg || weightKg < 20) {
    showAuthError("authRegError", "Please enter a valid weight.");
    return;
  }
  if (!heightCm || heightCm < 100) {
    showAuthError("authRegError", "Please enter a valid height.");
    return;
  }

  setAuthButtonLoading("authRegSubmitBtn", true);
  try {
    const cleanUsername = await registerAccount({ username, password, email, firstName, lastName });
    const activeStorageKey = getAccountStorageKey(cleanUsername);
    setActiveStorageKeyFn(activeStorageKey);

    // Set session (use the already-imported loginAccount)
    await loginAccount(cleanUsername, password, remember);

    // Build initial state with profile already filled in
    const profile = {
      name: [firstName, lastName].filter(Boolean).join(" "),
      age,
      weight: weightKg,
      height: heightCm,
      gender,
      goal,
      activityLevel,
      mealsPerDay: 4,
      completedAt: new Date().toISOString(),
    };

    let baseState = null;
    if (importLegacy && hasLegacyData()) {
      try {
        const legacyRaw = readLegacyData();
        if (legacyRaw) {
          baseState = importBackupPayload(legacyRaw);
        }
      } catch {}
    }

    if (baseState) {
      setState({ ...baseState, userProfile: profile });
    } else {
      setState({ userProfile: profile });
    }

    // requireProfile and revalidateProfileState will be called inside bootApp
    const account = { username: cleanUsername, firstName, lastName, email };
    await bootApp(account);
  } catch (err) {
    showAuthError("authRegError", err.message);
  } finally {
    setAuthButtonLoading("authRegSubmitBtn", false);
  }
}

export function bindAuthOverlay(setActiveStorageKeyFn, loadFromStorageFn) {
  // Tab switches
  document.getElementById("authTabLoginBtn")?.addEventListener("click", () => showAuthTab("login"));
  document.getElementById("authTabRegisterBtn")?.addEventListener("click", () => showAuthTab("register"));
  document.getElementById("authGoToRegisterBtn")?.addEventListener("click", () => showAuthTab("register"));
  document.getElementById("authGoToLoginBtn")?.addEventListener("click", () => showAuthTab("login"));

  // Unit toggle on register form
  document.getElementById("authRegUnitMetric")?.addEventListener("click", () => applyAuthRegUnitMode("metric"));
  document.getElementById("authRegUnitImperial")?.addEventListener("click", () => applyAuthRegUnitMode("imperial"));

  // Login form
  document.getElementById("authLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAuthLogin(setActiveStorageKeyFn, loadFromStorageFn);
  });

  // Register form
  document.getElementById("authRegisterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAuthRegister(setActiveStorageKeyFn);
  });

  // Show legacy import box if old data exists
  if (hasLegacyData()) {
    document.getElementById("authLegacyImportBox")?.classList.remove("hidden");
  }

  // If accounts exist, default to login; else default to register
  if (!hasAnyAccounts()) {
    showAuthTab("register");
  }
}

export function bindLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn || logoutBtn.dataset.bound === "true") return;
  logoutBtn.dataset.bound = "true";
  logoutBtn.addEventListener("click", () => {
    logout();
    // Reload page to reset all app state cleanly
    window.location.reload();
  });
}
