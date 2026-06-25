import { state, setState } from "../state.js";
import { createBackupPayload, importBackupPayload } from "../storage.js";
import { formatDate } from "../utils.js";
import { requireProfile, revalidateProfileState } from "./profile.js";
import { ensureSeedData, persistAndUpdate } from "../main.js";

export function setBackupStatus(message, isError = false) {
  const status = document.getElementById("backupStatus");
  if (!status) {
    return;
  }

  status.textContent = message;
  status.classList.toggle("text-rose-300", isError);
  status.classList.toggle("text-emerald-300", !isError);
}

export function bindBackupControls() {
  const exportButton = document.getElementById("exportBackupBtn");
  const importButton = document.getElementById("importBackupBtn");
  const importInput = document.getElementById("importBackupInput");

  if (exportButton && exportButton.dataset.bound !== "true") {
    exportButton.dataset.bound = "true";
    exportButton.addEventListener("click", () => {
      const backupPayload = createBackupPayload(state);
      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `fitness-dashboard-v6-backup-${formatDate(new Date())}.json`;
      link.click();

      URL.revokeObjectURL(url);
      setBackupStatus("Backup exportado com sucesso.");
    });
  }

  if (importButton && importButton.dataset.bound !== "true") {
    importButton.dataset.bound = "true";
    importButton.addEventListener("click", () => {
      importInput?.click();
    });
  }

  if (importInput && importInput.dataset.bound !== "true") {
    importInput.dataset.bound = "true";
    importInput.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      if (!file) return;

      try {
        const importedState = importBackupPayload(await file.text());
        setState(importedState);
        revalidateProfileState();
        requireProfile();
        ensureSeedData();
        persistAndUpdate(["all"]);
        setBackupStatus(`Backup importado: ${file.name}`);
      } catch (error) {
        setBackupStatus(
          error instanceof Error ? error.message : "Falha ao importar backup.",
          true,
        );
      } finally {
        importInput.value = "";
      }
    });
  }
}
