(function () {
  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute('data-client-id');
  if (!clientId) return;

  // >>> FILL THIS IN: your deployed Vercel domain <<<
  const API_BASE = 'https://YOUR-PROJECT-NAME.vercel.app';

  fetch(`${API_BASE}/api/get-chatbot?clientId=${encodeURIComponent(clientId)}`)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || data.status !== 'active' || !data.code) return;
      const s = document.createElement('script');
      s.textContent = data.code;
      document.body.appendChild(s);
    })
    .catch(function () { /* fail silently — no info leaked to inspect element */ });
})();
