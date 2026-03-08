const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const EXPECTED_NUMBERS = Array.from({ length: 49 }, (_, i) => i + 1);

function validateCategory(categoryName, categoryData) {
    const allNumbers = [];
    let isValid = true;
    for (const key in categoryData) {
        const values = categoryData[key];
        if (!Array.isArray(values)) {
            console.error(`[ERROR] ${categoryName} -> ${key} is not an array.`);
            isValid = false;
            continue;
        }
        allNumbers.push(...values);
    }
    const uniqueNumbers = [...new Set(allNumbers)].sort((a, b) => a - b);
    
    // Check for missing numbers
    const missing = EXPECTED_NUMBERS.filter(n => !uniqueNumbers.includes(n));
    if (missing.length > 0) {
        console.error(`[ERROR] ${categoryName}: Missing numbers: ${missing.join(', ')}`);
        isValid = false;
    }

    // Check for duplicate numbers
    if (allNumbers.length !== uniqueNumbers.length) {
        const counts = {};
        allNumbers.forEach(n => counts[n] = (counts[n] || 0) + 1);
        const duplicates = Object.keys(counts).filter(n => counts[n] > 1);
        console.error(`[ERROR] ${categoryName}: Duplicate numbers found: ${duplicates.join(', ')}`);
        isValid = false;
    }

    if (isValid) {
        console.log(`[PASS] ${categoryName} covers numbers 1-49 correctly.`);
    }
}

// 1. Validate "生肖", "五行", "波色", "五门", "段位", "合数", "合单双"
const numCategories = ["生肖", "五行", "波色", "五门", "段位", "合数", "合单双"];
numCategories.forEach(cat => {
    if (data[cat]) {
        validateCategory(cat, data[cat]);
    } else {
        console.error(`[ERROR] Missing category: ${cat}`);
    }
});

// 2. Validate "其它属性" references
if (data["其它属性"]) {
    const zodiacKeys = Object.keys(data["生肖"] || {});
    const otherProps = data["其它属性"];
    
    for (const prop in otherProps) {
        const values = otherProps[prop];
        if (!Array.isArray(values)) {
             console.error(`[ERROR] 其它属性 -> ${prop} is not an array.`);
             continue;
        }

        values.forEach(val => {
            // Handle complex strings like "鼠龙猴" or "猴（龙）"
            // Simple split if needed, or regex match
            let zodiacsFound = [];
            
            // Try to find known zodiacs in the string
            zodiacKeys.forEach(z => {
                if (val.includes(z)) {
                    zodiacsFound.push(z);
                }
            });

            if (zodiacsFound.length === 0) {
                 console.warn(`[WARN] 其它属性 -> ${prop}: Value "${val}" does not contain any known zodiac.`);
            }
        });
    }
    console.log(`[PASS] 其它属性 basic validation done.`);
}
