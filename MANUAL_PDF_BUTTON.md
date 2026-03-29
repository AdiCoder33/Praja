# Manual PDF Generation Button

## Feature Added ✅

A **"Generate PDF"** button has been added to the FIR Assistant interface that allows users to manually generate a FIR PDF at any time during the conversation.

## Location

The button is located in the **top-right corner** of the header:

```
┌─────────────────────────────────────┐
│  [📄 Generate PDF]  🚔 AI FIR       │
│     Assistant                        │
└─────────────────────────────────────┘
```

## How It Works

### 1. **Click the Button**
- Click "📄 Generate PDF" at any time during your conversation
- The button will show "⏳ Generating..." while processing

### 2. **PDF Generation**
- The system extracts all information collected so far from the conversation
- Generates a PDF with whatever details are available
- Fields not yet discussed will show as "N/A" or "To be filled"

### 3. **Download Link**
- A download button appears in the chat
- Click to download your FIR PDF immediately

### 4. **Completeness Indicator**
- **Green notification** = All required fields collected ✅
- **Orange notification** = Some fields incomplete ⚠️
- Missing fields are listed if applicable

## Use Cases

### Early Download
Generate a draft PDF early in the conversation to see what information is still needed:
```
User: "I lost my phone"
AI: "When did this happen?"
User: *clicks Generate PDF*
→ Gets partial PDF showing what's missing
```

### Multiple Versions
Generate PDFs at different stages:
- Draft version after basic details
- Updated version after adding property details
- Final version with all information

### Incomplete Conversations
If you need to leave before finishing:
- Generate PDF with current information
- Download what you have so far
- Continue later if needed

## Button States

| State | Appearance | Meaning |
|-------|------------|---------|
| **Ready** | `📄 Generate PDF` | Click to generate |
| **Processing** | `⏳ Generating...` | Please wait |
| **Disabled** | Grayed out | Currently processing |

## Technical Details

### Frontend
- **File**: `frontend/public/fir-assistant.html`
- **Button**: Top-right of header
- **Function**: `generatePDF()` in `app.js`

### Backend
- **Endpoint**: `POST /api/fir/generate`
- **File**: `backend/app/routes/fir.py`
- **Input**: Conversation history + language
- **Output**: PDF filename + completeness status

### Response Format
```json
{
  "status": "success",
  "pdf_filename": "FIR_20240329_123456.pdf",
  "complete": false,
  "missing_fields": ["age", "address", "incident_time"]
}
```

## Visual Feedback

### Complete FIR
```
┌─────────────────────────────────────┐
│ ✅ FIR Details Collected Successfully! │
│ Your FIR document is ready.          │
│ [📄 Download FIR PDF]                │
└─────────────────────────────────────┘
```

### Incomplete FIR
```
┌─────────────────────────────────────┐
│ ⚠️ FIR PDF Generated                │
│ Some fields may be incomplete.       │
│ Missing: age, address, incident_time │
│ [📄 Download FIR PDF]                │
└─────────────────────────────────────┘
```

## Mobile Responsive

On mobile devices, the button automatically moves below the title for better accessibility.

## Error Handling

- **No conversation**: Shows error "Please have a conversation first"
- **Extraction failed**: Shows error "Could not extract FIR data"
- **Network error**: Shows error "Failed to generate PDF. Please try again."

## Comparison: Manual vs Auto

| Feature | Manual Button | Auto-Generation |
|---------|---------------|-----------------|
| **Trigger** | User clicks button | System detects completeness |
| **Timing** | Any time | Only when complete |
| **Completeness** | Can be partial | Always complete |
| **Use Case** | Quick drafts | Final FIR |

## Benefits

✅ **Flexibility**: Generate PDF whenever you want
✅ **Preview**: See what information is still needed
✅ **Draft Mode**: Get partial FIR for reference
✅ **User Control**: Don't wait for auto-generation
✅ **Multiple Downloads**: Generate as many times as needed

## Example Workflow

```
1. Start conversation
   User: "I want to file FIR for lost phone"

2. Provide some details
   AI collects: name, contact, location

3. Click "Generate PDF" button
   → Download partial FIR showing what's missing

4. Continue conversation
   AI collects: date, time, phone details

5. Click "Generate PDF" again
   → Download updated FIR with more details

6. Complete all details
   → Auto-generation also triggers (optional)
   → Download final complete FIR
```

## Notes

- The button works independently of auto-generation
- Both systems can coexist - manual OR automatic
- PDFs are stored in `backend/generated_firs/`
- Each PDF has a unique timestamp filename
- No limit on how many times you can generate
