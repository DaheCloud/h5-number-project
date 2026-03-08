const fs = require('fs');
const path = require('path');

const data1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/data.json'), 'utf8'));
const data2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/data.backup.json'), 'utf8'));

function compare(obj1, obj2, path = '') {
    for (const key in obj1) {
        if (!obj2.hasOwnProperty(key)) {
            console.log(`Missing key in backup: ${path}.${key}`);
            continue;
        }
        
        const val1 = obj1[key];
        const val2 = obj2[key];

        if (Array.isArray(val1) && Array.isArray(val2)) {
            if (val1.length !== val2.length) {
                console.log(`Length mismatch at ${path}.${key}: New=${val1.length}, Old=${val2.length}`);
                console.log(`New: ${val1}`);
                console.log(`Old: ${val2}`);
            } else {
                // simple check
                const s1 = JSON.stringify(val1.sort());
                const s2 = JSON.stringify(val2.sort());
                if (s1 !== s2) {
                    console.log(`Content mismatch at ${path}.${key}`);
                    console.log(`New: ${s1}`);
                    console.log(`Old: ${s2}`);
                }
            }
        } else if (typeof val1 === 'object' && val1 !== null) {
            compare(val1, val2, `${path}.${key}`);
        }
    }
}

compare(data1, data2);
console.log("Comparison done.");
