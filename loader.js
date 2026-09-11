(function () {
  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute('data-client-id');
  if (!clientId) return;

  const API_BASE = 'https://chatbot-live-lac.vercel.app'.replace(/\/+$/, '');

  fetch(API_BASE + '/api/get-chatbot?clientId=' + encodeURIComponent(clientId))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || data.status !== 'active' || !data.code) return;
      injectWidget(data.code);
    })
    .catch(function () {});

  function injectWidget(html) {
    const iframe = document.createElement('iframe');
    iframe.title = 'Chat widget';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '400px';
    iframe.style.maxWidth = '100vw';
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.style.zIndex = '999999';

    function sizeIframe() {
      const availableHeight = window.innerHeight - 20; // small safety margin from top of screen
      iframe.style.height = Math.min(650, availableHeight) + 'px';
    }

    sizeIframe();
    window.addEventListener('resize', sizeIframe);

    document.body.appendChild(iframe);
    iframe.srcdoc = html;
  }
})();
