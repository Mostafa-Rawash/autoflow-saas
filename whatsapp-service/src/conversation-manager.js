/**
 * Conversation Manager
 * Manages WhatsApp conversations - calls Gemini API directly
 */
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from './logger.js';
import messageFormatter from './message-formatter.js';

const log = createServiceLogger('ConversationManager');
const MF = messageFormatter;

const CONVERSATION_STATES = {
  INITIATED: 'INITIATED',
  ANALYSIS_COMPLETE: 'ANALYSIS_COMPLETE',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED'
};

export class ConversationManager {
  constructor(geminiUrl) {
    this.conversations = new Map();
    this.chatHistories = new Map();
    this.geminiUrl = geminiUrl;
    this.apiKey = process.env.GEMINI_ROBOT_API_KEY || 'shared-secret-key';
  }

  async callApi(inputType, data, mimeType, phoneNumber) {
    const response = await axios.post(
      `${this.geminiUrl}/api/v1/analyze`,
      {
        input: {
          type: inputType,
          data: data,
          ...(mimeType && { mime_type: mimeType })
        },
        phone_number: phoneNumber
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        timeout: 60000
      }
    );
    return response.data;
  }

  addToChatHistory(apiaryId, role, text) {
    if (!this.chatHistories.has(apiaryId)) this.chatHistories.set(apiaryId, []);
    const history = this.chatHistories.get(apiaryId);
    history.push({ role, parts: [{ text }], timestamp: new Date().toISOString() });
    if (history.length > 20) history.splice(0, history.length - 20);
  }

  buildChatContext(apiaryId) {
    return this.chatHistories.get(apiaryId) || [];
  }

  async processUserClarification(apiaryId, clarification) {
    const conv = this.getConversationDetails(apiaryId);
    if (!conv) throw new Error('Conversation not found');
    const cleanClarification = typeof clarification === 'string' ? clarification : clarification?.content || '';
    this.addToChatHistory(apiaryId, 'user', cleanClarification);
    try {
      const result = await this.callApi('text', cleanClarification, null, conv.phone_number);
      if (!result.success) throw new Error(result.error?.message || 'Clarification failed');
      const data = result.data;
      if (data.analysis) {
        conv.analysis = data.analysis;
        conv.session_id = data.session_id || conv.session_id;
        conv.state = data.questions?.length ? CONVERSATION_STATES.AWAITING_CLARIFICATION : CONVERSATION_STATES.ANALYSIS_COMPLETE;
      }
      conv.updated_at = new Date().toISOString();
      this.addToChatHistory(apiaryId, 'model', data.message || 'تم تحديث التحليل');
      return {
        needsMoreClarification: !!(data.questions && data.questions.length),
        questions: data.questions,
        analysis: data.analysis,
        message: data.message || MF.inspectionReady(data.analysis)
      };
    } catch (error) {
      conv.state = CONVERSATION_STATES.FAILED;
      conv.updated_at = new Date().toISOString();
      throw error.response?.data || error;
    }
  }

  getConversation(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!this.conversations.has(cleanNumber)) {
      const apiaryId = `API-${uuidv4()}`;
      const newConversation = {
        apiary_id: apiaryId,
        phone_number: cleanNumber,
        session_id: null,
        state: CONVERSATION_STATES.INITIATED,
        analysis: null,
        questions: [],
        clarifications: [],
        chat_history: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.conversations.set(cleanNumber, newConversation);
      log.info(`New conversation created: ${apiaryId} for ${cleanNumber}`);
    }

    return this.conversations.get(cleanNumber);
  }

  async processAudio(apiaryId, audioBase64, phoneNumber = null) {
    const cleanNumber = phoneNumber?.replace(/[^0-9]/g, '') || apiaryId.replace(/[^0-9]/g, '');
    const conv = this.getConversation(phoneNumber || cleanNumber);
    
    try {
      log.info(`[${cleanNumber}] Processing audio`);
      
      const result = await this.callApi("audio", audioBase64, "audio/webm", phoneNumber || cleanNumber);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Analysis failed');
      }

      const data = result.data;
      
      if (conv) {
        conv.session_id = data.session_id;
        conv.state = CONVERSATION_STATES.ANALYSIS_COMPLETE;
        conv.analysis = data.analysis || conv.analysis;
        conv.updated_at = new Date().toISOString();
        this.addToChatHistory(data.session_id || conv.apiary_id, 'user', '[voice message]');
        this.addToChatHistory(data.session_id || conv.apiary_id, 'model', data.message || 'analysis complete');
      }

      let formattedMessage = data.message;
      
      if (data.analysis) {
        formattedMessage = MF.inspectionReady(data.analysis, data.transcription);
      }

      return {
        intent: data.intent,
        sessionId: data.session_id,
        analysis: data.analysis,
        transcription: data.transcription,
        message: formattedMessage
      };
    } catch (error) {
      log.error(`[${cleanNumber}] Audio processing failed: ${error.message}`);
      if (conv) {
        conv.state = CONVERSATION_STATES.FAILED;
        conv.updated_at = new Date().toISOString();
      }
      // Pass the full error object to preserve response data
      throw error.response?.data || error;
    }
  }

  async processText(phoneNumber, text) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const conv = this.getConversation(phoneNumber);
    
    // Local intent detection for Arabic commands
    const normalizedText = text.trim().toLowerCase();
    
    // Comprehensive confirm keywords (Save/Accept)
    const confirmKeywords = [
      // Arabic - Basic
      'نعم', 'نعم ', ' نعم', 'نعم.', 'نعم!', 'نعم؟',
      'أجل', 'اجل', 'أه', 'اه', 'آه', 'اهه', 'أها',
      // Arabic - Agreement
      'موافق', 'موافقه', 'موافقة', 'اوافق', 'أوافق', 'اوافقك', 'أوافقك',
      'أوافق', 'اوافق', 'متوافق', 'اتفق', 'أتفق', 'اتفق معك', 'أتفق معك',
      // Arabic - Correct/Right
      'صح', 'صحيح', 'صحيحة', 'صحيحه', 'صح 100', 'صح مية بالمية',
      'تمام', 'تمامم', 'مية تمام', 'مية بالمية',
      'مظبوط', 'مظبوطه', 'مظبوطة', 'صحيح مية بالمية',
      'صح مية بالمية', 'صحيح مية في المية', 'صحيح مية %',
      // Arabic - Save/Store
      'حفظ', 'احفظ', 'خزن', 'تخزين', 'احفظه', 'احفظها',
      'سجل', 'تسجيل', 'سجله', 'سجلها', 'سجل البيانات',
      // Arabic - Done/Complete
      'تم', 'تمام', 'خلاص', 'انتهى', 'انتهيت', 'خلصت',
      'اوكي', 'اوكيه', 'اوك', 'أوكي', 'أوكيه', 'أوك',
      'تمام يا باشا', 'تمام يا كبير', 'تمام تمام',
      // Arabic - Confirm
      'أكد', 'اكد', 'تأكيد', 'تاكيد', 'أكيد', 'اكيد',
      'تأكد', 'تأكدي', 'تأكدت', 'تأكدنا',
      // Arabic - Approval/Praise
      'احسنت', 'أحسنت', 'ممتاز', 'ممتازة', 'ممتازه',
      'رائع', 'رائعة', 'رائعه', 'عظيم', 'عظيمة', 'عظيمه',
      'جيد', 'جيدة', 'جيده', 'مية خير', 'تمام الخير',
      'حلو', 'حلوة', 'حلوه', 'جميل', 'جميلة', 'جميله',
      'كويس', 'كويسه', 'كويسة', 'تمام كويس',
      // Arabic - Agreement phrases
      'ماشي', 'ماشي الحال', 'ماشي تمام',
      'تمام يا فندم', 'تمام يا كبير', 'تمام يا باشا',
      'حاضر', 'حاضر يا باشا', 'حاضر يا كبير',
      'افهم', 'أفهم', 'افهم عليك', 'أفهم عليك',
      'واضح', 'واضح تمام', 'الامور واضحه', 'الامور واضحة',
      'واضحة', 'واضحه', 'كل حاجة واضحة',
      // English - Basic
      'yes', 'yes ', ' yes', 'yes.', 'yes!', 'yes?',
      'y', 'yep', 'yeah', 'yup', 'yupp', 'yess',
      // English - Confirm
      'confirm', 'confirmed', 'confirming', 'confirmation',
      'confirm it', 'confirm please', 'pls confirm',
      // English - Save
      'save', 'saved', 'saving', 'save it', 'save please',
      'store', 'stored', 'storing', 'keep', 'kept',
      // English - Accept
      'accept', 'accepted', 'accepting', 'accept it',
      'approve', 'approved', 'approving', 'approve it',
      // English - Agreement
      'ok', 'okay', 'kk', 'k', 'okey', 'okie',
      'alright', 'all right', 'aight', 'ight',
      'fine', 'good', 'great', 'perfect', 'excellent',
      // English - Complete
      'done', 'complete', 'completed', 'completing',
      'finish', 'finished', 'finishing', 'finished!',
      'true', 'correct', 'right', 'exactly', 'precisely',
      'got it', 'gotcha', 'understood', 'understand',
      'agree', 'agreed', 'agreeing', 'i agree', 'agreed!',
      'sure', 'of course', 'absolutely', 'definitely',
      // Numbers & Emojis
      '1', '١', '✅', '✔️', '☑️', '👍', '👌', '🆗',
      '💯', '👏', '🙏', '🙂', '😊', '😄', '😃',
      '👆', '👇', '✨', '🌟', '⭐', '💪'
    ];
    
    // Comprehensive reject keywords (Cancel/Delete)
    const rejectKeywords = [
      // Arabic - Basic No
      'لا', 'لأ', 'لاء', 'لا ', ' لا', 'لا.', 'لا!', 'لا؟',
      'لأ ', ' لأ', 'لأ.', 'لأ!', 'لاء ', ' لاء',
      // Arabic - Negative
      'غير', 'غير موافق', 'غير موافقة', 'غير موافقه',
      'مش موافق', 'مش موافقة', 'مش موافقه',
      'غير صح', 'غير صحيح', 'غير صحيحة', 'غير صحيحه',
      // Arabic - Reject
      'رفض', 'رفضت', 'ارفض', 'أرفض', 'رفضنا', 'رفضته',
      'مرفوض', 'مرفوضة', 'مرفوضه',
      // Arabic - Cancel
      'الغاء', 'إلغاء', 'ألغي', 'الغي', 'ألغى', 'الغى',
      'إلغي', 'يلغى', 'يلغي', 'تم الالغاء', 'تم الإلغاء',
      // Arabic - Delete
      'حذف', 'احذف', 'امسح', 'امسحه', 'امسحها',
      'احذفه', 'احذفها', 'محذوف', 'تم الحذف',
      // Arabic - Wrong/Error
      'خطأ', 'غلط', 'مخطئ', 'خطا', 'غلطه', 'غلطة',
      'غلطان', 'غلطانه', 'غلطانة', 'غلطين',
      'مش صح', 'مش صحيح', 'مو صح', 'مو صحيح',
      'خطأ في', 'غلط في', 'مخطئ في', 'في خطأ',
      // Arabic - Don't want
      'بلاش', 'مش عايز', 'مش عايزه', 'مش عايزة',
      'ما بدي', 'لا بدي', 'مش حاب', 'مش حابب',
      'ما بصير', 'مش تمام', 'مش كويس',
      // Arabic - Undo/Back
      'تراجع', 'رجوع', 'ارجع', 'أرجع', 'ارجع ورا',
      'الغي الموضوع', 'سيب الموضوع', 'سيبها',
      // Arabic - Stop/End
      'قف', 'وقف', 'توقف', 'توقفي', 'توقفوا',
      'انتهى', 'انتهينا', 'كفاية', 'بس كفاية',
      // English - Basic No
      'no', 'no ', ' no', 'no.', 'no!', 'no?',
      'n', 'nope', 'nah', 'nuh', 'naw', 'nooo',
      // English - Cancel
      'cancel', 'cancelled', 'canceling', 'canceled',
      'cancel it', 'cancel please', 'pls cancel',
      // English - Reject
      'reject', 'rejected', 'rejecting', 'rejection',
      'reject it', 'reject please',
      // English - Delete
      'delete', 'deleted', 'deleting', 'deletion',
      'delete it', 'delete please', 'remove', 'removed',
      'clear', 'cleared', 'clearing', 'reset', 'resetting',
      // English - Discard
      'discard', 'discarded', 'discarding', 'abort', 'aborted',
      // English - Stop/End
      'stop', 'stopped', 'stopping', 'end', 'ended', 'ending',
      'halt', 'terminate', 'terminated', 'close', 'closed',
      // English - Wrong/Error
      'wrong', 'error', 'mistake', 'mistaken', 'incorrect',
      'false', 'not correct', 'not right', 'invalid',
      'bad', 'not good', 'not ok', 'not okay',
      // English - Don't want
      'dont want', 'don\'t want', 'do not want',
      'not interested', 'pass', 'skip', 'skip it',
      'nevermind', 'never mind', 'nvm', 'forget it',
      // Numbers & Emojis
      '0', '٠', '❌', '✖️', '⛔', '🚫', '🙅', '🙅‍♂️', '🙅‍♀️',
      '👎', '😕', '😟', '😠', '😡', '😤', '💔',
      '⬅️', '↩️', '🔙', '🛑', '🚷'
    ];
    
    // Comprehensive edit keywords (Modify/Change)
    const editKeywords = [
      // Arabic - Edit
      'تعديل', 'تعدل', 'تعديل ', 'التعديل', 'تعديلات',
      'عدل', 'أعدل', 'عدله', 'عدلها', 'عدلي',
      'معدل', 'معدلة', 'معدله', 'تعديلي',
      // Arabic - Change
      'تغيير', 'تغير', 'تغيير ', 'التغيير', 'تغييرات',
      'غير', 'غيره', 'غيرها', 'غيري', 'أغير', 'اغير',
      'مغير', 'متغير', 'تغييره', 'تغييرة',
      // Arabic - Correct/Fix
      'تصحيح', 'تصحيح ', 'التصحيح', 'تصحيحات',
      'صحح', 'أصحح', 'صححه', 'صححها', 'صححي',
      'تصحيحه', 'تصحيحة', 'مصحح', 'مصححة', 'مصححه',
      // Arabic - Modify/Update
      'تعدل', 'تعديل', 'تعديل ', 'تعديله', 'تعديلة',
      'تغيير', 'تغيير ', 'تغييره', 'تغييرة',
      'تحديث', 'حدث', 'أحدث', 'حدثه', 'حدثها',
      'تجديد', 'جدد', 'أجدد', 'جدده', 'جددها',
      // Arabic - Add
      'إضافة', 'اضافة', 'إضافه', 'اضافه', 'الإضافة', 'الاضافة',
      'ضيف', 'أضف', 'اضف', 'أضيف', 'اضيف',
      'ضيفه', 'ضيفها', 'أضفه', 'أضفها', 'اضفه', 'اضفها',
      'ضيفي', 'أضيفي', 'اضيفي', 'زود', 'أزود', 'ازود',
      'زوده', 'زودها', 'أزوده', 'أزودها',
      // Arabic - Remove/Delete
      'حذف', 'احذف', 'امسح', 'امسحه', 'امسحها',
      'احذفه', 'احذفها', 'امسحي', 'احذفي',
      'شيل', 'أشيل', 'اشيل', 'شيله', 'شيلها',
      'نقص', 'أنقص', 'انقص', 'نقصه', 'نقصها',
      'أنقصه', 'أنقصها', 'انقصه', 'انقصها',
      'شيل منه', 'شيل منها', 'أشيل منه', 'أشيل منها',
      // Arabic - Change specific items
      'غير الخلية', 'غير المنحل', 'غير الرقم',
      'تغيير خلية', 'تغيير منحل', 'تغيير رقم',
      'تعديل الخلية', 'تعديل المنحل', 'تعديل الرقم',
      'غير رقم الخلية', 'غير رقم المنحل',
      'تغيير رقم الخلية', 'تغيير رقم المنحل',
      // Arabic - Fix specific items
      'صحح الخلية', 'صحح المنحل', 'صحح البيانات',
      'تصحيح الخلية', 'تصحيح المنحل', 'تصحيح البيانات',
      // Arabic - Wrong/Error phrases
      'خطأ في', 'غلط في', 'مخطئ في', 'في خطأ',
      'خطأ في الخلية', 'خطأ في المنحل', 'خطأ في البيانات',
      'غلط في الخلية', 'غلط في المنحل', 'غلط في البيانات',
      'ليس صحيح', 'ليس صح', 'مو صحيح', 'مو صح',
      'غير صحيح', 'غير صح', 'مش صحيح', 'مش صح',
      'مظبوطش', 'مش مظبوط', 'غير مظبوط',
      // Arabic - Edit phrases
      'عدل البيانات', 'عدل المعلومات', 'عدل التقرير',
      'تعديل البيانات', 'تعديل المعلومات', 'تعديل التقرير',
      'غير البيانات', 'غير المعلومات', 'غير التقرير',
      'تغيير البيانات', 'تغيير المعلومات', 'تغيير التقرير',
      'حدث البيانات', 'حدث المعلومات', 'حدث التقرير',
      'تحديث البيانات', 'تحديث المعلومات', 'تحديث التقرير',
      // Arabic - Add phrases
      'ضيف بيانات', 'ضيف معلومات', 'ضيف تفاصيل',
      'أضف بيانات', 'أضف معلومات', 'أضف تفاصيل',
      'اضف بيانات', 'اضف معلومات', 'اضف تفاصيل',
      'زود بيانات', 'زود معلومات', 'زود تفاصيل',
      'أضف ملاحظات', 'اضف ملاحظات', 'ضيف ملاحظات',
      // Arabic - Remove phrases
      'شيل بيانات', 'شيل معلومات', 'شيل تفاصيل',
      'احذف بيانات', 'احذف معلومات', 'احذف تفاصيل',
      'امسح بيانات', 'امسح معلومات', 'امسح تفاصيل',
      'نقص من البيانات', 'نقص من المعلومات',
      // English - Edit
      'edit', 'edited', 'editing', 'edition',
      'edit it', 'edit please', 'pls edit', 'edit this',
      // English - Modify
      'modify', 'modified', 'modifying', 'modification',
      'modify it', 'modify please', 'alter', 'altered', 'altering',
      // English - Change
      'change', 'changed', 'changing', 'changes',
      'change it', 'change please', 'pls change',
      'switch', 'switched', 'switching', 'switch it',
      // English - Update
      'update', 'updated', 'updating', 'updates',
      'update it', 'update please', 'pls update',
      'upgrade', 'upgraded', 'upgrading', 'refresh', 'refreshed',
      // English - Correct/Fix
      'correct', 'corrected', 'correcting', 'correction',
      'correct it', 'correct please', 'make correct',
      'fix', 'fixed', 'fixing', 'fixes', 'fix it', 'fix please',
      'repair', 'repaired', 'repairing', 'mend', 'mended',
      'revise', 'revised', 'revising', 'revision',
      'adjust', 'adjusted', 'adjusting', 'adjustment',
      'amend', 'amended', 'amending', 'amendment',
      // English - Add
      'add', 'added', 'adding', 'addition', 'add it', 'add please',
      'append', 'appended', 'appending', 'attach', 'attached',
      'include', 'included', 'including', 'insert', 'inserted',
      'put', 'putting', 'place', 'placed', 'adding',
      // English - Remove
      'remove', 'removed', 'removing', 'removal', 'remove it',
      'delete', 'deleted', 'deleting', 'deletion', 'delete it',
      'erase', 'erased', 'erasing', 'eliminate', 'eliminated',
      'omit', 'omitted', 'omitting', 'exclude', 'excluded',
      'take out', 'takeout', 'take it out', 'get rid of',
      'clear', 'cleared', 'clearing', 'clean', 'cleaned',
      // English - Wrong/Error
      'wrong', 'error', 'mistake', 'mistaken', 'incorrect',
      'not correct', 'not right', 'false', 'invalid',
      'bad data', 'wrong data', 'wrong info', 'wrong information',
      'error in', 'mistake in', 'wrong in', 'incorrect in',
      // English - Change specific items
      'change cell', 'change apiary', 'change number',
      'change cell id', 'change apiary id', 'change the cell',
      'change the apiary', 'change data', 'change info',
      'edit cell', 'edit apiary', 'edit data', 'edit info',
      'update cell', 'update apiary', 'update data', 'update info',
      'modify cell', 'modify apiary', 'modify data', 'modify info',
      'fix cell', 'fix apiary', 'fix data', 'fix info',
      'correct cell', 'correct apiary', 'correct data', 'correct info',
      // English - Phrases
      'need to change', 'need to edit', 'need to update', 'need to fix',
      'want to change', 'want to edit', 'want to update', 'want to fix',
      'have to change', 'have to edit', 'have to update', 'have to fix',
      'should change', 'should edit', 'should update', 'should fix',
      'pls change', 'pls edit', 'pls update', 'pls fix',
      'please change', 'please edit', 'please update', 'please fix',
      'can you change', 'can you edit', 'can you update', 'can you fix',
      'could you change', 'could you edit', 'could you update', 'could you fix',
      'i want to', 'i need to', 'i have to', 'i would like to',
      // Special characters
      '✏️', '📝', '✍️', '🔧', '🔨', '🛠️', '⚒️', '⛏️',
      '🔄', '🔃', '🔁', '🔄', '↩️', '↪️', '🔀', '🔁',
      '➕', '➖', '✖️', '➗', '➕', '➖', '✚', '✛'
    ];
    
    // Handle confirmation/rejection locally if analysis is complete
    if (conv?.state === CONVERSATION_STATES.ANALYSIS_COMPLETE) {
      const isConfirm = confirmKeywords.some(k => normalizedText === k || normalizedText.startsWith(k));
      const isReject = rejectKeywords.some(k => normalizedText === k || normalizedText.startsWith(k));
      const isEdit = editKeywords.some(k => normalizedText === k || normalizedText.startsWith(k));
      
      if (isConfirm) {
        log.info(`[${cleanNumber}] Local confirm intent detected`);
        conv.state = CONVERSATION_STATES.CONFIRMED;
        conv.updated_at = new Date().toISOString();
        return {
          intent: 'confirm',
          message: MF.inspectionSaved()
        };
      }
      
      if (isReject) {
        log.info(`[${cleanNumber}] Local reject intent detected`);
        conv.state = CONVERSATION_STATES.FAILED;
        conv.updated_at = new Date().toISOString();
        return {
          intent: 'reject',
          message: MF.userRejected()
        };
      }
      
      // For edit, we still need to call API with context
      if (isEdit) {
        log.info(`[${cleanNumber}] Edit intent detected - calling API with session context`);
        // Continue to API call with edit context
      }
    }
    
    try {
      log.info(`[${cleanNumber}] Processing text: "${text.substring(0, 50)}..."`);
      
      this.addToChatHistory(conv.apiary_id, 'user', text);
    const result = await this.callApi("text", text, null, phoneNumber);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Text processing failed');
      }

      const data = result.data;

      if (conv) {
        conv.updated_at = new Date().toISOString();
      }

      if (data.intent === 'confirm') {
        this.addToChatHistory(conv.apiary_id, 'model', data.message || MF.inspectionSaved());
        if (conv) {
          conv.state = CONVERSATION_STATES.CONFIRMED;
        }
        return {
          intent: data.intent,
          inspectionId: data.inspection_id,
          message: data.message || MF.inspectionSaved()
        };
      }

      if (data.intent === 'edit' && data.analysis) {
        if (conv) {
          conv.state = CONVERSATION_STATES.ANALYSIS_COMPLETE;
          conv.session_id = data.session_id;
          conv.analysis = data.analysis || conv.analysis;
        }
        this.addToChatHistory(conv.apiary_id, 'model', MF.inspectionReady(data.analysis));
        
        log.info(`[${cleanNumber}] Edit completed - Cell: ${data.analysis?.data?.[0]?.cell_id}, Frames: ${data.analysis?.data?.[0]?.frames?.length || 0}`);
        
        return {
          intent: data.intent,
          sessionId: data.session_id,
          analysis: data.analysis,
          message: MF.inspectionReady(data.analysis)
        };
      }

      if (data.message) this.addToChatHistory(conv.apiary_id, 'model', data.message);
      return {
        intent: data.intent,
        message: data.message,
        analysis: data.analysis
      };
    } catch (error) {
      log.error(`[${cleanNumber}] Text processing failed: ${error.message}`);
      // Pass the full error object to preserve response data
      throw error.response?.data || error;
    }
  }

  deleteConversation(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    this.conversations.delete(cleanNumber);
    log.info(`Conversation deleted for: ${cleanNumber}`);
  }

  getConversationDetails(apiaryId) {
    for (const conv of this.conversations.values()) {
      if (conv.apiary_id === apiaryId) return conv;
    }
    return null;
  }

  getConversations() {
    return this.conversations;
  }
}

export default ConversationManager;
