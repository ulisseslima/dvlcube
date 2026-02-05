# Charts Feature Documentation

## Overview
The Charts section allows you to visualize performance metrics from JSON data. It's designed to work with function execution data that includes metrics like execution time, error rates, and time series information.

## Features

✅ **Paste JSON** - Directly paste JSON data into the textarea
✅ **Upload JSON File** - Browse and upload .json files (up to 10MB)
✅ **POST Request** - No more 431 errors from large payloads
✅ **6 Chart Types** - Multiple visualization options

## Usage

1. Navigate to the Tools page
2. Select "Charts" from the sidebar
3. **Option A**: Paste your JSON data in the textarea
   **Option B**: Click "Browse" to upload a JSON file
4. Select a chart type from the dropdown
5. Click "Execute" to generate the chart

## Supported Chart Types

### 1. Time Series - Avg Execution Time
Displays average execution time over time for each function as a line chart. Useful for:
- Tracking performance trends
- Identifying performance degradation
- Comparing function performance over time

### 2. Execution Count by Function
Bar chart showing total execution count for each function. Best for:
- Understanding function usage patterns
- Identifying most frequently called functions
- Capacity planning

### 3. Performance Percentiles (P50/P95/P99)
Grouped bar chart comparing P50 (median), P95, and P99 execution times. Ideal for:
- Understanding performance distribution
- Identifying outliers
- SLA monitoring

### 4. Execution Time (Min/Avg/Max)
Grouped bar chart showing minimum, average, and maximum execution times. Great for:
- Understanding execution time range
- Identifying performance variability
- Spotting anomalies

### 5. Error Rate by Function
Bar chart with color-coded error rates (green < 1%, yellow 1-5%, red > 5%). Perfect for:
- Monitoring system health
- Identifying problematic functions
- Quality assurance

### 6. Execution Count Over Time (Stacked)
Stacked area chart showing execution counts over time for all functions. Useful for:
- Understanding overall system load
- Identifying peak usage times
- Resource allocation planning

## Data Format

Your JSON should follow this structure:

```json
{
    "projectId": "your-project-id",
    "startTime": "ISO-8601-timestamp",
    "endTime": "ISO-8601-timestamp",
    "functions": [
        {
            "functionName": "string",
            "executionCount": number,
            "errorCount": number,
            "errorRate": number (0-1),
            "executionTime": {
                "min": number,
                "max": number,
                "avg": number,
                "p50": number,
                "p95": number,
                "p99": number
            },
            "timeSeries": [
                {
                    "timestamp": "ISO-8601-timestamp",
                    "executionCount": number,
                    "errorCount": number,
                    "avgExecutionTime": number
                }
            ]
        }
    ]
}
```

## HTTP Method

The chart endpoint uses **POST** to handle large JSON payloads without hitting URL length limits (which caused 431 errors with GET).

## File Upload Support

- Accepts `.json` files
- Maximum file size: 10MB
- Files are processed in-memory for fast parsing

## Usage

1. Navigate to the Tools page
2. Select "Charts" from the sidebar
3. Paste your JSON data in the textarea
4. Select a chart type from the dropdown
5. Click "Execute" to generate the chart

## Example

See `test/sample-performance-data.json` for a complete example with 5 functions and time series data.

## Technologies

- **Chart.js 4.4.1** - Chart rendering
- **chartjs-adapter-date-fns** - Time axis support
- **Materialize CSS** - UI framework
