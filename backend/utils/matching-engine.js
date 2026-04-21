// Enhanced Keyword/Intent Matching Engine for AutoFlow
// Supports multiple matching strategies and intent detection

const natural = require('natural');
const TfIdf = natural.TfIdf;

// ========================================
// MATCHING TYPES
// ========================================

const MatchType = {
  EXACT: 'exact',           // Exact match
  CONTAINS: 'contains',     // Contains keyword
  STARTS_WITH: 'startsWith', // Starts with keyword
  ENDS_WITH: 'endsWith',    // Ends with keyword
  REGEX: 'regex',           // Regular expression
  FUZZY: 'fuzzy',           // Fuzzy match (typo tolerance)
  SEMANTIC: 'semantic',     // Semantic similarity
  INTENT: 'intent'          // Intent-based matching
};

// ========================================
// ARABIC LANGUAGE SUPPORT
// ========================================

const ArabicUtils = {
  // Common Arabic character variations
  normalize: (text) => {
    return text
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/[ئؤ]/g, 'ء')
      .replace(/[ـ]/g, '') // Remove tatweel
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  },
  
  // Arabic stop words
  stopWords: [
    'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك',
    'التي', 'الذي', 'التي', 'ما', 'لا', 'لم', 'كان', 'كانت',
    'هل', 'أنا', 'أنت', 'هو', 'هي', 'نحن', 'هم', 'هن'
  ],
  
  // Common Arabic greeting patterns
  greetings: [
    'مرحبا', 'أهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير',
    'هاي', 'هلا', 'اهلين', 'مرحب'
  ],
  
  // Common Arabic question patterns
  questionPatterns: [
    'كم', 'كام', 'قديش', 'كيف', 'ليش', 'ليه', 'وش',
    'ايش', 'شنو', 'شكون', 'وين', 'متى', 'هل'
  ]
};

// ========================================
// INTENT CATEGORIES
// ========================================

const Intents = {
  PRICING: {
    name: 'pricing',
    keywords: ['سعر', 'أسعار', 'كام', 'كم', 'قديش', 'تكلفة', 'فلوس', 'دفع'],
    patterns: [
      /كم (سعر|تكلفة|أجرة)/,
      /شحال/,
      /قديش/,
      /(سعر|أسعار) (الـ|ال)?/
    ],
    priority: 10
  },
  
  BOOKING: {
    name: 'booking',
    keywords: ['حجز', 'موعد', 'ميعاد', 'وقت', 'تاريخ', 'احجز', 'أحجز'],
    patterns: [
      /أحجز/,
      /عايز أحجز/,
      /حجز (موعد|تاريخ)/,
      /متاح (الـ|ال)?/
    ],
    priority: 9
  },
  
  HOURS: {
    name: 'hours',
    keywords: ['ساعات', 'وقت', 'مواعيد', 'مفتوح', 'مغلق', 'دوام'],
    patterns: [
      /ساعات (الـ|ال)?(عمل|دوام)/,
      /متى (تفتحوا|تغلقوا|الدوام)/,
      /فاكس (الـ|ال)?/
    ],
    priority: 8
  },
  
  LOCATION: {
    name: 'location',
    keywords: ['موقع', 'عنوان', 'فين', 'وين', 'مكان', 'فرع', 'عندكم'],
    patterns: [
      /فين (مكانكم|موقعكم|فرع)/,
      /وين/,
      /عايز (أوصل|أجي)/
    ],
    priority: 7
  },
  
  CONTACT: {
    name: 'contact',
    keywords: ['تواصل', 'اتصال', 'رقم', 'تليفون', 'جوال', 'واتس'],
    patterns: [
      /رقم (التواصل|التليفون)/,
      /كيف (أتواصل|أتصل)/
    ],
    priority: 6
  },
  
  SUPPORT: {
    name: 'support',
    keywords: ['مشكلة', 'عطل', 'شكوى', 'مساعدة', 'سؤال'],
    patterns: [
      /عايز (مساعدة|أسأل)/,
      /عندي (مشكلة|استفسار)/
    ],
    priority: 5
  },
  
  GREETING: {
    name: 'greeting',
    keywords: ArabicUtils.greetings,
    patterns: [],
    priority: 1
  }
};

// ========================================
// MATCHING ENGINE
// ========================================

class MatchingEngine {
  constructor() {
    this.tfidf = new TfIdf();
    this.classifier = new natural.BayesClassifier();
    this.setupClassifier();
  }
  
  setupClassifier() {
    // Train classifier with sample phrases
    Object.entries(Intents).forEach(([key, intent]) => {
      intent.keywords.forEach(keyword => {
        this.classifier.addDocument(keyword, intent.name);
      });
    });
    this.classifier.train();
  }
  
  // Normalize text for matching
  normalize(text, lang = 'ar') {
    if (lang === 'ar') {
      return ArabicUtils.normalize(text);
    }
    return text.toLowerCase().trim();
  }
  
  // Exact match
  exactMatch(message, keywords) {
    const normalized = this.normalize(message);
    return keywords.some(kw => normalized === this.normalize(kw));
  }
  
  // Contains match
  containsMatch(message, keywords) {
    const normalized = this.normalize(message);
    return keywords.some(kw => normalized.includes(this.normalize(kw)));
  }
  
  // Starts with match
  startsWithMatch(message, keywords) {
    const normalized = this.normalize(message);
    return keywords.some(kw => normalized.startsWith(this.normalize(kw)));
  }
  
  // Regex match
  regexMatch(message, patterns) {
    return patterns.some(pattern => pattern.test(message));
  }
  
  // Fuzzy match (with typo tolerance)
  fuzzyMatch(message, keywords, threshold = 0.8) {
    const normalized = this.normalize(message);
    
    for (const keyword of keywords) {
      const normalizedKw = this.normalize(keyword);
      const distance = natural.LevenshteinDistance(normalized, normalizedKw);
      const maxLength = Math.max(normalized.length, normalizedKw.length);
      const similarity = 1 - (distance / maxLength);
      
      if (similarity >= threshold) {
        return { match: true, keyword, similarity };
      }
    }
    
    return { match: false };
  }
  
  // Intent detection
  detectIntent(message) {
    const detectedIntents = [];
    const normalized = this.normalize(message);
    
    Object.entries(Intents).forEach(([key, intent]) => {
      let score = 0;
      
      // Keyword matching
      const keywordMatches = intent.keywords.filter(kw => 
        normalized.includes(this.normalize(kw))
      ).length;
      score += keywordMatches * intent.priority;
      
      // Pattern matching
      const patternMatches = intent.patterns.filter(pattern => 
        pattern.test(message)
      ).length;
      score += patternMatches * intent.priority * 2;
      
      if (score > 0) {
        detectedIntents.push({
          intent: intent.name,
          score,
          keywords: intent.keywords.filter(kw => 
            normalized.includes(this.normalize(kw))
          )
        });
      }
    });
    
    // Sort by score
    return detectedIntents.sort((a, b) => b.score - a.score);
  }
  
  // Semantic similarity (using TF-IDF)
  semanticMatch(message, documents) {
    this.tfidf.addDocument(message);
    
    const similarities = documents.map((doc, index) => {
      this.tfidf.addDocument(doc.content);
      const similarity = this.tfidf.tfidf(this.normalize(message), index + 1);
      return { document: doc, similarity };
    });
    
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }
  
  // Main match function
  match(message, rules) {
    const matches = [];
    const detectedIntents = this.detectIntent(message);
    
    for (const rule of rules) {
      let matched = false;
      let matchType = null;
      let matchScore = 0;
      
      // Intent-based matching
      if (rule.intent && detectedIntents.some(i => i.intent === rule.intent)) {
        matched = true;
        matchType = MatchType.INTENT;
        matchScore = detectedIntents.find(i => i.intent === rule.intent)?.score || 0;
      }
      
      // Exact match
      if (!matched && rule.matchType === MatchType.EXACT) {
        if (this.exactMatch(message, rule.keywords)) {
          matched = true;
          matchType = MatchType.EXACT;
          matchScore = 100;
        }
      }
      
      // Contains match
      if (!matched && (!rule.matchType || rule.matchType === MatchType.CONTAINS)) {
        if (this.containsMatch(message, rule.keywords)) {
          matched = true;
          matchType = MatchType.CONTAINS;
          matchScore = 80;
        }
      }
      
      // Starts with match
      if (!matched && rule.matchType === MatchType.STARTS_WITH) {
        if (this.startsWithMatch(message, rule.keywords)) {
          matched = true;
          matchType = MatchType.STARTS_WITH;
          matchScore = 90;
        }
      }
      
      // Regex match
      if (!matched && rule.matchType === MatchType.REGEX && rule.patterns) {
        if (this.regexMatch(message, rule.patterns)) {
          matched = true;
          matchType = MatchType.REGEX;
          matchScore = 95;
        }
      }
      
      // Fuzzy match
      if (!matched && rule.matchType === MatchType.FUZZY) {
        const fuzzy = this.fuzzyMatch(message, rule.keywords, rule.threshold || 0.8);
        if (fuzzy.match) {
          matched = true;
          matchType = MatchType.FUZZY;
          matchScore = Math.round(fuzzy.similarity * 70);
        }
      }
      
      if (matched) {
        matches.push({
          rule,
          matchType,
          matchScore,
          intents: detectedIntents
        });
      }
    }
    
    // Sort by score
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }
  
  // Get best match
  getBestMatch(message, rules) {
    const matches = this.match(message, rules);
    return matches[0] || null;
  }
  
  // Get response for message
  getResponse(message, rules, fallback = null) {
    const bestMatch = this.getBestMatch(message, rules);
    
    if (bestMatch) {
      return {
        response: bestMatch.rule.response,
        matchType: bestMatch.matchType,
        score: bestMatch.matchScore,
        intents: bestMatch.intents,
        ruleId: bestMatch.rule.id || bestMatch.rule._id
      };
    }
    
    // Fallback response
    if (fallback) {
      return {
        response: fallback,
        matchType: 'fallback',
        score: 0,
        intents: detectedIntents
      };
    }
    
    return null;
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  MatchingEngine,
  MatchType,
  Intents,
  ArabicUtils
};