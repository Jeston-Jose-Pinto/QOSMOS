// circuit-save-handler.js (Platform-Independent Version)

// NOTE: This version is DANGEROUS for production. It skips critical auth checks
// and relies solely on localStorage for ALL dynamic MERN/Auth/UI data.

// Utility function to simulate toast/loading (since we removed platform methods)
function logAndSimulateUI(message, isError = false) {
  const type = isError ? "ERROR" : "INFO";
  console.log(`[${type}] ${message}`);

  // Fallback UI simulation for loading/modals (basic DOM manipulation)
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (message.includes("Saving") && loadingOverlay) {
    loadingOverlay.classList.remove("hidden");
    document.getElementById("loadingText").textContent = message;
  } else if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
  }
  const saveModal = document.getElementById("saveCircuitModal");
  if (message.includes("Saving circuit...") || message.includes("Failed")) {
    if (saveModal) saveModal.classList.add("hidden");
  }
}

/**
 * Executes the save process using ONLY localStorage for state.
 */
async function saveCircuitHandler(isUpdate) {
  const savedCircuitState = JSON.parse(
    localStorage.getItem("currentCircuitState") || "{}"
  );
  const circuitData = savedCircuitState.gates || [];
  const numQubits = savedCircuitState.qubits || 3;

  // Retrieve MERN IDs/Props directly from localStorage
  const currentCircuitId = localStorage.getItem("qosmos_currentCircuitId");
  // 🔑 Fix: Get the existing title for use in PUT requests, ensuring the key is correct.
  const existingTitle =
    localStorage.getItem("qosmos_circuitTitle") || "Untitled Circuit";

  // Note: The redundant console.log('circ') and double localStorage.getItem in the original
  // have been removed for clean code.

  const currentLanguage =
    localStorage.getItem("qosmos_currentLanguage") || "qiskit";

  // 🛑 HARDCODED OR LOCAL STORAGE AUTH ID
  const userId =
    localStorage.getItem("qosmos_currentUserUid") || "anon_user_12345";

  console.log(
    `Loading Circuit State: ID=${currentCircuitId}, Lang=${currentLanguage}, Title=${existingTitle}`
  );
  console.log("user id is here" + userId);

  // Check circuit content precondition
  if (circuitData.length === 0) {
    logAndSimulateUI("Add gates to circuit before saving", true);
    return;
  }

  const titleInput = document.getElementById("saveTitleInput");

  // 🔑 CORE FIX: If it's an update (PUT), use the existingTitle.
  // If it's a new save (POST), try to read the modal input, defaulting to existingTitle if the modal input is empty.
  const title = isUpdate
    ? existingTitle
    : titleInput
    ? titleInput.value.trim()
    : existingTitle;

  // Re-check title validity now that we've determined the final title string.
  if (!title) {
    logAndSimulateUI("Please enter a valid title.", true);
    return;
  }

  // Determine URL and method
  const method = isUpdate ? "PUT" : "POST";
  const finalId = isUpdate ? currentCircuitId : "";
  // 🔑 Fix: Ensure the URL is correctly constructed for the PUT request with the ID.
  const url = isUpdate
    ? `http://localhost:5000/api/circuits/${finalId}`
    : "http://localhost:5000/api/circuits";

  logAndSimulateUI("Saving circuit...", false);

  try {
    // Since we removed platform, we must create a placeholder for code generation
    // NOTE: This will LIKELY break since code generation relies on the platform methods.
    // We will pass a simple string placeholder instead of calling platform.generateQiskitCode()
    const placeholderCode = `// Code Generation function (platform.generateQiskitCode) was unavailable.`;

    const payload = {
      userId: userId, // From localStorage/hardcoded
      title: title, // 🔑 The Title field is now guaranteed to be included
      qubits: numQubits,
      gates: circuitData.map((g) => ({
        type: g.gate,
        qubit: g.qubit,
        column: g.col,
        parameters: g.params || {},
      })),
      code: { qiskit: placeholderCode },
      language: currentLanguage,
    };

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log(responseData);

    if (!response.ok) {
      throw new Error(
        responseData.message ||
          `Failed to ${isUpdate ? "update" : "save"} circuit via API`
      );
    }

    logAndSimulateUI(
      `Circuit ${isUpdate ? "updated" : "saved"} successfully!`,
      false
    );
  } catch (error) {
    logAndSimulateUI("Failed to save circuit: " + error.message, true);
    console.error("API Save Error:", error);
  } finally {
    // 1. Hide Loading Spinner
    logAndSimulateUI("Finished", false); // This internally hides the loading overlay

    // 2. Hide the Save Modal (if it was still visible)
    document.getElementById("saveCircuitModal")?.classList.add("hidden");

    // 🔑 THE FIX: Explicitly hide the main modal overlay,
    // which is responsible for the background blur/dimming effect.
    document.getElementById("modalOverlay")?.classList.add("hidden");
  }
}

/**
 * Handles the initial click without platform checks.
 */
function prepareToSaveCircuitHandler() {
  // Check if we have an ID to decide between update or new save
  const currentCircuitId = localStorage.getItem("qosmos_currentCircuitId");
  console.log(currentCircuitId);

  const isUpdate = currentCircuitId !== null;

  if (isUpdate) {
    console.log("updating");

    saveCircuitHandler(true);
    return;
  }

  // Check gates from localStorage for new circuits
  const circuitState = JSON.parse(
    localStorage.getItem("currentCircuitState") || "{}"
  );
  if (!circuitState.gates || circuitState.gates.length === 0) {
    logAndSimulateUI("Add gates to circuit before saving", true);
    return;
  }

  // Show Save Modal (we must rely on the modal HTML/CSS for visibility)
  document.getElementById("saveTitleInput").value = "";
  // Since we removed platform.showModal, we manually toggle classes
  document.getElementById("modalOverlay")?.classList.remove("hidden");
  document.getElementById("saveCircuitModal")?.classList.remove("hidden");
  document.getElementById("saveTitleInput").focus();
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Attach to the main "Save" button
  document.getElementById("saveCircuitBtn")?.addEventListener("click", () => {
    console.log("saving circuit clicked");
    prepareToSaveCircuitHandler();
  });

  console.log(document.getElementById("buttonclosesave"));
  
  document.getElementById("buttonclosesave")?.addEventListener("click", () => {

    console.log("getting");
    
    document.getElementById("modalOverlay")?.classList.add("hidden");
    document.getElementById("saveCircuitModal")?.classList.add("hidden");
  });

  // 2. Attach to the modal form submission
  document
    .getElementById("saveCircuitForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      const isUpdate = localStorage.getItem("qosmos_currentCircuitId") !== null;

      saveCircuitHandler(isUpdate);
    });
});

const cancelButton=()=>{
    console.log("getting");
    
    document.getElementById("modalOverlay")?.classList.add("hidden");
    document.getElementById("saveCircuitModal")?.classList.add("hidden");
}
