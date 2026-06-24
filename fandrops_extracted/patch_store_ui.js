import fs from 'fs';

const p = 'src/apps/FanApp.tsx';
let txt = fs.readFileSync(p, 'utf8');

const storeReplacement = `
              <>
<div style={{ padding: '0', maxWidth: 'none', marginTop: '-40px' }}>
  <div style={{ height: '48px', borderBottom: '1px solid #EDE8E2', background: 'white', display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '0 40px', gap: '32px' }} className="hide-scrollbar">
    {ALL_ARTISTS.map(a => (
      <div key={a.id} onClick={() => setStoreArtist(a.id)} style={{ height: '100%', display: 'flex', alignItems: 'center', color: storeArtist === a.id ? '#111' : '#888', fontWeight: storeArtist === a.id ? 700 : 500, borderBottom: storeArtist === a.id ? '2px solid #C2507A' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', boxSizing: 'border-box' }}>
        {a.name}
      </div>
    ))}
  </div>
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {STORE_CATEGORIES.map(c => (
          <button key={c} onClick={() => setStoreCategory(c)} style={{ padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px', fontWeight: 600, background: storeCategory === c ? '#111' : 'transparent', color: storeCategory === c ? 'white' : '#888', border: storeCategory === c ? '1px solid #111' : '1px solid #EDE8E2' }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setIsStoreSortDropdownOpen(!isStoreSortDropdownOpen)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#111' }}>
            {storeSort} <span style={{ fontSize: '10px' }}>▼</span>
          </button>
          {isStoreSortDropdownOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '1px solid #EDE8E2', borderRadius: '8px', zIndex: 100, width: '140px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              {SORT_OPTIONS.map(s => (
                <div key={s} onClick={() => { setStoreSort(s); setIsStoreSortDropdownOpen(false); }} style={{ padding: '12px 16px', fontSize: '13px', cursor: 'pointer', color: storeSort === s ? '#111' : '#888', fontWeight: storeSort === s ? 700 : 500 }}>{s}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', background: 'white', border: '1px solid #EDE8E2', borderRadius: '6px', padding: '2px' }}>
          <button onClick={() => setStoreView('GRID')} style={{ background: storeView === 'GRID' ? '#111' : 'transparent', color: storeView === 'GRID' ? 'white' : '#888', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </button>
          <button onClick={() => setStoreView('TIMELINE')} style={{ background: storeView === 'TIMELINE' ? '#111' : 'transparent', color: storeView === 'TIMELINE' ? 'white' : '#888', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </div>
    {(storeArtist !== 'ALL' || storeCategory !== '전체') && (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
        {storeArtist !== 'ALL' && (
          <span style={{ background: '#F7F3EE', border: '1px solid #EDE8E2', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#111', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {ALL_ARTISTS.find(a => a.id === storeArtist)?.name} <X size={12} cursor="pointer" onClick={() => setStoreArtist('ALL')} />
          </span>
        )}
        {storeCategory !== '전체' && (
          <span style={{ background: '#F7F3EE', border: '1px solid #EDE8E2', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#111', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {storeCategory} <X size={12} cursor="pointer" onClick={() => setStoreCategory('전체')} />
          </span>
        )}
        <span onClick={() => { setStoreArtist('ALL'); setStoreCategory('전체'); }} style={{ fontSize: '12px', color: '#888', cursor: 'pointer', marginLeft: '8px', fontWeight: 600, borderBottom: '1px solid #888' }}>전체 초기화</span>
      </div>
    )}
    {(() => {
      let filteredItems = DUMMY_STORE_ITEMS.filter(item => {
        if (storeArtist !== 'ALL' && item.artistId !== storeArtist) return false;
        if (storeCategory !== '전체' && item.category !== storeCategory) return false;
        return true;
      });
      filteredItems = getSortedItems(filteredItems, storeSort);
      if (storeView === 'GRID') {
        return (
          <div className="grid-3" style={{ gap: '24px' }}>
            {filteredItems.map(item => {
              const isSoldOut = item.status === 'SOLD_OUT';
              const progress = isSoldOut ? 100 : (item.stock / item.maxStock) * 100;
              const isHotDeal = item.openDate && item.openDate > now;
              return (
                <div key={item.id} className="card reveal" style={{ opacity: isSoldOut ? 0.6 : 1, cursor: isSoldOut ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }} onClick={() => { if(!isSoldOut && !isHotDeal) setSelectedProduct(item); }}>
                  <div style={{ position: 'relative', height: '220px', background: 'var(--bg-cream)' }}>
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>{item.artist}</div>
                    {(100-progress) > 0 && !isSoldOut && (
                      <div style={{ position: 'absolute', top: 12, right: 12, background: (100-progress) <= 30 ? '#E11D48' : '#10B981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {item.stock}개 남음
                      </div>
                    )}
                    {isSoldOut && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '20px', fontWeight: 900, letterSpacing: '2px' }}>SOLD OUT</span>
                      </div>
                    )}
                    {isHotDeal && !isSoldOut && (
                      <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                        오픈까지 {formatTimeLeft(item.openDate)}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '10px', color: '#888', fontWeight: 700, marginBottom: '4px' }}>{item.category}</div>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ height: '4px', background: '#F0F0F0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: \`\${progress}%\`, background: isSoldOut ? '#ccc' : 'linear-gradient(90deg, #C2507A, #7F77DD)' }}></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#111' }}>₩{item.price.toLocaleString()}</div>
                      <button disabled={isHotDeal || isSoldOut} style={{ background: (isHotDeal || isSoldOut) ? '#ccc' : '#111', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: (isHotDeal || isSoldOut) ? 'not-allowed' : 'pointer' }}>
                        구매
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      } else {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {(() => {
              const groups = [
                { id: 'OPEN_TODAY', title: '오늘 오픈', color: '#E11D48', items: filteredItems.filter(i => i.status === 'OPEN_TODAY') },
                { id: 'OPEN_TOMORROW', title: '내일 오픈', color: '#F97316', items: filteredItems.filter(i => i.status === 'OPEN_TOMORROW') },
                { id: 'OPEN_WEEK', title: '이번 주 오픈', color: '#6B7280', items: filteredItems.filter(i => i.status === 'OPEN_WEEK') },
                { id: 'ON_SALE', title: '판매 중', color: '#6B7280', items: filteredItems.filter(i => i.status === 'ON_SALE') },
                { id: 'SOLD_OUT', title: '판매 종료', color: '#D1D5DB', items: filteredItems.filter(i => i.status === 'SOLD_OUT') }
              ];
              return groups.map(group => {
                if (group.items.length === 0) return null;
                return (
                  <div key={group.id} className="reveal">
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: group.color }}></div>
                       <h3 style={{ fontSize: '15px', fontWeight: 800, color: group.color, margin: 0 }}>
                          {group.title} {group.id === 'OPEN_TODAY' && '20:00 오픈'}
                       </h3>
                       <div style={{ flex: 1, height: '1px', background: '#EDE8E2' }}></div>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#EDE8E2', border: '1px solid #EDE8E2', borderRadius: '12px', overflow: 'hidden' }}>
                       {group.items.map(item => {
                         const progress = group.id === 'SOLD_OUT' ? 100 : (item.stock / item.maxStock) * 100;
                         return (
                           <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'white', padding: '16px 24px', opacity: group.id === 'SOLD_OUT' ? 0.6 : 1 }}>
                             <div style={{ width: '60px', height: '60px', background: 'var(--bg-cream)', borderRadius: '8px', flexShrink: 0 }}></div>
                             <div style={{ flex: 2 }}>
                               <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, marginBottom: '4px' }}>{item.artist} · {item.category}</div>
                               <div style={{ fontSize: '15px', fontWeight: 800 }}>{item.title}</div>
                             </div>
                             <div style={{ flex: 1, minWidth: '100px' }}>
                               <div style={{ height: '4px', background: '#F0F0F0', borderRadius: '2px', overflow: 'hidden' }}>
                                 <div style={{ height: '100%', width: \`\${progress}%\`, background: group.id === 'SOLD_OUT' ? '#ccc' : 'linear-gradient(90deg, #C2507A, #7F77DD)' }}></div>
                               </div>
                             </div>
                             <div style={{ width: '100px', fontSize: '16px', fontWeight: 800, color: '#111', textAlign: 'right' }}>
                               ₩{item.price.toLocaleString()}
                             </div>
                             <div style={{ width: '120px', display: 'flex', justifyContent: 'flex-end' }}>
                               {item.openDate && item.openDate > now ? (
                                 group.id === 'OPEN_TODAY' ? 
                                   <div style={{ color: '#E11D48', fontWeight: 800, fontSize: '14px' }}>D-{formatTimeLeft(item.openDate)}</div>
                                   : <button style={{ border: '1px solid var(--border)', background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>알림 받기</button>
                               ) : group.id === 'ON_SALE' ? (
                                 <button style={{ background: '#111', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => setSelectedProduct(item)}>구매하기</button>
                               ) : (
                                 <span style={{ fontSize: '13px', fontWeight: 800, color: '#888' }}>품절</span>
                               )}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                  </div>
                );
              });
            })()}
            {storeView === 'TIMELINE' && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#6B7280', marginBottom: '16px' }}>판매 중인 인기 상품</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {filteredItems.filter(i => i.status === 'ON_SALE').slice(0, 4).map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setSelectedProduct(item)}>
                      <div style={{ width: '80px', height: '80px', background: 'var(--bg-cream)', borderRadius: '8px' }}></div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 700, marginBottom: '4px' }}>{item.category}</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>{item.title}</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#C2507A' }}>₩{item.price.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    })()}
  </div>
</div>
              </>
`;

let lines = txt.split('\n');
let storeIdxStart = -1;
let storeIdxEnd = -1;

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('{/* Artist Filter Area */}')) {
    if (storeIdxStart === -1) {
      storeIdxStart = i - 1; // get the `<>` before it
    }
  }
}

let nesting = 0;
for(let i=storeIdxStart; i<lines.length; i++) {
  if (lines[i].includes('<>')) nesting++;
  if (lines[i].includes('</>')) {
    nesting--;
    if (nesting === 0) {
      storeIdxEnd = i;
      break;
    }
  }
}

if (storeIdxStart > -1 && storeIdxEnd > -1) {
   lines.splice(storeIdxStart, storeIdxEnd - storeIdxStart + 1, storeReplacement);
}

fs.writeFileSync(p, lines.join('\n'));
