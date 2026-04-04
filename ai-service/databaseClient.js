const axios = require("axios");

const DATABASE_URL = process.env.DATABASE_ROBOT_URL || "http://localhost:3000";
const API_KEY = process.env.DATABASE_ROBOT_API_KEY || "shared-secret-key";

class DatabaseClient {
  constructor() {
    this.baseUrl = DATABASE_URL;
    this.apiKey = API_KEY;
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
    };
  }

  async saveInspection(apiaryId, inspectionData, transcription, phoneNumber) {
    const finalApiaryId = inspectionData?.apiary_id || apiaryId;

    let fixedInspectionData = { ...inspectionData };
    if (
      !fixedInspectionData.inspection_date ||
      fixedInspectionData.inspection_date === "null" ||
      fixedInspectionData.inspection_date === null
    ) {
      fixedInspectionData.inspection_date = new Date().toISOString();
    }
    fixedInspectionData.apiary_id = finalApiaryId;

    const payload = {
      apiary_id: finalApiaryId,
      inspection_data: fixedInspectionData,
      transcription: transcription,
      phone_number: phoneNumber,
    };

    console.log("📤 Database payload:", JSON.stringify(payload, null, 2));

    if (!this.connected) {
      console.log("⚠️ Database not connected - skipping save");
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/inspections`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 30000,
        },
      );
      return response.data.data;
    } catch (error) {
      console.error(
        `❌ Failed to save inspection for ${apiaryId}:`,
        error.message,
      );
      throw error;
    }
  }

  async saveSession(sessionData) {
    const payload = {
      session_id: sessionData.session_id,
      phone_number: sessionData.phone_number,
      apiary_id: sessionData.apiary_id,
      state: sessionData.state,
      analysis: sessionData.analysis,
      transcription: sessionData.transcription,
      metadata: sessionData.metadata,
      conversation_history: sessionData.conversation_history,
      created_at: sessionData.created_at,
      updated_at: sessionData.updated_at,
    };

    console.log("📤 Saving session to database:", sessionData.session_id);

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/sessions`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 15000,
        },
      );

      console.log("✅ Session saved successfully:", sessionData.session_id);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Failed to save session:",
        error.message,
      );
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
      });
      this.connected = response.data && response.data.success === true;
      return this.connected;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }
}

module.exports = new DatabaseClient();
