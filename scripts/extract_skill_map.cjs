
const fs = require('fs');
const path = require('path');

const boardPath = path.resolve('src/Board.jsx');
const content = fs.readFileSync(boardPath, 'utf8');

// Find onSkillClick body
const startIdx = content.indexOf('const onSkillClick = (rawSkillName) => {');
if (startIdx === -1) {
    console.error('Could not find onSkillClick');
    process.exit(1);
}

// Simple extraction using regex on the function body
// We assume the function body ends eventually. We'll just search the next 20000 chars.
const body = content.substring(startIdx, startIdx + 20000);

const map = {};

// Regex for strict equality
// if (skillName === '称象') { ... moves.caocongChengxiangStart();
const regexStrict = /if\s*\((?:skillName|baseSkillName)\s*===\s*['"](.+?)['"]\)\s*\{[\s\S]*?moves\.(\w+)\(/g;
let match;
while ((match = regexStrict.exec(body)) !== null) {
    map[match[1]] = match[2];
}

// Regex for startsWith
// if (skillName.startsWith('成略')) { moves.xuyouChengLue();
const regexStart = /if\s*\((?:skillName|baseSkillName)\.startsWith\(['"](.+?)['"]\)\)\s*\{[\s\S]*?moves\.(\w+)\(/g;
while ((match = regexStart.exec(body)) !== null) {
    map[match[1]] = match[2];
}

console.log(JSON.stringify(map, null, 2));
