import fs from 'fs';
const p = 'src/apps/FanApp.tsx';
let txt = fs.readFileSync(p, 'utf8');

const sIdx = txt.indexOf('<>\n                \n          {/* Artist Filter Area */}');
const eIdx = txt.indexOf('</>\n            )}\n          </div>\n        )}\n\n        {/* --- SCHEDULE PAGE --- */}');

if (sIdx !== -1 && eIdx !== -1) {
  const replacement = fs.readFileSync('patch_store_ui.js', 'utf8').split('const storeReplacement = `')[1].split('`;\n\nlet lines')[0];
  txt = txt.slice(0, sIdx) + replacement + txt.slice(eIdx + 3);
}

const sIdx2 = txt.indexOf('<>\n              \n          {/* Artist Filter Area */}');
const eIdx2 = txt.indexOf('</>\n          )}\n        </div>\n      )}\n\n      \n        {/* --- CHECKOUT PAGE --- */}');

if (sIdx2 !== -1 && eIdx2 !== -1) {
  const replacement2 = fs.readFileSync('patch_ticket_ui.js', 'utf8').split('const ticketReplacement = `')[1].split('`;\n\nlet lines')[0];
  txt = txt.slice(0, sIdx2) + replacement2 + txt.slice(eIdx2 + 3);
}

fs.writeFileSync(p, txt);
