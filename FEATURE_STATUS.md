# AutoFlow Feature Status & Priority

> Last updated: 2026-05-17

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Fully Implemented |
| 🟡 | Partially Implemented |
| ❌ | Not Implemented |
| P0 | Critical — blocks revenue or existential risk |
| P1 | Table Stakes — competitors have it, users expect it |
| P2 | Competitive Parity — match or exceed competitors |
| P3 | Nice to Have — differentiation opportunities |

---

## WhatsApp

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 1 | Connect/disconnect via QR | ✅ | — | whatsapp-web.js based |
| 2 | Send/receive messages | ✅ | — | Works via whatsapp-web.js |
| 3 | Multi-client sessions | ✅ | — | Per-user session management |
| 4 | Bulk messaging | 🟡 | P1 | Basic send-bulk with 1s delay; no scheduling, no analytics |
| 5 | Message templates | 🟡 | P1 | Simple text templates only; no WhatsApp-approved template management |
| 6 | Official Business API migration | ❌ | **P0** | Current whatsapp-web.js is unofficial, risks bans, blocks Catalog/Payments/Flows |
| 7 | Number coexistence | ❌ | **P0** | Use same number on app + platform simultaneously |
| 8 | WhatsApp Catalog | ❌ | P3 | Product catalog + cart inside WhatsApp |
| 9 | WhatsApp Forms (Flows) | ❌ | P2 | Native in-app data collection forms |
| 10 | WhatsApp Payments | ❌ | P3 | Accept payments in conversation |
| 11 | Click-to-WhatsApp Ads | ❌ | P3 | Launch Meta ads that open WhatsApp |

## Channels

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 12 | Telegram | ✅ | — | Full bot integration, multi-bot, auto-reply hooks |
| 13 | Live Chat Widget | ✅ | — | Embeddable JS widget, pre-chat forms, department routing |
| 14 | Email (SMTP send) | 🟡 | P2 | Config + send works; no IMAP inbox polling |
| 15 | Instagram | ❌ | P1 | Model enum only, no routes/services |
| 16 | Facebook Messenger | ❌ | P1 | Model enum only, no routes/services |
| 17 | SMS | ❌ | P3 | No integration |

## AI & Automation

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 18 | AI Auto-Reply | ✅ | — | Per-channel toggle, tone config, plan limits |
| 19 | AI Chat (RAG) | ✅ | — | Upload docs → chunk → embed → semantic search → answers with citations |
| 20 | Auto-Replies | ✅ | — | 4 match types (exact, contains, startsWith, regex) + template resolution |
| 21 | Follow-Ups | ✅ | — | 4 trigger types (no_reply, schedule, status_change, new_conversation) |
| 22 | Workflows | ✅ | — | 7 triggers + 12 actions with condition engine |
| 23 | Variable Substitution | ✅ | — | `{{variable}}` with Arabic equivalents |
| 24 | Chatbot Builder | ❌ | **P1** | Visual drag-and-drop flow builder — WhatChimp's hero feature |
| 25 | AI Intent Detection | ❌ | P1 | Auto-classify incoming → route to agent/bot/AI |
| 26 | Appointment Booking | ❌ | P1 | Calendar-based booking in chat |

## Team & Inbox

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 27 | Shared Team Inbox | ✅ | — | Multi-agent conversation handling |
| 28 | Assign Conversations | ✅ | — | Manual + auto assignment |
| 29 | Internal Notes | ✅ | — | Text notes on conversations |
| 30 | Roles & Permissions | ✅ | — | 5 roles, 30 granular permissions |
| 31 | Departments | ✅ | — | Round-robin, skill-based, least-busy assignment + escalation |
| 32 | CSAT Ratings | ✅ | — | 1-5 stars + comments on conversations |
| 33 | Phone Number Masking | ❌ | P2 | Hide customer numbers from agents |
| 34 | Manager Monitoring | ❌ | P1 | Supervisor real-time oversight of agent chats |
| 35 | Chat Translation | ❌ | P2 | Auto-translate incoming messages |

## Contacts & CRM

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 36 | Contact Management | ✅ | — | Full CRUD, search, filter |
| 37 | Custom Fields | ✅ | — | Key-value pairs per contact |
| 38 | Tags/Labels | ✅ | — | Tag-based organization |
| 39 | Contact Merge | ✅ | — | Merge duplicate contacts |
| 40 | External IDs per Channel | ✅ | — | Channel-specific IDs (WhatsApp JID, Telegram chat ID) |
| 41 | Customer Segmentation | ❌ | P2 | Dynamic segments for targeted broadcasts |

## Marketing & Campaigns

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 42 | Broadcast Messaging | 🟡 | P1 | Basic WhatsApp bulk only; no scheduling, no analytics |
| 43 | Campaign Management | ❌ | **P1** | Create, schedule, segment, and track campaigns |
| 44 | Campaign Analytics | ❌ | P2 | Delivery/read/reply metrics per campaign |
| 45 | Drip Campaign Builder | ❌ | P2 | Multi-step automated message sequences |
| 46 | Click-to-WhatsApp Ads | ❌ | P3 | Meta Ads integration for acquisition |

## Commerce & Payments

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 47 | Payment Gateway | ❌ | **P0** | No gateway integrated — cannot collect subscription revenue |
| 48 | Invoice Generation | ❌ | P2 | PDF invoices for B2B billing |
| 49 | Product Catalog | ❌ | P3 | Browse products in chat |
| 50 | Cart / In-Chat Ordering | ❌ | P3 | Full shopping experience |
| 51 | Abandoned Cart Recovery | ❌ | P3 | Auto-message for abandoned carts |
| 52 | Order Confirmations | ❌ | P3 | Auto-send on purchase |

## Integrations

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 53 | REST API | ✅ | — | Full Express.js API with auth |
| 54 | Outgoing Webhooks | ❌ | **P1** | Push events to external apps; route stubs only |
| 55 | Custom Webhook Listener | ❌ | P2 | Receive JSON triggers from external apps |
| 56 | Zapier | ❌ | P3 | 3000+ app connections |
| 57 | Pabbly | ❌ | P3 | Automation platform |
| 58 | Make (Integromat) | ❌ | P3 | Visual workflow design |
| 59 | N8N | ❌ | P3 | Self-hosted workflow builder |
| 60 | Google Sheets | ❌ | P2 | Real-time data sync |
| 61 | Shopify | ❌ | P3 | E-commerce automation |
| 62 | WooCommerce | ❌ | P3 | E-commerce automation |
| 63 | CRM Integrations | ❌ | P3 | HubSpot, Salesforce, Zoho |

## Data & Reporting

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 64 | Analytics Dashboard | ✅ | — | Overview, channels, timeline |
| 65 | Conversation Timeline | ✅ | — | Full activity log per conversation |
| 66 | Data Export | ❌ | P1 | CSV/PDF export for contacts, conversations, analytics |
| 67 | Data Import | ❌ | P2 | Bulk import contacts, templates |
| 68 | Reporting Module | ❌ | P2 | Scheduled reports, PDF generation |

## Platform & UX

| # | Feature | Status | Priority | Notes |
|---|---|---|---|---|
| 69 | Arabic RTL Support | ✅ | — | Full RTL + Cairo font |
| 70 | Dark Mode | ✅ | — | Theme toggle |
| 71 | Help Center | ✅ | — | Articles, categories, tags, voting |
| 72 | Embeddable Chat Widget | ✅ | — | Standalone JS widget for external sites |
| 73 | Knowledge Base / RAG | ✅ | — | Document upload → chunk → embed → search → answer |
| 74 | Templates | ✅ | — | Multi-channel, categories, variables |
| 75 | Subscription Plans | ✅ | — | 4 tiers with usage tracking |
| 76 | 14-Day Free Trial | ✅ | — | Automatic on new accounts |
| 77 | Rate Limiting | 🟡 | P2 | IP-based global limit only; no per-user/plan limits |
| 78 | White-Label | ❌ | P2 | Remove branding for premium |
| 79 | Onboarding Portal | ❌ | P2 | Step-by-step wizard for new users |
| 80 | Canned Responses in Chat | ❌ | P2 | Quick-insert template responses |
| 81 | Per-Plan Rate Limiting | ❌ | P2 | Enforce tier differences |

---

## Summary by Priority

### P0 — Critical (3 features)
Must have before launch. Blocks revenue or platform viability.

| # | Feature | Status | Impact |
|---|---|---|---|
| 6 | WhatsApp Business API Migration | ❌ | Unofficial method risks bans; blocks Catalog/Payments/Flows/Templates |
| 47 | Payment Gateway Integration | ❌ | Cannot collect subscription revenue without it |
| 7 | WhatsApp Number Coexistence | ❌ | Businesses won't switch if they lose WhatsApp app access |

### P1 — Table Stakes (10 features)
Competitors have these. Users will expect them.

| # | Feature | Status |
|---|---|---|
| 4 | Bulk Messaging (upgrade) | 🟡 |
| 5 | Message Templates (upgrade) | 🟡 |
| 15 | Instagram Channel | ❌ |
| 16 | Facebook Messenger Channel | ❌ |
| 24 | Chatbot Builder | ❌ |
| 25 | AI Intent Detection | ❌ |
| 26 | Appointment Booking | ❌ |
| 34 | Manager Monitoring | ❌ |
| 42 | Campaign Management | ❌ |
| 54 | Outgoing Webhooks | ❌ |
| 66 | Data Export | ❌ |

### P2 — Competitive Parity (14 features)
Match competitors to stay relevant.

| # | Feature | Status |
|---|---|---|
| 14 | Email Inbox (IMAP) | 🟡 |
| 9 | WhatsApp Forms (Flows) | ❌ |
| 33 | Phone Number Masking | ❌ |
| 35 | Chat Translation | ❌ |
| 41 | Customer Segmentation | ❌ |
| 44 | Campaign Analytics | ❌ |
| 45 | Drip Campaign Builder | ❌ |
| 48 | Invoice Generation | ❌ |
| 55 | Custom Webhook Listener | ❌ |
| 60 | Google Sheets Integration | ❌ |
| 67 | Data Import | ❌ |
| 68 | Reporting Module | ❌ |
| 78 | White-Label | ❌ |
| 79 | Onboarding Portal | ❌ |
| 80 | Canned Responses in Chat | ❌ |
| 81 | Per-Plan Rate Limiting | ❌ |

### P3 — Nice to Have (11 features)
Differentiation opportunities or future growth.

| # | Feature | Status |
|---|---|---|
| 10 | WhatsApp Catalog | ❌ |
| 11 | Click-to-WhatsApp Ads | ❌ |
| 17 | SMS Channel | ❌ |
| 46 | Click-to-WhatsApp Ads | ❌ |
| 49 | Payment Collection in Chat | ❌ |
| 50 | Cart / In-Chat Ordering | ❌ |
| 51 | Abandoned Cart Recovery | ❌ |
| 52 | Order Confirmations | ❌ |
| 56 | Zapier Integration | ❌ |
| 57 | Pabbly Integration | ❌ |
| 58 | Make Integration | ❌ |
| 59 | N8N Integration | ❌ |
| 61 | Shopify Integration | ❌ |
| 62 | WooCommerce Integration | ❌ |
| 63 | CRM Integrations | ❌ |

---

## Summary by Status

| Status | Count | Percentage |
|---|---|---|
| ✅ Fully Implemented | 26 | 32% |
| 🟡 Partially Implemented | 9 | 11% |
| ❌ Not Implemented | 46 | 57% |
| **Total** | **81** | 100% |

### Fully Implemented (26)
WhatsApp connect/disconnect, send/receive, multi-client, Telegram, Live Chat, AI Auto-Reply, AI Chat/RAG, Auto-Replies, Follow-Ups, Workflows, Variable Substitution, Shared Inbox, Assign Conversations, Internal Notes, Roles & Permissions, Departments, CSAT, Contact Management, Custom Fields, Tags, Contact Merge, External IDs, Analytics Dashboard, Conversation Timeline, Help Center, Embeddable Widget, Knowledge Base, Templates, Subscription Plans, Free Trial, REST API, Arabic RTL, Dark Mode

### Partially Implemented (9)
Bulk Messaging, Message Templates, Email (send only), Rate Limiting (IP only), Subscription/Billing (no gateway), Campaign/Broadcast (basic), Canned Responses (templates as proxy), Webhooks (stubs), Data Export (CSV stub)

### Not Implemented (46)
WhatsApp Business API, Number Coexistence, Catalog, Forms/Flows, Payments, Click-to-Ads, Instagram, Messenger, SMS, Chatbot Builder, Intent Detection, Appointment Booking, Phone Masking, Manager Monitoring, Translation, Segmentation, Campaign Management, Campaign Analytics, Drip Campaigns, Payment Gateway, Invoices, Product Catalog, Cart/Orders, Abandoned Cart, Order Confirmations, Webhooks (outgoing), Webhook Listener, Google Sheets, Zapier, Pabbly, Make, N8N, Shopify, WooCommerce, CRM, Data Export (full), Data Import, Reporting, White-Label, Onboarding, Canned Responses, Per-Plan Limits, Click-to-Ads