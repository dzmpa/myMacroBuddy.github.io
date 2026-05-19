// js/trophies.js
import { getState } from "./state.js";

export const BADGE_DICTIONARY = {
  THE_FIRST_REP: {
    icon: "🏗️",
    title: "The First Rep",
    description: "Log your very first meal inside the application.",
  },
  MACRO_SNIPER: {
    icon: "🥩",
    title: "Macro Sniper",
    description: "Hit your daily protein target within a strict 3g margin.",
  },
  IRON_DISCIPLINE_7: {
    icon: "⛓️",
    title: "Iron Discipline",
    description:
      "Maintain a perfect daily food logging streak for 7 consecutive days.",
  },
  FIBER_KING: {
    icon: "🥦",
    title: "Fiber King",
    description: "Meet or exceed your calculated daily fiber target.",
  },
};

export function renderTrophyRoom() {
  const container = document.getElementById("trophyGrid");
  if (!container) return;

  const state = getState();
  const unlockedBadges = state.gamification?.badges || [];

  container.innerHTML = Object.entries(BADGE_DICTIONARY)
    .map(([id, badge]) => {
      const isUnlocked = unlockedBadges.includes(id);

      if (isUnlocked) {
        return `
        <div class="flex flex-col items-center p-5 rounded-3xl border border-emerald-500/50 bg-slate-800 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-center transition-transform hover:scale-105">
          <div class="text-5xl mb-3 drop-shadow-md">${badge.icon}</div>
          <h4 class="text-sm font-bold text-white mb-2 tracking-wide">${badge.title}</h4>
          <p class="text-xs text-emerald-100/80 leading-relaxed">${badge.description}</p>
        </div>
      `;
      } else {
        return `
        <div class="flex flex-col items-center p-5 rounded-3xl border border-slate-800/60 bg-slate-950/40 opacity-50 grayscale text-center relative overflow-hidden">
          <div class="text-5xl mb-3 relative inline-block">
            ${badge.icon}
            <div class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center bg-slate-900 border border-slate-700 rounded-full text-[10px]">🔒</div>
          </div>
          <h4 class="text-sm font-bold text-slate-400 mb-1">${badge.title}</h4>
          <p class="text-xs text-slate-500 leading-relaxed italic">Requirement: ${badge.description}</p>
        </div>
      `;
      }
    })
    .join("");
}

export function toggleTrophyModal(forceOpen) {
  const modal = document.getElementById("trophyModal");
  if (!modal) return;

  const isHidden = modal.classList.contains("hidden");
  const willOpen = forceOpen !== undefined ? forceOpen : isHidden;

  if (willOpen) {
    renderTrophyRoom();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    const closeBtn = document.getElementById("closeTrophyModalBtn");
    if (closeBtn && closeBtn.dataset.bound !== "true") {
      closeBtn.dataset.bound = "true";
      closeBtn.addEventListener("click", () => toggleTrophyModal(false));
    }
  } else {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }
}
