import fs from 'fs';
let txt = fs.readFileSync('src/apps/FanApp.tsx', 'utf8');
txt = txt.replace(/\\`/g, "`");
txt = txt.replace(/\\\$/g, "$");
txt = txt.replace(/\\n/g, "\\n"); // wait, `\n` might have turned into literal backslash n, let's leave it unless broken

// Just clean up escaped backtick and dollar
fs.writeFileSync('src/apps/FanApp.tsx', txt);
