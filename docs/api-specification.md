## **Here are the real webhook response structures** (what WhatsApp sends to your server)

All payloads follow this **common wrapper**:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WABA_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": { ... },
            "contacts": [ { ... } ],
            "messages": [ { ... } ]          // ← Main content here
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### 1. User sends **Text**

```json
{
  "type": "text",
  "text": {
    "body": "Hello, I want to order pizza"
  }
}
```

### 2. User sends **Image**

```json
{
  "type": "image",
  "image": {
    "caption": "This is the product I want",   // optional
    "mime_type": "image/jpeg",
    "sha256": "abc123...",
    "id": "MEDIA_ID_HERE",                    // Use this to download
    "url": "https://lookaside.fbsbx.com/..."  // temporary URL (newer)
  }
}
```

### 3. User sends **Audio / Voice Message**

```json
{
  "type": "audio",
  "audio": {
    "mime_type": "audio/ogg; codecs=opus",
    "sha256": "def456...",
    "id": "MEDIA_ID_HERE",
    "url": "https://lookaside.fbsbx.com/...",
    "voice": true                          // true = voice note, false = audio file
  }
}
```

### 4. User sends **Video**

```json
{
  "type": "video",
  "video": {
    "caption": "Check this video",
    "mime_type": "video/mp4",
    "sha256": "ghi789...",
    "id": "MEDIA_ID_HERE",
    "url": "https://lookaside.fbsbx.com/..."
  }
}
```

**Note for all media**: The file is **not** included. Use the `id` (recommended) or `url` to download it via Cloud API.

### 5. User clicks **Reply Button** (Interactive Button)

```json
{
  "type": "interactive",
  "interactive": {
    "type": "button_reply",
    "button_reply": {
      "id": "btn_yes",           // The ID you set when sending the button
      "title": "Yes, confirmed"
    }
  }
}
```

### 6. User selects from **List** (Interactive List)

```json
{
  "type": "interactive",
  "interactive": {
    "type": "list_reply",
    "list_reply": {
      "id": "priority_express",     // The row ID you defined
      "title": "Express Delivery",
      "description": "2-3 days"     // optional
    }
  }
}
```

## **Here are the clean JSON structures for sending messages** via WhatsApp Cloud API.

You send them with a **POST** request to:
`https://graph.facebook.com/<API_VERSION>/<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/messages`

Headers:
- `Content-Type: application/json`
- `Authorization: Bearer <ACCESS_TOKEN>`

### 1. Send **Text** Message

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "6281234567890",          // User's WhatsApp number with country code
  "type": "text",
  "text": {
    "preview_url": false,         // Set true if message contains link
    "body": "Hello! How can I help you today?"
  }
}
```

### 2. Send **Reply Buttons** (Interactive Button)

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "6281234567890",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": {
      "type": "text",
      "text": "Confirm your order"       // optional (can be text, image, video, document)
    },
    "body": {
      "text": "Do you want to proceed with this order?"
    },
    "footer": {
      "text": "Reply within 24 hours"     // optional
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "btn_yes",               // Unique ID (max 256 chars)
            "title": "Yes, Confirm"        // Max 20 characters
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_no",
            "title": "No, Cancel"
          }
        }
      ]
    }
  }
}
```

**Limit**: Maximum **3 buttons**

### 3. Send **List** Message

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "6281234567890",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "header": {
      "type": "text",
      "text": "Choose Service"               // optional
    },
    "body": {
      "text": "Please select one of the options below"
    },
    "footer": {
      "text": "Thank you"                    // optional
    },
    "action": {
      "button": "Select Option",             // Button text (max 20 chars)
      "sections": [
        {
          "title": "Delivery Options",       // optional
          "rows": [
            {
              "id": "express",               // Unique ID per row
              "title": "Express Delivery",   // Max 24 chars
              "description": "2-3 days (Rp 50.000)"   // optional, max 72 chars
            },
            {
              "id": "regular",
              "title": "Regular Delivery",
              "description": "5-7 days (Rp 20.000)"
            }
          ]
        }
      ]
    }
  }
}
```

**Limits**:
- Max **10 rows** total
- Max **10 sections**
- Each row `title` ≤ 24 characters
