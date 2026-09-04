// loader.js
(function() {
  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute('data-client-id');

  if (!clientId) {
    console.error('Chatbot Error: Missing data-client-id attribute on script tag.');
    return;
  }

  // Replace with your actual deployed Vercel domain
  const API_BASE = 'https://my-chatbot-cdn.vercel.app';

  fetch(`${API_BASE}/api/get-chatbot?clientId=${encodeURIComponent(clientId)}`)
    .then(res => {
      if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.status !== 'active') {
        console.warn(`Chatbot disabled for ${clientId}.`);
        return;
      }
      buildChatbotWidget(data.config);
    })
    .catch(err => console.error('Chatbot initialization failed:', err.message));

  function buildChatbotWidget(config) {
    console.log('Chatbot verified! Building widget with config:', config);
    // TODO: build your actual chat bubble / UI here using values from `config`
    // e.g. config.greeting, config.themeColor, config.avatarUrl, etc.
  }
})();
