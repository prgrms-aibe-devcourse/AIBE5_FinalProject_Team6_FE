import fs from 'fs';

let txt = fs.readFileSync('src/apps/FanApp.tsx', 'utf8');

const getReplacement = (varName, setterName) => `
<div style={{ padding: '0', maxWidth: 'none', marginTop: '-40px' }}>
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px 0 40px' }}>
    <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '24px', marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
       <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111', marginBottom: '20px' }}>My Artist</h3>
       <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '12px' }} className="hide-scrollbar">
          {/* ALL option */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '72px' }} onClick={() => ${setterName}('ALL')}>
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: ${varName} === 'ALL' ? '2px solid #111' : '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '15px', fontWeight: 800 }}>ALL</span>
             </div>
             <span style={{ fontSize: '13px', color: '#111', fontWeight: 600 }}>전체</span>
          </div>

          {ALL_ARTISTS.map(a => (
            <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '72px' }} onClick={() => ${setterName}(a.id)}>
               <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: ${varName} === a.id ? '2px solid #111' : '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{a.name.substring(0,3)}</span>
               </div>
               <span style={{ fontSize: '13px', color: '#111', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.name}</span>
            </div>
          ))}
       </div>
       <div style={{ marginTop: '12px' }}>
          <button style={{ width: '100%', padding: '12px', borderRadius: '24px', border: '1px solid #E5E5E5', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', color: '#111', fontSize: '14px', fontWeight: 700, transition: 'background 0.2s' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             아티스트
          </button>
       </div>
    </div>
  </div>
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 40px 32px 40px' }}>`;

const storeIdxStart = txt.indexOf("onClick={() => setStoreArtist(a.id)}");
if (storeIdxStart !== -1) {
    const p1 = txt.lastIndexOf("<div style={{ padding: '0', maxWidth: 'none', marginTop: '-40px' }}>", storeIdxStart);
    const p2 = txt.indexOf("<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>", storeIdxStart); // Inside the inner div
    const p3 = txt.lastIndexOf("<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>", p2);
    
    if (p1 !== -1 && p3 !== -1) {
        txt = txt.slice(0, p1) + getReplacement('storeArtist', 'setStoreArtist') + txt.slice(p3 + "<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>".length);
    }
}

const ticketIdxStart = txt.indexOf("onClick={() => setTicketArtist(a.id)}");
if (ticketIdxStart !== -1) {
    const p1 = txt.lastIndexOf("<div style={{ padding: '0', maxWidth: 'none', marginTop: '-40px' }}>", ticketIdxStart);
    const p2 = txt.indexOf("<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>", ticketIdxStart);
    const p3 = txt.lastIndexOf("<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>", p2);
    
    if (p1 !== -1 && p3 !== -1) {
        txt = txt.slice(0, p1) + getReplacement('ticketArtist', 'setTicketArtist') + txt.slice(p3 + "<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>".length);
    }
}

fs.writeFileSync('src/apps/FanApp.tsx', txt);
