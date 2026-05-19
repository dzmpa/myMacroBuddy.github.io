// js/notifications.js

let confettiPromise = null;

function loadConfetti() {
  if (!confettiPromise) {
    confettiPromise = new Promise((resolve, reject) => {
      if (window.confetti) return resolve(window.confetti);
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
      script.onload = () => resolve(window.confetti);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return confettiPromise;
}

export async function showLevelUpNotification(title, message, icon = "🏆") {
  // Haptic Feedback (vibração tátil)
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

  // Disparar confetis a partir do topo
  try {
    const confetti = await loadConfetti();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.1 },
      colors: ['#10b981', '#38bdf8', '#fb7185', '#facc15'],
      zIndex: 9999
    });
  } catch (e) {
    console.warn("Confetti falhou ao carregar", e);
  }

  // Criar o container da notificação com Glassmorphism (Tailwind)
  const container = document.createElement("div");
  container.className = `
    fixed top-0 left-0 right-0 z-[100] flex justify-center p-4
    transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
    translate-y-[-150%]
  `;
  // Respeita o Notch / Dynamic Island do iPhone
  container.style.paddingTop = "calc(env(safe-area-inset-top) + 16px)";

  container.innerHTML = `
    <div class="flex items-center gap-4 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 shadow-2xl max-w-sm w-full">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-2xl shadow-inner">
        ${icon}
      </div>
      <div class="flex-1">
        <h4 class="text-sm font-bold text-white">${title}</h4>
        <p class="text-xs text-slate-300 mt-0.5">${message}</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Animação de entrada
  requestAnimationFrame(() => {
    container.classList.remove("translate-y-[-150%]");
    container.classList.add("translate-y-0");
  });

  // Auto-remoção após 4.5 segundos
  setTimeout(() => {
    container.classList.remove("translate-y-0");
    container.classList.add("translate-y-[-150%]");
    setTimeout(() => container.remove(), 600); 
  }, 4500);
}