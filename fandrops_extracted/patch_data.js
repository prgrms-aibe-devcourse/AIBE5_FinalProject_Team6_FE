import fs from 'fs';

const p = 'src/apps/FanApp.tsx';
let txt = fs.readFileSync(p, 'utf8');

const newData = `
// --- NEW MOCK DATA ---
const ALL_ARTISTS = [
  { id: 'ALL', name: '전체', count: 0 },
  { id: 'starlight', name: '별빛스튜디오', count: 12847 },
  { id: 'moonlight', name: '문라이트', count: 3201 },
  { id: 'neonbuzz', name: '네온버즈', count: 891 },
  { id: 'prism', name: '프리즘', count: 422 }
];

const STORE_CATEGORIES = ['전체', '포토카드', '굿즈', '앨범', '의류', '키링'];
const TICKET_CATEGORIES = ['전체', '팬미팅', '콘서트', '사인회', '온라인'];

const SORT_OPTIONS = ['마감임박순', '최신등록순', '낮은가격순', '높은가격순', '인기순'];

const DUMMY_STORE_ITEMS = [
    { id: 'S1', artistId: 'starlight', artist: '별빛스튜디오', category: '포토카드', title: '한정 포토북 3D 에디션', price: 49000, stock: 40, maxStock: 200, status: 'OPEN_TODAY', openDate: new Date(new Date().setHours(20, 0, 0, 0)), createdAt: new Date('2025-05-10'), sales: 1540 },
    { id: 'S2', artistId: 'moonlight', artist: '문라이트', category: '굿즈', title: '1주년 기념 아크릴 스탠드', price: 29000, stock: 275, maxStock: 500, status: 'ON_SALE', createdAt: new Date('2025-05-01'), sales: 2100 },
    { id: 'S3', artistId: 'neonbuzz', artist: '네온버즈', category: '앨범', title: '데뷔 앨범 한정반', price: 35000, stock: 0, maxStock: 100, status: 'SOLD_OUT', createdAt: new Date('2025-04-15'), sales: 5000 },
    { id: 'S4', artistId: 'starlight', artist: '별빛스튜디오', category: '굿즈', title: '공식 후드 티셔츠', price: 65000, stock: 120, maxStock: 171, status: 'ON_SALE', createdAt: new Date('2025-05-05'), sales: 850 },
    { id: 'S5', artistId: 'moonlight', artist: '문라이트', category: '포토카드', title: '여름 한정 포토카드 SET', price: 22000, stock: 15, maxStock: 214, status: 'OPEN_TOMORROW', openDate: new Date(new Date().setDate(new Date().getDate() + 1)), createdAt: new Date('2025-05-12'), sales: 120 },
    { id: 'S6', artistId: 'starlight', artist: '별빛스튜디오', category: '앨범', title: '2nd 미니앨범 ECHO', price: 18000, stock: 200, maxStock: 500, status: 'ON_SALE', createdAt: new Date('2025-05-02'), sales: 3000 },
    { id: 'S7', artistId: 'prism', artist: '프리즘', category: '키링', title: '홀로그램 아크릴 키링', price: 12000, stock: 50, maxStock: 166, status: 'OPEN_WEEK', openDate: new Date(new Date().setDate(new Date().getDate() + 3)), createdAt: new Date('2025-05-14'), sales: 50 },
    { id: 'S8', artistId: 'neonbuzz', artist: '네온버즈', category: '굿즈', title: '형광 응원봉', price: 45000, stock: 300, maxStock: 375, status: 'ON_SALE', createdAt: new Date('2025-05-10'), sales: 700 }
];

const DUMMY_TICKET_ITEMS = [
    { id: 'T1', artistId: 'starlight', artist: '별빛스튜디오', category: '팬미팅', title: '별빛스튜디오 팬미팅 2025', price: 55000, venue: '서울 올림픽홀', dateStr: '2025.06.15', status: 'OPEN_TODAY', openDate: new Date(new Date().setHours(20, 0, 0, 0)), createdAt: new Date('2025-05-10'), sales: 800 },
    { id: 'T2', artistId: 'moonlight', artist: '문라이트', category: '콘서트', title: '문라이트 단독 콘서트', price: 88000, venue: '홍대 무브홀', dateStr: '2025.06.22', status: 'ON_SALE', createdAt: new Date('2025-05-01'), sales: 1500 },
    { id: 'T3', artistId: 'neonbuzz', artist: '네온버즈', category: '사인회', title: '데뷔 기념 사인회', price: 0, venue: '강남 팬사인회장', dateStr: '2025.07.05', status: 'OPEN_WEEK', openDate: new Date(new Date().setDate(new Date().getDate() + 3)), createdAt: new Date('2025-05-13'), sales: 30 },
    { id: 'T4', artistId: 'prism', artist: '프리즘', category: '온라인', title: '온라인 팬미팅', price: 30000, venue: '온라인', dateStr: '2025.07.10', status: 'READY', createdAt: new Date('2025-05-14'), openDate: new Date(new Date().setDate(new Date().getDate() + 5)), sales: 10 }
];

function formatTimeLeft(targetDate) {
  if (!targetDate) return "";
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
  const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
  return \`\${h}:\${m}:\${s}\`;
}

function getSortedItems(items, sortKey) {
  return [...items].sort((a, b) => {
    if (sortKey === '마감임박순') {
        const aT = a.openDate ? a.openDate.getTime() : 9999999999999;
        const bT = b.openDate ? b.openDate.getTime() : 9999999999999;
        return aT - bT;
    }
    if (sortKey === '최신등록순') return b.createdAt.getTime() - a.createdAt.getTime();
    if (sortKey === '낮은가격순') return a.price - b.price;
    if (sortKey === '높은가격순') return b.price - a.price;
    if (sortKey === '인기순') return b.sales - a.sales;
    return 0;
  });
}
`;

if (!txt.includes('ALL_ARTISTS')) {
    txt = txt.replace('export default function App', newData + '\nexport default function App');
    fs.writeFileSync(p, txt);
}

