const express = require('express')
const multer = require('multer')
const router = express.Router()

// Configure multer for file uploads (in-memory storage)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

/**
 * Parse performance metrics JSON and generate chart data
 * Supports both JSON in request body and file uploads
 */
router.post('/parse', upload.single('file'), async (req, res) => {
    try {
        let jsonData
        let chartType = req.body.chartType || 'timeSeries'
        
        // Check if data comes from file upload or text input
        if (req.file) {
            // File upload
            try {
                const fileContent = req.file.buffer.toString('utf-8')
                jsonData = JSON.parse(fileContent)
            } catch (e) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid JSON file: ' + e.message 
                })
            }
        } else if (req.body.data) {
            // Text input
            try {
                jsonData = JSON.parse(req.body.data)
            } catch (e) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid JSON: ' + e.message 
                })
            }
        } else {
            return res.status(400).json({ 
                success: false, 
                error: 'No data provided. Please paste JSON or upload a file.' 
            })
        }

        // Validate the data structure
        if (!jsonData.functions || !Array.isArray(jsonData.functions)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid data structure. Expected "functions" array.' 
            })
        }

        const chartData = generateChartData(jsonData, chartType)
        
        res.json({ 
            success: true, 
            chartData,
            metadata: {
                projectId: jsonData.projectId,
                startTime: jsonData.startTime,
                endTime: jsonData.endTime,
                functionCount: jsonData.functions.length
            }
        })
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        })
    }
})

/**
 * Generate chart-specific data based on type
 */
function generateChartData(data, chartType = 'timeSeries') {
    const functions = data.functions
    
    switch (chartType) {
        case 'timeSeries':
            return generateTimeSeriesData(functions)
        
        case 'executionCount':
            return generateExecutionCountData(functions)
        
        case 'percentiles':
            return generatePercentilesData(functions)
        
        case 'avgExecutionTime':
            return generateAvgExecutionTimeData(functions)
        
        case 'errorRate':
            return generateErrorRateData(functions)
        
        case 'executionTimeComparison':
            return generateExecutionTimeComparisonData(functions)
        
        default:
            return generateTimeSeriesData(functions)
    }
}

/**
 * Time Series: Average execution time over time for each function
 */
function generateTimeSeriesData(functions) {
    const datasets = []
    const colors = [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)'
    ]
    
    functions.forEach((func, index) => {
        const data = func.timeSeries
            .filter(ts => ts.executionCount > 0)
            .map(ts => ({
                x: new Date(ts.timestamp),
                y: ts.avgExecutionTime
            }))
        
        datasets.push({
            label: func.functionName,
            data: data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
            tension: 0.4
        })
    })
    
    return {
        type: 'line',
        datasets: datasets,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'MMM dd HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Avg Execution Time (ms)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Average Execution Time Over Time'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    }
}

/**
 * Execution Count: Total executions per function
 */
function generateExecutionCountData(functions) {
    const labels = functions.map(f => f.functionName)
    const data = functions.map(f => f.executionCount)
    
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Executions',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Execution Count'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Total Execution Count by Function'
                },
                legend: {
                    display: false
                }
            }
        }
    }
}

/**
 * Percentiles: p50, p95, p99 comparison
 */
function generatePercentilesData(functions) {
    const labels = functions.map(f => f.functionName)
    
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'P50 (median)',
                    data: functions.map(f => f.executionTime.p50),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                },
                {
                    label: 'P95',
                    data: functions.map(f => f.executionTime.p95),
                    backgroundColor: 'rgba(255, 206, 86, 0.6)',
                    borderColor: 'rgb(255, 206, 86)',
                    borderWidth: 1
                },
                {
                    label: 'P99',
                    data: functions.map(f => f.executionTime.p99),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Execution Time (ms)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Percentiles Comparison'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    }
}

/**
 * Average Execution Time: Compare min, max, avg
 */
function generateAvgExecutionTimeData(functions) {
    const labels = functions.map(f => f.functionName)
    
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Min',
                    data: functions.map(f => f.executionTime.min),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                },
                {
                    label: 'Average',
                    data: functions.map(f => f.executionTime.avg),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Max',
                    data: functions.map(f => f.executionTime.max),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Execution Time (ms)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Execution Time Comparison (Min/Avg/Max)'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    }
}

/**
 * Error Rate: Error rate per function
 */
function generateErrorRateData(functions) {
    const labels = functions.map(f => f.functionName)
    const errorRates = functions.map(f => f.errorRate * 100) // Convert to percentage
    
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Error Rate (%)',
                data: errorRates,
                backgroundColor: errorRates.map(rate => 
                    rate > 5 ? 'rgba(255, 99, 132, 0.6)' : 
                    rate > 1 ? 'rgba(255, 206, 86, 0.6)' : 
                    'rgba(75, 192, 192, 0.6)'
                ),
                borderColor: errorRates.map(rate => 
                    rate > 5 ? 'rgb(255, 99, 132)' : 
                    rate > 1 ? 'rgb(255, 206, 86)' : 
                    'rgb(75, 192, 192)'
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Error Rate (%)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Error Rate by Function'
                },
                legend: {
                    display: false
                }
            }
        }
    }
}

/**
 * Execution Time Comparison: Stacked area chart of executions over time
 */
function generateExecutionTimeComparisonData(functions) {
    // Collect all unique timestamps
    const timestampSet = new Set()
    functions.forEach(func => {
        func.timeSeries.forEach(ts => {
            timestampSet.add(ts.timestamp)
        })
    })
    
    const timestamps = Array.from(timestampSet).sort()
    const labels = timestamps.map(ts => new Date(ts).toLocaleString())
    
    const colors = [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)'
    ]
    
    const datasets = functions.map((func, index) => {
        const data = timestamps.map(timestamp => {
            const entry = func.timeSeries.find(ts => ts.timestamp === timestamp)
            return entry ? entry.executionCount : 0
        })
        
        return {
            label: func.functionName,
            data: data,
            backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.6)'),
            borderColor: colors[index % colors.length],
            borderWidth: 1,
            fill: true
        }
    })
    
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Execution Count'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Execution Count Over Time (Stacked)'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    }
}

module.exports = router
