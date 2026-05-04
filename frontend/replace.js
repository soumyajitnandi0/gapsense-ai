const fs = require('fs');
const path = './app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/text-\[#1B1C1D\]/g, 'text-foreground');
content = content.replace(/bg-\[#1B1C1D\]/g, 'bg-foreground');
content = content.replace(/border-black\/5/g, 'border-white/5');
content = content.replace(/border-black\/10/g, 'border-white/10');
content = content.replace(/bg-white\/40/g, 'bg-card/40');
content = content.replace(/bg-white\/60/g, 'bg-card/60');
content = content.replace(/bg-white\/20/g, 'bg-card/20');
content = content.replace(/hover:bg-white/g, 'hover:bg-card');
content = content.replace(/bg-white/g, 'bg-card');
content = content.replace(/bg-black\/5/g, 'bg-white/5');
content = content.replace(/bg-\[#1A1A1A\]/g, 'bg-[#141414]');
content = content.replace(/text-black/g, 'text-background');

fs.writeFileSync(path, content);
