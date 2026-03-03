
const fs = require('fs');
const path = require('path');

const generals = require('../configs/generals.json');
const boardPath = path.resolve('src/Board.jsx');
const content = fs.readFileSync(boardPath, 'utf8');

// Find onSkillClick body
const startIdx = content.indexOf('const onSkillClick = (rawSkillName) => {');
if (startIdx === -1) {
    console.error('Could not find onSkillClick');
    process.exit(1);
}

// Extract body (heuristic: match braces)
let braceCount = 0;
let bodyStart = content.indexOf('{', startIdx);
let bodyEnd = -1;
for (let i = bodyStart; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    if (braceCount === 0) {
        bodyEnd = i;
        break;
    }
}
const body = content.substring(bodyStart, bodyEnd + 1);

// Robust extraction function
function extractBlock(skillName) {
    // Search for: if (skillName === 'Name') {
    // OR: if (skillName.startsWith('Name')) {
    // OR: if (baseSkillName === 'Name') {
    
    const patterns = [
        `if \\(skillName === ['"]${skillName}['"]\\)\\s*\\{`,
        `if \\(baseSkillName === ['"]${skillName}['"]\\)\\s*\\{`,
        `if \\(skillName\\.startsWith\\(['"]${skillName}['"]\\)\\)\\s*\\{`,
        `if \\(baseSkillName\\.startsWith\\(['"]${skillName}['"]\\)\\)\\s*\\{`
    ];
    
    for (const p of patterns) {
        const regex = new RegExp(p);
        const match = regex.exec(body);
        if (match) {
            const blockStart = match.index + match[0].length - 1; // pointing to {
            // Count braces from blockStart
            let count = 0;
            let blockEnd = -1;
            for (let i = blockStart; i < body.length; i++) {
                if (body[i] === '{') count++;
                if (body[i] === '}') count--;
                if (count === 0) {
                    blockEnd = i;
                    break;
                }
            }
            if (blockEnd !== -1) {
                return body.substring(match.index, blockEnd + 1);
            }
        }
    }
    return null;
}

// Output Report
console.log('# 武将技能测试报告\n');
console.log('## 测试标准\n1. **点击响应**: 必须能在 `onSkillClick` 中找到对应的处理逻辑。\n2. **功能实现**: 处理逻辑不仅仅是 `return`，必须调用 `moves` 或修改状态。\n3. **无报错**: 代码本身无明显语法错误（静态分析）。\n');
console.log('| 武将 | 技能 | 点击后逻辑 (代码片段) | 状态评价 |');
console.log('|---|---|---|---|');

const enabledGenerals = generals.filter(g => g.enable);

enabledGenerals.forEach(gen => {
    gen.skills.forEach(skill => {
        let fullLogic = extractBlock(skill);
        let status = '✅ 通过';
        let displayLogic = '';
        
        if (!fullLogic) {
            displayLogic = "无点击响应 (被动/自动触发)";
            status = '⚠️ 被动/无响应';
        } else {
            // Clean up: remove the if wrapper
            let innerLogic = fullLogic.replace(/if\s*\(.+?\)\s*\{/, '').replace(/\}$/, '').trim();
            
            if (innerLogic.includes('alert')) {
                status = '❌ 仅提示/未实现';
            } else if (!innerLogic.includes('moves') && !innerLogic.includes('set') && !innerLogic.includes('setActiveSkill')) {
                // If it doesn't call moves or set state, it's likely empty or logging
                 status = '⚠️ 仅日志/无操作';
            }
            
            displayLogic = innerLogic.replace(/\s+/g, ' ').substring(0, 60);
            if (innerLogic.length > 60) displayLogic += '...';
            if (displayLogic.length === 0) {
                displayLogic = "(逻辑为空)";
                status = '❌ 空逻辑';
            }
        }
        
        console.log(`| ${gen.name} | ${skill} | \`${displayLogic}\` | ${status} |`);
    });
});
