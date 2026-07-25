function renderChatHistory(crewKey) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  // Clear current messages
  msgs.innerHTML = '';

  const history = chatHistory[crewKey] || [];

  if (history.length === 0) {
    // No history yet — show greeting
    const c   = CREW[crewKey];
    const div = document.createElement('div');
    div.className = 'msg crew-msg';
    div.innerHTML = `
      <div class="msg-av" style="border-color:${c.color}60">${c.emoji}</div>
      <div class="msg-body">
        <div class="msg-name" style="color:${c.color}">${c.name}</div>
        <div class="bubble">${c.greet}</div>
      </div>`;
    msgs.appendChild(div);
    // Save greeting to history too
    chatHistory[crewKey].push({
      type: 'crew',
      name:  c.name,
      text:  c.greet,
      emoji: c.emoji,
      color: c.color
    });
    return;
  }

  // Render existing history
  history.forEach(msg => {
    const div = document.createElement('div');
    if (msg.type === 'crew') {
      div.className = 'msg crew-msg';
      div.innerHTML = `
        <div class="msg-av" style="border-color:${msg.color}60">${msg.emoji}</div>
        <div class="msg-body">
          <div class="msg-name" style="color:${msg.color}">${msg.name}</div>
          <div class="bubble">${msg.text}</div>
        </div>`;
    } else {
      div.className = 'msg user-msg';
      div.innerHTML = `
        <div class="msg-av" style="border-color:${msg.color}40">👤</div>
        <div class="msg-body">
          <div class="msg-name">You</div>
          <div class="bubble">${escHtml(msg.text)}</div>
        </div>`;
    }
    msgs.appendChild(div);
  });

  msgs.scrollTop = msgs.scrollHeight;
}
