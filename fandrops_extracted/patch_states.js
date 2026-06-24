import fs from 'fs';

const p = 'src/apps/FanApp.tsx';
let txt = fs.readFileSync(p, 'utf8');

// 1. We need to add state variables.
// Let's find "const [seatMapUnlocked, setSeatMapUnlocked] = useState(false);"
const stateRegex = /(const \[seatMapUnlocked, setSeatMapUnlocked\] = useState\(false\);)/;

const newStates = `
  // New Filter & Sort States
  const [storeArtist, setStoreArtist] = useState('ALL');
  const [storeCategory, setStoreCategory] = useState('전체');
  const [storeSort, setStoreSort] = useState('마감임박순');
  const [storeView, setStoreView] = useState('GRID');
  const [isStoreSortDropdownOpen, setIsStoreSortDropdownOpen] = useState(false);

  const [ticketArtist, setTicketArtist] = useState('ALL');
  const [ticketCategory, setTicketCategory] = useState('전체');
  const [ticketSort, setTicketSort] = useState('마감임박순');
  const [ticketView, setTicketView] = useState('GRID');
  const [isTicketSortDropdownOpen, setIsTicketSortDropdownOpen] = useState(false);

  const [now, setNow] = useState(new Date());
`;

if (!txt.includes('const [storeArtist')) {
    txt = txt.replace(stateRegex, `$1 \n${newStates}`);
}

// 2. Add Interval for 'now'
const effectRegex = /(const timer = setTimeout\(\(\) => \{\n\s*setQueuePosition\(p => p > 0 \? p - 1 : 0\);\n\s*\}, 50\);\n\s*return \(\) => clearTimeout\(timer\);\n\s*\}\n\s*\}, \[queueActive, queuePosition\]\);)/;

const newEffect = `
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
`;
if (!txt.includes('setInterval(() => {')) {
    txt = txt.replace(effectRegex, `$1\n${newEffect}`);
}

// Mock Data
const DUMMY_STORE_ITEMS = `[
    { id: 'S1', artist: '별빛스튜디오', category: '포토카드', title: '한정 포토북 3D 에디션', price: 49000, stock: 40, maxStock: 200, status: 'OPEN_TODAY' },
    { id: 'S2', artist: '문라이트', category: '굿즈', title: '1주년 기념 아크릴 스탠드', price: 29000, stock: 275, maxStock: 500, status: 'ON_SALE' },
    { id: 'S3', artist: '네온버즈', category: '앨범', title: '데뷔 앨범 한정반', price: 35000, stock: 0, maxStock: 100, status: 'SOLD_OUT' },
    { id: 'S4', artist: '별빛스튜디오', category: '굿즈', title: '공식 후드 티셔츠', price: 65000, stock: 120, maxStock: 171, status: 'ON_SALE' },
    { id: 'S5', artist: '문라이트', category: '포토카드', title: '여름 한정 포토카드 SET', price: 22000, stock: 15, maxStock: 214, status: 'OPEN_TOMORROW' },
    { id: 'S6', artist: '별빛스튜디오', category: '앨범', title: '2nd 미니앨범 ECHO', price: 18000, stock: 200, maxStock: 500, status: 'ON_SALE' },
    { id: 'S7', artist: '프리즘', category: '키링', title: '홀로그램 아크릴 키링', price: 12000, stock: 50, maxStock: 166, status: 'OPEN_WEEK' },
    { id: 'S8', artist: '네온버즈', category: '굿즈', title: '형광 응원봉', price: 45000, stock: 300, maxStock: 375, status: 'ON_SALE' }
]`;

const DUMMY_TICKET_ITEMS = `[
    { id: 'T1', artist: '별빛스튜디오', category: '팬미팅', title: '별빛스튜디오 팬미팅 2025', price: 55000, venue: '서울 올림픽홀', date: '2025.06.15', status: 'OPEN_TODAY' },
    { id: 'T2', artist: '문라이트', category: '콘서트', title: '문라이트 단독 콘서트', price: 88000, venue: '홍대 무브홀', date: '2025.06.22', status: 'ON_SALE' },
    { id: 'T3', artist: '네온버즈', category: '사인회', title: '데뷔 기념 사인회', price: 0, venue: '강남 팬사인회장', date: '2025.07.05', status: 'OPEN_WEEK' },
    { id: 'T4', artist: '프리즘', category: '온라인', title: '온라인 팬미팅', price: 30000, venue: '온라인', date: '2025.07.10', status: 'READY' }
]`;

fs.writeFileSync(p, txt);
