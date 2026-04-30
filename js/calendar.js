import { createEmptyDay, getState, setState } from "./state.js";
import { saveToStorage } from "./storage.js";
import { loadDay } from "./dashboard.js";
import { formatDate, safeNumber } from "./utils.js";

let onDateChange = () => {};

function hasDayData(day = createEmptyDay()) {
  return (
    safeNumber(day.kcal) > 0 ||
    safeNumber(day.prot) > 0 ||
    safeNumber(day.carb) > 0 ||
    safeNumber(day.fat) > 0 ||
    safeNumber(day.peso) > 0 ||
    safeNumber(day.agua) > 0 ||
    String(day.notes ?? "").trim().length > 0 ||
    (Array.isArray(day.foods) && day.foods.length > 0)
  );
}

function bindControls() {
  const prevButton = document.getElementById("prevMonth");
  const nextButton = document.getElementById("nextMonth");

  if (prevButton && prevButton.dataset.bound !== "true") {
    prevButton.dataset.bound = "true";
    prevButton.addEventListener("click", () => changeMonth(-1));
  }

  if (nextButton && nextButton.dataset.bound !== "true") {
    nextButton.dataset.bound = "true";
    nextButton.addEventListener("click", () => changeMonth(1));
  }
}

function changeMonth(delta) {
  const currentState = getState();
  const nextMonth = new Date(currentState.currentMonth);

  nextMonth.setDate(1);
  nextMonth.setMonth(nextMonth.getMonth() + delta);

  setState({ currentMonth: nextMonth });
  saveToStorage(getState());
  renderCalendar();
}

function handleDateSelect(dateValue) {
  const selectedDate = new Date(dateValue);
  const currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

  setState({
    selectedDate,
    currentMonth,
  });

  saveToStorage(getState());
  loadDay();
  renderCalendar();
  onDateChange();
}

export function initCalendar(options = {}) {
  onDateChange = options.onDateChange || (() => {});
  bindControls();
  renderCalendar();
}

export function renderCalendar() {
  const currentState = getState();
  const container = document.getElementById("calendar");
  const label = document.getElementById("monthLabel");

  if (!container) return;

  container.innerHTML = "";

  const visibleMonth = new Date(currentState.currentMonth);
  visibleMonth.setDate(1);

  if (label) {
    label.textContent = visibleMonth
      .toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  }

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let index = 0; index < offset; index += 1) {
    const spacer = document.createElement("div");
    spacer.className = "h-10";
    container.appendChild(spacer);
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const dateValue = new Date(year, month, dayNumber);
    const dateKey = formatDate(dateValue);
    const day = currentState.days[dateKey];
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = dayNumber;
    button.className =
      "h-10 rounded-2xl border border-transparent bg-slate-900 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800";

    if (formatDate(currentState.selectedDate) === dateKey) {
      button.classList.add("border-emerald-400", "bg-emerald-500", "text-slate-950", "font-bold");
    } else if (hasDayData(day)) {
      button.classList.add("border-emerald-500/60", "text-emerald-200");
    }

    button.addEventListener("click", () => handleDateSelect(dateValue));
    container.appendChild(button);
  }
}
