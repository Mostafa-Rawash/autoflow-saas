# خطة تطوير نظام إدارة المحادثات وتعديل التحليل مع Gemini AI

## نظرة عامة على النظام

النظام الحالي يستخدم نموذج جلسات بسيط يعتمد على `session_id` من Gemini، لكن يحتاج لتطور كبير ليقوم بـ:

1. **إدارة محادثات متعددة المراحل** مع تتبع كامل للتاريخ
2. **تمرير معلومات الجلسات** بين أجزاء النظام المختلفة
3. **السماح للمستخدم بتعديل التحليل** الوارد من خلال الردود النصية أو الصوتية
4. **إعادة إرسال التحليل المعدل** إلى Gemini AI لتحديث JSON
5. **الاحتفاظ بسجل محادثات** كامل مع Gemini للاستفادة من السياق

---

## المتطلبات الأساسية

### 1. هيكل البيانات الجديد للمحادثة

```typescript
interface Conversation {
  apiary_id: string;
  phone_number: string;
  session_id: string | null;
  transcription: string | null;
  analysis: any;              // التحليل الحالي
  questions: string[];        // الأسئلة المطلوبة للتوضيح
  clarifications: Clarification[]; // التعديلات والإيضاحات
  state: ConversationState;
  
  // سجل المحادثة مع Gemini
  chat_history: ChatMessage[]; 
  
  created_at: string;
  updated_at: string;
}

interface Clarification {
  id: string;
  type: 'text' | 'audio';
  content: string;            // نص التعديل أو التفريغ الصوتي
  timestamp: string;
  applied: boolean;           // هل تم تطبيق هذا التعديل؟
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
}

type ConversationState = 
  | 'INITIATED'
  | 'AWAITING_CLARIFICATION'
  | 'ANALYSIS_IN_PROGRESS'
  | 'ANALYSIS_COMPLETE'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'FAILED';
```

---

## البنية الجديدة للنظام

### 1. تحديث ConversationManager

```typescript
class ConversationManager {
  // ...existing code...
  
  // إضافة سجل المحادثة
  private chatHistories: Map<string, ChatMessage[]> = new Map();
  
  // الحصول على محادثة مع التهيئة الكاملة
  getOrCreateConversation(phoneNumber: string): Conversation {
    // ...
  }
  
  // معالجة رد المستخدم (تعديل أو توضيح)
  async processUserClarification(
    apiaryId: string,
    clarification: string | { type: 'audio', content: string }
  ): Promise<{
    needsMoreClarification: boolean;
    questions?: string[];
    analysis?: any;
    message: string;
  }> {
    // 1. إضافة رد المستخدم إلى السجل
    // 2. إرسال التعديل إلى Gemini مع التحليل الحالي
    // 3. طلب إعادة كتابة JSON بالتعديلات
    // 4. تحديث التحليل والرد على المستخدم
  }
  
  // إضافة رسالة إلى سجل المحادثة
  addToChatHistory(apiaryId: string, role: 'user' | 'model', text: string): void {
    // ...
  }
  
  // بناء سياق المحادثة لإرساله إلى Gemini
  buildChatContext(apiaryId: string): ChatMessage[] {
    // يجلب آخر N رسالة من السجل
  }
}
```

### 2. GeminiClient الجديد مع دعم المحادثة

```typescript
class GeminiClient {
  // استخدام REST API مع إرسال السياق الكامل
  
  async startSession(
    apiaryId: string, 
    audioBase64: string, 
    phoneNumber?: string
  ): Promise<SessionResult> {
    // بدء جلسة جديدة مع Gemini
  }
  
  async submitSessionAnswers(
    sessionId: string, 
    answers: Record<string, string>
  ): Promise<SessionResult> {
    // ...
  }
  
  // دالة جديدة: تعديل التحليل
  async modifyAnalysis(
    currentAnalysis: any,
    clarification: string,
    chatHistory: ChatMessage[]
  ): Promise<{
    updatedAnalysis: any;
    needsMoreClarification: boolean;
    questions?: string[];
  }> {
    // 1. بناءrompt يحتوي على:
    //    - التحليل الحالي
    //    - تعديل المستخدم
    //    - سجل المحادثة
    // 2. طلب من Gemini إعادة كتابة JSON مع التعديلات
    // 3. التحقق من صحة JSON الناتج
  }
  
  // دالة جديدة: إضافة توضيح صوتي
  async processClarificationAudio(
    audioBase64: string,
    currentAnalysis: any,
    chatHistory: ChatMessage[]
  ): Promise<{
    transcription: string;
    updatedAnalysis: any;
    needsMoreClarification: boolean;
    questions?: string[];
  }> {
    // 1. تحويل الصوت إلى نص
    // 2. إرسال للتعديل كالمعتاد
  }
}
```

---

## سير العمل التفصيلي

### مسار 1: المستخدم يرسل صوت للتحليل الأولي

```
WhatsApp → Server → ConversationManager → GeminiClient
                                        ↓
                              [إنشاء جلسة جديدة]
                                        ↓
                              Gemini تُرجع التحليل
                                        ↓
                              ConversationManager
                                        ↓
                              تحديث Conversation + ChatHistory
                                        ↓
                              MessageFormatter.formatAnalysis()
                                        ↓
                              WhatsApp Reply
```

### مسار 2: المستخدم يريد تعديل التحليل

```
WhatsApp (نصي) → Server → ConversationManager
                              ↓
                    [إضافة للـ ChatHistory]
                              ↓
                    GeminiClient.modifyAnalysis()
                              ↓
                    [إرسال مع السياق الكامل]
                              ↓
                    Gemini تُرجع تحليل معدل
                              ↓
                    تحديث Conversation.analysis
                              ↓
                    MessageFormatter.formatAnalysis()
                              ↓
                    WhatsApp Reply
```

### مسار 3: المستخدم يرسل صوت كتوضيح

```
WhatsApp (صوتي) → Server → ConversationManager
                              ↓
                    [تحميل الصوت]
                              ↓
                    GeminiClient.processClarificationAudio()
                              ↓
                    [تحويل الصوت لنص + تعديل]
                              ↓
                    Gemini تُرجع تحليل معدل
                              ↓
                    تحديث Conversation + ChatHistory
                              ↓
                    MessageFormatter.formatAnalysis()
                              ↓
                    WhatsApp Reply
```

---

## تنفيذ Gemini API مع سياق المحادثة

### الطريقة الأولى: REST API (مطلوبة لأننا نستخدم gemini-robot)

```typescript
async function modifyAnalysisWithContext(
  geminiUrl: string,
  currentAnalysis: any,
  clarification: string,
  chatHistory: ChatMessage[]
): Promise<any> {
  // بناء سياق المحادثة
  const contents = [
    // رسائل سابقة
    ...chatHistory.map(msg => ({
      role: msg.role,
      parts: msg.parts
    })),
    // رسالة التعديل الجديدة
    {
      role: 'user',
      parts: [{
        text: `
التحليل الحالي:
${JSON.stringify(currentAnalysis, null, 2)}

تعديل المستخدم:
${clarification}

الرجاء إعادة كتابة JSON مع أخذ التعديل بعين الاعتبار.
أعد فقط JSON صالح بدون نص إضافي.
`
      }]
    }
  ];

  const response = await fetch(`${geminiUrl}/generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        responseJsonSchema: ANALYSIS_SCHEMA // تعريف هيكل JSON المتوقع
      }
    })
  });

  const result = await response.json();
  return JSON.parse(result.candidates[0].content.parts[0].text);
}
```

### الطريقة الثانية: استخدام Gemini SDK

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// إنشاء محادثة مع السياق
async function modifyAnalysisWithSDK(
  currentAnalysis: any,
  clarification: string,
  chatHistory: ChatMessage[]
) {
  // إنشاء محادثة
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
أنت مساعد لتحليل بيانات خلايا النحل.
Receives analysis and user clarifications.
يرد بـ JSON معدل فقط بدون نص إضافي.
`
    }
  });

  // إرسال السياق السابق
  for (const msg of chatHistory.slice(-5)) { // آخر 5 رسائل
    await chat.sendMessage({ 
      message: msg.parts[0].text 
    });
  }

  // إرسال التعديل
  const response = await chat.sendMessage({
    message: `
التحليل الحالي:
${JSON.stringify(currentAnalysis)}

تعديل المستخدم:
${clarification}

أعد JSON معدل فقط:
`
  });

  return JSON.parse(response.text);
}
```

---

## هيكل JSON المتوقع للتحليل

```typescript
const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    apiary_id: { type: "string" },
    inspection_date: { type: "string" },
    cell_id: { type: "string" },
    total_frames: { type: "number" },
    queen_status: { type: "string" },
    overall_health: { type: "string" },
    description: { type: "string" },
    frames: {
      type: "array",
      items: {
        type: "object",
        properties: {
          frame_number: { type: "number" },
          honey: { type: "string" },
          eggs: { type: "string" },
          brood_open: { type: "string" },
          brood_sealed: { type: "string" },
          pollen: { type: "string" },
          empty_frame: { type: "string" },
          notes: { type: "string" }
        }
      }
    },
    alerts: {
      type: "array",
      items: { type: "string" }
    },
    confidence_score: { type: "number" }
  },
  required: ["apiary_id", "queen_status", "overall_health"]
};
```

---

## تحديث MessageFormatter لدعم التعديلات

```typescript
class MessageFormatter {
  // ...existing methods...
  
  static analysisWithModification(
    originalAnalysis: any, 
    modification: string
  ): string {
    return `
📝 *تم تعديل التحليل بناءً على ملاحظاتك*

🔄 *التعديل الذي أرسلته:*
${modification}

━━━━━━━━━━━━━━━━━━━━━━━━

🐝 *التحليل المحدث:*
${MessageFormatter.formatArabicReport(originalAnalysis)}

━━━━━━━━━━━━━━━━━━━━━━━━

✅ *تأكيد؟* [نعم/لا]
`;
  }
  
  static askingForModification(
    currentAnalysis: any,
    question: string
  ): string {
    return `
❓ *استفسار:*

${question}

━━━━━━━━━━━━━━━━━━━━━━━━

📊 *التحليل الحالي:*
${MessageFormatter.formatArabicReport(currentAnalysis)}

━━━━━━━━━━━━━━━━━━━━━━━━

💬 *أرسل تعديلك أو إجابتك*
`;
  }
}
```

---

## قائمة المهام للتنفيذ

### المرحلة 1: تحديث Types و Database
- [ ] تحديث `Conversation` type ليشمل `chat_history`
- [ ] إضافة `Clarification` type
- [ ] تحديث schema للحفظ (ملفات أو قاعدة بيانات)

### المرحلة 2: تحديث ConversationManager
- [ ] إضافة `addToChatHistory()` method
- [ ] إضافة `buildChatContext()` method  
- [ ] تحديث `processUserResponse()` ليدعم التعديلات
- [ ] إضافة `processClarification()` method جديد

### المرحلة 3: تحديث GeminiClient
- [ ] إضافة REST client مع دعم السياق
- [ ] تنفيذ `modifyAnalysis()` method
- [ ] تنفيذ `processClarificationAudio()` method
- [ ] إضافة JSON validation

### المرحلة 4: تحديث Server
- [ ] تحديث message handler ليدعم أنواع الردود المختلفة
- [ ] إضافة routes للتحكم بالجلسة

### المرحلة 5: الاختبار
- [ ] اختبار إرسال صوت أولي
- [ ] اختبار إرسال تعديل نصي
- [ ] اختبار إرسال صوت كتوضيح
- [ ] اختبار تأكيد/رفض التحليل المحدث

---

## ملاحظات هامة

### إدارة سياق Gemini
- **تجنب إرسال كل المحادثة**: استخدم آخر 5-10 رسائل فقط
- **trim old messages**: يمكن تلخيص الرسائل القديمة إذا طالت المحادثة
- **system instruction**: استخدم لتوجيه Gemini لـرد بـ JSON فقط

### معالجة الأخطاء
- **Validate JSON**: تأكد من أن Gemini يرد بـ JSON صالح
- **Fallback**: إذا فشل التعديل، أرجع للتحليل الأصلي مع رسالة خطأ

### تجربة المستخدم
- ** jelas Feedback**: أخبر المستخدم أن التعديل قيد المعالجة
- **Confirm Changes**: اعرض التحليل المحدث واطلب تأكيد
- **History Accessible**: اسمح للمستخدم vedere محادثة التعديلات

---

## مثال على المحادثة الكاملة

```
المستخدم: [يرسل صوت]
النظام: 🐝 *تقرير فحص خلية نحل*
        📅 تاريخ الفحص: ...
        📦 رقم الخلية: 5
        👑 الملكة: موجودة
        💚 الصحة: جيدة
        ✅ تأكيد؟ [نعم/لا]

المستخدم: رقم الخلية خطأ، يجب أن يكون 7
النظام: 📝 *تم تعديل التحليل*
        🔄 التعديل: رقم الخلية خطأ، يجب أن يكون 7
        
        🐝 *التحليل المحدث:*
        📦 رقم الخلية: 7 ✓
        
        ✅ تأكيد؟ [نعم/لا]

المستخدم: نعم
النظام: ✅ *تم حفظ التحليل بنجاح*
```

---

## المراجع

- [Gemini API Structured Output](https://ai.google.dev/gemini-api/docs/structured-output)
- [Multi-turn Conversations](https://ai.google.dev/docs/multiturn-conversation)
- [REST API Examples](https://ai.google.dev/docs/rest-api-guide)
