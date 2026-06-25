import { formatDate, safeNumber } from "./utils.js";

let macroChart = null;
let weightChart = null;

function baseOptions(showLegend = true) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        labels: {
          color: "#cbd5e1",
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
        },
      },
      y: {
        grid: {
          color: "#1e293b",
        },
        ticks: {
          color: "#94a3b8",
        },
      },
    },
  };
}

function movingAverage7d(days, dateKey) {
  const anchorDate = new Date(dateKey);
  let sum = 0;
  let count = 0;

  for (let index = 0; index < 7; index += 1) {
    const sampleDate = new Date(anchorDate);
    sampleDate.setDate(sampleDate.getDate() - index);

    const sampleKey = formatDate(sampleDate);
    const sampleWeight = safeNumber(days[sampleKey]?.peso);

    if (sampleWeight > 0) {
      sum += sampleWeight;
      count += 1;
    }
  }

  return count > 0 ? Number((sum / count).toFixed(2)) : null;
}

export function renderWeightChart(days = {}) {
  if (typeof Chart === "undefined") return;

  const canvas = document.getElementById("weightChart");
  if (!canvas) return;

  if (weightChart) weightChart.destroy();

  const entries = Object.entries(days)
    .filter(([, day]) => safeNumber(day.peso) > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-21);

  // Ensure canvas has pixel dimensions so Chart.js can render reliably in headless
  try {
    const parent = canvas.parentElement || canvas;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor((rect.width || 400) * dpr));
    const h = Math.max(1, Math.floor((rect.height || 140) * dpr));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = (w / dpr) + "px";
    canvas.style.height = (h / dpr) + "px";
  } catch (e) {
    // ignore sizing errors
  }

  weightChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: entries.map(([dateKey]) => dateKey.slice(5)),
      datasets: [
        {
          label: "Peso",
          data: entries.map(([, day]) => safeNumber(day.peso)),
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 3,
          fill: false,
        },
        {
          label: "Media 7D",
          data: entries.map(([dateKey]) => movingAverage7d(days, dateKey)),
          borderColor: "#10b981",
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 0,
        },
      ],
    },
    options: baseOptions(),
  });
  try {
    const ts = String(Date.now());
    try { canvas.dataset.renderedAt = ts; } catch (e) {}
    try { canvas.setAttribute('data-rendered-at', ts); } catch (e) {}
    try { console.debug && console.debug('charts:renderMacroChart set ts', ts); } catch (e) {}
  } catch {}
}

export function renderMacroChart(day = {}, target = {}) {
  if (typeof Chart === "undefined") return;

  const canvas = document.getElementById("macroChart");
  if (!canvas) return;

  if (macroChart) macroChart.destroy();

  // Ensure canvas has pixel dimensions so Chart.js can render reliably in headless
  try {
    const parent = canvas.parentElement || canvas;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor((rect.width || 400) * dpr));
    const h = Math.max(1, Math.floor((rect.height || 280) * dpr));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = (w / dpr) + "px";
    canvas.style.height = (h / dpr) + "px";
  } catch (e) {
    // ignore sizing errors
  }

  macroChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Proteina", "Hidratos", "Gordura"],
      datasets: [
        {
          label: "Consumido",
          data: [
            safeNumber(day.prot),
            safeNumber(day.carb),
            safeNumber(day.fat),
          ],
          backgroundColor: ["#38bdf8", "#facc15", "#fb7185"],
          borderRadius: 10,
        },
        {
          label: "Meta",
          data: [
            safeNumber(target.prot),
            safeNumber(target.carb),
            safeNumber(target.fat),
          ],
          backgroundColor: "rgba(226, 232, 240, 0.15)",
          borderColor: "rgba(226, 232, 240, 0.35)",
          borderWidth: 1,
          borderRadius: 10,
        },
      ],
    },
    options: baseOptions(),
  });
  try {
    canvas.dataset.renderedAt = String(Date.now());
  } catch {}
}

export function renderCharts(day, target, days) {
  renderMacroChart(day, target);
  renderWeightChart(days);
  try {
    const mc = document.getElementById('macroChart');
    if (mc) mc.dataset.renderedAt = String(Date.now());
  } catch {}
}
