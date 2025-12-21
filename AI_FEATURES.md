# AI Features Guide

## Setup

1. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your-key-here
```

2. Restart the server:
```bash
npm start
```

## Features

### 🔍 AI-Enhanced Search (Auto)
- The search bar will automatically use AI when available
- Interprets natural language queries like:
  - "coffee shops near downtown Seattle"
  - "hiking trails in Oregon"
  - "that famous bridge in SF"
- Falls back to standard search if AI is unavailable

### 🤖 AI Assistant Button
Click the purple "AI" button to get:
- Optimal map style recommendations
- Suggested dimensions for your selection
- Tips for better map generation
- Reasoning behind suggestions

### 📝 AI Map Description
When you open the Preview modal:
- AI automatically analyzes your map selection
- Provides context about what's shown
- Suggests use cases (wall art, planning, etc.)
- Appears in the "Current Selection Info" section

## API Endpoints

### POST `/api/ai/search`
Enhances location search with natural language understanding.

**Request:**
```json
{
  "query": "coffee shops near Pike Place"
}
```

**Response:**
```json
{
  "searchTerm": "Pike Place Seattle",
  "suggestions": ["Capitol Hill Seattle", "University District Seattle"],
  "interpretation": "Searching Pike Place area for coffee shops"
}
```

### POST `/api/ai/describe`
Generates description of map selection.

**Request:**
```json
{
  "location": "47.6062, -122.3321",
  "bbox": "south,west,north,east",
  "style": "streets-v12",
  "dimensions": "2000x2000"
}
```

**Response:**
```json
{
  "description": "This map shows downtown Seattle..."
}
```

### POST `/api/ai/suggest`
Provides optimization suggestions.

**Request:**
```json
{
  "location": "47.6062, -122.3321",
  "style": "streets-v12",
  "dimensions": "2000x2000",
  "purpose": "wall art"
}
```

**Response:**
```json
{
  "suggestedStyle": "outdoors-v12",
  "suggestedDimensions": "2560x2560",
  "reasoning": "Outdoors style works better...",
  "tips": ["Use higher resolution", "Consider portrait orientation"]
}
```

## Models Used

- **gpt-4o-mini**: Fast, cost-effective model for all AI features
- Temperature: 0.7-0.8 for creative but focused responses
- Token limits: 200-300 to keep responses concise

## Error Handling

- If OpenAI API key is missing, AI features gracefully disable
- Search falls back to standard Mapbox geocoding
- AI button shows notification if unavailable
- All features continue working without AI

## Cost Considerations

GPT-4o-mini is extremely affordable:
- ~$0.15 per million input tokens
- ~$0.60 per million output tokens
- Each AI call uses ~200-500 tokens
- Typical usage: pennies per day

## Tips

1. **For best search results**: Be specific with landmarks or neighborhoods
2. **AI suggestions**: Work best when you have a specific use case in mind
3. **Descriptions**: More helpful for unfamiliar areas
4. **Rate limits**: API has generous limits, but consider caching for production
