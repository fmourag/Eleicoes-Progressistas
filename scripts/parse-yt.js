const fs = require('fs');
const content = fs.readFileSync('C:/Users/usuario/.gemini/antigravity/brain/583e1538-31b6-40c8-a5e5-50015908253d/.system_generated/steps/11236/content.md', 'utf8');
const regex = /https:\/\/yt3\.(?:googleusercontent|ggpht)\.com\/[^"'\s\\]+/g;
const matches = content.match(regex);
console.log('Matches:', matches ? [...new Set(matches)] : 'None');
