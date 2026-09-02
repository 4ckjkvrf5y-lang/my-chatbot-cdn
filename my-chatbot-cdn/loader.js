(async function () {
  // 1. Identify client config to load from data-client-id attribute
  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute("data-client-id") || "bloom_hair";

  // 2. Read the live configuration object injected safely from the database
  const config = window.ChatbotConfig;

  // 3. Inject Widget CSS Styles into head
  const style = document.createElement("style");
  style.innerHTML = `
    .chat-widget-bubble {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${config.primaryColor};
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999999;
      transition: transform 0.2s ease;
    }
    .chat-widget-bubble:hover {
      transform: scale(1.05);
    }
    .chat-widget-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 360px;
      max-width: calc(100vw - 40px);
      height: 520px;
      max-height: calc(100vh - 120px);
      background-color: ${config.backgroundColor};
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .chat-widget-header {
      background-color: ${config.primaryColor};
      color: #ffffff;
      padding: 16px;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chat-widget-close {
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      opacity: 0.8;
    }
    .chat-widget-close:hover { opacity: 1; }
    .chat-widget-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: flex-start;
      flex-direction: column;
      gap: 12px;
    }
    .chat-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .chat-msg-bot {
      background-color: ${config.cardColor};
      color: #222222;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .chat-msg-user {
      background-color: ${config.secondaryColor};
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .chat-chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
      align-self: flex-start;
    }
    .chat-chip {
      background-color: #ffffff;
      border: 1px solid ${config.secondaryColor};
      color: ${config.primaryColor};
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .chat-chip:hover {
      background-color: ${config.cardColor};
    }
    .chat-widget-footer {
      padding: 12px;
      background-color: #ffffff;
      border-top: 1px solid rgba(0,0,0,0.08);
      display: flex;
      gap: 8px;
    }
    .chat-widget-input {
      flex: 1;
      border: 1px solid #ccc;
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 14px;
      outline: none;
    }
    .chat-widget-input:focus {
      border-color: ${config.secondaryColor};
    }
    .chat-widget-send {
      background-color: ${config.primaryColor};
      color: #ffffff;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  document.head.appendChild(style);

  // 4. Create HTML elements for Widget
  const bubble = document.createElement("div");
  bubble.className = "chat-widget-bubble";
  bubble.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

  const windowEl = document.createElement("div");
  windowEl.className = "chat-widget-window";
  windowEl.innerHTML = `
    <div class="chat-widget-header">
      <span>${config.businessName}</span>
      <span class="chat-widget-close">&times;</span>
    </div>
    <div class="chat-widget-body" id="chat-body"></div>
    <div class="chat-widget-footer">
      <input type="text" class="chat-widget-input" id="chat-input" placeholder="Type a question..." />
      <button class="chat-widget-send" id="chat-send">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(windowEl);

  const chatBody = windowEl.querySelector("#chat-body");
  const chatInput = windowEl.querySelector("#chat-input");
  const chatSend = windowEl.querySelector("#chat-send");
  const chatClose = windowEl.querySelector(".chat-widget-close");

  function renderWelcome() {
    chatBody.innerHTML = "";
    addBotMessage(config.welcomeMessage);

    if (config.chips && config.chips.length > 0) {
      const chipsContainer = document.createElement("div");
      chipsContainer.className = "chat-chips-container";
      config.chips.forEach((chip) => {
        const chipBtn = document.createElement("button");
        chipBtn.className = "chat-chip";
        chipBtn.textContent = chip.label.replace(/"/g, "");
        chipBtn.onclick = () => handleUserQuery(chip.query);
        chipsContainer.appendChild(chipBtn);
      });
      chatBody.appendChild(chipsContainer);
    }
  }

  function addBotMessage(text) {
    const msg = document.createElement("div");
    msg.className = "chat-msg chat-msg-bot";
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "chat-msg chat-msg-user";
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function findAnswer(query) {
    const cleanQuery = query.toLowerCase().trim();

    for (const item of config.presetQA) {
      for (const keyword of item.keywords) {
        if (cleanQuery.includes(keyword.toLowerCase())) {
          return item.response;
        }
      }
    }
    return config.fallbackMessage;
  }

  function handleUserQuery(queryText) {
    if (!queryText.trim()) return;
    addUserMessage(queryText);

    setTimeout(() => {
      const reply = findAnswer(queryText);
      addBotMessage(reply);
    }, 300);
  }

  bubble.onclick = () => {
    const isOpen = windowEl.style.display === "flex";
    windowEl.style.display = isOpen ? "none" : "flex";
    if (!isOpen && chatBody.children.length === 0) {
      renderWelcome();
    }
  };

  chatClose.onclick = () => {
    windowEl.style.display = "none";
  };

  chatSend.onclick = () => {
    const val = chatInput.value;
    chatInput.value = "";
    handleUserQuery(val);
  };

  chatInput.onkeypress = (e) => {
    if (e.key === "Enter") {
      chatSend.click();
    }
  };
})();
