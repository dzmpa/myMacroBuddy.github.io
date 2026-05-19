import { getState } from "./state.js";

export const BADGE_DICTIONARY = {
  THE_FIRST_REP: {
    icon: "🏗️",
    title: "The First Rep",
    description: "You logged your very first meal. The foundation is set.",
  },
  MACRO_SNIPER: {
    icon: "🥩",
    title: "Macro Sniper",
    description:
      "Hit your daily protein target with surgical precision (within a 3g margin).",
  },
  IRON_DISCIPLINE_7: {
    icon: "⛓️",
    title: "Iron Discipline",
    description:
      "Maintained a perfect daily logging streak for 7 consecutive days.",
  },
  FIBER_KING: {
    icon: "🥦",
    title: "Fiber King",
    description:
      "Hit your daily fiber target, ensuring optimal digestion and health.",
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
        <div class="flex flex-col items-center p-5 rounded-3xl border border-slate-700 bg-slate-900/60 opacity-60 grayscale text-center">
          <div class="text-5xl mb-3 relative">
            ${badge.icon}
            <div class="absolute inset-0 flex items-center justify-center bg-slate-950/50 rounded-full text-2xl backdrop-blur-[2px]">🔒</div>
          </div>
          <h4 class="text-sm font-bold text-slate-400 mb-2">Bloqueado</h4>
          <p class="text-xs text-slate-500">Continua a manter o rigor no registo para descobrir...</p>
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

    // Liga o botão de fechar automaticamente (e de forma segura, apenas uma vez)
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
