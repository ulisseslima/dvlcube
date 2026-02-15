/**
 * Unit tests for capitalizedTitle function
 * Tests hyphenated compound word handling and various style guides
 */

// Import the capitalizedTitle function from generate.js
const path = require('path');
const generateModule = require(path.join(__dirname, '../routes/generate.js'));

// Access the capitalizedTitle function by extracting it from the module
// Since it's not exported, we need to extract it from the file
const fs = require('fs');
const generateCode = fs.readFileSync(path.join(__dirname, '../routes/generate.js'), 'utf8');

// Extract and evaluate the capitalizedTitle function
const functionMatch = generateCode.match(/function capitalizedTitle[\s\S]+?^}/m);
if (!functionMatch) {
    console.error('Could not extract capitalizedTitle function');
    process.exit(1);
}

// Create the function in our scope
eval(functionMatch[0]);

// Test cases
const testCases = [
    {
        input: 'read-write and read-only transaction routing with spring',
        expected: {
            APA: 'Read-Write and Read-Only Transaction Routing With Spring',
            CHICAGO: 'Read-Write and Read-Only Transaction Routing with Spring',
            AP: 'Read-Write and Read-Only Transaction Routing With Spring',
            MLA: 'Read-Write and Read-Only Transaction Routing with Spring',
            BB: 'Read-Write and Read-Only Transaction Routing with Spring',
            AMA: 'Read-Write and Read-Only Transaction Routing With Spring'
        }
    }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('Running capitalize title tests...\n');

testCases.forEach((testCase, index) => {
    console.log(`Test case ${index + 1}: "${testCase.input}"`);
    console.log('─'.repeat(80));
    
    Object.keys(testCase.expected).forEach(style => {
        const result = capitalizedTitle(testCase.input, style);
        const expected = testCase.expected[style];
        const isPass = result === expected;
        
        if (isPass) {
            passed++;
            console.log(`✓ ${style.padEnd(10)} PASS`);
            console.log(`  Result: "${result}"`);
        } else {
            failed++;
            console.log(`✗ ${style.padEnd(10)} FAIL`);
            console.log(`  Expected: "${expected}"`);
            console.log(`  Got:      "${result}"`);
        }
    });
    
    console.log('─'.repeat(80));
    console.log();
});

// Summary
console.log('Test Summary:');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);

if (failed > 0) {
    process.exit(1);
}

console.log('\n✓ All tests passed!');
