import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, PenTool, Image, Calendar as CalendarIcon, Package, ShoppingCart, Users, UserCircle, LogOut, CheckCircle2, Activity, ArrowUpRight, ArrowDownRight, Clock, Plus, Upload, X } from 'lucide-react';
import { logout } from '../api/auth';
import { ROLE_KEY } from '../App';
import { getCalendar, createEvent, registerLive, startLive } from '../api/schedule';
import type { ScheduleResult } from '../types/schedule';
import { getNotices, createNotice } from '../api/notices';
import type { NoticeResult } from '../types/notice';
import { getAgencyBanners, createAgencyBanner, updateAgencyBanner, deleteAgencyBanner, requestAgencyPresignedUrl, uploadToS3Agency } from '../api/agencyBanners';
import type { AgencyBannerFormData } from '../api/agencyBanners';
import type { BannerResponse } from '../types/banner';
import { getVotes, createVote } from '../api/votes';
import type { GoodsVoteResult } from '../types/vote';
import { getProducts, createProduct } from '../api/products';
import type { CreateProductRequest, ProductResponse } from '../api/products';

interface BannerForm {
  id?: number
  title: string
  imageUrl: string
  landingUrl: string
  exposureOrder: number
  startAt: string
  endAt: string
  isActive: boolean
  _file?: File
}

const SCHEDULE_ARTISTS = [
  { id: 1, name: 'NOVA' },
  { id: 2, name: 'LUNA' },
  { id: 3, name: 'ECHO' },
]

function fmtSchedule(iso: string) {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return {
    date: `${mm}/${dd}`,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  }
}

const TYPE_LABELS: Record<string, string> = { DROP: '발매', LIVE: 'LIVE', EVENT: '이벤트', NOTICE: '공지' }
const TYPE_COLORS: Record<string, string> = { DROP: '#C2507A', LIVE: '#FF4444', EVENT: '#7F77DD', NOTICE: '#888' }

export default function AgencyApp() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMenu, setActiveMenu] = useState(() => searchParams.get('menu') ?? 'dashboard');

  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    setSearchParams({ menu }, { replace: false });
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem(ROLE_KEY);
    navigate('/login', { replace: true });
  };
  const [showEventModal, setShowEventModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteOptions, setVoteOptions] = useState<any[]>([{id: 1, label: '', image: ''}, {id: 2, label: '', image: ''}]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [linkNoticeToggle, setLinkNoticeToggle] = useState(false);

  const [votesList, setVotesList] = useState<GoodsVoteResult[]>([]);
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [editingBanner, setEditingBanner] = useState<BannerForm | null>(null);

  const handleBannerSubmit = async () => {
    if (!editingBanner?.title?.trim()) {
      alert('배너 제목을 입력해주세요.');
      return;
    }
    try {
      let imageUrl = editingBanner.imageUrl;
      if (editingBanner._file) {
        const { presignedUrl, imageUrl: uploaded } = await requestAgencyPresignedUrl(
          editingBanner._file.type,
          editingBanner._file.size,
        );
        await uploadToS3Agency(presignedUrl, editingBanner._file);
        imageUrl = uploaded;
      }
      const data: AgencyBannerFormData = {
        title: editingBanner.title,
        imageUrl,
        landingUrl: editingBanner.landingUrl,
        exposureOrder: editingBanner.exposureOrder || banners.length + 1,
        ...(editingBanner.startAt ? { startAt: editingBanner.startAt } : {}),
        ...(editingBanner.endAt ? { endAt: editingBanner.endAt } : {}),
      };
      if (editingBanner.id) {
        await updateAgencyBanner(editingBanner.id, { ...data, isActive: editingBanner.isActive });
        alert('배너 설정이 수정되었습니다.');
      } else {
        await createAgencyBanner(data);
        alert('새 배너가 등록되었습니다.');
      }
      setBanners(await getAgencyBanners());
      setShowBannerModal(false);
      setEditingBanner(null);
    } catch {
      alert('배너 저장에 실패했습니다.');
    }
  };

  const handleBannerDelete = async (id: number) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) return;
    try {
      await deleteAgencyBanner(id);
      setBanners(banners.filter(b => b.id !== id));
    } catch {
      alert('배너 삭제에 실패했습니다.');
    }
  };

  const [notices, setNotices] = useState<NoticeResult[]>([]);

  const [artists, setArtists] = useState([
    { 
      id: 'starlight', 
      name: 'Starlight', 
      desc: 'Shining like stars in the night sky.',
      profileImg: 'https://images.unsplash.com/photo-1516280440502-6134b281f626?w=200&q=80',
      sns: {
        instagram: '@official_starlight',
        youtube: 'Starlight Official',
        twitter: '@starlight_official'
      },
      members: [
        { id: 'm1', name: 'Luna', role: 'Main Vocal', img: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&q=80&w=200' },
        { id: 'm2', name: 'Mina', role: 'Main Dancer', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200' }
      ]
    },
    { 
      id: 'rose', 
      name: 'ROSE', 
      desc: 'Elegant and powerful performance group.',
      profileImg: 'https://images.unsplash.com/photo-1514525253361-b83f859b73c0?w=200&q=80',
      sns: {
        instagram: '@official_rose',
        youtube: 'ROSE Official',
        twitter: '@rose_official'
      },
      members: [
        { id: 'm3', name: 'Rose', role: 'Leader', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' }
      ]
    }
  ]);

  const [selectedProfileArtist, setSelectedProfileArtist] = useState(artists[0].id);
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [newNotice, setNewNotice] = useState({ title: '', tag: 'NOTICE (일반공지)', content: '' });

  const [productList, setProductList] = useState<ProductResponse[]>([]);
  const [productForm, setProductForm] = useState({ name: '', price: '', totalQty: '', isDrops: false, dropsStartAt: '', dropsEndAt: '' });

  // 스케줄 관리 상태
  const [agencyArtistId, setAgencyArtistId] = useState(1);
  const [agencySchedules, setAgencySchedules] = useState<ScheduleResult[]>([]);
  const [eventForm, setEventForm] = useState({ title: '', type: 'EVENT', date: '', time: '' });
  const [liveForm, setLiveForm] = useState({ title: '', date: '', time: '', liveUrl: '' });
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [startingLiveId, setStartingLiveId] = useState<number | null>(null);

  const updateArtist = (updated: any) => {
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
    setEditingArtist(null);
    alert('아티스트 정보가 성공적으로 반영되었습니다.');
  };

  const updateMember = (artistId: string, updatedMember: any) => {
    setArtists(artists.map(a => {
      if (a.id === artistId) {
        let newMembers = [...a.members];
        if (updatedMember.id && newMembers.find(m => m.id === updatedMember.id)) {
           newMembers = newMembers.map(m => m.id === updatedMember.id ? updatedMember : m);
        } else {
           newMembers.push({ ...updatedMember, id: 'm' + Date.now() });
        }
        return {
          ...a,
          members: newMembers
        };
      }
      return a;
    }));
    setEditingMember(null);
    alert('멤버 정보가 성공적으로 반영되었습니다.');
  };

  const addNotice = async () => {
    if (!newNotice.title.trim()) return;
    try {
      await createNotice(agencyArtistId, newNotice.title, newNotice.content);
      const res = await getNotices(agencyArtistId);
      setNotices(res.items);
      setNewNotice({ title: '', tag: 'NOTICE (일반공지)', content: '' });
      setShowNoticeModal(false);
      alert('새 공지사항이 등록되었습니다!');
    } catch {
      alert('공지 등록에 실패했습니다.');
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Agency Dashboard' },
    { id: 'profile', icon: UserCircle, label: 'Artist & Members' },
    { id: 'calendar', icon: CalendarIcon, label: 'Artist Schedule' },
    { id: 'notices', icon: PenTool, label: 'Notice Management' },
    { id: 'votes', icon: CheckCircle2, label: 'Goods Voting' },
    { id: 'products', icon: Package, label: 'Products & Drops' },
    { id: 'inventory', icon: Activity, label: 'Inventory History' },
    { id: 'banners', icon: Image, label: 'Home Promotion Banners' },
    { id: 'orders', icon: ShoppingCart, label: 'Order Management' },
  ];

  useEffect(() => {
    if (activeMenu !== 'banners') return;
    getAgencyBanners().then(setBanners).catch(() => {});
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu !== 'votes') return;
    getVotes(agencyArtistId).then(res => setVotesList(res.items)).catch(() => {});
  }, [activeMenu, agencyArtistId]);

  useEffect(() => {
    if (activeMenu !== 'products') return;
    getProducts('regular', undefined, 50, agencyArtistId)
      .then(res => setProductList(res.items))
      .catch(() => {});
  }, [activeMenu, agencyArtistId]);

  useEffect(() => {
    if (activeMenu !== 'calendar') return;
    getCalendar(agencyArtistId)
      .then(res => setAgencySchedules(res.events))
      .catch(() => {});
  }, [activeMenu, agencyArtistId]);

  useEffect(() => {
    if (activeMenu !== 'notices') return;
    getNotices(agencyArtistId)
      .then(res => setNotices(res.items))
      .catch(console.error);
  }, [activeMenu, agencyArtistId]);

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col font-sans">
      {/* Top GNB */}
      <header className="h-[72px] bg-white/88 backdrop-blur-[10px] border-b border-[#EDE8E2] px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="font-bold tracking-[3px] text-lg font-mono">FANDROPS<span className="text-[#C2507A]">.</span></div>
          <div className="hidden md:flex items-center gap-2 border-l border-[#EDE8E2] pl-6">
            <span className="text-xs font-bold text-[#888] uppercase tracking-[1px]">Agency Studio</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">Starlight Ent.</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C2507A] to-[#7F77DD] p-[2px]">
             <div className="w-full h-full bg-white rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1516280440502-6134b281f626?w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
             </div>
          </div>
          <button onClick={handleLogout} className="p-2 ml-4 hover:bg-[#F7F3EE] rounded-lg">
             <LogOut size={20} className="text-[#888]" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-[#EDE8E2] overflow-y-auto hidden-scrollbar py-6 flex flex-col shrink-0 relative z-20">
          <div className="flex-1 px-4 space-y-1">
             {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleMenuChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeMenu === item.id 
                      ? 'bg-[#F7F3EE] text-[#C2507A] shadow-[inset_2px_0_0_#C2507A]' 
                      : 'text-[#888] hover:bg-[#F7F3EE] hover:text-[#111]'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </button>
             ))}
          </div>
          <div className="px-4 mt-6 pt-6 border-t border-[#EDE8E2]">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#888] hover:bg-black/5 hover:text-black transition-all">
                <LogOut className="w-5 h-5 shrink-0" />
                로그아웃
             </button>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 capitalize">{navItems.find(item => item.id === activeMenu)?.label}</h2>

            {activeMenu === 'dashboard' && (
              <div className="space-y-8">
                {/* Notice Banner */}
                <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                   <div>
                     <div className="text-xs uppercase tracking-[2px] text-[#7F77DD] font-bold mb-2">공지사항</div>
                     <h3 className="text-lg font-bold">새로운 플랫폼 기능: 핫딜 대기열 기능이 활성화되었습니다!</h3>
                     <p className="text-sm text-[#888] mt-1">트래픽 급증을 방지하기 위해 새로운 확장형 대기열 시스템으로 상품 드롭을 구성해보세요.</p>
                   </div>
                   <button className="bg-[#C2507A] text-white px-6 py-2 rounded-xl text-sm font-bold shrink-0 hover:opacity-90 transition-opacity shadow-lg shadow-pink-900/10">가이드 읽기</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stat Cards */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EDE8E2]">
                     <div className="text-xs text-[#888] uppercase tracking-[1px] mb-2 font-mono">총 팬 수 (Total Fans)</div>
                     <div className="text-3xl font-bold text-[#111]">12,847</div>
                     <div className="text-xs text-green-500 font-bold mt-2">↑ 이번 주 342명 증가</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#EDE8E2]">
                     <div className="text-xs text-[#888] uppercase tracking-[1px] mb-2 font-mono">진행 중인 드롭 (Active Drops)</div>
                     <div className="text-3xl font-bold text-[#111]">2</div>
                     <div className="text-xs text-[#888] mt-2">1건 마감 임박</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#EDE8E2]">
                     <div className="text-xs text-[#888] uppercase tracking-[1px] mb-2 font-mono">월간 수익 (Monthly Rev)</div>
                     <div className="text-3xl font-bold text-[#111]">₩45.2M</div>
                     <div className="text-xs text-green-500 font-bold mt-2">↑ 전월 대비 12% 증가</div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'profile' && (
              <div className="space-y-8">
                <div className="flex gap-4 border-b border-[#EDE8E2] pb-4 overflow-x-auto hide-scrollbar">
                  {artists.map(artist => (
                    <button 
                      key={artist.id}
                      onClick={() => setSelectedProfileArtist(artist.id)}
                      className={`px-6 py-2 rounded-full font-black text-sm whitespace-nowrap transition-all ${
                        selectedProfileArtist === artist.id ? 'bg-[#C2507A] text-white' : 'bg-[#F7F3EE] text-[#888]'
                      }`}
                    >
                      {artist.name} 프로필
                    </button>
                  ))}
                  <button className="px-6 py-2 rounded-full font-black text-sm whitespace-nowrap bg-[#EDE8E2] text-[#111] hover:bg-[#D7D0CA] transition-colors">+ 아티스트 추가</button>
                </div>

                {artists.filter(a => a.id === selectedProfileArtist).map(artist => (
                  <div key={artist.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-[#EDE8E2] text-center shadow-sm">
                        <div className="w-32 h-32 bg-[#F7F3EE] rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-xl relative group overflow-hidden">
                           <img src={artist.profileImg} alt="" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setEditingArtist(artist)}>
                              <span className="text-white font-bold text-xs">변경</span>
                           </div>
                        </div>
                        <h4 className="text-xl font-black mb-1">{artist.name}</h4>
                        <p className="text-sm text-[#888] font-medium mb-6 line-clamp-2 px-4">{artist.desc}</p>
                        <button 
                          className="w-full bg-[#C2507A] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-pink-100 hover:opacity-90 active:scale-[0.98] transition-all"
                          onClick={() => setEditingArtist(artist)}
                        >
                          그룹 프로필 수정
                        </button>
                      </div>

                      <div className="bg-[#111] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C2507A] opacity-20 blur-[40px]" />
                        <h4 className="font-black mb-6 flex items-center gap-2 relative z-10">
                           <Users size={18} className="text-[#C2507A]" /> SNS & Links
                        </h4>
                        <div className="space-y-4 opacity-90 text-xs font-bold relative z-10">
                           <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                             <span className="text-white/60">Instagram</span>
                             <span className="font-mono text-[#C2507A]">{artist.sns.instagram}</span>
                           </div>
                           <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                             <span className="text-white/60">YouTube</span>
                             <span className="font-mono text-[#C2507A]">{artist.sns.youtube}</span>
                           </div>
                           <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                             <span className="text-white/60">Twitter/X</span>
                             <span className="font-mono text-[#C2507A]">{artist.sns.twitter}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-8 rounded-[32px] border border-[#EDE8E2] shadow-sm">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F7F3EE]">
                          <h4 className="text-xl font-black">멤버 리스트 <span className="text-[#C2507A] ml-1">{artist.members.length}</span></h4>
                          <button onClick={() => setEditingMember({ name: '', role: '', img: '' })} className="text-[#C2507A] font-black text-xs uppercase tracking-widest hover:underline">+ ADD NEW MEMBER</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {artist.members.map(member => (
                            <div 
                              key={member.id} 
                              onClick={() => setEditingMember(member)}
                              className="flex items-center gap-4 p-5 bg-[#F7F3EE] rounded-2xl group hover:bg-white border border-transparent hover:border-[#C2507A] transition-all cursor-pointer"
                            >
                              <img src={member.img} alt="" className="w-16 h-16 rounded-[20px] object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
                              <div className="flex-1">
                                <div className="font-black text-[#111]">{member.name}</div>
                                <div className="text-[10px] font-black text-[#C2507A] uppercase tracking-wider mt-0.5">{member.role}</div>
                              </div>
                              <div className="text-[#EDE8E2] group-hover:text-[#C2507A] transition-colors">
                                <PenTool size={16} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Info Tip */}
                      <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-dashed border-[#EDE8E2]">
                        <p className="text-xs font-bold text-[#A0958C] leading-relaxed">
                          💡 <span className="text-[#111]">Tip:</span> 멤버 카드를 클릭하여 개별 이미지를 변경하거나 역할을 수정할 수 있습니다. 
                          변경 사항은 모든 아티스트 공간에 즉시 반영됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Artist Edit Modal */}
                {editingArtist && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-xl p-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C2507A]" />
                      <h3 className="text-2xl font-black mb-8 text-[#111]">아티스트 프로필 수정</h3>
                      
                      <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                        <div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">프로필 이미지 URL</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-bold"
                            value={editingArtist.profileImg}
                            onChange={(e) => setEditingArtist({...editingArtist, profileImg: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">아티스트 이름</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-bold"
                            value={editingArtist.name}
                            onChange={(e) => setEditingArtist({...editingArtist, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">소개글 (Bio)</label>
                          <textarea 
                            className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-medium h-24 resize-none"
                            value={editingArtist.desc}
                            onChange={(e) => setEditingArtist({...editingArtist, desc: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">Instagram Handle</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-16 focus:outline-none focus:border-[#C2507A] font-mono text-sm"
                              value={editingArtist.sns.instagram}
                              onChange={(e) => setEditingArtist({...editingArtist, sns: {...editingArtist.sns, instagram: e.target.value}})}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">YouTube Channel</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-16 focus:outline-none focus:border-[#C2507A] font-mono text-sm"
                              value={editingArtist.sns.youtube}
                              onChange={(e) => setEditingArtist({...editingArtist, sns: {...editingArtist.sns, youtube: e.target.value}})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-10">
                        <button className="flex-1 bg-[#F7F3EE] text-[#111] py-4 rounded-2xl font-black text-sm" onClick={() => setEditingArtist(null)}>취소</button>
                        <button className="flex-1 bg-[#C2507A] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-pink-100" onClick={() => updateArtist(editingArtist)}>저장하기</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Edit Modal */}
                {editingMember && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-10 shadow-2xl relative">
                      <h3 className="text-2xl font-black mb-8 text-[#111]">멤버 정보 수정</h3>
                      
                      <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-[#F7F3EE] relative group">
                           <img src={editingMember.img} alt="" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                              <span className="text-white font-bold text-[10px]">사진 변경</span>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">이미지 URL</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-16 focus:outline-none focus:border-[#C2507A] font-black"
                            value={editingMember.img}
                            onChange={(e) => setEditingMember({...editingMember, img: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">멤버 이름</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-16 focus:outline-none focus:border-[#C2507A] font-black"
                            value={editingMember.name}
                            onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">포지션/역할</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-16 focus:outline-none focus:border-[#C2507A] font-bold"
                            value={editingMember.role}
                            onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-10">
                        <button className="flex-1 bg-[#F7F3EE] text-[#111] py-4 rounded-2xl font-black text-sm" onClick={() => setEditingMember(null)}>취소</button>
                        <button className="flex-1 bg-[#C2507A] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-pink-100" onClick={() => updateMember(selectedProfileArtist, editingMember)}>반영하기</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeMenu === 'banners' && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-[#EDE8E2]">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-black mb-1">Banner Placement Control</h3>
                      <p className="text-xs text-[#888] font-bold">노출 순서 및 기간 한정 배너 제어</p>
                    </div>
                    <button onClick={() => { setEditingBanner({ title: '', imageUrl: '', landingUrl: '', exposureOrder: banners.length + 1, startAt: '', endAt: '', isActive: true }); setShowBannerModal(true); }} className="bg-[#C2507A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-pink-100 flex items-center gap-2">
                       <Plus size={16} /> 배너 등록
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[...banners].sort((a, b) => a.exposureOrder - b.exposureOrder).map((banner) => (
                      <div key={banner.id} className="flex items-center gap-6 p-5 bg-[#F7F3EE] rounded-2xl border border-transparent hover:border-[#C2507A] transition-all group">
                         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[#C2507A] border border-[#EDE8E2]">
                            {banner.exposureOrder}
                         </div>
                         <div className="flex-1">
                            <div className="font-black text-[#111]">{banner.title}</div>
                            <div className="flex items-center gap-4 mt-1">
                               <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#888]">
                                  <Clock size={12} />
                                  {banner.startAt ? banner.startAt.slice(0, 10) : '~'} - {banner.endAt ? banner.endAt.slice(0, 10) : '∞'}
                               </div>
                               <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                  {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                               </span>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={async () => {
                              const ord = prompt('변경할 순서를 입력하세요', String(banner.exposureOrder));
                              if (ord && !isNaN(Number(ord))) {
                                try { await updateAgencyBanner(banner.id, { exposureOrder: Number(ord) }); setBanners(await getAgencyBanners()); } catch { alert('순서 변경에 실패했습니다.'); }
                              }
                            }} className="text-[11px] font-black uppercase text-[#888] hover:text-[#111]">Move</button>
                            <button onClick={() => { setEditingBanner({ id: banner.id, title: banner.title, imageUrl: banner.imageUrl, landingUrl: banner.landingUrl, exposureOrder: banner.exposureOrder, startAt: banner.startAt?.slice(0, 16) ?? '', endAt: banner.endAt?.slice(0, 16) ?? '', isActive: banner.isActive }); setShowBannerModal(true); }} className="text-[11px] font-black uppercase text-[#C2507A] hover:opacity-70">Edit</button>
                            <button onClick={() => handleBannerDelete(banner.id)} className="text-[11px] font-black uppercase text-red-500 hover:opacity-70">Del</button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'votes' && (
              <div className="space-y-6">
                 <div className="bg-white p-8 rounded-[32px] border border-[#EDE8E2] shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                       <div>
                          <h3 className="text-xl font-black mb-1">Goods Voting Management</h3>
                          <p className="text-xs text-[#888] font-bold">팬들이 직접 결정하는 차기 굿즈 출시 투표 제어</p>
                       </div>
                       <button onClick={() => setShowVoteModal(true)} className="bg-[#C2507A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-pink-100">새 투표 생성</button>
                    </div>

                    {showVoteModal && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[32px] w-full max-w-lg p-10 relative">
                          <h3 className="text-2xl font-black mb-6">새 투표 굿즈 생성</h3>
                          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                             <div>
                                <label className="block text-xs font-black text-[#888] uppercase mb-2">투표 제목</label>
                                <input type="text" id="voteTitle" className="w-full bg-[#F7F3EE] p-4 rounded-xl border border-transparent focus:border-[#C2507A] focus:outline-none" placeholder="예: 차기 응원봉 디자인 투표" />
                             </div>
                             <div>
                                <label className="block text-xs font-black text-[#888] uppercase mb-2">종료 기한</label>
                                <input type="datetime-local" id="voteEndDate" className="w-full bg-[#F7F3EE] p-4 rounded-xl border border-transparent focus:border-[#C2507A] focus:outline-none" />
                             </div>
                             
                             <div className="pt-4 border-t border-[#ede8e2]">
                                <div className="flex justify-between items-center mb-4">
                                  <label className="block text-xs font-black text-[#888] uppercase">투표 옵션</label>
                                  <button 
                                    className="text-[10px] text-[#C2507A] font-bold bg-pink-50 px-2 py-1 rounded"
                                    onClick={() => {
                                      if (voteOptions.length < 6) {
                                        setVoteOptions([...voteOptions, { id: Date.now(), label: '', image: '' }]);
                                      } else {
                                        alert('최대 6개까지만 추가 가능합니다.');
                                      }
                                    }}
                                  >+ 옵션 추가</button>
                                </div>
                                <div className="space-y-3">
                                  {voteOptions.map((opt, idx) => (
                                    <div key={opt.id} className="flex gap-2 items-center">
                                      <label className="shrink-0 w-12 h-12 rounded-lg bg-[#F7F3EE] border border-[#ede8e2] flex items-center justify-center cursor-pointer overflow-hidden group relative">
                                        {opt.image ? (
                                          <img src={opt.image} className="w-full h-full object-cover" />
                                        ) : (
                                          <Image size={14} className="text-[#888]" />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                          <span className="text-[8px] text-white font-bold">변경</span>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={e => {
                                           const file = e.target.files?.[0];
                                           if (file) {
                                             const reader = new FileReader();
                                             reader.onload = (e) => setVoteOptions(voteOptions.map(o => o.id === opt.id ? {...o, image: e.target?.result as string} : o));
                                             reader.readAsDataURL(file);
                                           }
                                        }} />
                                      </label>
                                      <input 
                                        type="text" 
                                        placeholder={`옵션 ${idx+1} 라벨 (예: 핑크블러썸)`}
                                        className="flex-1 bg-[#F7F3EE] p-3 rounded-xl border border-transparent focus:border-[#C2507A] focus:outline-none text-sm"
                                        value={opt.label}
                                        onChange={e => setVoteOptions(voteOptions.map(o => o.id === opt.id ? {...o, label: e.target.value} : o))}
                                      />
                                      {voteOptions.length > 2 && (
                                        <button 
                                          className="shrink-0 w-8 h-8 flex items-center justify-center text-[#ff4444] bg-red-50 rounded-lg hover:bg-red-100"
                                          onClick={() => setVoteOptions(voteOptions.filter(o => o.id !== opt.id))}
                                        >
                                          <X size={14} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-4 mt-8 pt-4 border-t border-[#ede8e2]">
                             <button onClick={() => setShowVoteModal(false)} className="flex-1 p-4 bg-[#F7F3EE] rounded-2xl font-bold">취소</button>
                             <button onClick={async () => {
                                 const title = (document.getElementById('voteTitle') as HTMLInputElement).value;
                                 const end = (document.getElementById('voteEndDate') as HTMLInputElement).value;
                                 if (!title || !end) {
                                   alert('제목과 종료 기한을 입력해주세요.');
                                   return;
                                 }
                                 if (voteOptions.some(o => !o.label.trim())) {
                                    alert('모든 옵션의 라벨을 입력해주세요.');
                                    return;
                                 }
                                 try {
                                   await createVote(agencyArtistId, {
                                     title,
                                     endsAt: new Date(end).toISOString(),
                                     options: voteOptions.map(o => ({ label: o.label, imageUrl: '' })),
                                   });
                                   const res = await getVotes(agencyArtistId);
                                   setVotesList(res.items);
                                   setShowVoteModal(false);
                                   setVoteOptions([{id: 1, label: '', image: ''}, {id: 2, label: '', image: ''}]);
                                   alert('투표가 등록되었습니다!');
                                 } catch {
                                   alert('투표 등록에 실패했습니다.');
                                 }
                             }} className="flex-1 p-4 bg-[#C2507A] text-white rounded-2xl font-bold">투표 등록 (생성)</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {votesList.length === 0 && (
                        <p className="col-span-2 text-center py-12 text-[#888] font-bold">등록된 투표가 없습니다.</p>
                      )}
                      {votesList.map((vote) => {
                        const totalVotes = vote.options.reduce((sum, o) => sum + o.voteCount, 0);
                        const endLabel = vote.endsAt ? vote.endsAt.slice(0, 10) : '-';
                        return (
                          <div key={vote.id} className="bg-[#F7F3EE] p-6 rounded-3xl border border-transparent hover:border-[#C2507A] transition-all group">
                            <div className="flex justify-between items-start mb-4">
                               <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${vote.active ? 'bg-[#C2507A] text-white' : 'bg-gray-300 text-gray-600'}`}>
                                  {vote.active ? 'ONGOING' : 'CLOSED'}
                               </span>
                            </div>
                            <h4 className="text-lg font-black mb-4">{vote.title}</h4>
                            <div className="flex items-center justify-between py-4 border-t border-white/40">
                               <div className="text-center">
                                  <div className="text-[10px] font-black text-[#888] uppercase mb-1">Total Votes</div>
                                  <div className="font-black text-[#C2507A]">{totalVotes.toLocaleString()}</div>
                               </div>
                               <div className="text-center">
                                  <div className="text-[10px] font-black text-[#888] uppercase mb-1">End Date</div>
                                  <div className="font-black text-[#111]">{endLabel}</div>
                               </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => alert('결과 통계 보고서가 생성되었습니다.')} className="flex-1 bg-white py-3 rounded-2xl font-black text-[11px] hover:bg-[#F7F3EE] transition-all shadow-sm">결과 통계 보기</button>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                 </div>
              </div>
            )}

            {activeMenu === 'inventory' && (
              <div className="bg-white rounded-[32px] border border-[#EDE8E2] overflow-hidden shadow-sm">
                 <div className="p-8 border-b border-[#EDE8E2] bg-[#FAF8F5] flex justify-between items-center">
                    <div>
                       <h3 className="text-xl font-black italic mb-1 uppercase tracking-tighter">Inventory Detailed History</h3>
                       <p className="text-xs text-[#888] font-bold">재고 예약, 출고, 보정 등 정교한 흐름 기록</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { const adjust = prompt('증감할 재고 수량을 입력하세요. (예: 50, -20)'); if(adjust) alert('재고 보정이 완료되었습니다.'); }} className="px-4 py-2 bg-[#C2507A] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-pink-100">
                          <Plus size={14} /> 재고 보정 (Adjust)
                       </button>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-[#F7F3EE] text-[#888] text-[11px] uppercase tracking-[2px] font-black">
                             <th className="px-8 py-4">Status / Type</th>
                             <th className="px-8 py-4">Product Name</th>
                             <th className="px-8 py-4">Quantity</th>
                             <th className="px-8 py-4">Handled By</th>
                             <th className="px-8 py-4 text-right">Timestamp</th>
                          </tr>
                       </thead>
                       <tbody>
                          {[
                            { type: 'RELEASE', icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-50', prod: 'Echo Season Photobook', qty: '-12', user: 'Order System', time: '2026.05.21 14:12' },
                            { type: 'RESERVE', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', prod: 'Starlight Lightstick', qty: '-1', user: 'Order #241A', time: '2026.05.21 13:55' },
                            { type: 'COMPENSATE', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50', prod: 'Summer Tee (XL)', qty: '+50', user: 'Admin (Lee)', time: '2026.05.20 18:02' },
                            { type: 'CANCEL', icon: ArrowDownRight, color: 'text-green-500', bg: 'bg-green-50', prod: 'Echo Photobook', qty: '+1', user: 'Order Canceled', time: '2026.05.20 17:45' },
                          ].map((row, i) => (
                            <tr key={i} className="border-b border-[#F7F3EE] hover:bg-[#fafafa] transition-colors group">
                               <td className="px-8 py-5">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] ${row.bg} ${row.color}`}>
                                     <row.icon size={12} />
                                     {row.type}
                                  </div>
                               </td>
                               <td className="px-8 py-5">
                                  <div className="font-bold text-sm text-[#111]">{row.prod}</div>
                                  <div className="text-[10px] text-[#888] font-bold">Category: Merch</div>
                               </td>
                               <td className="px-8 py-5">
                                  <span className={`font-mono font-black text-sm ${row.qty.startsWith('-') ? 'text-red-500' : 'text-green-600'}`}>
                                     {row.qty}
                                  </span>
                               </td>
                               <td className="px-8 py-5 text-sm font-medium text-[#555]">{row.user}</td>
                               <td className="px-8 py-5 text-right text-xs font-mono text-[#888]">{row.time}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            {activeMenu === 'calendar' && (
              <div className="bg-white p-8 rounded-[32px] border border-[#EDE8E2] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">예정된 스케줄 (Upcoming Schedule)</h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={agencyArtistId}
                      onChange={e => setAgencyArtistId(Number(e.target.value))}
                      className="bg-[#F7F3EE] border border-[#ede8e2] px-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:border-[#C2507A]"
                    >
                      {SCHEDULE_ARTISTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <button className="bg-[#F7F3EE] border border-[#ede8e2] text-[#111] px-4 py-2 rounded-xl text-sm font-bold" onClick={() => setShowLiveModal(true)}>라이브 등록</button>
                    <button className="bg-[#C2507A] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-pink-100" onClick={() => setShowEventModal(true)}>일정 추가</button>
                  </div>
                </div>

                {/* 이벤트 추가 모달 */}
                {showEventModal && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                      <h3 className="text-xl font-bold mb-4">새 일정 추가</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-[#888] mb-1">일정명</label>
                          <input type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" placeholder="일정 제목을 입력하세요" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#888] mb-1">종류</label>
                          <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]">
                            <option value="EVENT">이벤트 (EVENT)</option>
                            <option value="DROP">앨범·굿즈 발매 (DROP)</option>
                            <option value="NOTICE">공지 (NOTICE)</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-[#888] mb-1">날짜</label>
                            <input type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[#888] mb-1">시간</label>
                            <input type="time" value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <button className="flex-1 bg-[#F7F3EE] text-[#111] py-3 rounded-xl font-bold" onClick={() => { setShowEventModal(false); setEventForm({ title: '', type: 'EVENT', date: '', time: '' }); }}>취소</button>
                        <button className="flex-1 bg-[#C2507A] text-white py-3 rounded-xl font-bold" onClick={async () => {
                          if (!eventForm.title.trim() || !eventForm.date || !eventForm.time) { alert('모든 필드를 입력해주세요.'); return; }
                          try {
                            await createEvent(agencyArtistId, eventForm.title.trim(), eventForm.type, `${eventForm.date}T${eventForm.time}:00+09:00`);
                            setShowEventModal(false);
                            setEventForm({ title: '', type: 'EVENT', date: '', time: '' });
                            getCalendar(agencyArtistId).then(res => setAgencySchedules(res.events)).catch(() => {});
                            alert('일정이 등록되었습니다.');
                          } catch { alert('일정 등록에 실패했습니다.'); }
                        }}>저장</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 라이브 등록 모달 */}
                {showLiveModal && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                      <h3 className="text-xl font-bold mb-4">라이브 방송 등록</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-[#888] mb-1">라이브 제목</label>
                          <input type="text" value={liveForm.title} onChange={e => setLiveForm({...liveForm, title: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" placeholder="라이브 제목을 입력하세요" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-[#888] mb-1">날짜</label>
                            <input type="date" value={liveForm.date} onChange={e => setLiveForm({...liveForm, date: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[#888] mb-1">시간</label>
                            <input type="time" value={liveForm.time} onChange={e => setLiveForm({...liveForm, time: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#888] mb-1">YouTube 임베드 URL</label>
                          <input type="text" value={liveForm.liveUrl} onChange={e => setLiveForm({...liveForm, liveUrl: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                          <p className="text-xs text-[#888] mt-1">형식: https://www.youtube.com/embed/VIDEO_ID</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <button className="flex-1 bg-[#F7F3EE] text-[#111] py-3 rounded-xl font-bold" onClick={() => { setShowLiveModal(false); setLiveForm({ title: '', date: '', time: '', liveUrl: '' }); }}>취소</button>
                        <button className="flex-1 bg-[#FF4444] text-white py-3 rounded-xl font-bold" onClick={async () => {
                          if (!liveForm.title.trim() || !liveForm.date || !liveForm.time || !liveForm.liveUrl.trim()) { alert('모든 필드를 입력해주세요.'); return; }
                          if (!/^https:\/\/www\.youtube\.com\/embed\/[^/?#]+$/.test(liveForm.liveUrl.trim())) { alert('YouTube 임베드 URL 형식이 올바르지 않습니다.\n예: https://www.youtube.com/embed/VIDEO_ID'); return; }
                          try {
                            await registerLive(agencyArtistId, liveForm.title.trim(), `${liveForm.date}T${liveForm.time}:00+09:00`, liveForm.liveUrl.trim());
                            setShowLiveModal(false);
                            setLiveForm({ title: '', date: '', time: '', liveUrl: '' });
                            getCalendar(agencyArtistId).then(res => setAgencySchedules(res.events)).catch(() => {});
                            alert('라이브가 등록되었습니다.');
                          } catch { alert('라이브 등록에 실패했습니다.'); }
                        }}>등록</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 스케줄 목록 */}
                {agencySchedules.length === 0 ? (
                  <div className="text-center py-12 text-[#888] font-bold">등록된 스케줄이 없습니다.</div>
                ) : (
                  <div className="space-y-3">
                    {agencySchedules.map(s => {
                      const { date, time } = fmtSchedule(s.startTime);
                      return (
                        <div key={s.id} className="flex items-center gap-6 p-4 rounded-xl border border-[#EDE8E2] hover:bg-[#F7F3EE] transition-colors">
                          <div className="text-center w-20 shrink-0 border-r border-[#EDE8E2] pr-6">
                            <div className="text-[#C2507A] font-bold text-sm">{date}</div>
                            <div className="text-[#888] text-xs font-mono">{time}</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold mb-1" style={{ color: TYPE_COLORS[s.type] ?? '#888' }}>{TYPE_LABELS[s.type] ?? s.type}</div>
                            <div className="font-bold">{s.title}</div>
                          </div>
                          {s.type === 'LIVE' && (
                            <button
                              disabled={startingLiveId === s.id}
                              onClick={async () => {
                                setStartingLiveId(s.id);
                                try {
                                  await startLive(s.id);
                                  getCalendar(agencyArtistId).then(res => setAgencySchedules(res.events)).catch(() => {});
                                  alert('라이브가 시작되었습니다!');
                                } catch { alert('라이브 시작에 실패했습니다.'); }
                                finally { setStartingLiveId(null); }
                              }}
                              className="text-sm font-bold text-white bg-[#FF4444] px-3 py-1.5 rounded-lg disabled:opacity-50"
                            >
                              {startingLiveId === s.id ? '처리 중...' : '라이브 시작'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

             {activeMenu === 'notices' && (
               <div className="bg-white p-8 rounded-[32px] border border-[#EDE8E2] shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black">공지사항 관리 (Manage Notices)</h3>
                    <button className="bg-[#C2507A] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-pink-100" onClick={() => setShowNoticeModal(true)}>+ 공지 작성</button>
                  </div>

                  {showNoticeModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl w-full max-w-2xl p-8">
                        <h3 className="text-2xl font-black mb-6">공지사항 작성</h3>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">카테고리 (ARTIST_NOTICE)</label>
                              <select 
                                className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A]"
                                value={newNotice.tag}
                                onChange={(e) => setNewNotice({ ...newNotice, tag: e.target.value })}
                              >
                                <option>NOTICE (일반공지)</option>
                                <option>LIVE (라이브 공지)</option>
                                <option>EVENT (이벤트)</option>
                                <option>DROP (상품 드롭)</option>
                              </select>
                            </div>
                            <div>
                               <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">등록일</label>
                               <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                            </div>
                          </div>
                          <div className="mt-4 border-t border-[#ede8e2] pt-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-bold text-[#111] cursor-pointer" onClick={() => setLinkNoticeToggle(!linkNoticeToggle)}>
                                아티스트 캘린더 일정에 자동 추가
                              </label>
                              <div className="relative inline-flex items-center cursor-pointer" onClick={() => setLinkNoticeToggle(!linkNoticeToggle)}>
                                <input type="checkbox" className="sr-only peer" checked={linkNoticeToggle} readOnly />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C2507A]"></div>
                              </div>
                            </div>
                            {linkNoticeToggle && (
                               <div className="mt-4 p-4 bg-[#F7F3EE] rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                  <div>
                                    <label className="block text-xs font-black text-[#888] uppercase mb-1">일정 제목</label>
                                    <input type="text" value={newNotice.title} className="w-full bg-white border border-[#ede8e2] px-3 py-2 rounded-lg" readOnly />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-black text-[#888] uppercase mb-1">일정 일시</label>
                                      <input type="datetime-local" className="w-full bg-white border border-[#ede8e2] px-3 py-2 rounded-lg" />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-black text-[#888] uppercase mb-1">일정 타입</label>
                                      <input type="text" value={newNotice.tag} className="w-full bg-white border border-[#ede8e2] px-3 py-2 rounded-lg" readOnly />
                                    </div>
                                  </div>
                               </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">제목</label>
                            <input 
                              type="text" 
                              placeholder="공지 제목을 입력하세요" 
                              className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A] font-bold text-[#111]" 
                              value={newNotice.title}
                              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">첨부 이미지</label>
                            <div className="flex gap-4 items-center">
                              {(newNotice as any).image && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[#ede8e2] relative group">
                                  <img src={(newNotice as any).image as string} alt="notice img" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <label className="cursor-pointer bg-[#F7F3EE] px-4 py-3 rounded-xl border border-[#ede8e2] text-sm font-bold text-[#888] hover:text-[#C2507A] hover:border-[#C2507A] transition-colors flex-1 flex justify-center items-center gap-2">
                                <Upload size={16} /> {(newNotice as any).image ? '이미지 변경' : '이미지 첨부하기'}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => setNewNotice({...newNotice, image: ev.target?.result as string} as any);
                                    reader.readAsDataURL(file);
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">상세 내용 (Markdown 지원)</label>
                            <textarea 
                              placeholder="공지 내용을 입력하세요..." 
                              className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A] h-48 resize-none text-[#111]"
                              value={newNotice.content}
                              onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                            ></textarea>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                          <button className="flex-1 bg-[#F7F3EE] text-[#111] py-4 rounded-xl font-bold" onClick={() => setShowNoticeModal(false)}>취소</button>
                          <button className="flex-1 bg-[#C2507A] text-white py-4 rounded-xl font-bold" onClick={addNotice}>등록하기</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {notices.map((notice) => (
                      <div key={notice.id} className="flex items-center gap-6 p-5 rounded-xl border border-[#EDE8E2] hover:border-[#C2507A] transition-all group">
                         <div className="w-2 cursor-grab text-[#EDE8E2] group-hover:text-[#C2507A]">⠿</div>
                         <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#F7F3EE] text-[#C2507A]">{notice.type}</span>
                               <span className="text-xs font-medium text-[#888]">{notice.scheduledAt ? fmtSchedule(notice.scheduledAt).date : ''}</span>
                            </div>
                            <div className="font-bold text-[#111]">{notice.title}</div>
                         </div>
                         <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-[#F7F3EE] rounded-lg text-[#888] hover:text-[#111] transition-colors">수정</button>
                            <button className="p-2 hover:bg-[#F7F3EE] rounded-lg text-[#888] hover:text-red-500 transition-colors" onClick={() => setNotices(notices.filter(n => n.id !== notice.id))}>삭제</button>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             {activeMenu === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black">상품 및 드롭 관리 (Manage Drops)</h3>
                   <button className="bg-[#C2507A] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-pink-100" onClick={() => setShowProductModal(true)}>+ 새 드롭 생성</button>
                 </div>

                 {showProductModal && (
                   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                       <h3 className="text-xl font-bold mb-4">새 상품 / 드롭 추가</h3>
                       <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-[#888] mb-2 flex justify-between">
                              <span>상품 썸네일/상세 이미지 (최대 5장)</span>
                              <span className="text-xs text-[#C2507A] font-black cursor-pointer" onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const files = (e.target as HTMLInputElement).files;
                                  if (files) {
                                    Array.from(files).forEach((f: any) => {
                                       // Simple dummy handling for mock
                                       alert('선택된 이미지: ' + f.name);
                                    });
                                  }
                                };
                                input.click();
                              }}>+ 이미지 업로드 (Upload)</span>
                            </label>
                            <label className="cursor-pointer">
                              <div className="w-full h-24 border-2 border-dashed border-[#ede8e2] rounded-xl flex flex-col items-center justify-center text-[#888] bg-[#F7F3EE] hover:border-[#C2507A] hover:text-[#C2507A] transition-colors">
                                <Upload size={20} className="mb-1" />
                                <span className="text-xs font-bold">클릭하거나 이미지를 드래그하세요</span>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                accept="image/*"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files) {
                                    alert('최대 5장 업로드 로직 시작: ' + Array.from(files).map((f: any) => f.name).join(', '));
                                  }
                                }}
                              />
                            </label>
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                               {/* Mock Previews */}
                               <div className="w-16 h-16 rounded-lg bg-gray-200 relative border border-[#ede8e2] overflow-hidden shrink-0 group">
                                  <div className="absolute top-1 left-1 bg-[#C2507A] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm z-10">대표</div>
                                  <div className="w-full h-full bg-[#111] flex items-center justify-center text-white/50 text-[10px]">Mock</div>
                                  <button className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                               </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[#888] mb-1">상품명 (Product Name)</label>
                           <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-bold text-[#888] mb-1">가격 (KRW)</label>
                             <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                           </div>
                           <div>
                             <label className="block text-sm font-bold text-[#888] mb-1">초기 재고 (Initial Stock)</label>
                             <input type="number" value={productForm.totalQty} onChange={e => setProductForm({...productForm, totalQty: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                           </div>
                         </div>
                         <div className="flex items-center gap-2 mb-2 mt-4">
                           <input type="checkbox" id="hot-deal" checked={productForm.isDrops} onChange={e => setProductForm({...productForm, isDrops: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                           <label htmlFor="hot-deal" className="text-sm font-bold text-[#111] cursor-pointer">핫딜 대기열 활성화 (트래픽이 많을 때)</label>
                         </div>
                         <div className="text-xs text-[#888] ml-6 mb-4">트래픽 급증 시 사용자들은 대기열에 진입하게 됩니다.</div>
                         
                         <div>
                           <label className="block text-sm font-bold text-[#888] mb-1">상세 설명</label>
                           <textarea className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A] h-20 resize-none"></textarea>
                         </div>
                       </div>
                       <div className="flex gap-2 mt-6">
                         <button className="flex-1 bg-[#F7F3EE] text-[#111] py-3 rounded-xl font-bold" onClick={() => setShowProductModal(false)}>취소</button>
                         <button className="flex-1 bg-[#C2507A] text-white py-3 rounded-xl font-bold" onClick={async () => {
                           if (!productForm.name.trim() || !productForm.price || !productForm.totalQty) {
                             alert('상품명, 가격, 재고를 모두 입력해주세요.');
                             return;
                           }
                           try {
                             const req: CreateProductRequest = {
                               artistId: agencyArtistId,
                               name: productForm.name.trim(),
                               price: Number(productForm.price),
                               totalQty: Number(productForm.totalQty),
                               type: productForm.isDrops ? 'drops' : 'regular',
                             };
                             await createProduct(req);
                             const refreshed = await getProducts('regular', undefined, 50, agencyArtistId);
                             setProductList(refreshed.items);
                             setShowProductModal(false);
                             setProductForm({ name: '', price: '', totalQty: '', isDrops: false, dropsStartAt: '', dropsEndAt: '' });
                             alert('드롭이 스케줄되었습니다!');
                           } catch {
                             alert('상품 등록에 실패했습니다.');
                           }
                         }}>드롭 시작하기</button>
                       </div>
                     </div>
                   </div>
                 )}

                 {productList.length === 0 && (
                   <p className="text-center py-12 text-[#888] font-bold">등록된 상품이 없습니다.</p>
                 )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {productList.map((item) => (
                     <div key={item.id} className="bg-white rounded-2xl border border-[#EDE8E2] p-6 flex gap-4 items-center cursor-pointer hover:border-[#111] transition-colors">
                       <div className="w-20 h-20 bg-[#F7F3EE] rounded-xl flex items-center justify-center shrink-0">
                         <Package className="text-[#ccc] w-8 h-8" />
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm max-w-[150px] truncate">{item.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.status === 'ON_SALE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{item.status}</span>
                         </div>
                         <div className="text-sm text-[#888] font-mono mb-1">₩{item.price.toLocaleString()}</div>
                         <div className="text-xs font-bold text-[#111]">재고 (Stock): {item.totalQty.toLocaleString()}</div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {activeMenu === 'orders' && (
              <div className="bg-white rounded-[32px] border border-[#EDE8E2] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#EDE8E2] flex justify-between items-center bg-[#FAF8F5]">
                  <h3 className="text-lg font-black italic">RECENT ORDERS</h3>
                  <div className="text-xs font-black text-[#C2507A] cursor-pointer hover:underline uppercase tracking-widest">Export to CSV</div>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F7F3EE] text-[#888] text-xs uppercase tracking-wider">
                      <th className="p-4 font-medium">주문 번호 (Order ID)</th>
                      <th className="p-4 font-medium">상품 (Product)</th>
                      <th className="p-4 font-medium">날짜 (Date)</th>
                      <th className="p-4 font-medium">상태 (Status)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '#ORD-001', prod: '응원봉 (Lightstick)', date: '오늘, 14:20', status: '처리중' },
                      { id: '#ORD-002', prod: '포토북 (Photo Book)', date: '오늘, 12:45', status: '배송중' },
                      { id: '#ORD-003', prod: '콘서트 티켓 (Concert Ticket)', date: '어제', status: '완료' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#EDE8E2] last:border-0 hover:bg-[#fafafa]">
                        <td className="p-4 text-sm font-mono font-bold text-[#111]">{row.id}</td>
                        <td className="p-4 text-sm text-[#333]">{row.prod}</td>
                        <td className="p-4 text-sm text-[#888]">{row.date}</td>
                        <td className="p-4 text-sm">
                          <span className="font-bold text-xs px-2 py-1 bg-gray-100 rounded">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeMenu === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#EDE8E2]">
                    <h3 className="text-sm font-bold text-[#888] uppercase tracking-[1px] mb-6">팬슈머 성장 트렌드 (Audience Growth)</h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                       {[40, 55, 45, 75, 60, 85, 100].map((h, i) => (
                         <div key={i} className="w-1/6 bg-gradient-to-t from-[#C2507A] to-[#7F77DD] rounded-t-sm" style={{ height: `${h}%` }}></div>
                       ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#EDE8E2]">
                    <h3 className="text-sm font-bold text-[#888] uppercase tracking-[1px] mb-6">주요 국가/지역 (Top Regions)</h3>
                    <div className="space-y-4">
                      {[
                        { region: '대한민국 (South Korea)', val: '45%' },
                        { region: '미국 (United States)', val: '22%' },
                        { region: '일본 (Japan)', val: '15%' },
                        { region: '기타 국가 (Others)', val: '18%' },
                      ].map((r, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold">{r.region}</span>
                            <span className="text-[#888] font-mono">{r.val}</span>
                          </div>
                          <div className="w-full h-2 bg-[#F7F3EE] rounded-full overflow-hidden">
                            <div className="h-full bg-[#111]" style={{ width: r.val }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {showBannerModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                <div className="bg-white rounded-[32px] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-black mb-6">{editingBanner?.id ? '배너 수정' : '새 배너 등록'}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">배너 이미지</label>
                      <div className="flex flex-col gap-3 mb-4">
                        {(editingBanner?.imageUrl || editingBanner?._file) && (
                          <div className="w-full h-32 rounded-xl border border-[#ede8e2] overflow-hidden shrink-0 relative group">
                            {editingBanner._file
                              ? <div className="w-full h-full bg-[#F7F3EE] flex items-center justify-center text-xs text-[#888] font-bold">{editingBanner._file.name}</div>
                              : <img src={editingBanner.imageUrl} alt="banner" className="w-full h-full object-cover" />
                            }
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg cursor-pointer" onClick={(e) => { e.preventDefault(); setEditingBanner({...editingBanner!, imageUrl: '', _file: undefined}); }}>이미지 삭제</span>
                            </div>
                          </div>
                        )}
                        <label className="cursor-pointer bg-[#F7F3EE] px-4 py-3 rounded-xl border border-dashed border-[#ede8e2] text-sm font-bold text-[#888] hover:text-[#C2507A] hover:border-[#C2507A] transition-colors flex justify-center items-center gap-2">
                          <Upload size={16} /> {editingBanner?._file || editingBanner?.imageUrl ? '이미지 변경' : '이미지 파일(.jpg, .png) 첨부'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setEditingBanner({...editingBanner!, _file: file});
                          }} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">배너 제목</label>
                      <input type="text" value={editingBanner?.title || ''} onChange={(e) => setEditingBanner({...editingBanner!, title: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">랜딩 URL</label>
                      <input type="text" placeholder="https://..." value={editingBanner?.landingUrl || ''} onChange={(e) => setEditingBanner({...editingBanner!, landingUrl: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">시작일</label>
                        <input type="datetime-local" value={editingBanner?.startAt || ''} onChange={(e) => setEditingBanner({...editingBanner!, startAt: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">종료일</label>
                        <input type="datetime-local" value={editingBanner?.endAt || ''} onChange={(e) => setEditingBanner({...editingBanner!, endAt: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">노출 순서</label>
                      <input type="number" min={1} value={editingBanner?.exposureOrder || ''} onChange={(e) => setEditingBanner({...editingBanner!, exposureOrder: Number(e.target.value)})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#888] uppercase tracking-wider mb-2">상태</label>
                      <select value={editingBanner?.isActive ? 'ACTIVE' : 'INACTIVE'} onChange={(e) => setEditingBanner({...editingBanner!, isActive: e.target.value === 'ACTIVE'})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl focus:outline-none focus:border-[#C2507A]">
                        <option value="ACTIVE">ACTIVE (노출)</option>
                        <option value="INACTIVE">INACTIVE (비노출)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button className="flex-1 bg-[#F7F3EE] text-[#111] py-4 rounded-xl font-bold" onClick={() => setShowBannerModal(false)}>취소</button>
                    <button className="flex-1 bg-[#C2507A] text-white py-4 rounded-xl font-bold" onClick={handleBannerSubmit}>{editingBanner?.id ? '수정하기' : '등록하기'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
