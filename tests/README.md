# Testes E2E — Playwright

Este directório contém os testes Playwright que validam resiliência da PWA: throttling (CPU + rede), comportamento do Service Worker (cache/offline) e persistência em IndexedDB.

Principais cenários
- `dashboard-throttle.spec.mjs` — Emula rede lenta e CPU estrangulado (CDP, Chromium) e valida que UI e gráficos se mantêm responsivos.
- `dashboard-throttle.spec.mjs` (cenário adicional) — Verifica instalação do Service Worker e que ativos são servidos em modo offline.
- `dashboard-throttle.spec.mjs` (cenário IndexedDB) — Grava um alimento enquanto offline e valida que o `IndexedDB` persiste os dados e a UI os exibe após reload.

Requisitos
- Node.js (16+ recomendado)
- `npm install` nas dependências do projeto
- Playwright browsers instalados localmente para correr os testes Chromium/Firefox/WebKit

Comandos rápidos (local)

Instala dependências e browsers:
```bash
npm install
npx playwright install
```

Starta um servidor estático a partir da raiz do repositório (os testes usam `http://127.0.0.1:8000` por padrão):
```bash
npx http-server -c-1 .  # ou: python3 -m http.server 8000
```

Executar toda a suite Playwright:
```bash
npx playwright test
```

Executar apenas o teste de throttling/IndexedDB em Chromium (útil para depurar localmente):
```bash
npx playwright test tests/dashboard-throttle.spec.mjs --project=chromium
```

Executar em modo interativo/headeado (útil para ver o que acontece):
```bash
npx playwright test --headed --debug
```

Relatórios e artefatos
- Relatório HTML: `npx playwright show-report` ou abrir `playwright-report/index.html` gerado localmente.
- Artefatos gerados pelo `playwright.config.mjs`:
  - `test-results/` — contém vídeos, screenshots e traces (configurado para reter apenas em falhas por padrão).
  - `playwright-report/` — relatório HTML gerado pelo Playwright.

No CI (GitHub Actions)
- O workflow envia os diretórios `playwright-report/**` e `test-results/**` como artifacts para cada job (mesmo em falhas). Esses artefatos podem ser descarregados do separador "Artifacts" do run no GitHub Actions.
- Para abrir um trace localmente: `npx playwright show-trace <path-to-trace>`.
- Vídeos mostram a interação UI durante o teste; screenshots são capturadas apenas em falhas; traces contêm timeline, rede, e snapshots do DOM para debugging aprofundado.

Notas importantes
- Os testes que usam CDP (Network/Emulation/CPU throttling) requerem Chromium; por isso usam `test.skip` para outros browsers.
- Certifica-te que o servidor está a servir a página no mesmo origin usado pelos testes (por exemplo `http://127.0.0.1:8000`).
- Se alterares `playwright.config.mjs` para outro `baseURL`, atualiza os comandos acima ou executa com `--config` apropriado.

Dicas de debug
- Reproduzir localmente com `--headed` ajuda a ver exatamente o fluxo.
- Aceder às pipelines no GitHub Actions e descarregar os artifacts oferece vídeos e traces para analisar falhas intermitentes que não ocorrem localmente.

Contacto
- Se quiseres, posso adicionar um script NPM (`npm run test:e2e`) e um ficheiro `tests/LOCAL.md` com screenshots de exemplo e um checklist para debugging de falhas CI.
