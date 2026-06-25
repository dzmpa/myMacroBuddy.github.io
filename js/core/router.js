export const APP_PAGES = [
  "calculator",
  "today",
  "search",
  "suggestions",
  "progress",
  "settings",
];

export function isValidAppPage(page) {
  return APP_PAGES.includes(
    String(page || "")
      .trim()
      .toLowerCase(),
  );
}

export function getActiveAppPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedPage = String(params.get("page") || "")
    .trim()
    .toLowerCase();

  return isValidAppPage(requestedPage) ? requestedPage : "calculator";
}

export function setActiveAppPage(nextPage, { replace = false } = {}) {
  const normalizedPage = String(nextPage || "")
    .trim()
    .toLowerCase();

  if (!isValidAppPage(normalizedPage)) {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("page", normalizedPage);

  if (replace) {
    window.history.replaceState({}, "", url);
  } else {
    window.history.pushState({}, "", url);
  }

  renderPageNavigation();
  window.scrollTo({ top: 0, behavior: "auto" });
}

export function renderPageNavigation() {
  const activePage = getActiveAppPage();

  document.querySelectorAll("[data-page-link]").forEach((button) => {
    const isActive = button.dataset.pageLink === activePage;

    button.classList.toggle("border-emerald-500", isActive);
    button.classList.toggle("bg-emerald-500", isActive);
    button.classList.toggle("text-slate-950", isActive);
    button.classList.toggle("text-slate-200", !isActive);
    button.classList.toggle("border-slate-700", !isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  document.querySelectorAll("[data-app-page]").forEach((section) => {
    const isActive = section.dataset.appPage === activePage;

    section.classList.toggle("hidden", !isActive);
    section.setAttribute("aria-hidden", isActive ? "false" : "true");

    if (section instanceof HTMLDetailsElement) {
      section.open = isActive;
    }
  });
}

export function bindPageNavigation() {
  document.querySelectorAll("[data-page-link]").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveAppPage(button.dataset.pageLink);
    });
  });

  window.addEventListener("popstate", () => {
    renderPageNavigation();
  });
}
