(function() {
  var script = document.currentScript || document.querySelector('script[data-user-id]');
  if (!script) return;

  var userId = script.getAttribute('data-user-id');
  var apiUrl = script.src.replace(/\/livechat-widget\.js$/, '');
  var container = document.createElement('div');
  container.id = 'autoflow-livechat';
  document.body.appendChild(container);

  var state = 'closed';
  var config = null;
  var conversationId = null;

  function loadConfig() {
    fetch(apiUrl + '/api/livechat/widget/' + userId)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success && data.data) {
          config = data.data;
          renderWidget();
        }
      })
      .catch(function(err) { console.error('[AutoFlow LiveChat] Failed to load config:', err); });
  }

  function sendMessage(text) {
    if (!text || !conversationId) return;
    fetch(apiUrl + '/api/livechat/widget/message/' + conversationId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, type: 'text' })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success) {
        addMessage('contact', text);
      }
    })
    .catch(function(err) { console.error('[AutoFlow LiveChat] Failed to send message:', err); });
  }

  function startChat(name, email, phone) {
    fetch(apiUrl + '/api/livechat/widget/' + userId + '/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, phone: phone, visitorId: 'v_' + Math.random().toString(36).substr(2, 9) })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success && data.data) {
        conversationId = data.data._id;
        renderChat();
      }
    })
    .catch(function(err) { console.error('[AutoFlow LiveChat] Failed to start chat:', err); });
  }

  function addMessage(sender, text) {
    var messages = container.querySelector('.aflc-messages');
    if (!messages) return;
    var div = document.createElement('div');
    div.style.cssText = 'margin-bottom:10px;max-width:80%;' + (sender === 'contact' ? 'margin-right:auto;' : 'margin-left:auto;');
    var bubble = document.createElement('div');
    bubble.style.cssText = 'padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;word-break:break-word;' +
      (sender === 'bot' ? 'background:' + (config ? config.primaryColor : '#14b8a6') + ';color:white;border-bottom-right-radius:4px;' :
       'background:#f1f5f9;color:#1e293b;border-bottom-left-radius:4px;');
    bubble.textContent = text;
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function renderWidget() {
    if (!config || !config.isActive) return;
    container.innerHTML = '';
    var pos = config.position === 'bottom-left' ? 'left:20px;right:auto;' : 'right:20px;left:auto;';

    var btn = document.createElement('div');
    btn.style.cssText = 'position:fixed;bottom:20px;' + pos + 'width:60px;height:60px;border-radius:50%;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;z-index:999999;background:' + config.primaryColor;
    btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    btn.onmouseenter = function() { btn.style.transform = 'scale(1.1)'; };
    btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };
    btn.onclick = function() { state = 'open'; renderChat(); };
    container.appendChild(btn);
  }

  function renderChat() {
    if (!config) return;
    container.innerHTML = '';
    var pos = config.position === 'bottom-left' ? 'left:20px;right:auto;' : 'right:20px;left:auto;';
    var isOnline = config.isOnline !== false;

    var chat = document.createElement('div');
    chat.style.cssText = 'position:fixed;bottom:20px;' + pos + 'width:380px;height:520px;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:white;';

    chat.innerHTML =
      '<div style="padding:16px 20px;background:' + config.primaryColor + ';color:white;display:flex;align-items:center;justify-content:space-between;">' +
        '<div><div style="font-size:16px;font-weight:600;">' + config.title + '</div><div style="font-size:12px;opacity:0.8;">' + (isOnline ? config.subtitle : config.offlineMessage) + '</div></div>' +
        '<div style="cursor:pointer;padding:4px;" id="aflc-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>' +
      '</div>' +
      '<div class="aflc-messages" style="flex:1;overflow-y:auto;padding:16px;"></div>' +
      (conversationId ?
        '<div style="padding:12px;border-top:1px solid #e5e7eb;display:flex;gap:8px;">' +
          '<input id="aflc-input" type="text" placeholder="اكتب رسالتك..." style="flex:1;padding:10px 14px;border:1px solid #e5e7eb;border-radius:12px;font-size:14px;outline:none;" />' +
          '<button id="aflc-send" style="padding:10px 16px;background:' + config.primaryColor + ';color:white;border:none;border-radius:12px;cursor:pointer;font-size:14px;">إرسال</button>' +
        '</div>' : '') +
      (!conversationId ?
        '<div style="padding:20px;border-top:1px solid #e5e7eb;">' +
          (config.preChatForm?.enabled ?
            '<div style="display:flex;flex-direction:column;gap:8px;">' +
              '<input id="aflc-name" type="text" placeholder="الاسم" style="padding:10px 14px;border:1px solid #e5e7eb;border-radius:12px;font-size:14px;outline:none;" />' +
              '<input id="aflc-email" type="email" placeholder="البريد الإلكتروني" style="padding:10px 14px;border:1px solid #e5e7eb;border-radius:12px;font-size:14px;outline:none;" />' +
              '<button id="aflc-start" style="padding:12px;background:' + config.primaryColor + ';color:white;border:none;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600;">ابدأ المحادثة</button>' +
            '</div>' :
            '<button id="aflc-start" style="width:100%;padding:12px;background:' + config.primaryColor + ';color:white;border:none;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600;">ابدأ المحادثة</button>'
          ) +
        '</div>' : '');

    container.appendChild(chat);

    if (config.welcomeMessage) {
      addMessage('bot', config.welcomeMessage);
    }

    document.getElementById('aflc-close').onclick = function() {
      state = 'closed';
      renderWidget();
    };

    var startBtn = document.getElementById('aflc-start');
    if (startBtn) {
      startBtn.onclick = function() {
        var name = document.getElementById('aflc-name')?.value || 'زائر';
        var email = document.getElementById('aflc-email')?.value || '';
        startChat(name, email, '');
      };
    }

    var sendBtn = document.getElementById('aflc-send');
    var input = document.getElementById('aflc-input');
    if (sendBtn && input) {
      sendBtn.onclick = function() {
        var text = input.value.trim();
        if (text) { sendMessage(text); input.value = ''; }
      };
      input.onkeydown = function(e) {
        if (e.key === 'Enter') {
          var text = input.value.trim();
          if (text) { sendMessage(text); input.value = ''; }
        }
      };
    }
  }

  loadConfig();
})();