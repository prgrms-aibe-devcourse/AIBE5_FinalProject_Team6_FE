import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, PenTool, Image, Calendar as CalendarIcon, Package, ShoppingCart, Users, UserCircle, LogOut, CheckCircle2, Activity, ArrowUpRight, ArrowDownRight, Clock, Plus, Upload, X } from 'lucide-react';
import { logout } from '../api/auth';
import { ROLE_KEY } from '../App';
import { getCalendar, createEvent, registerLive, startLive } from '../api/schedule';
import type { ScheduleResult } from '../types/schedule';
import { getNotices, getNotice, createNotice } from '../api/notices';
import type { NoticeResult } from '../types/notice';
import { getAgencyBanners, createAgencyBanner, updateAgencyBanner, deleteAgencyBanner, requestAgencyPresignedUrl, uploadToS3Agency } from '../api/agencyBanners';
import type { AgencyBannerFormData } from '../api/agencyBanners';
import type { BannerResponse } from '../types/banner';
import { getVotes, createVote } from '../api/votes';
import type { GoodsVoteResult } from '../types/vote';
import { getProducts, getProduct, createProduct, updateProduct, restockProduct } from '../api/products';
import type { CreateProductRequest, ProductListItem, ProductResponse } from '../api/products';
import { getAgencyArtists, getArtistPublicProfile, updateArtistProfile, requestArtistProfileImagePresignedUrl, updateArtistProfileImage, getArtistMembers } from '../api/agencyArtists'
import type { ArtistItem, ArtistPublicProfile, ArtistMember } from '../types/artist'
import { createArtistMember, updateArtistMember, deleteArtistMember } from '../api/artistMembers'
import { getAgencyOrders } from '../api/agencyOrders'
import type { AgencyOrderItem } from '../api/agencyOrders'
import { getAgencyInventoryHistory } from '../api/agencyInventory'
import type { InventoryHistoryItem } from '../api/agencyInventory';

interface MemberEditForm {
  id?: number
  memberName: string
  profileImageUrl: string
  _file?: File
}

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
const INV_CHANGE_LABELS: Record<string, string> = {
  RESERVE: '선점', RELEASE: '해제', DECREASE: '차감', INCREASE: '입고', COMPENSATE: '보상',
}

function fmtNoticeDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [votesList, setVotesList] = useState<GoodsVoteResult[]>([]);
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [editingBanner, setEditingBanner] = useState<BannerForm | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const doDeleteBanner = async (id: number) => {
    try {
      await deleteAgencyBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      showToast('배너가 삭제되었습니다.');
    } catch {
      showToast('배너 삭제에 실패했습니다.', 'error');
    }
    setConfirmDelete(null);
  };

  const handleBannerSubmit = async () => {
    if (!editingBanner?.title?.trim()) {
      showToast('배너 제목을 입력해주세요.', 'error');
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
        showToast('배너 설정이 수정되었습니다.');
      } else {
        await createAgencyBanner(data);
        showToast('새 배너가 등록되었습니다.');
      }
      setBanners(await getAgencyBanners());
      setShowBannerModal(false);
      setEditingBanner(null);
    } catch {
      showToast('배너 저장에 실패했습니다.', 'error');
    }
  };

  const handleBannerDelete = (id: number) => {
    setConfirmDelete(id);
  };

  const [notices, setNotices] = useState<NoticeResult[]>([]);

  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [artistProfile, setArtistProfile] = useState<ArtistPublicProfile | null>(null);
  const [artistMembers, setArtistMembers] = useState<ArtistMember[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState({ bio: '', instagramUrl: '', youtubeUrl: '', twitterUrl: '', officialUrl: '' });
  const [editingMemberForm, setEditingMemberForm] = useState<MemberEditForm | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [newNotice, setNewNotice] = useState({ title: '', tag: 'NOTICE (일반공지)', content: '' });

  const [productList, setProductList] = useState<ProductListItem[]>([]);
  const [productForm, setProductForm] = useState({ name: '', price: '', totalQty: '', isDrops: false, dropsStartAt: '', dropsEndAt: '' });
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);

  // 스케줄 관리 상태
  const [agencyArtistId, setAgencyArtistId] = useState<number | null>(null);
  const [agencySchedules, setAgencySchedules] = useState<ScheduleResult[]>([]);
  const [agencyOrders, setAgencyOrders] = useState<AgencyOrderItem[]>([]);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistoryItem[]>([]);
  const [eventForm, setEventForm] = useState({ title: '', type: 'EVENT', date: '', time: '' });
  const [liveForm, setLiveForm] = useState({ title: '', date: '', time: '', liveUrl: '' });
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [startingLiveId, setStartingLiveId] = useState<number | null>(null);

  const [selectedNoticeDetail, setSelectedNoticeDetail] = useState<NoticeResult | null>(null);
  const [selectedVote, setSelectedVote] = useState<GoodsVoteResult | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [productEditForm, setProductEditForm] = useState({ name: '', price: '', dropsStartAt: '', dropsEndAt: '' });
  const [restockQty, setRestockQty] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [ordersCursor, setOrdersCursor] = useState<string | null>(null);
  const [ordersHasMore, setOrdersHasMore] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [inventoryCursor, setInventoryCursor] = useState<string | null>(null);
  const [inventoryHasMore, setInventoryHasMore] = useState(false);
  const [inventoryProductFilter, setInventoryProductFilter] = useState<number | ''>('');

  const refreshProductList = async (artistId = agencyArtistId) => {
    if (!artistId) return;
    const [regular, drops] = await Promise.all([
      getProducts('regular', undefined, 50, artistId),
      getProducts('drops', undefined, 50, artistId),
    ]);
    setProductList([...regular.items, ...drops.items]);
  };

  const openNoticeDetail = async (noticeId: number) => {
    if (!agencyArtistId) return;
    try {
      const detail = await getNotice(agencyArtistId, noticeId);
      setSelectedNoticeDetail(detail);
    } catch {
      showToast('공지를 불러오지 못했습니다.', 'error');
    }
  };

  const openProductDetail = async (item: ProductListItem) => {
    try {
      const detail = await getProduct(item.id);
      setSelectedProduct(detail);
      setProductEditForm({
        name: detail.name,
        price: String(detail.price),
        dropsStartAt: detail.dropsStartAt ? detail.dropsStartAt.slice(0, 16) : '',
        dropsEndAt: detail.dropsEndAt ? detail.dropsEndAt.slice(0, 16) : '',
      });
    } catch {
      showToast('상품 정보를 불러오지 못했습니다.', 'error');
    }
  };

  const loadOrders = async (cursor?: string, append = false) => {
    try {
      const res = await getAgencyOrders(agencyArtistId ?? undefined, cursor);
      setAgencyOrders(prev => append ? [...prev, ...res.items] : res.items);
      setOrdersCursor(res.nextCursor);
      setOrdersHasMore(res.nextCursor != null);
    } catch {
      showToast('주문 목록을 불러오지 못했습니다.', 'error');
    }
  };

  const loadInventory = async (cursor?: string, append = false) => {
    try {
      const productId = inventoryProductFilter === '' ? undefined : Number(inventoryProductFilter);
      const res = await getAgencyInventoryHistory(agencyArtistId ?? undefined, productId, cursor);
      setInventoryHistory(prev => append ? [...prev, ...res.items] : res.items);
      setInventoryCursor(res.nextCursor);
      setInventoryHasMore(res.nextCursor != null);
    } catch {
      showToast('재고 이력을 불러오지 못했습니다.', 'error');
    }
  };

  const artistSelect = (
    <select
      value={agencyArtistId ?? ''}
      onChange={e => setAgencyArtistId(Number(e.target.value))}
      className="bg-[#F7F3EE] border border-[#ede8e2] px-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:border-[#C2507A]"
    >
      {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
    </select>
  );

  const openProfileEdit = () => {
    if (!artistProfile) return;
    setProfileEditForm({
      bio: artistProfile.bio ?? '',
      instagramUrl: artistProfile.instagramUrl ?? '',
      youtubeUrl: artistProfile.youtubeUrl ?? '',
      twitterUrl: artistProfile.twitterUrl ?? '',
      officialUrl: artistProfile.officialUrl ?? '',
    });
    setShowProfileModal(true);
  };

  const handleProfileSave = async () => {
    if (!agencyArtistId) return;
    try {
      await updateArtistProfile(agencyArtistId, profileEditForm);
      setArtistProfile(prev => prev ? { ...prev, ...profileEditForm } : null);
      setShowProfileModal(false);
      showToast('프로필이 수정되었습니다.');
    } catch {
      showToast('프로필 수정에 실패했습니다.', 'error');
    }
  };

  const handleProfileImageChange = async (file: File) => {
    if (!agencyArtistId) return;
    try {
      const { presignedUrl, imageUrl } = await requestArtistProfileImagePresignedUrl(
        agencyArtistId, file.type, file.size,
      );
      await uploadToS3Agency(presignedUrl, file);
      await updateArtistProfileImage(agencyArtistId, imageUrl);
      setArtistProfile(prev => prev ? { ...prev, profileImageUrl: imageUrl } : null);
      showToast('프로필 이미지가 변경되었습니다.');
    } catch {
      showToast('이미지 변경에 실패했습니다.', 'error');
    }
  };

  const handleMemberSave = async () => {
    if (!agencyArtistId || !editingMemberForm) return;
    try {
      let profileImageUrl = editingMemberForm.profileImageUrl;
      if (editingMemberForm._file) {
        const { presignedUrl, imageUrl } = await requestAgencyPresignedUrl(
          editingMemberForm._file.type, editingMemberForm._file.size,
        );
        await uploadToS3Agency(presignedUrl, editingMemberForm._file);
        profileImageUrl = imageUrl;
      }
      if (editingMemberForm.id) {
        await updateArtistMember(editingMemberForm.id, {
          memberName: editingMemberForm.memberName,
          profileImageUrl: profileImageUrl || undefined,
        });
      } else {
        await createArtistMember({
          artistId: agencyArtistId,
          memberName: editingMemberForm.memberName,
          profileImageUrl: profileImageUrl || undefined,
        });
      }
      const updated = await getArtistMembers(agencyArtistId);
      setArtistMembers(updated);
      setEditingMemberForm(null);
      showToast('멤버 정보가 반영되었습니다.');
    } catch {
      showToast('멤버 저장에 실패했습니다.', 'error');
    }
  };

  const handleMemberDelete = async (memberId: number) => {
    if (!agencyArtistId) return;
    if (!window.confirm('멤버를 삭제하시겠습니까?')) return;
    try {
      await deleteArtistMember(memberId);
      setArtistMembers(prev => prev.filter(m => m.id !== memberId));
      showToast('멤버가 삭제되었습니다.');
    } catch {
      showToast('멤버 삭제에 실패했습니다.', 'error');
    }
  };

  const addNotice = async () => {
    if (!newNotice.title.trim() || !agencyArtistId) return;
    try {
      await createNotice(agencyArtistId, newNotice.title, newNotice.content);
      const res = await getNotices(agencyArtistId);
      setNotices(res.items);
      setNewNotice({ title: '', tag: 'NOTICE (일반공지)', content: '' });
      setShowNoticeModal(false);
      showToast('새 공지사항이 등록되었습니다!');
    } catch {
      showToast('공지 등록에 실패했습니다.', 'error');
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
    getAgencyArtists().then(res => {
      setArtists(res.items);
      if (res.items.length > 0) setAgencyArtistId(res.items[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeMenu !== 'profile' || !agencyArtistId) return;
    Promise.all([
      getArtistPublicProfile(agencyArtistId),
      getArtistMembers(agencyArtistId),
    ]).then(([profile, members]) => {
      setArtistProfile(profile);
      setArtistMembers(members);
    }).catch(() => {});
  }, [activeMenu, agencyArtistId]);

  useEffect(() => {
    if (activeMenu !== 'banners') return;
    getAgencyBanners().then(setBanners).catch(() => {});
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu !== 'votes' || !agencyArtistId) return;
    getVotes(agencyArtistId).then(res => setVotesList(res.items)).catch(() => {});
  }, [activeMenu, agencyArtistId]);

  useEffect(() => {
    if (activeMenu !== 'products' || !agencyArtistId) return;
    Promise.all([
      getProducts('regular', undefined, 50, agencyArtistId),
      getProducts('drops', undefined, 50, agencyArtistId),
    ])
      .then(([regular, drops]) => setProductList([...regular.items, ...drops.items]))
      .catch(() => {});
  }, [activeMenu, agencyArtistId]);

  useEffect(() => {
    if (activeMenu !== 'calendar' || !agencyArtistId) return;
    getCalendar(agencyArtistId)
      .then(res => setAgencySchedules(res.events))
      .catch(() => {});
  }, [activeMenu, agencyArtistId]);

  useEffect(() => {
    if (activeMenu !== 'notices' || !agencyArtistId) return;
    getNotices(agencyArtistId)
      .then(res => setNotices(res.items))
      .catch(console.error);
  }, [activeMenu, agencyArtistId]);

  useEffect(() => {
    if (activeMenu !== 'orders') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [activeMenu, agencyArtistId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeMenu !== 'inventory') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (agencyArtistId) refreshProductList().catch(() => {});
    loadInventory();
  }, [activeMenu, agencyArtistId, inventoryProductFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#F7F3EE] text-[#111] flex flex-col font-sans">
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
                      onClick={() => setAgencyArtistId(artist.id)}
                      className={`px-6 py-2 rounded-full font-black text-sm whitespace-nowrap transition-all ${
                        agencyArtistId === artist.id ? 'bg-[#C2507A] text-white' : 'bg-[#F7F3EE] text-[#888]'
                      }`}
                    >
                      {artist.name} 프로필
                    </button>
                  ))}
                  <button className="px-6 py-2 rounded-full font-black text-sm whitespace-nowrap bg-[#EDE8E2] text-[#111] hover:bg-[#D7D0CA] transition-colors">+ 아티스트 추가</button>
                </div>

                {artistProfile ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-[#EDE8E2] text-center shadow-sm">
                        <div className="w-32 h-32 bg-[#F7F3EE] rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-xl relative group overflow-hidden">
                          {artistProfile.profileImageUrl
                            ? <img src={artistProfile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                            : <UserCircle className="w-16 h-16 text-[#ccc]" />
                          }
                          <div
                            className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            onClick={() => profileImageInputRef.current?.click()}
                          >
                            <span className="text-white font-bold text-xs">변경</span>
                          </div>
                        </div>
                        <input
                          ref={profileImageInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleProfileImageChange(f); e.target.value = ''; }}
                        />
                        <h4 className="text-xl font-black mb-1">{artistProfile.name}</h4>
                        <p className="text-sm text-[#888] font-medium mb-6 line-clamp-2 px-4">{artistProfile.bio}</p>
                        <button
                          className="w-full bg-[#C2507A] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-pink-100 hover:opacity-90 active:scale-[0.98] transition-all"
                          onClick={openProfileEdit}
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
                            <span className="font-mono text-[#C2507A] truncate ml-2">{artistProfile.instagramUrl || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="text-white/60">YouTube</span>
                            <span className="font-mono text-[#C2507A] truncate ml-2">{artistProfile.youtubeUrl || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="text-white/60">Twitter/X</span>
                            <span className="font-mono text-[#C2507A] truncate ml-2">{artistProfile.twitterUrl || '-'}</span>
                          </div>
                          {artistProfile.officialUrl && (
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                              <span className="text-white/60">Official</span>
                              <span className="font-mono text-[#C2507A] truncate ml-2">{artistProfile.officialUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-8 rounded-[32px] border border-[#EDE8E2] shadow-sm">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F7F3EE]">
                          <h4 className="text-xl font-black">멤버 리스트 <span className="text-[#C2507A] ml-1">{artistMembers.length}</span></h4>
                          <button onClick={() => setEditingMemberForm({ memberName: '', profileImageUrl: '' })} className="text-[#C2507A] font-black text-xs uppercase tracking-widest hover:underline">+ ADD NEW MEMBER</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {artistMembers.map(member => (
                            <div key={member.id} className="flex items-center gap-4 p-5 bg-[#F7F3EE] rounded-2xl group hover:bg-white border border-transparent hover:border-[#C2507A] transition-all">
                              {member.profileImageUrl
                                ? <img src={member.profileImageUrl} alt="" className="w-16 h-16 rounded-[20px] object-cover border-2 border-white shadow-md shrink-0" />
                                : <div className="w-16 h-16 rounded-[20px] bg-[#EDE8E2] flex items-center justify-center shrink-0"><UserCircle className="w-8 h-8 text-[#ccc]" /></div>
                              }
                              <div className="flex-1 min-w-0">
                                <div className="font-black text-[#111] truncate">{member.memberName}</div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => setEditingMemberForm({ id: member.id, memberName: member.memberName, profileImageUrl: member.profileImageUrl ?? '' })} className="p-2 hover:bg-[#F7F3EE] rounded-lg text-[#888] hover:text-[#C2507A] transition-colors"><PenTool size={14} /></button>
                                <button onClick={() => handleMemberDelete(member.id)} className="p-2 hover:bg-[#F7F3EE] rounded-lg text-[#888] hover:text-red-500 transition-colors"><X size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-dashed border-[#EDE8E2]">
                        <p className="text-xs font-bold text-[#A0958C] leading-relaxed">
                          💡 <span className="text-[#111]">Tip:</span> 멤버 카드의 수정·삭제 버튼으로 정보를 관리하세요. 변경 사항은 팬 앱에 즉시 반영됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-24 text-[#888] font-bold text-sm">프로필을 불러오는 중...</div>
                )}

                {/* Profile Edit Modal */}
                {showProfileModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-xl p-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C2507A]" />
                      <h3 className="text-2xl font-black mb-8 text-[#111]">아티스트 프로필 수정</h3>
                      <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                        <div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">소개글 (Bio)</label>
                          <textarea className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-medium h-24 resize-none" value={profileEditForm.bio} onChange={e => setProfileEditForm({ ...profileEditForm, bio: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">Instagram URL</label>
                            <input type="text" className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-mono text-sm" value={profileEditForm.instagramUrl} onChange={e => setProfileEditForm({ ...profileEditForm, instagramUrl: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">YouTube URL</label>
                            <input type="text" className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-mono text-sm" value={profileEditForm.youtubeUrl} onChange={e => setProfileEditForm({ ...profileEditForm, youtubeUrl: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">Twitter/X URL</label>
                            <input type="text" className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-mono text-sm" value={profileEditForm.twitterUrl} onChange={e => setProfileEditForm({ ...profileEditForm, twitterUrl: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">Official Site URL</label>
                            <input type="text" className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-mono text-sm" value={profileEditForm.officialUrl} onChange={e => setProfileEditForm({ ...profileEditForm, officialUrl: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-10">
                        <button className="flex-1 bg-[#F7F3EE] text-[#111] py-4 rounded-2xl font-black text-sm" onClick={() => setShowProfileModal(false)}>취소</button>
                        <button className="flex-1 bg-[#C2507A] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-pink-100" onClick={handleProfileSave}>저장하기</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Edit Modal */}
                {editingMemberForm && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-10 shadow-2xl relative">
                      <h3 className="text-2xl font-black mb-6 text-[#111]">{editingMemberForm.id ? '멤버 정보 수정' : '멤버 추가'}</h3>
                      <div className="flex justify-center mb-6">
                        <label className="cursor-pointer">
                          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-[#F7F3EE] relative group bg-[#EDE8E2] flex items-center justify-center">
                            {editingMemberForm.profileImageUrl
                              ? <img src={editingMemberForm.profileImageUrl} alt="" className="w-full h-full object-cover" />
                              : <Upload size={24} className="text-[#aaa]" />
                            }
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white font-bold text-[10px]">사진 변경</span>
                            </div>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setEditingMemberForm(prev => prev ? { ...prev, _file: f, profileImageUrl: URL.createObjectURL(f) } : null);
                            e.target.value = '';
                          }} />
                        </label>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">멤버 이름</label>
                        <input type="text" className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-black" value={editingMemberForm.memberName} onChange={e => setEditingMemberForm(prev => prev ? { ...prev, memberName: e.target.value } : null)} />
                      </div>
                      <div className="flex gap-3 mt-8">
                        <button className="flex-1 bg-[#F7F3EE] text-[#111] py-4 rounded-2xl font-black text-sm" onClick={() => setEditingMemberForm(null)}>취소</button>
                        <button className="flex-1 bg-[#C2507A] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-pink-100" onClick={handleMemberSave}>반영하기</button>
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
                                try { await updateAgencyBanner(banner.id, { exposureOrder: Number(ord) }); setBanners(await getAgencyBanners()); } catch { showToast('순서 변경에 실패했습니다.', 'error'); }
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
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                       <div>
                          <h3 className="text-xl font-black mb-1">Goods Voting Management</h3>
                          <p className="text-xs text-[#888] font-bold">팬들이 직접 결정하는 차기 굿즈 출시 투표 제어</p>
                       </div>
                       <div className="flex items-center gap-3">
                         {artistSelect}
                         <button onClick={() => setShowVoteModal(true)} className="bg-[#C2507A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-pink-100">새 투표 생성</button>
                       </div>
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
                                 if (!agencyArtistId) { showToast('아티스트를 먼저 선택해주세요.', 'error'); return; }
                                 if (!title || !end) {
                                   showToast('제목과 종료 기한을 입력해주세요.', 'error');
                                   return;
                                 }
                                 if (voteOptions.some(o => !o.label.trim())) {
                                    showToast('모든 옵션의 라벨을 입력해주세요.', 'error');
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
                                   showToast('투표가 등록되었습니다!');
                                 } catch {
                                   showToast('투표 등록에 실패했습니다.', 'error');
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
                        const isClosed = !vote.active;
                        return (
                          <div
                            key={vote.id}
                            onClick={() => setSelectedVote(vote)}
                            className={`p-6 rounded-3xl border border-transparent hover:border-[#C2507A] transition-all group cursor-pointer ${
                              isClosed ? 'bg-gray-100 opacity-60 grayscale' : 'bg-[#F7F3EE]'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                               <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${vote.active ? 'bg-[#C2507A] text-white' : 'bg-gray-400 text-white'}`}>
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
                            <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => setSelectedVote(vote)}
                                  className="flex-1 bg-white py-3 rounded-2xl font-black text-[11px] hover:bg-[#F7F3EE] transition-all shadow-sm"
                                >
                                  투표 결과 보기
                                </button>
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
                 <div className="p-8 border-b border-[#EDE8E2] bg-[#FAF8F5] flex justify-between items-center flex-wrap gap-4">
                    <div>
                       <h3 className="text-xl font-black italic mb-1 uppercase tracking-tighter">Inventory Detailed History</h3>
                       <p className="text-xs text-[#888] font-bold">재고 변경 이력 조회 (읽기 전용)</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                       {artistSelect}
                       <select
                         value={inventoryProductFilter}
                         onChange={e => setInventoryProductFilter(e.target.value === '' ? '' : Number(e.target.value))}
                         className="bg-white border border-[#ede8e2] px-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:border-[#C2507A]"
                       >
                         <option value="">전체 상품</option>
                         {productList.map(p => (
                           <option key={p.id} value={p.id}>{p.name}</option>
                         ))}
                       </select>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-[#F7F3EE] text-[#888] text-[11px] uppercase tracking-[2px] font-black">
                             <th className="px-8 py-4">유형</th>
                             <th className="px-8 py-4">상품명</th>
                             <th className="px-8 py-4">변동</th>
                             <th className="px-8 py-4">변경 전</th>
                             <th className="px-8 py-4">변경 후</th>
                             <th className="px-8 py-4">참조</th>
                             <th className="px-8 py-4 text-right">일시</th>
                          </tr>
                       </thead>
                       <tbody>
                          {inventoryHistory.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-8 py-8 text-center text-sm text-[#888]">재고 이력이 없습니다.</td>
                            </tr>
                          ) : inventoryHistory.map(row => {
                            const typeStyle: Record<string, { color: string; bg: string }> = {
                              RELEASE:    { color: 'text-blue-500',   bg: 'bg-blue-50' },
                              RESERVE:    { color: 'text-amber-500',  bg: 'bg-amber-50' },
                              COMPENSATE: { color: 'text-purple-500', bg: 'bg-purple-50' },
                              INCREASE:   { color: 'text-green-600',  bg: 'bg-green-50' },
                              DECREASE:   { color: 'text-red-500',    bg: 'bg-red-50' },
                            };
                            const { color, bg } = typeStyle[row.changeType] ?? { color: 'text-gray-500', bg: 'bg-gray-50' };
                            const TypeIcon = row.deltaQty >= 0 ? ArrowUpRight : ArrowDownRight;
                            const refLabel = row.refType === 'ORDER' && row.referenceId ? `Order #${row.referenceId}` : row.refType;
                            const typeLabel = INV_CHANGE_LABELS[row.changeType] ?? row.changeType;
                            return (
                            <tr key={row.historyId} className="border-b border-[#F7F3EE] hover:bg-[#fafafa] transition-colors group">
                               <td className="px-8 py-5">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] ${bg} ${color}`}>
                                     <TypeIcon size={12} />
                                     {typeLabel}
                                  </div>
                               </td>
                               <td className="px-8 py-5">
                                  <div className="font-bold text-sm text-[#111]">{row.productName}</div>
                               </td>
                               <td className="px-8 py-5">
                                  <span className={`font-mono font-black text-sm ${row.deltaQty < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                     {row.deltaQty > 0 ? '+' : ''}{row.deltaQty}
                                  </span>
                               </td>
                               <td className="px-8 py-5 text-sm font-mono text-[#888]">{row.qtyBefore}</td>
                               <td className="px-8 py-5 text-sm font-mono text-[#111]">{row.qtyAfter}</td>
                               <td className="px-8 py-5 text-sm font-medium text-[#555]">{refLabel}</td>
                               <td className="px-8 py-5 text-right text-xs font-mono text-[#888]">{new Date(row.changedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                            </tr>
                          );
                          })}
                       </tbody>
                    </table>
                 </div>
                 {inventoryHasMore && (
                   <div className="p-6 text-center border-t border-[#EDE8E2]">
                     <button
                       onClick={() => inventoryCursor && loadInventory(inventoryCursor, true)}
                       className="text-sm font-bold text-[#C2507A] hover:underline"
                     >
                       더 보기
                     </button>
                   </div>
                 )}
              </div>
            )}

            {activeMenu === 'calendar' && (
              <div className="bg-white p-8 rounded-[32px] border border-[#EDE8E2] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">예정된 스케줄 (Upcoming Schedule)</h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={agencyArtistId ?? ''}
                      onChange={e => setAgencyArtistId(Number(e.target.value))}
                      className="bg-[#F7F3EE] border border-[#ede8e2] px-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:border-[#C2507A]"
                    >
                      {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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
                          if (!agencyArtistId || !eventForm.title.trim() || !eventForm.date || !eventForm.time) { showToast('모든 필드를 입력해주세요.', 'error'); return; }
                          try {
                            await createEvent(agencyArtistId, eventForm.title.trim(), eventForm.type, `${eventForm.date}T${eventForm.time}:00+09:00`);
                            setShowEventModal(false);
                            setEventForm({ title: '', type: 'EVENT', date: '', time: '' });
                            getCalendar(agencyArtistId).then(res => setAgencySchedules(res.events)).catch(() => {});
                            showToast('일정이 등록되었습니다.');
                          } catch { showToast('일정 등록에 실패했습니다.', 'error'); }
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
                          if (!agencyArtistId || !liveForm.title.trim() || !liveForm.date || !liveForm.time || !liveForm.liveUrl.trim()) { showToast('모든 필드를 입력해주세요.', 'error'); return; }
                          if (!/^https:\/\/www\.youtube\.com\/embed\/[^/?#]+$/.test(liveForm.liveUrl.trim())) { showToast('YouTube 임베드 URL 형식이 올바르지 않습니다. (예: https://www.youtube.com/embed/VIDEO_ID)', 'error'); return; }
                          try {
                            await registerLive(agencyArtistId, liveForm.title.trim(), `${liveForm.date}T${liveForm.time}:00+09:00`, liveForm.liveUrl.trim());
                            setShowLiveModal(false);
                            setLiveForm({ title: '', date: '', time: '', liveUrl: '' });
                            getCalendar(agencyArtistId).then(res => setAgencySchedules(res.events)).catch(() => {});
                            showToast('라이브가 등록되었습니다.');
                          } catch { showToast('라이브 등록에 실패했습니다.', 'error'); }
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
                        <div
                          key={s.id}
                          className={`flex items-center gap-6 p-4 rounded-xl border border-[#EDE8E2] hover:bg-[#F7F3EE] transition-colors ${s.type === 'NOTICE' ? 'cursor-pointer' : ''}`}
                          onClick={() => { if (s.type === 'NOTICE') openNoticeDetail(s.id); }}
                        >
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
                                  if (agencyArtistId) getCalendar(agencyArtistId).then(res => setAgencySchedules(res.events)).catch(() => {});
                                  showToast('라이브가 시작되었습니다!');
                                } catch { showToast('라이브 시작에 실패했습니다.', 'error'); }
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
                  <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <h3 className="text-xl font-black">공지사항 관리 (Manage Notices)</h3>
                    <div className="flex items-center gap-3">
                      {artistSelect}
                      <button className="bg-[#C2507A] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-pink-100" onClick={() => setShowNoticeModal(true)}>+ 공지 작성</button>
                    </div>
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
                    {notices.length === 0 && (
                      <p className="text-center py-12 text-[#888] font-bold">등록된 공지가 없습니다.</p>
                    )}
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        onClick={() => openNoticeDetail(notice.id)}
                        className="flex items-center gap-6 p-5 rounded-xl border border-[#EDE8E2] hover:border-[#C2507A] transition-all cursor-pointer"
                      >
                         <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#F7F3EE] text-[#C2507A]">{notice.type}</span>
                               <span className="text-xs font-medium text-[#888]">{notice.scheduledAt ? fmtSchedule(notice.scheduledAt).date : ''}</span>
                            </div>
                            <div className="font-bold text-[#111]">{notice.title}</div>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             {activeMenu === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                   <h3 className="text-xl font-black">상품 및 드롭 관리 (Manage Drops)</h3>
                   <div className="flex items-center gap-3">
                     {artistSelect}
                     <button className="bg-[#C2507A] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-pink-100" onClick={() => setShowProductModal(true)}>+ 새 상품 생성</button>
                   </div>
                 </div>

                 {showProductModal && (
                   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                       <h3 className="text-xl font-bold mb-4">새 상품 / 드롭 추가</h3>
                       <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-[#888] mb-2 flex justify-between items-center">
                              <span>상품 이미지 (최대 5장)</span>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">저장 API 준비 중</span>
                            </label>
                            <label className="cursor-pointer">
                              <div className="w-full h-24 border-2 border-dashed border-[#ede8e2] rounded-xl flex flex-col items-center justify-center text-[#888] bg-[#F7F3EE] hover:border-[#C2507A] hover:text-[#C2507A] transition-colors">
                                <Upload size={20} className="mb-1" />
                                <span className="text-xs font-bold">클릭하여 이미지 선택 (미리보기만, 최대 5장)</span>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files ?? []).slice(0, 5);
                                  const readers = files.map(file => new Promise<string>((resolve) => {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => resolve(ev.target?.result as string);
                                    reader.readAsDataURL(file);
                                  }));
                                  Promise.all(readers).then(urls => setProductImagePreviews(urls));
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            {productImagePreviews.length > 0 && (
                              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                {productImagePreviews.map((src, idx) => (
                                  <div key={idx} className="w-16 h-16 rounded-lg border border-[#ede8e2] overflow-hidden shrink-0 relative group">
                                    {idx === 0 && (
                                      <div className="absolute top-1 left-1 bg-[#C2507A] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm z-10">대표</div>
                                    )}
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => setProductImagePreviews(prev => prev.filter((_, i) => i !== idx))}
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-[10px] text-[#888] mt-2">미리보기만 가능합니다. 성빈님 BE 이미지 API 연동 후 실제 저장됩니다.</p>
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
                           <label htmlFor="hot-deal" className="text-sm font-bold text-[#111] cursor-pointer">드롭스 판매 (Drops)</label>
                         </div>
                         <div className="text-xs text-[#888] ml-6 mb-4">트래픽 급증 시 사용자들은 대기열에 진입하게 됩니다.</div>
                         {productForm.isDrops && (
                           <div className="grid grid-cols-2 gap-4 ml-6">
                             <div>
                               <label className="block text-sm font-bold text-[#888] mb-1">드롭스 시작 일시</label>
                               <input type="datetime-local" value={productForm.dropsStartAt} onChange={e => setProductForm({...productForm, dropsStartAt: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                             </div>
                             <div>
                               <label className="block text-sm font-bold text-[#888] mb-1">드롭스 종료 일시</label>
                               <input type="datetime-local" value={productForm.dropsEndAt} onChange={e => setProductForm({...productForm, dropsEndAt: e.target.value})} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                             </div>
                           </div>
                         )}
                       </div>
                       <div className="flex gap-2 mt-6">
                         <button className="flex-1 bg-[#F7F3EE] text-[#111] py-3 rounded-xl font-bold" onClick={() => { setShowProductModal(false); setProductImagePreviews([]); }}>취소</button>
                         <button className="flex-1 bg-[#C2507A] text-white py-3 rounded-xl font-bold" onClick={async () => {
                           if (!agencyArtistId || !productForm.name.trim() || !productForm.price || !productForm.totalQty) {
                             showToast('상품명, 가격, 재고를 모두 입력해주세요.', 'error');
                             return;
                           }
                           try {
                             const req: CreateProductRequest = {
                               artistId: agencyArtistId,
                               name: productForm.name.trim(),
                               price: Number(productForm.price),
                               totalQty: Number(productForm.totalQty),
                               type: productForm.isDrops ? 'drops' : 'regular',
                               ...(productForm.isDrops && productForm.dropsStartAt ? { dropsStartAt: `${productForm.dropsStartAt}:00` } : {}),
                               ...(productForm.isDrops && productForm.dropsEndAt ? { dropsEndAt: `${productForm.dropsEndAt}:00` } : {}),
                             };
                             await createProduct(req);
                             await refreshProductList();
                             setShowProductModal(false);
                             setProductForm({ name: '', price: '', totalQty: '', isDrops: false, dropsStartAt: '', dropsEndAt: '' });
                             setProductImagePreviews([]);
                             showToast('상품이 등록되었습니다.');
                           } catch {
                             showToast('상품 등록에 실패했습니다.', 'error');
                           }
                         }}>등록하기</button>
                       </div>
                     </div>
                   </div>
                 )}

                 {productList.length === 0 && (
                   <p className="text-center py-12 text-[#888] font-bold">등록된 상품이 없습니다.</p>
                 )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {productList.map((item) => (
                     <div
                       key={item.id}
                       onClick={() => openProductDetail(item)}
                       className="bg-white rounded-2xl border border-[#EDE8E2] p-6 flex gap-4 items-center cursor-pointer hover:border-[#111] transition-colors"
                     >
                       <div className="w-20 h-20 bg-[#F7F3EE] rounded-xl flex items-center justify-center shrink-0">
                         <Package className="text-[#ccc] w-8 h-8" />
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm max-w-[150px] truncate">{item.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.status === 'ON_SALE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{item.status}</span>
                         </div>
                         <div className="text-sm text-[#888] font-mono mb-1">₩{(item.price ?? 0).toLocaleString()}</div>
                         <div className="text-xs font-bold text-[#111]">총 재고: {(item.totalQty ?? 0).toLocaleString()} / 판매 가능: {(item.availableQty ?? 0).toLocaleString()}</div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {activeMenu === 'orders' && (
              <div className="bg-white rounded-[32px] border border-[#EDE8E2] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#EDE8E2] flex justify-between items-center bg-[#FAF8F5] flex-wrap gap-4">
                  <h3 className="text-lg font-black italic">RECENT ORDERS</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {artistSelect}
                    <input
                      type="text"
                      placeholder="주문번호 검색"
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      className="bg-white border border-[#ede8e2] px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-[#C2507A]"
                    />
                    <select
                      value={orderStatusFilter}
                      onChange={e => setOrderStatusFilter(e.target.value)}
                      className="bg-white border border-[#ede8e2] px-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:border-[#C2507A]"
                    >
                      <option value="">전체 상태</option>
                      <option value="PAID">PAID</option>
                      <option value="RESERVED">RESERVED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F7F3EE] text-[#888] text-xs uppercase tracking-wider">
                      <th className="p-4 font-medium">주문 번호 (Order ID)</th>
                      <th className="p-4 font-medium">상품 (Product)</th>
                      <th className="p-4 font-medium">결제 금액</th>
                      <th className="p-4 font-medium">날짜 (Date)</th>
                      <th className="p-4 font-medium">상태 (Status)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencyOrders
                      .filter(order => !orderStatusFilter || order.status === orderStatusFilter)
                      .filter(order => !orderSearch || String(order.orderId).includes(orderSearch))
                      .length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-sm text-[#888]">주문 내역이 없습니다.</td>
                      </tr>
                    ) : agencyOrders
                      .filter(order => !orderStatusFilter || order.status === orderStatusFilter)
                      .filter(order => !orderSearch || String(order.orderId).includes(orderSearch))
                      .map(order => (
                      <tr key={order.orderId} className="border-b border-[#EDE8E2] last:border-0 hover:bg-[#fafafa]">
                        <td className="p-4 text-sm font-mono font-bold text-[#111]">#{order.orderId}</td>
                        <td className="p-4 text-sm text-[#333]">
                          <div className="font-medium">{order.productSummary}</div>
                          <div className="text-xs text-[#888]">{order.artistName}</div>
                        </td>
                        <td className="p-4 text-sm font-mono font-bold text-[#111]">₩{(order.totalAmount ?? 0).toLocaleString()}</td>
                        <td className="p-4 text-sm text-[#888]">{new Date(order.createdAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-4 text-sm">
                          <span className="font-bold text-xs px-2 py-1 bg-gray-100 rounded">{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ordersHasMore && (
                  <div className="p-6 text-center border-t border-[#EDE8E2]">
                    <button
                      onClick={() => ordersCursor && loadOrders(ordersCursor, true)}
                      className="text-sm font-bold text-[#C2507A] hover:underline"
                    >
                      더 보기
                    </button>
                  </div>
                )}
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

    {selectedNoticeDetail && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-6" onClick={() => setSelectedNoticeDetail(null)}>
        <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black px-2 py-1 rounded bg-[#F7F3EE] text-[#C2507A]">{selectedNoticeDetail.type}</span>
            <button onClick={() => setSelectedNoticeDetail(null)} className="p-2 hover:bg-[#F7F3EE] rounded-lg"><X size={18} /></button>
          </div>
          <h2 className="text-2xl font-black mb-2">{selectedNoticeDetail.title}</h2>
          <p className="text-xs text-[#888] mb-6">{fmtNoticeDate(selectedNoticeDetail.scheduledAt)}</p>
          {selectedNoticeDetail.imageUrls?.length > 0 && (
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {selectedNoticeDetail.imageUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="h-32 rounded-xl object-cover" />
              ))}
            </div>
          )}
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-[#333] leading-relaxed">{selectedNoticeDetail.content || '내용이 없습니다.'}</p>
          </div>
        </div>
      </div>
    )}

    {selectedVote && (() => {
      const total = selectedVote.options.reduce((s, o) => s + o.voteCount, 0);
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-6" onClick={() => setSelectedVote(null)}>
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${selectedVote.active ? 'bg-[#C2507A] text-white' : 'bg-gray-400 text-white'}`}>
                {selectedVote.active ? 'ONGOING' : 'CLOSED'}
              </span>
              <button onClick={() => setSelectedVote(null)} className="p-2 hover:bg-[#F7F3EE] rounded-lg"><X size={18} /></button>
            </div>
            <h2 className="text-xl font-black mb-2">{selectedVote.title}</h2>
            <p className="text-xs text-[#888] mb-6">종료: {selectedVote.endsAt?.slice(0, 10) ?? '-'} · 총 {total.toLocaleString()}표</p>
            <div className="space-y-4 mb-8">
              {selectedVote.options.map(opt => {
                const pct = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0;
                return (
                  <div key={opt.id}>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span>{opt.label}</span>
                      <span className="text-[#C2507A]">{opt.voteCount.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[#F7F3EE] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C2507A] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              {selectedVote.active && (
                <button
                  disabled
                  title="백엔드 API 준비 중"
                  className="flex-1 bg-red-500/50 text-white py-3 rounded-xl font-bold text-sm cursor-not-allowed"
                >
                  투표 강제 종료
                </button>
              )}
              <button onClick={() => setSelectedVote(null)} className="flex-1 bg-[#F7F3EE] text-[#111] py-3 rounded-xl font-bold text-sm">닫기</button>
            </div>
          </div>
        </div>
      );
    })()}

    {selectedProduct && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-6" onClick={() => { setSelectedProduct(null); setShowRestockModal(false); }}>
        <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <span className={`text-[10px] font-bold px-2 py-1 rounded ${selectedProduct.status === 'ON_SALE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {selectedProduct.status}
            </span>
            <button onClick={() => { setSelectedProduct(null); setShowRestockModal(false); }} className="p-2 hover:bg-[#F7F3EE] rounded-lg"><X size={18} /></button>
          </div>
          {!showRestockModal ? (
            <>
              <h2 className="text-xl font-black mb-4">상품 상세</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-black text-[#888] uppercase mb-1">상품명</label>
                  <input type="text" value={productEditForm.name} onChange={e => setProductEditForm({ ...productEditForm, name: e.target.value })} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#888] uppercase mb-1">가격 (KRW)</label>
                  <input type="number" value={productEditForm.price} onChange={e => setProductEditForm({ ...productEditForm, price: e.target.value })} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-[#F7F3EE] p-3 rounded-xl">
                    <div className="text-[10px] text-[#888] font-bold">총 재고</div>
                    <div className="font-black">{selectedProduct.totalQty}</div>
                  </div>
                  <div className="bg-[#F7F3EE] p-3 rounded-xl">
                    <div className="text-[10px] text-[#888] font-bold">예약</div>
                    <div className="font-black">{selectedProduct.reservedQty}</div>
                  </div>
                  <div className="bg-[#F7F3EE] p-3 rounded-xl">
                    <div className="text-[10px] text-[#888] font-bold">가용</div>
                    <div className="font-black text-[#C2507A]">{selectedProduct.availableQty}</div>
                  </div>
                </div>
                {(selectedProduct.dropsStartAt || selectedProduct.dropsEndAt) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-[#888] uppercase mb-1">드롭 시작</label>
                      <input type="datetime-local" value={productEditForm.dropsStartAt} onChange={e => setProductEditForm({ ...productEditForm, dropsStartAt: e.target.value })} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-3 py-2 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#888] uppercase mb-1">드롭 종료</label>
                      <input type="datetime-local" value={productEditForm.dropsEndAt} onChange={e => setProductEditForm({ ...productEditForm, dropsEndAt: e.target.value })} className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-3 py-2 rounded-xl text-sm" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="w-full bg-[#C2507A] text-white py-3 rounded-xl font-bold text-sm"
                  onClick={async () => {
                    try {
                      await updateProduct(selectedProduct.id, {
                        name: productEditForm.name.trim(),
                        price: Number(productEditForm.price),
                        ...(productEditForm.dropsStartAt ? { dropsStartAt: `${productEditForm.dropsStartAt}:00` } : {}),
                        ...(productEditForm.dropsEndAt ? { dropsEndAt: `${productEditForm.dropsEndAt}:00` } : {}),
                      });
                      await refreshProductList();
                      const updated = await getProduct(selectedProduct.id);
                      setSelectedProduct(updated);
                      showToast('상품이 수정되었습니다.');
                    } catch {
                      showToast('상품 수정에 실패했습니다.', 'error');
                    }
                  }}
                >
                  수정 저장
                </button>
                {selectedProduct.status === 'ON_SALE' && (
                  <button
                    className="w-full bg-orange-100 text-orange-700 py-3 rounded-xl font-bold text-sm"
                    onClick={async () => {
                      if (!window.confirm('이 상품을 품절 처리하시겠습니까?')) return;
                      try {
                        await updateProduct(selectedProduct.id, { status: 'SOLD_OUT' });
                        await refreshProductList();
                        setSelectedProduct(null);
                        showToast('품절 처리되었습니다.');
                      } catch {
                        showToast('품절 처리에 실패했습니다.', 'error');
                      }
                    }}
                  >
                    품절 처리
                  </button>
                )}
                <button
                  className="w-full bg-[#F7F3EE] text-[#111] py-3 rounded-xl font-bold text-sm"
                  onClick={() => { setRestockQty(''); setShowRestockModal(true); }}
                >
                  재입고
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black mb-4">재입고</h2>
              <input
                type="number"
                min={1}
                placeholder="입고 수량"
                value={restockQty}
                onChange={e => setRestockQty(e.target.value)}
                className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-3 rounded-xl mb-4 focus:outline-none focus:border-[#C2507A]"
              />
              <div className="flex gap-2">
                <button className="flex-1 bg-[#F7F3EE] py-3 rounded-xl font-bold" onClick={() => setShowRestockModal(false)}>취소</button>
                <button
                  className="flex-1 bg-[#C2507A] text-white py-3 rounded-xl font-bold"
                  onClick={async () => {
                    const qty = Number(restockQty);
                    if (!qty || qty < 1) { showToast('수량을 입력해주세요.', 'error'); return; }
                    try {
                      await restockProduct(selectedProduct.id, qty);
                      await refreshProductList();
                      const updated = await getProduct(selectedProduct.id);
                      setSelectedProduct(updated);
                      setShowRestockModal(false);
                      showToast('재입고가 완료되었습니다.');
                    } catch {
                      showToast('재입고에 실패했습니다.', 'error');
                    }
                  }}
                >
                  입고하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    {toast && (
      <div role="alert" className={`fixed bottom-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold flex items-center gap-3 transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#111]'}`}>
        <span>{toast.type === 'error' ? '✕' : '✓'}</span>
        {toast.msg}
      </div>
    )}

    {confirmDelete !== null && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
          <h3 className="text-lg font-black mb-2">배너를 삭제하시겠습니까?</h3>
          <p className="text-sm text-[#888] mb-6">삭제 후에는 복구할 수 없습니다.</p>
          <div className="flex gap-3">
            <button className="flex-1 bg-[#F7F3EE] text-[#111] py-3 rounded-xl font-bold" onClick={() => setConfirmDelete(null)}>취소</button>
            <button className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold" onClick={() => doDeleteBanner(confirmDelete)}>삭제</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
