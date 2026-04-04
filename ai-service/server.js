require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const AudioProcessor = require("./audioProcessor");
const sessionStore = require("./sessionStore");
const databaseClient = require("./databaseClient");
const { authMiddleware } = require("./authMiddleware");

const app = express();
const PORT = process.env.PORT || 3001;
const audioProcessor = new AudioProcessor();

sessionStore.setOnSessionExpired(async (sessionData) => {
  try {
    await databaseClient.saveSession(sessionData);
  } catch (error) {
    console.error("⚠️ Failed to save expired session to database:", error.message);
  }
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(morgan("tiny"));

const response = {
  success(data, message = null) {
    return { success: true, data, ...(message && { message }) };
  },
  error(message, code = "INTERNAL_ERROR", details = null) {
    return {
      success: false,
      error: { code, message, ...(details && { details }) },
    };
  },
};

app.get("/health", async (req, res) => {
  const dbHealthy = await databaseClient.healthCheck();
  res.json(
    response.success({
      status: "ok",
      service: "Gemini Robot",
      version: "3.0.0-AI-POWERED",
      database_connected: dbHealthy,
      timestamp: new Date().toISOString(),
    }),
  );
});

app.post("/api/v1/analyze", authMiddleware, async (req, res) => {
  try {
    const { input, phone_number } = req.body;

    if (!input) {
      return res
        .status(400)
        .json(response.error("input is required", "VALIDATION_ERROR"));
    }

    // Determine identifier based on auth source
    let identifier;
    let source;
    
    if (req.user.source === "api") {
      // JWT auth - use userId from token
      identifier = req.user.userId || req.user.user_id;
      source = "api";
      if (!identifier) {
        return res.status(400).json(
          response.error("userId not found in token", "VALIDATION_ERROR")
        );
      }
    } else {
      // WhatsApp auth - use phone_number from body
      identifier = phone_number;
      source = "whatsapp";
      if (!identifier) {
        return res
          .status(400)
          .json(response.error("phone_number is required", "VALIDATION_ERROR"));
      }
    }

    const { type, data, mime_type } = input;

    if (!type || !data) {
      return res
        .status(400)
        .json(
          response.error(
            "input.type and input.data are required",
            "VALIDATION_ERROR",
          ),
        );
    }

    const existingSession = sessionStore.get(identifier, source);

    if (type === "text" && existingSession) {
      console.log(`📥 Text from ${phone_number} - detecting intent...`);

      const intentResult = await audioProcessor.detectIntent(
        data,
        existingSession.analysis,
        existingSession.conversation_history,
      );

      sessionStore.update(phone_number, {
        conversation_history: [
          ...existingSession.conversation_history,
          { role: "user", content: data },
          { role: "assistant", content: intentResult.message },
        ],
      });

      if (intentResult.intent === "confirm") {
        console.log("✅ User confirmed - checking database connection...");

        if (!existingSession.analysis) {
          return res
            .status(400)
            .json(response.error("No analysis to confirm", "NO_ANALYSIS"));
        }

        if (
          existingSession.confirmed ||
          existingSession.state === "completed"
        ) {
          return res.json(
            response.success({
              intent: "confirm",
              session_id: existingSession.session_id,
              message:
                "Inspection already confirmed. Send audio to start new analysis.",
            }),
          );
        }

        const dbConnected = await databaseClient.healthCheck();
        let saved = null;

        if (dbConnected) {
          console.log("💾 Database connected - saving inspection...");
          saved = await databaseClient.saveInspection(
            existingSession.analysis.apiary_id,
            existingSession.analysis,
            existingSession.transcription,
            phone_number,
          );
        } else {
          console.log("⚠️ Database not available - completing without save");
        }

        sessionStore.update(phone_number, {
          state: "completed",
          confirmed: true,
        });

        const completedSession = sessionStore.get(phone_number);
        if (completedSession) {
          try {
            await databaseClient.saveSession(completedSession);
          } catch (sessionError) {
            console.error("⚠️ Failed to save session to database:", sessionError.message);
          }
        }

        return res.json(
          response.success({
            intent: "confirm",
            session_id: existingSession.session_id,
            inspection_id: saved?.inspection_id,
            saved_to_database: dbConnected && saved !== null,
            message: dbConnected
              ? intentResult.message || "Inspection saved successfully!"
              : "Analysis complete (database unavailable - data not persisted)",
          }),
        );
      }

      if (intentResult.intent === "edit") {
        console.log("✏️ User wants to edit - modifying analysis...");

        const modificationResult = await audioProcessor.modifyAnalysis(
          existingSession.analysis,
          intentResult.clarification,
        );

        sessionStore.update(phone_number, {
          analysis: modificationResult.updatedAnalysis,
          metadata: modificationResult.metadata,
          conversation_history: [
            ...existingSession.conversation_history,
            { role: "assistant", content: "Analysis updated" },
          ],
        });

        return res.json(
          response.success({
            intent: "edit",
            session_id: existingSession.session_id,
            analysis: modificationResult.updatedAnalysis,
            metadata: modificationResult.metadata,
            message:
              intentResult.message ||
              "Analysis updated. Please confirm to save.",
          }),
        );
      }

      if (intentResult.intent === "cancel") {
        console.log("❌ User cancelled session");

        const cancelledSession = {
          ...existingSession,
          state: "cancelled",
        };

        try {
          await databaseClient.saveSession(cancelledSession);
        } catch (sessionError) {
          console.error("⚠️ Failed to save cancelled session to database:", sessionError.message);
        }

        sessionStore.delete(phone_number);

        return res.json(
          response.success({
            intent: "cancel",
            message:
              intentResult.message ||
              "Session cancelled. Send audio to start new analysis.",
          }),
        );
      }

      return res.json(
        response.success({
          intent: intentResult.intent,
          session_id: existingSession.session_id,
          analysis: existingSession.analysis,
          metadata: existingSession.metadata,
          message: intentResult.message,
        }),
      );
    }

    if (type === "audio") {
      const allowedAudioFormats = [
        "audio/webm",
        "audio/mp4",
        "audio/wav",
        "audio/mp3",
        "audio/mpeg",
        "audio/ogg",
        "audio/aac",
        "audio/flac",
        "audio/x-ms-wma",
        "audio/aiff",
        "audio/opus",
        "audio/m4a",
      ];

      if (
        mime_type &&
        !allowedAudioFormats.some((fmt) => mime_type.includes(fmt))
      ) {
        return res
          .status(400)
          .json(
            response.error(
              `Unsupported audio format. Allowed: ${allowedAudioFormats.join(", ")}`,
              "VALIDATION_ERROR",
            ),
          );
      }

      console.log(`📥 Processing ${type} from ${phone_number}...`);

      const result = await audioProcessor.process(
        data,
        mime_type || "audio/webm",
        {
          context: "",
        },
      );

      const extractedApiaryId = result.data?.apiary_id || "1";
      const extractedCellId = result.data?.cell_id || "1";
      console.log(`🐝 Apiary: ${extractedApiaryId}, Cell: ${extractedCellId}`);

      if (existingSession && existingSession.analysis) {
        console.log("📝 Updating existing session with new audio...");

        // Check if this audio has explicit cell reference (Zero Protocol)
        const hasExplicitCell = audioProcessor.containsCellReference(
          result.transcription
        );

        let updatedAnalysis = result.data;

        if (hasExplicitCell) {
          console.log("🎯 Explicit cell reference detected - applying Zero Protocol");
          // Force fresh cell_id extraction, don't inherit from previous session
          updatedAnalysis = {
            ...result.data,
            cell_id: result.data?.cell_id || "1"
          };
        }

        sessionStore.update(phone_number, {
          apiary_id: extractedApiaryId,
          analysis: updatedAnalysis,
          transcription: result.transcription || "",
          metadata: result.metadata,
          conversation_history: [
            ...existingSession.conversation_history,
            { role: "user", content: `[audio file updated]` },
            { role: "assistant", content: "Analysis updated with new audio" },
          ],
        });

        return res.json(
          response.success({
            intent: "audio_update",
            session_id: existingSession.session_id,
            analysis: result.data,
            metadata: result.metadata,
            transcription: result.transcription,
            message:
              "Analysis updated with new audio. Please confirm to save or reply with changes.",
          }),
        );
      }

      const newSession = sessionStore.create(phone_number, {
        apiary_id: extractedApiaryId,
        analysis: result.data,
        transcription: result.transcription || "",
        metadata: result.metadata,
        conversation_history: [
          { role: "user", content: `[${type} file attached]` },
          { role: "assistant", content: "Analysis complete" },
        ],
      });

      return res.json(
        response.success({
          intent: "new_analysis",
          session_id: newSession.session_id,
          apiary_id: extractedApiaryId,
          analysis: result.data,
          metadata: result.metadata,
          transcription: result.transcription,
          message:
            "Audio analyzed successfully. Please confirm to save or reply with changes.",
        }),
      );
    }

    if (type === "text" && !existingSession) {
      console.log(`📝 Processing text as new analysis from ${phone_number}...`);

      const result = await audioProcessor.processText(data, {
        context: "",
      });

      const extractedApiaryId = result.data?.apiary_id || "1";

      const newSession = sessionStore.create(phone_number, {
        apiary_id: extractedApiaryId,
        analysis: result.data,
        transcription: result.transcription || data,
        metadata: result.metadata,
        conversation_history: [
          { role: "user", content: data },
          { role: "assistant", content: "Analysis complete" },
        ],
      });

      return res.json(
        response.success({
          intent: "new_analysis",
          session_id: newSession.session_id,
          apiary_id: extractedApiaryId,
          analysis: result.data,
          metadata: result.metadata,
          transcription: result.transcription,
          message:
            "Text analyzed successfully. Please confirm to save or reply with changes.",
        }),
      );
    }

    return res
      .status(400)
      .json(
        response.error(
          "Invalid input type. Use: audio or text",
          "INVALID_TYPE",
        ),
      );
  } catch (error) {
    console.error("❌ Error in analyze endpoint:", error);
    res
      .status(500)
      .json(
        response.error(
          error.message || "Internal server error",
          "PROCESSING_ERROR",
        ),
      );
  }
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json(response.error(err.message || "Internal server error"));
});

app.use((req, res) => {
  res
    .status(404)
    .json(response.error("Endpoint not found", "NOT_FOUND", { path: req.url }));
});

app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Gemini Robot Started (AI-Powered)`);
  console.log(`Port: ${PORT}`);
  console.log(`${"=".repeat(60)}\n`);
});
