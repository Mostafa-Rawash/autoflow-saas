const AGSFlatSchema = require("./apairy_flat_schema.json");
const { GoogleGenAI } = require("@google/genai");

// Fast-path intent keywords with multilingual support
const INTENT_KEYWORDS = {
  confirm: [
    // English
    'yes', 'yep', 'yup', 'sure', 'ok', 'k', 'done',
    'confirm', 'save', 'yah', 'yeah', 'yess', 'yup',
    // Arabic
    'نعم', 'أيوة', 'آه', 'تم', 'احفظ', 'حفظ',
    'موافق', 'تمام', 'ماشي', 'خلاص', 'حلو', 'زين',
    'طيب', 'كويس', 'ممتاز', 'ناعم', 'نعمم'
  ],
  cancel: [
    // English
    'no', 'nope', 'cancel', 'stop', 'quit', 'delete',
    'nah', 'noo', 'cncl',
    // Arabic
    'لا', 'إلغاء', 'حذف', 'امسح', 'وقف', 'مش موافق',
    'لاء', 'لاه', 'لأ'
  ],
  new_analysis: [
    // English
    'new', 'restart', 'again', 'fresh', 'start over',
    // Arabic
    'جديد', 'من جديد', 'مرة ثانية', 'ابدأ', 'تحليل جديد'
  ]
};

class AudioProcessor {
  constructor() {
    this.genAI = null;
    this.model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
    this.fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-preview";
    this.requestTimeout = 25000;
  }

  async generateWithRetry(contents, config) {
    const models = [this.model, this.fallbackModel];
    let lastError;

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const modelType = i === 0 ? "primary" : "fallback";

      try {
        console.log(`🤖 Attempting ${modelType} model: ${model}...`);
        const response = await this.withTimeout(
          this.genAI.models.generateContent({
            model: model,
            contents: contents,
            config: config,
          }),
          this.requestTimeout,
        );
        console.log(`✅ ${modelType} model succeeded: ${model}`);
        return response;
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || String(error);
        console.error(`❌ ${modelType} model failed: ${model} - ${errorMessage}`);

        if (i < models.length - 1) {
          console.log(`🔄 Retrying with fallback model...`);
        }
      }
    }

    throw lastError;
  }

  withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${ms}ms`)),
          ms,
        ),
      ),
    ]);
  }

  getGenAI() {
    if (!this.genAI) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not set in environment");
      }
      this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this.genAI;
  }

  async process(audioBase64, mimeType, options = {}) {
    const { apiaryId = "1", context = "" } = options;
    this.getGenAI();
    try {
      console.log("🎙️  Processing audio with Gemini...");

      const prompt = this.buildPrompt(apiaryId, context);

      console.log("🤖 Sending analysis request...");
      const response = await this.generateWithRetry(
        [
          { inlineData: { data: audioBase64, mimeType } },
          { text: prompt },
        ],
        {
          responseMimeType: "application/json",
          
        }
      );

      let responseText = this.extractText(response);

      if (!responseText) {
        throw new Error("No response text from Gemini API");
      }

      console.log("📄 Response received, parsing...");

      const parsedResponse = this.parseResponse(responseText, apiaryId);

      console.log("✅ Audio analysis complete");
      return parsedResponse;
    } catch (error) {
      console.error("❌ Error processing audio:", error.message);
      throw error;
    }
  }

  async processText(textInput, options = {}) {
    const { apiaryId = "1", context = "" } = options;
    this.getGenAI();
    try {
      console.log("📝 Processing text with Gemini...");

      const prompt = this.buildPrompt(apiaryId, context, textInput);

      console.log("🤖 Sending analysis request...");
      const response = await this.generateWithRetry(
        [{ text: prompt }],
        {
          responseMimeType: "application/json",
          
        }
      );

      let responseText = this.extractText(response);

      if (!responseText) {
        throw new Error("No response text from Gemini API");
      }

      console.log("📄 Response received, parsing...");

      const parsedResponse = this.parseResponse(responseText, apiaryId);

      console.log("✅ Text analysis complete");
      return parsedResponse;
    } catch (error) {
      console.error("❌ Error processing text:", error.message);
      throw error;
    }
  }

  async detectIntent(text, previousAnalysis = null, conversationHistory = []) {
    this.getGenAI();
    try {
      console.log("🔍 Detecting user intent...");

      // FAST-PATH: Check for simple intent keywords with typo tolerance
      const simpleIntent = this.detectSimpleIntent(text);
      if (simpleIntent) {
        console.log(`⚡ Fast-path detected: ${simpleIntent}`);
        const isArabic = /[\u0600-\u06FF]/.test(text);
        const messages = {
          confirm: isArabic ? "✅ تم تأكيد البيانات." : "✅ Data confirmed.",
          cancel: isArabic ? "❌ تم الإلغاء." : "❌ Cancelled.",
          new_analysis: isArabic ? "🆕 تحليل جديد." : "🆕 New analysis started."
        };
        return {
          intent: simpleIntent,
          message: messages[simpleIntent],
          clarification: null,
          target_field: null,
          new_value: null
        };
      }

      const historyContext = conversationHistory
        .slice(-5)
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const prompt = this.buildIntentPrompt(
        text,
        previousAnalysis,
        historyContext,
      );

      const response = await this.generateWithRetry(
        [{ text: prompt }],
        {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              intent: {
                type: "string",
                enum: [
                  "confirm",
                  "edit",
                  "new_analysis",
                  "clarification",
                  "question",
                  "cancel",
                ],
              },
              clarification: { type: "string" },
              target_field: { type: "string" },
              new_value: { type: "string" },
              message: { type: "string" },
            },
            required: ["intent", "message"],
          },
        }
      );

      let responseText = this.extractText(response);

      if (!responseText) {
        throw new Error("No response from Gemini for intent detection");
      }

      // Try to parse JSON with multiple fallback attempts
      let intentData = null;
      let parseError = null;

      // Attempt 1: Direct parsing
      try {
        intentData = JSON.parse(responseText);
      } catch (e) {
        parseError = e;
      }

      // Attempt 2: Clean and parse
      if (!intentData) {
        try {
          const cleanedText = this.cleanJsonResponse(responseText);
          intentData = JSON.parse(cleanedText);
        } catch (e) {
          parseError = e;
        }
      }

      // Attempt 3: Extract JSON using regex
      if (!intentData) {
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extracted = this.cleanJsonResponse(jsonMatch[0]);
            intentData = JSON.parse(extracted);
          }
        } catch (e) {
          parseError = e;
        }
      }

      // If all parsing attempts failed, return a safe default
      if (!intentData) {
        console.error("❌ Failed to parse intent JSON after all attempts:", parseError?.message);
        console.log("📝 Raw response that failed parsing:", responseText.substring(0, 500));
        
        // Return a safe default based on text content
        const lowerText = text.toLowerCase();
        let defaultIntent = "clarification";
        let defaultMessage = "I didn't understand that clearly. Could you please confirm if you want to save the analysis, make changes, or start over?";

        if (lowerText.includes("save") || lowerText.includes("confirm") || lowerText.includes("yes")) {
          defaultIntent = "confirm";
          defaultMessage = "Confirming your inspection data.";
        } else if (lowerText.includes("change") || lowerText.includes("edit") || lowerText.includes("modify")) {
          defaultIntent = "edit";
          defaultMessage = "What would you like to change?";
        } else if (lowerText.includes("cancel") || lowerText.includes("delete") || lowerText.includes("no")) {
          defaultIntent = "cancel";
          defaultMessage = "Session cancelled.";
        }

        intentData = {
          intent: defaultIntent,
          message: defaultMessage,
          clarification: text,
          fallback: true
        };
        console.log("🔄 Using fallback intent detection:", defaultIntent);
      }

      console.log("✅ Intent detected:", intentData.intent);
      return intentData;
    } catch (error) {
      console.error("❌ Error detecting intent:", error.message);
      throw error;
    }
  }

  async modifyAnalysis(currentAnalysis, clarification) {
    this.getGenAI();
    try {
      console.log("🔄 Modifying analysis with clarification...");

      const prompt = this.buildModifyPrompt(currentAnalysis, clarification);

      const response = await this.generateWithRetry(
        [{ text: prompt }],
        {
          responseMimeType: "application/json",
          
        }
      );

      let responseText = this.extractText(response);

      if (!responseText) {
        throw new Error("No response from Gemini");
      }

      const parsed = this.parseResponse(
        responseText,
        currentAnalysis?.apiary_id,
      );

      return {
        updatedAnalysis: parsed.data,
        metadata: parsed.metadata,
      };
    } catch (error) {
      console.error("❌ Error modifying analysis:", error.message);
      throw error;
    }
  }

  buildPrompt(apiaryId, context, textInput = null) {
    const isTextMode = textInput !== null;

    const intro = isTextMode
      ? `You are a specialized AI system for analyzing beekeeping hive inspection TEXT descriptions.`
      : `You are a specialized AI system for analyzing beekeeping hive inspection audio recordings.`;

    const inputSource = isTextMode
      ? `The input below is a TEXT description from a beekeeper: "${textInput}"`
      : `The input is natural human speech that may be:`;

    const hiveExtract = isTextMode
      ? `- Extract hive number directly from the text description`
      : `- Extract hive number directly from audio`;

    return `${intro}
Your task is to convert natural verbal descriptions from beekeepers during hive inspections into accurate and logical structured data.

${isTextMode ? inputSource : inputSource}
- In different Arabic dialects (Saudi, Egyptian, Gulf, etc.)
- Disorganized
- Containing noise or incomplete words
- Fast or slow
- Non-technical

You must understand meaning and context first before analyzing words.

BASIC RULE:
- If information is unclear, infer carefully based on beekeeping logic
- NEVER fabricate data
- If you don't understand a word, re-interpret it from context before rejecting

=== STAGE 1: CONTEXTUAL UNDERSTANDING ===
The system follows the natural sequence of beekeeper speech:
hive → frame → content → quantity

Context rules:
1. If a hive number is mentioned without a frame number, the first content mentioned is for frame 1
2. If said: "this one", "the next", "the second", "the other side" - means current frame or next in sequence
3. If content mentioned without specifying frame: link to last active frame
4. If no active frame exists: default to frame 1
5. Word "flip it" or "other side" means continue on same frame

=== STAGE 2: BEEKEEPING DICTIONARY ===
Hive: خلية (khaliya), صندوق (sanduk), قفير (qfeer), قلية (qilya)
Frame: برواز (barwaz), إطار (itrar), ايطار (itar), هذا فيه (hatha fih), اللي بعده (elly ba3do), الاخر (elakher)
Honey: عسل (asal), رشت (rasht), رشة (rasha), رحيق (rahiq), عسل مختوم (asal mokhtam), عصر (asar)
Eggs: بيض (bayd), صوب (sub), صواب (sawab), ذري (thari), دود (dud), بزورة (bazura), طرح (tarah)

=== STAGE 2b: BROOD TYPES - CRITICAL MAPPING ===
OPEN BROOD (Larva/Pupa visible in cells) → JSON field "brood_open":
- حضنة مفتوحة (hadna maftoha) - Multiple variations:
  * حضنة مفتوحة / حضنه مفتوحة / حضنة مفتوحه / حضنه مفتوحه
  * حوي (hay) / حياة (hayat) / خدمة (khidma)
  * شغال مفتوح / شغل مفتوح / يرقات (yarqat)

SEALED BROOD (Capped cells with developing bees) → JSON field "brood_sealed":
- حضنة مغلقة (hadna mughlaqa) - Multiple variations:
  * حضنة مغلقة / حضنه مغلقة / حضنة مغلقه / حضنه مغلقه
  * غمي (ghami) / غامي (ghami) / ختوم (khtum) / ختم (khatam) / مختوم (mokhtum)
  * شغال مختوم / شغل مغلق

IMPORTANT: Listen carefully for these exact Arabic terms and map correctly:
- "مفتوح" or "مفتوحة" in context of brood → brood_open
- "مغلق" or "مغلقة" in context of brood → brood_sealed

DEFAULT RULE: If user says "حضنه" or "حضنة" WITHOUT specifying "مفتوحة" or "مغلقة":
- "حضنه" or "حضنة" ALONE → defaults to OPEN BROOD (brood_open)
- Examples: "فيه حضنه" / "عندي حضنة" / "الحضنة كثيرة" → brood_open: [1] or [2]
- Only map to SEALED if user explicitly says "مغلقة", "مغلق", "ختوم", or "مختوم"

=== STAGE 2c: ARABIC SPEECH PATTERNS - EXAMPLES ===
Pattern 1 - Sequential Frame Description:
Input: "خلية 5... الإطار الأول فيه عسل... والثاني فيه حضنة مفتوحة وبيض..."
→ cell_id: "5", frame 1: honey present, frame 2: brood_open + eggs

Pattern 2 - Mixed Content:
Input: "إطار 3 مليان عسل وختوم"
→ frame 3: honey [2] + brood_sealed [2]

Pattern 3 - Correction Pattern:
Input: "لا لا مش الإطار 2، الإطار 3 اللي فيه الحضنة"
→ Ignore frame 2, update frame 3 with brood

Pattern 4 - Quantity Description:
Input: "فيه شوية بيض وPresence of open brood and eggs with the queen present"
→ eggs: [1], brood_open: [1], queen_status: "present"

Pattern 5 - Multiple Frames at Once:
Input: "الأول والثاني فيهم عسل، الثالث فيه حضنة مغلقة"
→ frame 1: honey, frame 2: honey, frame 3: brood_sealed

Pattern 6 - "حضنه" Without Open/Closed Specified (Defaults to OPEN):
Input: "الإطار ٢ فيه حضنه" or "فيه حضنة"
→ frame 2: brood_open: [1], brood_sealed: [0]

Input: "الإطار ٣ حضنه مغلقة"
→ frame 3: brood_open: [0], brood_sealed: [1]

Pollen: ردم (radam), خبز (khibz), حبوب لقاح (hubub luwah), غبار (ghabar)
Queen: ملكة (malika), العراد (elared), الابو (elabu), ماما (mama), الأم (elom)
Empty Frame: فاضي (fadi), اساس (asas), جديد (jdid)

=== STAGE 3: QUANTITIES ===
Low: شوية (shwaya), ربع (rub3), رشة (rasha), بسيط (basit), خفيف (khafeef), بداية (bidaya)
Medium: نصف (nisf), طيب (tayeb), زين (zayn), جيدة (jayida), ماشي حاله (mashi hala)
High: فل (full), مليان (milyan), كامل (kamal), قوي (gawi), ممتاز (mumtaz), ما شاء الله (ma shaa Allah)

=== STAGE 4: EXTRACT HIVE NUMBER (CRITICAL) ===
${hiveExtract}
- Examples: "الخلية رقم 7" (hive number 7) → cell_id = "7"
- If hive number not explicitly mentioned, use default "1"
- DO NOT infer cell_id from previous context or conversations

=== STAGE 5: QUEEN STATUS ===
- If queen mentioned explicitly → queen_status = "present"
- If eggs or fresh brood found and queen not mentioned → queen is implicitly present ("present")
- If queen absence explicitly mentioned → "absent"

=== STAGE 6: ALERTS ===
- If signs of disease or parasites found, add to alerts

${context ? `Previous context: ${context}` : ""}

=== CRITICAL - QUANTITY VALUES MUST BE 0, 1, 2, OR 3 ONLY ===
Quantity scale (STRICT - no other values allowed):
- 0 = NOT MENTIONED or not addressed in the text
- 1 = LOW quantity (قليل، ضعيف، بسيط، شوية)
- 2 = MEDIUM quantity (متوسط، عادي، نصف، طيب)
- 3 = HIGH quantity (كثير، عالي، كبير، مليان، ما شاء الله)

=== REQUIRED JSON FORMAT ===
Return ONLY valid JSON with this exact structure:
{
  "apiary_id": "1",
  "inspection_date": "2026-02-27T10:00:00",
  "cell_id": "1",
  "total_frames": 3,
  "description": "general description from voice",
  "queen_status": "present",
  "overall_health": "good",
  "frames": [
    {
      "frame_number": 1,
      "honey": ["2"],
      "eggs": ["1"],
      "brood_open": ["2"],
      "brood_sealed": ["0"],
      "pollen": [],
      "empty_frame": false,
      "notes": "عسل كثير في الإطار الأول مع حضنة مفتوحة"
    }
  ]
}

=== CRITICAL - QUANTITY ARRAY VALUES ===
Return arrays with SINGLE values based on quantity detected:
- none/not mentioned → ["0"]
- low/قليل/شوية → ["1"]
- medium/متوسط/نصف → ["2"]  
- high/كثير/مليان → ["3"]

EXAMPLES:
- "فيه عسل كثير" → "honey": ["3"]
- "شوية بيض" → "eggs": ["1"]
- "حضنة مفتوحة متوسطة" → "brood_open": ["2"], "brood_sealed": ["0"]
- "ما فيه شي" or not mentioned → ["0"] or can be omitted
- "فيه ختوم كثير" → "brood_open": ["0"], "brood_sealed": ["3"]

NEVER return ["0","1","2"] - always use SINGLE value based on actual quantity!

IMPORTANT RULES:
- honey/eggs/brood_open/brood_sealed/pollen: Use SINGLE value in array based on quantity
- ["0"] means none/not mentioned
- brood_open = for حضنة مفتوحة (open brood)
- brood_sealed = for حضنة مغلقة (sealed brood)
- notes is REQUIRED for each frame in Arabic
- cell_id is the hive number extracted from the audio
- Return ONLY valid JSON with no additional text or markdown`;
  }

  buildIntentPrompt(text, previousAnalysis, historyContext) {
    const analysisContext = previousAnalysis
      ? `Previous analysis:\n${JSON.stringify(previousAnalysis, null, 2)}`
      : "No previous analysis";

    return `You are an AI assistant helping a beekeeper confirm or edit their hive inspection analysis.

=== ARABIC INTENT RECOGNITION DICTIONARY ===
CONFIRM (Save/Approve) → intent: "confirm":
- نعم, yes, أيوة, آه, صح, صحيح, تمام, ماشي, ok, confirm, save
- تم, حفظ, تأكيد, يس, yup, yeah, موافق, أوكي, خلاص
- ما شاء الله, حلو, زين, طيب, كويس, ممتاز

EDIT (Modify/Change) → intent: "edit":
- غير, تغيير, change, تعديل, modify, خطأ, غلط, مش صح
- غير لي, عدل, صحح, ليس صحيح, خطأ في, غلط في

CANCEL (Delete/Restart) → intent: "cancel":
- إلغاء, cancel, حذف, امسح, شيل, new, جديد, من جديد
- غيرت رأيي, changed my mind, start over, restart, انسحب, ما أبي

QUESTION (Inquiry) → intent: "question":
- سؤال, question, ?, why, ليش, لماذا, كيف, how, what, ايش
- متى, when, وين, where, كم, how many

CLARIFICATION (Additional Info) → intent: "clarification":
- توضيح, clarify, كمان, also, additionally, besides, وأيضا, además

${analysisContext}

${historyContext ? `Conversation history:\n${historyContext}\n` : ""}

User's message: "${text}"

=== INSTRUCTIONS ===
1. Identify intent based on keywords above
2. For "edit", extract WHAT to change and TO WHAT
3. For "question", understand what information user seeks
4. For "clarification", capture the additional details provided
5. Respond with friendly Arabic or English based on user's language

Return JSON:
{
  "intent": "confirm|edit|question|clarification|new_analysis|cancel",
  "clarification": "Detailed explanation of what user wants (for edit/clarification)",
  "target_field": "Specific field to change if edit (e.g., 'frame_2_brood', 'cell_id', 'honey_quantity')",
  "new_value": "The new value for target field",
  "message": "Friendly response in user's language (Arabic if user spoke Arabic)"
}

Return ONLY valid JSON with no markdown formatting.`;
  }

  buildModifyPrompt(currentAnalysis, clarification) {
    return `You are a beekeeping expert AI specializing in Arabic beekeeping terminology.

TASK: Modify the existing analysis based on user's clarification.

CURRENT ANALYSIS:
${JSON.stringify(currentAnalysis, null, 2)}

USER CLARIFICATION:
${clarification}

=== ARABIC MODIFICATION PATTERNS ===
CELL/HIVE CHANGES:
- "الخلية رقم ٧" or "cell is 7" → cell_id: "7"
- "غير الخلية لـ ٥" → cell_id: "5"
- "خطأ، الخلية ٣ مش ٢" → cell_id: "3"

FRAME CHANGES:
- "الإطار الأول" or "frame 1" → frame_number: 1
- "غير الإطار ٢" → modify frame 2
- "أضف إطار" → add new frame
- "امسح الإطار ٣" → remove frame 3

CONTENT CHANGES (Arabic Terms):
HONEY (عسل):
- "الإطار ١ فيه عسل كثير" → frame 1: honey: [3]
- "ما فيه عسل" → honey: [0]
- "شوية عسل" → honey: [1]

EGGS (بيض):
- "فيه بيض" → eggs: [2] or [3]
- "ما فيه بيض" → eggs: [0]
- "بيض كثير" → eggs: [3]

OPEN BROOD (حضنة مفتوحة) → brood_open field:
- "فيه حضنة مفتوحة" or "شغال مفتوح" → brood_open: ["1"] or ["2"], brood_sealed: []
- "حضنة مفتوحة في الإطار ٢" → frame 2: brood_open: ["1"], brood_sealed: []
- "كتير حضنة مفتوحة" → brood_open: ["2"], brood_sealed: []
- Variations: حضنة مفتوحة, حضنه مفتوحة, حضنة مفتوحه, حوي, حياة

SEALED BROOD (حضنة مغلقة) → brood_sealed field:
- "فيه حضنة مغلقة" or "شغال مختوم" → brood_open: [], brood_sealed: ["1"] or ["2"]
- "حضنة مغلقة في الإطار ٣" → frame 3: brood_open: [], brood_sealed: ["1"]
- "ختوم كثير" → brood_open: [], brood_sealed: ["2"]
- Variations: حضنة مغلقة, حضنه مغلقة, حضنة مغلقه, غمي, غامي, ختوم, مختوم
- ONLY use brood_sealed when explicitly mentioning مغلقة/مختوم/ختوم

COMBINED BROOD:
- If both open and sealed mentioned → brood_open: ["1"], brood_sealed: ["2"]

POLLEN (ردم/غبار):
- "فيه ردم" or "غبار" → pollen: [2] or [3]
- "ردم كثير" or "ما شاء الله" → pollen: [3]

HIGH QUANTITY PHRASES:
- "ما شاء الله", "ما شاء الله تبارك الله", "ماشاء الله", "كتير", "كثير", "مليان" → [3]
- When user says "ما شاء الله" it means A LOT → return [3]

EMPTY FRAME (فاضي):
- "إطار فاضي" or "فاضي" → empty_frame: true
- "ما فيه شي" → empty_frame: true

QUEEN STATUS:
- "الملكة موجودة" or "شفت الملكة" → queen_status: "present"
- "ما فيه ملكة" or "مفقودة" → queen_status: "absent"

HEALTH STATUS:
- "الصحة جيدة" or "ممتاز" → overall_health: "good"
- "تحذير" or "مرض" → overall_health: "warning"
- "سيئ" or "ضعيف" → overall_health: "poor"

=== INSTRUCTIONS ===
1. Parse the Arabic/English clarification carefully
2. Identify which specific frames and fields to modify
3. Extract quantities from Arabic descriptions (كثير/قليل/شوية/ما شاء الله/ما فيه)
4. IMPORTANT: When user says "ما شاء الله" or "ما شاء الله تبارك الله" it means HIGH quantity → return [3]
5. Update ONLY the mentioned fields
5. Keep all other data unchanged
6. Ensure all frame notes are descriptive in Arabic

=== CRITICAL - QUANTITY VALUES MUST BE 0, 1, 2, OR 3 ONLY ===
Quantity scale (STRICT):
- 0 = NOT MENTIONED or not addressed
- 1 = LOW (قليل، ضعيف، بسيط، شوية)
- 2 = MEDIUM (متوسط، عادي، نصف، طيب)
- 3 = HIGH (كثير، عالي، كبير، مليان، ما شاء الله)

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "apiary_id": "...",
  "inspection_date": "2026-02-27T10:00:00",
  "cell_id": "...",
  "total_frames": ...,
  "description": "General description in Arabic",
  "queen_status": "present",
  "overall_health": "good",
  "frames": [
    {
      "frame_number": 1,
      "honey": ["0","1","2"],
      "eggs": ["0","1","2"],
      "brood_open": ["0","1","2"],
      "brood_sealed": ["0","1","2"],
      "pollen": ["0","1","2"],
      "empty_frame": false,
      "notes": "عسل متوسط في الإطار الأول مع حضنة مفتوحة"
    }
  ]
}

CRITICAL RULES:
- honey/eggs/brood_open/brood_sealed/pollen: ["1"]=low, ["2"]=medium, ["3"]=high, ["0"]=none/not mentioned
- brood_open = for حضنة مفتوحة (open brood)
- brood_sealed = for حضنة مغلقة (sealed brood)
- When user mentions "ما شاء الله" → [3] (for honey/eggs/pollen only)
- Update cell_id if user mentions different hive number
- Keep notes in Arabic and descriptive
- Return ONLY valid JSON with no markdown`;
  }

  cleanJsonResponse(responseText) {
    let cleanedText = responseText.trim();

    const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      cleanedText = jsonMatch[1].trim();
    }

    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    cleanedText = cleanedText.replace(/\/\/.*$/gm, "");
    cleanedText = cleanedText.replace(/\/\*[\s\S]*?\*\//g, "");
    cleanedText = cleanedText.replace(/'/g, '"');
    cleanedText = cleanedText.replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    cleanedText = this.removeTrailingCommas(cleanedText);

    return cleanedText;
  }

  parseResponse(responseText, inputApiaryId = null) {
    try {
      let cleanedText = responseText.trim();

      const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        cleanedText = jsonMatch[1].trim();
      }

      const firstBrace = cleanedText.indexOf("{");
      const lastBrace = cleanedText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      cleanedText = cleanedText.replace(/\/\/.*$/gm, "");
      cleanedText = cleanedText.replace(/\/\*[\s\S]*?\*\//g, "");
      cleanedText = cleanedText.replace(/'/g, '"');
      cleanedText = cleanedText.replace(/([{,]\s*)(\w+):/g, '$1"$2":');
      cleanedText = this.removeTrailingCommas(cleanedText);

      const jsonData = JSON.parse(cleanedText);
      console.log("✅ AI returned structured JSON");

      const inspectionData = this.transformToDataFormat(
        jsonData,
        inputApiaryId,
      );

      return {
        type: "analysis",
        success: true,
        data: inspectionData,
        metadata: jsonData.metadata || {
          queen_status: "unknown",
          overall_health: "unknown",
          alerts: [],
        },
        raw_response: cleanedText,
      };
    } catch (error) {
      console.error("❌ Error parsing response:", error.message);
      throw error;
    }
  }

  transformToDataFormat(parsedData, inputApiaryId = null) {
    let inspectionDate = parsedData.inspection_date;
    if (
      !inspectionDate ||
      inspectionDate === "null" ||
      inspectionDate === null
    ) {
      inspectionDate = new Date().toISOString();
    }

    const finalApiaryId =
      parsedData.apiary_id || inputApiaryId || "1";

    // Transform frames to ensure brood structure is correct and values are 0-3
    const transformedFrames = (parsedData.frames || []).map((frame) => {
      let broodOpen = [];
      let broodSealed = [];

      if (frame.brood) {
        broodOpen = frame.brood.open || [];
        broodSealed = frame.brood.sealed || [];
      } else {
        broodOpen = frame.brood_open || [];
        broodSealed = frame.brood_sealed || [];
      }

      return {
        frame_number: frame.frame_number || 1,
        honey: this.validateQuantityArray(frame.honey, "quantity"),
        eggs: this.validateQuantityArray(frame.eggs, "quantity"),
        brood: {
          open: this.validateQuantityArray(broodOpen, "brood"),
          sealed: this.validateQuantityArray(broodSealed, "brood"),
        },
        pollen: this.validateQuantityArray(frame.pollen, "quantity"),
        empty_frame: frame.empty_frame || false,
        notes: frame.notes || "",
      };
    });

    return {
      apiary_id: finalApiaryId,
      inspection_date: inspectionDate,
      data: [
        {
          cell_id: parsedData.cell_id || "1",
          total_frames:
            parsedData.total_frames || transformedFrames.length || 0,
          frames: transformedFrames,
          description: parsedData.description || "",
        },
      ],
      metadata: {
        queen_status: parsedData.queen_status || "unknown",
        overall_health: parsedData.overall_health || "unknown",
        alerts: parsedData.alert_list || [],
      },
    };
  }

  removeTrailingCommas(text) {
    let result = "";
    let inString = false;
    let stringChar = "";
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];

      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && inString) {
        if (text[i - 1] !== "\\") {
          inString = false;
          stringChar = "";
        }
      }

      if (char === "," && !inString) {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) {
          j++;
        }
        if (j < text.length && (text[j] === "}" || text[j] === "]")) {
          i++;
          continue;
        }
      }

      result += char;
      i++;
    }

    return result;
  }

  extractText(response) {
    if (response.text) {
      return typeof response.text === "function"
        ? response.text()
        : response.text;
    } else if (response.response) {
      return typeof response.response.text === "function"
        ? response.response.text()
        : response.response.text;
    }
    return null;
  }

  validateQuantityArray(value, type = "quantity") {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return [];
    }

    const validValues = value
      .map((v) => {
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const num = parseInt(v, 10);
          return isNaN(num) ? null : num;
        }
        return null;
      })
      .filter((v) => v !== null && v >= 0 && v <= 3);

    return validValues;
  }

  containsCellReference(transcription) {
    if (!transcription || typeof transcription !== "string") {
      return false;
    }

    const cellPatterns = [
      /خلية\s*\d+/i,
      /cell\s*\d+/i,
      /hive\s*\d+/i,
      /صندوق\s*\d+/i,
      /قفير\s*\d+/i,
      /قلية\s*\d+/i,
    ];

    return cellPatterns.some((pattern) => pattern.test(transcription));
  }
}

module.exports = AudioProcessor;
