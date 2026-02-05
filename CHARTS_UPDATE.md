# Charts Feature Update - POST & File Upload Support

## Changes Made

### 1. Backend Changes ([routes/charts.js](routes/charts.js))
- ✅ Changed from GET to POST request
- ✅ Added multer middleware for file upload handling
- ✅ Support both JSON pasting and file uploads
- ✅ Files processed in-memory (no disk writes)
- ✅ 10MB file size limit
- ✅ Better error messages for invalid JSON

### 2. Frontend Changes ([views/pages/tools/index.ejs](views/pages/tools/index.ejs))
- ✅ Added file input field support
- ✅ Updated `callRoute()` to detect POST vs GET
- ✅ Use FormData for POST requests
- ✅ Handle file uploads alongside text input
- ✅ Store HTTP method in card dataset attribute

### 3. Route Metadata ([routes/tools.js](routes/tools.js))
- ✅ Updated method from GET to POST
- ✅ Added file parameter with .json accept filter
- ✅ Made both textarea and file optional (need one or the other)
- ✅ Updated description to mention file upload

### 4. Dependencies ([package.json](package.json))
- ✅ Added multer@1.4.5-lts.2 for file upload handling

## Problem Solved

**Error 431 (Request Header Fields Too Large)** - This occurred when pasting large JSON data because GET requests put parameters in the URL/headers. By switching to POST:
- Data is sent in the request body (no size limit)
- Headers remain small
- Can handle JSON files of any reasonable size (up to 10MB)

## New Features

### File Upload
Users can now upload JSON files instead of pasting:
1. Click "Browse" button
2. Select a .json file
3. Choose chart type
4. Click "Execute"

### Dual Input Support
Users can choose either method:
- **Paste JSON**: Traditional textarea input
- **Upload File**: Browse and select .json file

## Technical Details

### Request Flow (POST)
```
User pastes JSON → Frontend collects FormData → POST to /charts/parse → 
Backend parses JSON → Generates chart data → Returns to frontend → 
Renders Chart.js visualization
```

### Request Flow (File Upload)
```
User uploads file → Frontend adds file to FormData → POST to /charts/parse → 
Multer processes file → Backend reads buffer → Parses JSON → 
Generates chart data → Returns to frontend → Renders Chart.js visualization
```

### FormData Structure
```javascript
{
  data: "JSON string" (optional),
  file: File object (optional),
  chartType: "timeSeries|executionCount|..."
}
```

## Testing

To test the feature:

1. Start the server: `npm start`
2. Navigate to `/tools`
3. Click "Charts" in sidebar
4. **Test 1**: Paste JSON from `test/sample-performance-data.json`
5. **Test 2**: Upload `test/sample-performance-data.json` as file
6. Both should generate the same chart

## Security Considerations

- ✅ File size limit (10MB) prevents memory exhaustion
- ✅ Only .json MIME types accepted (frontend validation)
- ✅ JSON parsing errors caught and returned gracefully
- ✅ No files written to disk (in-memory processing)
- ✅ Input validation on data structure

## Browser Compatibility

- ✅ Modern browsers with FormData support
- ✅ File API support required for uploads
- ✅ Fetch API for requests

## Future Enhancements

- Add drag-and-drop file upload
- Support CSV to JSON conversion
- Add data validation schema
- Export chart as image
- Save chart configurations
