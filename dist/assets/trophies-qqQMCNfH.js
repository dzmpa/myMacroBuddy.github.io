import{t as e}from"./index-FuXLcI9w.js";var t={THE_FIRST_REP:{icon:`🏗️`,title:`The First Rep`,description:`Log your very first meal inside the application.`},MACRO_SNIPER:{icon:`🥩`,title:`Macro Sniper`,description:`Hit your daily protein target within a strict 3g margin.`},IRON_DISCIPLINE_7:{icon:`⛓️`,title:`Iron Discipline`,description:`Maintain a perfect daily food logging streak for 7 consecutive days.`},FIBER_KING:{icon:`🥦`,title:`Fiber King`,description:`Meet or exceed your calculated daily fiber target.`}};function n(){let n=document.getElementById(`trophyGrid`);if(!n)return;let r=e().gamification?.badges||[];n.innerHTML=Object.entries(t).map(([e,t])=>r.includes(e)?`
        <div class="flex flex-col items-center p-5 rounded-3xl border border-emerald-500/50 bg-slate-800 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-center transition-transform hover:scale-105">
          <div class="text-5xl mb-3 drop-shadow-md">${t.icon}</div>
          <h4 class="text-sm font-bold text-white mb-2 tracking-wide">${t.title}</h4>
          <p class="text-xs text-emerald-100/80 leading-relaxed">${t.description}</p>
        </div>
      `:`
        <div class="flex flex-col items-center p-5 rounded-3xl border border-slate-800/60 bg-slate-950/40 opacity-50 grayscale text-center relative overflow-hidden">
          <div class="text-5xl mb-3 relative inline-block">
            ${t.icon}
            <div class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center bg-slate-900 border border-slate-700 rounded-full text-[10px]">🔒</div>
          </div>
          <h4 class="text-sm font-bold text-slate-400 mb-1">${t.title}</h4>
          <p class="text-xs text-slate-500 leading-relaxed italic">Requirement: ${t.description}</p>
        </div>
      `).join(``)}function r(e){let t=document.getElementById(`trophyModal`);if(!t)return;let i=t.classList.contains(`hidden`);if(e===void 0?i:e){n(),t.classList.remove(`hidden`),t.classList.add(`flex`),document.body.classList.add(`overflow-hidden`);let e=document.getElementById(`closeTrophyModalBtn`);e&&e.dataset.bound!==`true`&&(e.dataset.bound=`true`,e.addEventListener(`click`,()=>r(!1)))}else t.classList.add(`hidden`),t.classList.remove(`flex`),document.body.classList.remove(`overflow-hidden`)}export{r as toggleTrophyModal};