import fs from 'fs';
let txt = fs.readFileSync('src/apps/FanApp.tsx', 'utf8');

// Fix timeline reveal class
txt = txt.replace(/<div key=\{group\.id\} className="reveal">/g, '<div key={group.id} className="reveal-removed">');
// Additionally, update the useEffect to include storeView and ticketView
txt = txt.replace(
  /activeTab, selectedArtist, boardTab, myPageTab, selectedTicketEvent, seatMapUnlocked\]\);/g,
  'activeTab, selectedArtist, boardTab, myPageTab, selectedTicketEvent, seatMapUnlocked, storeView, ticketView, storeArtist, ticketArtist]);'
);

fs.writeFileSync('src/apps/FanApp.tsx', txt);
