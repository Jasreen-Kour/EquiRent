// Messages View for Renter-Owner Inquiries
const messagesView = {
  activePartnerId: null,
  activePartner: null,

  async render() {
    if (!state.isAuthenticated) {
      window.location.hash = '#/login';
      return '';
    }

    let conversations = [];
    try {
      const res = await api.messages.getConversations();
      conversations = res.conversations || [];
    } catch (err) {
      console.error('Failed to load conversations', err);
    }

    // Default to first conversation partner if none selected
    if (!this.activePartnerId && conversations.length > 0) {
      this.activePartnerId = conversations[0].partnerId;
    }

    let thread = [];
    if (this.activePartnerId) {
      try {
        const thRes = await api.messages.getThread(this.activePartnerId);
        thread = thRes.messages || [];
        this.activePartner = thRes.partner || { name: 'Chat Partner' };
      } catch (e) {
        console.error('Failed to load thread', e);
      }
    }

    const convListHtml = conversations.length === 0 ? `
      <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
        No active conversations. Reach out to an owner via an equipment details page.
      </div>
    ` : conversations.map(c => `
      <div class="conversation-item ${c.partnerId === this.activePartnerId ? 'active' : ''}" onclick="messagesView.selectPartner('${c.partnerId}')">
        <div class="user-avatar-img" style="width: 38px; height: 38px; flex-shrink: 0;">
          ${c.partnerName.charAt(0)}
        </div>
        <div style="flex: 1; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 0.875rem; color: var(--primary-navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.partnerName}</strong>
            <span style="font-size: 0.6875rem; color: var(--text-muted);">${new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.2rem;">
            ${c.lastMessage}
          </p>
        </div>
        ${c.unreadCount > 0 ? `<span class="notif-badge-count" style="position: static; font-size: 0.625rem;">${c.unreadCount}</span>` : ''}
      </div>
    `).join('');

    const threadMessagesHtml = thread.length === 0 ? `
      <div style="margin: auto; text-align: center; color: var(--text-muted);">
        <i data-lucide="message-square" style="width: 48px; height: 48px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
        <p>No messages yet. Send a greeting to start the conversation!</p>
      </div>
    ` : thread.map(m => {
      const isMe = m.senderId === state.user._id;
      return `
        <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
          <div>${m.text}</div>
          <div class="message-time">
            ${new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="dashboard-layout">
        ${dashboardView.renderSidebar('/messages')}

        <main class="dashboard-main">
          <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">Direct Inquiries & Messages</h2>
            <p class="text-muted" style="font-size: 0.875rem;">Coordinate equipment drop-off logistics, verify attachments, and confirm jobsite schedules.</p>
          </div>

          <div class="messages-layout">
            <!-- Left: Conversations List -->
            <div class="conversations-sidebar">
              <div class="conversations-header">
                Conversations (${conversations.length})
              </div>
              <div class="conversations-list">
                ${convListHtml}
              </div>
            </div>

            <!-- Right: Active Chat Thread -->
            <div class="chat-thread-container">
              <div class="chat-header">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div class="user-avatar-img" style="width: 36px; height: 36px;">
                    ${this.activePartner ? this.activePartner.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <h4 style="font-size: 0.9375rem; font-weight: 700; color: var(--primary-navy);">${this.activePartner ? this.activePartner.name : 'Select a Chat'}</h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${this.activePartner?.company || 'Verified Member'} • Active Marketplace Partner</span>
                  </div>
                </div>

                <span class="status-badge status-active">Online</span>
              </div>

              <!-- Message Stream -->
              <div class="chat-messages" id="chat-messages-stream">
                ${threadMessagesHtml}
              </div>

              <!-- Input Bar -->
              <form class="chat-input-bar" onsubmit="messagesView.handleSendMessage(event)">
                <input type="text" id="chat-input-field" class="form-control" placeholder="Write a message..." required />
                <button type="submit" class="btn btn-primary">
                  <i data-lucide="send"></i>
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  selectPartner(partnerId) {
    this.activePartnerId = partnerId;
    router.navigate('/messages');
  },

  async handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input-field');
    const text = input ? input.value.trim() : '';
    if (!text || !this.activePartnerId) return;

    input.value = '';

    try {
      await api.messages.send({
        recipientId: this.activePartnerId,
        text
      });

      // Quick re-fetch and scroll down
      const thRes = await api.messages.getThread(this.activePartnerId);
      const stream = document.getElementById('chat-messages-stream');
      if (stream) {
        stream.innerHTML = (thRes.messages || []).map(m => {
          const isMe = m.senderId === state.user._id;
          return `
            <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
              <div>${m.text}</div>
              <div class="message-time">
                ${new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          `;
        }).join('');
        stream.scrollTop = stream.scrollHeight;
      }
    } catch (err) {
      state.showToast(err.message || 'Failed to send message', 'error');
    }
  }
};
