# Function Relationships - WhatsApp Web.js Service

## Flowchart: Application Startup and Message Processing

```mermaid
flowchart TB
    subgraph app["app.ts"]
        main["main()"] --> acquireLock["acquireLock()"]
        main --> releaseLock["releaseLock()"]
    end

    subgraph server["api/server.ts"]
        startServer["startServer()"] --> initServices["initializeServices()"]
        initServices --> createWhatsApp["new WhatsAppClientWrapper()"]
        initServices --> createConvMgr["new ConversationManager()"]
        
        initServices --> setupQR["QR Event Handler"]
        initServices --> setupReady["Ready Event Handler"]
        initServices --> setupMsg["Message Event Handler"]
        initServices --> setupDisconnect["Disconnected Event Handler"]
        initServices --> setupError["Error Event Handler"]
        
        setupMsg --> isAuthorized["isAuthorizedNumber()"]
        setupMsg --> getConv["getConversation()"]
        
        setupMsg --> hasMedia{hasMedia?}
        hasMedia -->|Yes| downloadMedia["message.downloadMedia()"]
        downloadMedia --> processAudio["processAudio()"]
        
        hasMedia -->|No| processResponse["processUserResponse()"]
        
        processAudio --> use["MessageFormatter"]
        processResponse --> use
    end

    subgraph manager["services/conversation/manager.ts"]
        getConvMgr["getConversation()"] --> createGemini["new GeminiClient()"]
        
        processAudioMgr["processAudio()"] --> startSession["geminiClient.startSession()"]
        processAudioMgr --> updateConv["Update Conversation State"]
        
        processResponseMgr["processUserResponse()"] --> hasSession{session_id?}
        hasSession -->|Yes| submitAnswers["submitSessionAnswers()"]
        hasSession -->|No| checkConfirm["Check Confirmation/Rejection"]
        
        submitAnswers --> submitToGemini["geminiClient.submitSessionAnswers()"]
        submitAnswers --> updateConv2["Update Conversation State"]
        
        checkConfirm --> formatMsg["MessageFormatter.inspectionReady()"]
        checkConfirm --> formatMsg2["MessageFormatter.userRejected()"]
        checkConfirm --> formatMsg3["MessageFormatter.serviceUnavailable()"]
    end

    subgraph formatter["utils/message-formatter.ts"]
        format["format()"]
        inspectionReady["inspectionReady()"]
        formatArabic["formatArabicReport()"]
        inspectionSaved["inspectionSaved()"]
        clarification["clarificationQuestion()"]
        multipleQuestions["multipleQuestions()"]
        userRejected["userRejected()"]
        serviceUnavailable["serviceUnavailable()"]
        
        inspectionReady --> formatArabic
    end

    %% Relationships
    processAudio -->|Returns| use
    processResponse -->|Returns| use
    startSession -->|Returns| processAudioMgr
    submitToGemini -->|Returns| submitAnswers
    submitAnswers -->|Returns| formatMsg
```

## Sequence Diagram: Message Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant WhatsApp
    participant Server
    participant ConvMgr
    participant Gemini
    participant Formatter

    User->>WhatsApp: Send Audio Message
    WhatsApp->>Server: message event
    
    Server->>Server: isAuthorizedNumber()
    alt Authorized
        Server->>ConvMgr: getConversation(phoneNumber)
        ConvMgr-->>Server: Conversation
        
        alt Has Media
            Server->>ConvMgr: processAudio(apiaryId, base64)
            ConvMgr->>Gemini: startSession()
            Gemini-->>ConvMgr: result
            ConvMgr->>ConvMgr: Update conversation state
            
            alt needsClarification
                ConvMgr-->>Server: questions[]
                Server->>Formatter: multipleQuestions()
                Formatter-->>Server: formatted string
                Server->>WhatsApp: message.reply()
            else hasAnalysis
                ConvMgr-->>Server: analysis
                Server->>Formatter: inspectionReady()
                Formatter-->>Server: formatted string
                Server->>WhatsApp: message.reply()
            end
            
        else Text Response
            Server->>ConvMgr: processUserResponse()
            
            alt Has session_id
                ConvMgr->>Gemini: submitSessionAnswers()
                Gemini-->>ConvMgr: result
                ConvMgr->>ConvMgr: Update state
                ConvMgr-->>Server: message
                Server->>WhatsApp: message.reply()
            else No session
                Server->>WhatsApp: message.reply()
            end
        end
    else Not Authorized
        Server-->>WhatsApp: (ignore)
    end
```

## Class Diagram: Key Components

```mermaid
classDiagram
    class App {
        +main() void
        +acquireLock() boolean
        +releaseLock() void
    }
    
    class Server {
        +startServer() void
        #initializeServices() void
        #isAuthorizedNumber() boolean
    }
    
    class MessageFormatter {
        +format() string
        +inspectionReady() string
        +formatArabicReport() string
        +inspectionSaved() string
        +clarificationQuestion() string
        +multipleQuestions() string
        +userRejected() string
        +serviceUnavailable() string
    }
    
    class ConversationManager {
        -conversations: Map
        -geminiClient: GeminiClient
        +getConversation() Conversation
        +processAudio() Promise
        +processUserResponse() Promise
        +submitSessionAnswers() Promise
        +getSessionStatus() Promise
        +deleteConversation() void
        +getConversationDetails() Conversation
        +getConversations() Map
    }
    
    class WhatsAppClientWrapper {
        +getClient() Client
        +on() void
    }
    
    Server --> MessageFormatter: uses
    Server --> ConversationManager: manages
    Server --> WhatsAppClientWrapper: wraps
    ConversationManager --> MessageFormatter: uses
    ConversationManager --> GeminiClient: uses
```

## Data Flow: Audio to Analysis

```mermaid
flowchart LR
    subgraph Input
        A[Audio Message] --> B[Download Media]
    end
    
    subgraph Processing
        B --> C[Base64 Encode]
        C --> D[ConversationManager.processAudio]
        D --> E[GeminiClient.startSession]
        E --> F{Response Type}
    end
    
    subgraph Output
        F -->|Questions| G[Format Questions]
        F -->|Analysis| H[Format Analysis]
        G --> I[WhatsApp Reply]
        H --> I
    end
    
    style D fill:#f9f,color:#333
    style E fill:#ff9,color:#333
    style I fill:#9f9,color:#333
```
