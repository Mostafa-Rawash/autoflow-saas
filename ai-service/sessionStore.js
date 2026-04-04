class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.SESSION_TTL = 30 * 60 * 1000;
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    this.onSessionExpired = null;
  }

  setOnSessionExpired(callback) {
    this.onSessionExpired = callback;
  }

  create(identifier, initialData = {}, source = "whatsapp") {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const session = {
      session_id: sessionId,
      source: source, // "api" (PHP/JWT) or "whatsapp" (API Key)
      user_id: source === "api" ? identifier : null,
      phone_number: source === "whatsapp" ? identifier : null,
      apiary_id: initialData.apiary_id || null,
      state: "pending",
      created_at: now,
      updated_at: now,
      analysis: initialData.analysis || null,
      transcription: initialData.transcription || "",
      metadata: initialData.metadata || null,
      conversation_history: initialData.conversation_history || [],
    };

    const key = source === "api" ? `user_${identifier}` : identifier;
    this.sessions.set(key, session);
    console.log(`📝 Session created for ${source}: ${identifier}`);

    return session;
  }

  async get(identifier, source = "whatsapp") {
    const key = source === "api" ? `user_${identifier}` : identifier;
    const session = this.sessions.get(key);

    if (!session) {
      return null;
    }

    if (this.isExpired(session)) {
      const expiredSession = {
        ...session,
        state: "expired",
      };

      if (this.onSessionExpired) {
        try {
          await this.onSessionExpired(expiredSession);
        } catch (error) {
          console.error("⚠️ Failed to save expired session:", error.message);
        }
      }

      this.delete(identifier, source);
      return null;
    }

    return session;
  }

  update(identifier, updates, source = "whatsapp") {
    const session = this.get(identifier, source);

    if (!session) {
      return null;
    }

    const updatedSession = {
      ...session,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const key = source === "api" ? `user_${identifier}` : identifier;
    this.sessions.set(key, updatedSession);

    return updatedSession;
  }

  delete(identifier, source = "whatsapp") {
    const key = source === "api" ? `user_${identifier}` : identifier;
    return this.sessions.delete(key);
  }

  async cleanup() {
    let count = 0;
    const now = Date.now();

    for (const [key, session] of this.sessions.entries()) {
      const updated = new Date(session.updated_at).getTime();
      if (now - updated > this.SESSION_TTL) {
        const expiredSession = {
          ...session,
          state: "expired",
        };

        if (this.onSessionExpired) {
          try {
            await this.onSessionExpired(expiredSession);
          } catch (error) {
            console.error("⚠️ Failed to save expired session:", error.message);
          }
        }

        this.sessions.delete(key);
        count++;
      }
    }

    if (count > 0) {
      console.log(`🧹 Cleaned up ${count} expired sessions`);
    }
  }

  isExpired(session) {
    const updated = new Date(session.updated_at).getTime();
    return Date.now() - updated > this.SESSION_TTL;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
  }
}

const sessionStore = new SessionStore();

module.exports = sessionStore;
