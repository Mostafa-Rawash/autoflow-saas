/**
 * Message formatter utilities
 * Formats WhatsApp messages for user communication - Detailed Arabic Format
 */

/**
 * Format frame details
 */
function formatFrames(frames) {
  if (!frames || !Array.isArray(frames)) return '';
  
  let result = '';
  frames.forEach((frame, index) => {
    const frameNum = frame.frame_number || (index + 1);
    const honey = frame.honey?.[0] ?? '-';
    const eggs = frame.eggs?.[0] ?? '-';
    const broodOpen = frame.brood?.open?.[0] ?? '-';
    const broodSealed = frame.brood?.sealed?.[0] ?? '-';
    const pollen = frame.pollen?.[0] ?? '-';
    const isEmpty = frame.empty_frame === true;
    const notes = frame.notes || '';
    
    result += `\n🔹 إطار رقم: ${frameNum}`;
    result += `\n- 🍯 عسل: ${honey}`;
    result += `\n- 🥚 بيض: ${eggs}`;
    result += `\n- 🐛 حضنة مفتوحة: ${broodOpen}`;
    result += `\n- 🔒 حضنة مغلقة: ${broodSealed}`;
    result += `\n- 🌼 حبوب لقاح: ${pollen}`;
    result += `\n- 🪹 إطار فارغ: ${isEmpty}`;
    if (notes) {
      result += `\n🗒 ملاحظات: ${notes}`;
    }
    result += '\n';
  });
  
  return result;
}

/**
 * Format full analysis report
 */
function formatAnalysisReport(analysis, showModification = false, clarification = '') {
  let report = '';
  
  // Get nested data
  const cellData = analysis?.data?.[0] || {};
  const metadata = analysis?.metadata || {};
  const frames = cellData.frames || [];
  
  const apiaryId = analysis?.apiary_id || cellData?.apiary_id || 'null';
  const inspectionDate = analysis?.inspection_date || cellData?.inspection_date || 'null';
  const cellId = cellData?.cell_id || 'null';
  const totalFrames = cellData?.total_frames || frames.length || 'null';
  
  const queenStatus = metadata?.queen_status || 'غير محدد';
  const overallHealth = metadata?.overall_health || 'غير محدد';
  const description = metadata?.description || '';
  const alerts = metadata?.alerts || [];

  // Header
  report += '🐝 *تقرير فحص خلية نحل*\n';
  report += '\n━━━━━━━━━━━━━━\n';
  
  // Basic info
  report += `📅 تاريخ الفحص: ${inspectionDate}\n`;
  report += `🏡 رقم المنحل: ${apiaryId}\n`;
  report += `📦 رقم الخلية: ${cellId}\n`;
  report += `🪵 عدد الإطارات: ${totalFrames}\n`;
  
  report += '\n━━━━━━━━━━━━━━\n';
  
  // Queen status
  report += '📋 *حالة الملكة*\n';
  report += `👑 ${queenStatus}\n`;
  
  report += '\n━━━━━━━━━━━━━━\n';
  
  // Overall health
  report += '💚 *الصحة العامة*\n';
  report += `${overallHealth}\n`;
  
  // Description
  if (description) {
    report += '\n━━━━━━━━━━━━━━\n';
    report += '📝 *الوصف العام*\n';
    report += `${description}\n`;
  }
  
  // Frames details
  if (frames.length > 0) {
    report += '\n━━━━━━━━━━━━━━\n';
    report += '🪵 *تفاصيل الإطارات*\n';
    report += formatFrames(frames);
  }
  
  // Alerts
  report += '\n━━━━━━━━━━━━━━\n';
  report += '🚨 *تنبيهات*\n';
  if (alerts.length > 0) {
    alerts.forEach(alert => {
      report += `• ${alert}\n`;
    });
  } else {
    report += '✅ لا توجد تنبيهات\n';
  }
    
  return report;
}

/**
 * Format initial inspection result
 */
export function inspectionReady(analysis, transcription) {
  if (!analysis) {
    return '❌ Unable to analyze the audio. Please try again.';
  }

  let message = '';
  
  // Add user clarification if provided (for modified analysis)
  message += '✅ *تم تحليل الصوت*\n';
  
  message += '\n━━━━━━━━━━━━━━\n';
  
  // Add full analysis report
  message += formatAnalysisReport(analysis);
  
  message += '\n━━━━━━━━━━━━━━\n';
  message += '\n✅ *تأكيد؟* [نعم/لا]';
  message += '\n📝 يمكنك إرسال ملاحظة للتعديل';

  return message;
}

/**
 * Confirmation message when saved
 */
export function inspectionSaved() {
  return `✅ *تم حفظ الفحص بنجاح*

تم حفظ تقرير فحص خلية النحل في قاعدة البيانات.

🐝 يمكنك إرسال صوت جديد لفحص آخر`;
}

/**
 * Message when user rejects
 */
export function userRejected() {
  return `❌ *تم رفض الفحص*

تم تجاهل الفحص.

🐝 يمكنك إرسال صوت جديد لفحص آخر`;
}

/**
 * Format clarification questions
 */
export function clarificationQuestions(questions, transcription) {
  if (!questions || questions.length === 0) {
    return '❓ يرجى تقديم مزيد من المعلومات حول الفحص.';
  }

  let message = '❓ *أسئلة للتوضيح*\n';
  
  if (transcription) {
    message += `\n📝 *النص:* ${transcription}\n`;
  }
  
  message += '\n━━━━━━━━━━━━━━\n';
  message += 'الرجاء الإجابة على:\n\n';
  
  questions.forEach((q, index) => {
    message += `${index + 1}. ${q}\n`;
  });

  return message;
}

/**
 * Format error message - handles various error formats including API errors
 */
export function errorMessage(errorMsg) {
  let msg = errorMsg;
  
  if (typeof errorMsg === 'object' && errorMsg !== null) {
    // Try multiple paths to extract error message
    // Path 1: axios error with response.data.error.message (Gemini API format)
    if (errorMsg.response?.data?.error?.message) {
      msg = errorMsg.response.data.error.message;
    }
    // Path 2: axios error with response.data.message
    else if (errorMsg.response?.data?.message) {
      msg = errorMsg.response.data.message;
    }
    // Path 3: axios error with response.data as string
    else if (typeof errorMsg.response?.data === 'string') {
      msg = errorMsg.response.data;
    }
    // Path 4: error object with error.message
    else if (errorMsg.error?.message) {
      msg = errorMsg.error.message;
    }
    // Path 5: error object with message property
    else if (errorMsg.message) {
      msg = errorMsg.message;
    }
    // Path 6: error object with code property
    else if (errorMsg.code) {
      msg = errorMsg.code;
    }
    // Path 7: error object with statusText
    else if (errorMsg.response?.statusText) {
      msg = errorMsg.response.statusText;
    }
    // Last resort: stringify the error object
    else {
      try {
        msg = JSON.stringify(errorMsg);
      } catch {
        msg = 'حدث خطأ غير معروف';
      }
    }
    
    // Ensure msg is a string
    if (typeof msg !== 'string') {
      try {
        msg = JSON.stringify(msg);
      } catch {
        msg = 'حدث خطأ غير معروف';
      }
    }
  }
  
  // Ensure we have a valid string
  if (!msg || typeof msg !== 'string') {
    msg = 'حدث خطأ غير معروف';
  }
  
  // Check for specific API errors - preserve original message for 503 errors
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
    // Keep the original English message from Gemini API
    // The msg already contains the full error message
  }
  
  return `❌ *Error*\n\n${msg}\n\nPlease try again or send a new voice message.`;
}

/**
 * Welcome message
 */
export function welcomeMessage() {
  return `👋 *مرحباً بك في مساعد تربية النحل*

يمكنني تحليل أصوات فحص خلايا النحل.

أرسل لي صوتاً وسيتم:
• نص الصوت وتحليله
• تقديم تقرير مفصل عن الفحص
• طرح أسئلة للتوضيح إذا لزم الأمر

أرسل *help* للمزيد من المعلومات`;
}

/**
 * Help message
 */
export function helpMessage() {
  return `📖 *مساعدة*

*كيفية الاستخدام:*
1. أرسل صوتاً عن فحص خلية النحل
2. انتظر تحليل الذكاء الاصطناعي
3. أجب على أي أسئلة للتوضيح
4. أرسل *نعم* للتأكيد أو *لا* للرفض

*الأوامر:*
• *help* - عرض هذه المساعدة
• *status* - حالة الخدمة

*اللغات المدعومة:* العربية والإنجليزية`;
}

export default {
  inspectionReady,
  inspectionSaved,
  userRejected,
  clarificationQuestions,
  errorMessage,
  welcomeMessage,
  helpMessage
};
