// app_combined.js
// Lightweight loader: load `app.js` first (core app code), then `app1.js` (override circuit logic)
// This keeps the original files untouched and ensures the circuit implementation from app1.js
// runs after app.js so its functions (SimpleQuantumCircuit, drawCircuit, etc.) take precedence.
(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = false;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = (e) => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  // Load sequentially: app.js then app1.js
  loadScript('app.js')
    .then(() => {
      // small tick to ensure any initialization from app.js has wired up
      return loadScript('app1.js');
    })
    .then(() => {
      console.log('app_combined: Loaded app.js and app1.js — app1 circuit will be active');
    })
    .catch((err) => {
      console.error('app_combined loader error:', err);
    });
})();
