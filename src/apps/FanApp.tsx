import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logout } from '../api/auth';
import { ROLE_KEY } from '../App';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Search, Calendar, Heart, Share2, Filter, Image as ImageIcon, Smile, MoreHorizontal, MessageSquare, Bell, Pin, Play, Youtube, ChevronLeft, ChevronRight, X, User, ShoppingBag, LogOut, Ticket, Settings, ThumbsUp, CheckCircle2, Gift } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import { useQueue } from '../hooks/useQueue';
import { getProducts, subscribeRestock, unsubscribeRestock } from '../api/products';
import type { ProductResponse } from '../types/product';
import { getMainBanners } from '../api/banners';
import type { BannerResponse } from '../types/banner';
import { getCart, addCartItem, updateCartItem, removeCartItem } from '../api/cart';
import type { CartItemResponse } from '../types/cart';
import { getFeeds, createFeed, createComment, likeFeed, unlikeFeed, followArtist, unfollowArtist, getJoinedArtists } from '../api/community';
import type { FeedResponse } from '../types/feed';
import { getCalendar } from '../api/schedule';
import type { ScheduleResult } from '../types/schedule';
import { getVotes, castBallot } from '../api/votes';
import type { GoodsVoteResult } from '../types/vote';
import { getAttendanceEvents, checkIn } from '../api/attendance';
import type { AttendanceEventResult } from '../types/attendance';
import { getNotifications, markAsRead } from '../api/notifications';
import type { NotificationResult } from '../types/notification';
import { getMyProfile, updateMyProfile, getMyActivities } from '../api/fan';
import type { FanResult, ActivityItem } from '../types/fan';
import { getMyOrders, cancelOrder } from '../api/orders';
import type { OrderListItem } from '../types/order';

const SORT_OPTIONS = ['낮은가격순', '높은가격순'];

function getSortedItems(items: ProductResponse[], sortKey: string) {
  return [...items].sort((a, b) => {
    if (sortKey === '낮은가격순') return a.price - b.price;
    if (sortKey === '높은가격순') return b.price - a.price;
    return 0;
  });
}



function artistGradient(id: number): string {
  const gradients = [
    'linear-gradient(135deg, #FF9A9E, #FECFEF)',
    'linear-gradient(135deg, #fccb90, #d57eeb)',
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
    'linear-gradient(135deg, #f6d365, #fda085)',
  ]
  return gradients[id % gradients.length]
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

function scheduleDateTime(iso: string): { date: string; time: string; fullDate: string } {
  const kst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000)
  return {
    date: String(kst.getUTCDate()).padStart(2, '0'),
    time: `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')} KST`,
    fullDate: `${kst.getUTCFullYear()}.${String(kst.getUTCMonth() + 1).padStart(2, '0')}.${String(kst.getUTCDate()).padStart(2, '0')}`,
  }
}

function groupSchedulesByMonth(events: ScheduleResult[]): [string, ScheduleResult[]][] {
  const sorted = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  const map = new Map<string, ScheduleResult[]>()
  for (const e of sorted) {
    const kst = new Date(new Date(e.startTime).getTime() + 9 * 60 * 60 * 1000)
    const key = `${kst.getUTCFullYear()}.${String(kst.getUTCMonth() + 1).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return Array.from(map.entries())
}

const TAB_TO_URL: Record<string, string> = {
  'HOME': 'home', 'ARTISTS': 'artists', 'STORE': 'store',
  'WORKSPACE': 'workspace', 'MY PAGE': 'my-page', 'NOTIFICATIONS': 'notifications',
};
const TAB_FROM_URL: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_URL).map(([k, v]) => [v, k])
);
const TRANSIENT_TABS = new Set(['CHECKOUT', 'QUEUE_WAIT', 'ORDER_COMPLETE']);

export default function App({ role = 'FAN' }: { role?: string }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [favoriteArtists, setFavoriteArtists] = useState<{ id: number; name: string; bg: string }[]>([
    { id: 1, name: 'NOVA', bg: 'linear-gradient(135deg, #FF9A9E, #FECFEF)' },
    { id: 2, name: 'LUNA', bg: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
    { id: 3, name: 'ECHO', bg: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
  ]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [boardTab, setBoardTab] = useState<string>(() => {
    const b = searchParams.get('board');
    return b ? b.toUpperCase() : 'FEED';
  });
  const [postInput, setPostInput] = useState('');
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [commentsMap, setCommentsMap] = useState<{[key: string]: any[]}>({});

  const handleCommentSubmit = async (postId: number) => {
    const key = String(postId);
    const content = commentInputs[key];
    if (!content?.trim() || !selectedArtist) return;

    const tempComment = {
      id: crypto.randomUUID(),
      author: role === 'ARTIST' ? selectedArtist.name : 'Me',
      content: content.trim(),
      time: '방금 전',
    };

    setCommentsMap(prev => ({ ...prev, [key]: [...(prev[key] || []), tempComment] }));
    setCommentInputs(prev => ({ ...prev, [key]: '' }));
    setFeeds(prev => prev.map(f => f.id === postId ? { ...f, commentCount: f.commentCount + 1 } : f));

    try {
      await createComment(postId, selectedArtist.id, content.trim());
    } catch {
      setCommentsMap(prev => ({
        ...prev,
        [key]: (prev[key] || []).filter((c: any) => c.id !== tempComment.id),
      }));
      setFeeds(prev => prev.map(f => f.id === postId ? { ...f, commentCount: f.commentCount - 1 } : f));
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>(() =>
    TAB_FROM_URL[searchParams.get('tab') ?? ''] ?? 'HOME'
  );
  const [isArtistAuthorized, setIsArtistAuthorized] = useState(false);
  
  const [feeds, setFeeds] = useState<FeedResponse[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(false);

  const handlePostSubmit = async () => {
    if (!postInput.trim() || !selectedArtist) return;
    const content = postInput.trim();
    setPostInput('');
    try {
      await createFeed(selectedArtist.id, content, []);
      const updated = await getFeeds(selectedArtist.id);
      setFeeds(updated.items);
    } catch (e) {
      console.error(e);
    }
  };

  const currentArtistPosts = feeds;
  const currentOfficialPosts = feeds.filter(f => f.artistMemberId != null);

  const handleLikeFeed = async (post: FeedResponse) => {
    if (!selectedArtist) return;
    const newIsLiked = !post.isLiked;
    setFeeds(prev => prev.map(f => f.id === post.id
      ? { ...f, isLiked: newIsLiked, likeCount: f.likeCount + (newIsLiked ? 1 : -1) }
      : f
    ));
    try {
      if (newIsLiked) {
        await likeFeed(post.id, selectedArtist.id);
      } else {
        await unlikeFeed(post.id);
      }
    } catch {
      setFeeds(prev => prev.map(f => f.id === post.id
        ? { ...f, isLiked: !newIsLiked, likeCount: f.likeCount + (newIsLiked ? -1 : 1) }
        : f
      ));
    }
  };

  const handleFollowToggle = async () => {
    if (!selectedArtist || role === 'ARTIST') return;
    const isFollowing = favoriteArtists.some(a => a.id === selectedArtist.id);
    if (isFollowing) {
      setFavoriteArtists(prev => prev.filter(a => a.id !== selectedArtist.id));
      try {
        await unfollowArtist(selectedArtist.id);
      } catch {
        setFavoriteArtists(prev => [...prev, selectedArtist]);
      }
    } else {
      setFavoriteArtists(prev => [...prev, selectedArtist]);
      try {
        await followArtist(selectedArtist.id);
      } catch {
        setFavoriteArtists(prev => prev.filter(a => a.id !== selectedArtist.id));
      }
    }
  };

  const [notifications, setNotifications] = useState<NotificationResult[]>([]);

  const [showArtistSearch, setShowArtistSearch] = useState(false);
  
  const {
    checkoutData, setCheckoutData,
    checkoutForm, setCheckoutForm,
    payMethod, setPayMethod,
    paymentStatus, paymentError,
    handlePay, resetCheckout,
  } = useCheckout(setActiveTab);

  const { queueState, resetQueue } = useQueue();

  // 대기열 PROCESSING 전이 시 accessTicket을 checkoutData에 담아 결제 화면으로 이동
  useEffect(() => {
    if (queueState.phase === 'PROCESSING' && queueState.accessTicket && checkoutData) {
      const ticket = queueState.accessTicket;
      setTimeout(() => {
        setCheckoutData(prev => prev ? { ...prev, accessTicket: ticket } : prev);
        setActiveTab('CHECKOUT');
      }, 0);
    }
  }, [queueState.phase, queueState.accessTicket]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select artist board if role is ARTIST
  useEffect(() => {
    if (role === 'ARTIST' && !selectedArtist && favoriteArtists.length > 0) {
      setTimeout(() => {
        setSelectedArtist(favoriteArtists[0]);
        setBoardTab('FEED');
      }, 0);
    }
  }, [role, selectedArtist, favoriteArtists]);

  const [showCart, setShowCart] = useState(false);
  const [showNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [myPageTab, setMyPageTab] = useState<string>(() => {
    const s = searchParams.get('sub');
    return s ? s.toUpperCase() : 'OVERVIEW';
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // New Filter & Sort States
  const [storeArtist, setStoreArtist] = useState('ALL');
  const [storeCategory, setStoreCategory] = useState('전체');
  const [storeSort, setStoreSort] = useState('낮은가격순');
  const [storeSearch, setStoreSearch] = useState('');
  const [storePage, setStorePage] = useState(1);
  const [isStoreSortDropdownOpen, setIsStoreSortDropdownOpen] = useState(false);
  const [storeBannerIdx, setStoreBannerIdx] = useState(0);
  const [storeItems, setStoreItems] = useState<ProductResponse[]>([]);
  const [storeNextCursor, setStoreNextCursor] = useState<string | null>(null);
  const [storeHasMore, setStoreHasMore] = useState(false);
  const [storeLoading, setStoreLoading] = useState(true);
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'STORE' || selectedProduct || banners.length === 0) return;
    const t = setInterval(() => {
      setStoreBannerIdx((i) => (i + 1) % banners.length);
    }, 4500);
    return () => clearInterval(t);
  }, [activeTab, selectedProduct, banners.length]);

  
  const [productMainImg, setProductMainImg] = useState(0);
  const [productQty, setProductQty] = useState(1);
  const [productOption, setProductOption] = useState('Version A');
  const [showOptionDropdown, setShowOptionDropdown] = useState(false);
  const [productTab, setProductTab] = useState('DETAIL'); // DETAIL | DELIVERY | REVIEW

  // Rank Game State (Removed as per user request)
  
  const [goodsVotes, setGoodsVotes] = useState<GoodsVoteResult[]>([]);
  const [hasVoted, setHasVoted] = useState<number[]>([]);
  const [collectedCards, setCollectedCards] = useState<any[]>([]);

  // Attendance Event State
  const [showAttendance, setShowAttendance] = useState(false);
  const [isAllowNotification, setIsAllowNotification] = useState(true);
  const [isNotifUpdating, setIsNotifUpdating] = useState(false);
  const [restockSubscribed, setRestockSubscribed] = useState<Set<number>>(new Set());
  const [fanProfile, setFanProfile] = useState<FanResult | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [myOrders, setMyOrders] = useState<OrderListItem[]>([]);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [showAttendanceBanner, setShowAttendanceBanner] = useState(false);
  const [attendanceStep, setAttendanceStep] = useState<'IDLE' | 'STAMPING' | 'REWARD'>('IDLE');
  const [triggeredArtists, setTriggeredArtists] = useState<number[]>([]);

  const [notices] = useState([
    { id: 'n1', tag: 'NOTICE', title: 'NOVA 2주년 기념 라이브 콘서트 상세 안내', date: '2026.05.20', type: 'NOTICE' },
    { id: 'n2', tag: 'TICKET', title: 'LUNA 팬미팅 2025 티켓 오픈 안내', date: '2026.06.15', type: 'TICKET' },
    { id: 'n3', tag: '이벤트', title: 'ECHO 특별판 포토북 출시 기념 팬사인회', date: '2026.05.10', type: 'EVENT' },
    { id: 'n4', tag: '공지', title: '공식 팬클럽 멤버십 키트 배송 지연 안내', date: '2026.05.08', type: 'NOTICE' },
  ]);

  const [schedules, setSchedules] = useState<ScheduleResult[]>([]);
  const [activeAttendanceEvent, setActiveAttendanceEvent] = useState<AttendanceEventResult | null>(null);

  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);

  // Trigger Attendance Banner when entering Artist tab (Feed is default entry)
  useEffect(() => {
    if (boardTab === 'FEED' && selectedArtist && !triggeredArtists.includes(selectedArtist.id)) {
      const timer = setTimeout(() => {
        setShowAttendanceBanner(true);
      }, 600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setShowAttendanceBanner(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [boardTab, selectedArtist, triggeredArtists]);

  useEffect(() => {
    if (!selectedArtist) return;
    const id = selectedArtist.id as number;
    getVotes(id).then(res => setGoodsVotes(res.items)).catch(() => {});
    getCalendar(id).then(res => setSchedules(res.events)).catch(() => {});
    getAttendanceEvents(id).then(evts => setActiveAttendanceEvent(evts[0] ?? null)).catch(() => {});
  }, [selectedArtist]);

  useEffect(() => {
    if (activeTab !== 'NOTIFICATIONS') return;
    getNotifications().then(setNotifications).catch(() => {});
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'MY PAGE') return;
    getMyProfile().then(p => {
      setFanProfile(p);
      setIsAllowNotification(p.allowNotification);
    }).catch(() => {});
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'MY PAGE' || myPageTab !== 'OVERVIEW') return;
    getMyActivities().then(res => setActivities(res.items)).catch(() => {});
  }, [activeTab, myPageTab]);

  useEffect(() => {
    if (activeTab !== 'MY PAGE' || myPageTab !== 'ORDERS') return;
    getMyOrders().then(res => setMyOrders(res.items)).catch(() => {});
  }, [activeTab, myPageTab]);

  // Trigger Intersection Observer again when activeTab changes
  useEffect(() => {
    // 1. Lenis Smooth Scroll Initialization
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js';
    script.onload = () => {
      // @ts-expect-error: window.Lenis is loaded at runtime via CDN
      const lenis = new window.Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        touchMultiplier: 2,
      });

      const header = document.querySelector('.floating-header');
      
      lenis.on('scroll', (e: any) => {
        if (e.scroll > 50) {
          header?.classList.add('is-scrolled');
        } else {
          header?.classList.remove('is-scrolled');
        }
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Set up reveal animation for newly mounted elements on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1, 
      rootMargin: '0px 0px -50px 0px' 
    });

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    }, 50);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [activeTab, selectedArtist, boardTab, myPageTab, storeArtist, storePage, storeSearch]);

  // 상품 목록 초기 로드
  useEffect(() => {
    getProducts('regular')
      .then(res => {
        setStoreItems(res.items ?? []);
        setStoreNextCursor(res.nextCursor ?? null);
        setStoreHasMore(res.hasMore ?? false);
      })
      .catch(console.error)
      .finally(() => setStoreLoading(false));
  }, []);

  // 메인 배너 로드
  useEffect(() => {
    getMainBanners()
      .then(setBanners)
      .catch(console.error);
  }, []);

  // 장바구니 열릴 때 항목 로드
  useEffect(() => {
    if (!showCart) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartLoading(true);
    getCart()
      .then(res => setCartItems(res.items))
      .catch(() => setCartItems([]))
      .finally(() => setCartLoading(false));
  }, [showCart]);

  // 팔로우한 아티스트 목록 로드
  useEffect(() => {
    getJoinedArtists()
      .then(res => {
        setFavoriteArtists(res.items.map(a => ({
          id: a.artistId,
          name: `Artist #${a.artistId}`,
          bg: artistGradient(a.artistId),
        })));
      })
      .catch(console.error);
  }, []);

  // URL → state: 뒤로가기/앞으로가기 시 React 상태를 URL에 맞게 동기화
  useEffect(() => {
    void (async () => {
      if (searchParams.get('mode') === 'checkout') { setActiveTab('CHECKOUT'); return; }
      const urlTab = searchParams.get('tab');
      const tab = (urlTab && TAB_FROM_URL[urlTab]) ?? 'HOME';
      if (!TRANSIENT_TABS.has(tab)) setActiveTab(tab);
      setBoardTab(searchParams.get('board')?.toUpperCase() ?? 'FEED');
      setMyPageTab(searchParams.get('sub')?.toUpperCase() ?? 'OVERVIEW');
      // 아티스트
      const artistIdParam = searchParams.get('artistId');
      if (!artistIdParam) { setSelectedArtist(null); }
      else if (favoriteArtists.length > 0) {
        const found = favoriteArtists.find(a => a.id === parseInt(artistIdParam));
        if (found) setSelectedArtist(found);
      }
      // 스토어 필터 (STORE 탭일 때만 복원)
      if (tab === 'STORE') {
        setStoreArtist(searchParams.get('storeArtist') ?? 'ALL');
        setStoreCategory(searchParams.get('category') ?? '전체');
        setStoreSort(searchParams.get('sort') ?? '낮은가격순');
        setStoreSearch(searchParams.get('q') ?? '');
      }
      // 상품 상세 (storeItems 로드 후 별도 복원)
      if (!searchParams.get('productId')) setSelectedProduct(null);
      // 공지 상세
      const noticeIdParam = searchParams.get('noticeId');
      if (!noticeIdParam) { setSelectedNotice(null); }
      else {
        const found = notices.find((n: any) => String(n.id) === noticeIdParam);
        if (found) setSelectedNotice(found);
      }
    })();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // state → URL: 사용자 탭 클릭 시 history 항목 생성 (뒤로가기 지원)
  const isTabMounted = useRef(false);
  useEffect(() => {
    if (!isTabMounted.current) { isTabMounted.current = true; return; }
    if (TRANSIENT_TABS.has(activeTab)) {
      if (activeTab === 'CHECKOUT' && selectedProduct) {
        setSearchParams({ tab: 'store', productId: String(selectedProduct.id), mode: 'checkout' }, { replace: false });
      }
      return;
    }
    const desiredUrlTab = TAB_TO_URL[activeTab] ?? 'home';
    if ((searchParams.get('tab') ?? 'home') === desiredUrlTab) return;
    const params: Record<string, string> = { tab: desiredUrlTab };
    if (selectedArtist) params.artistId = String(selectedArtist.id);
    setSearchParams(params, { replace: false });
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // state → URL: 상품/공지 상세 진입 시 history 항목 생성
  const isDetailMounted = useRef(false);
  useEffect(() => {
    if (!isDetailMounted.current) { isDetailMounted.current = true; return; }
    if (!selectedProduct && !selectedNotice) return;
    if (selectedProduct && searchParams.get('productId') === String(selectedProduct.id)) return;
    if (selectedNotice && searchParams.get('noticeId') === String(selectedNotice.id)) return;
    const params: Record<string, string> = { tab: TAB_TO_URL[activeTab] ?? 'home' };
    if (selectedArtist) params.artistId = String(selectedArtist.id);
    if (selectedArtist && boardTab !== 'FEED') params.board = boardTab.toLowerCase();
    if (selectedProduct) params.productId = String(selectedProduct.id);
    if (selectedNotice) params.noticeId = String(selectedNotice.id);
    setSearchParams(params, { replace: false });
  }, [selectedProduct?.id, selectedNotice?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // state → URL: 서브 상태 변경 시 replace (추가 history 항목 없음)
  useEffect(() => {
    if (TRANSIENT_TABS.has(activeTab)) return;
    const params: Record<string, string> = { tab: TAB_TO_URL[activeTab] ?? 'home' };
    if (selectedArtist) params.artistId = String(selectedArtist.id);
    if (selectedArtist && boardTab !== 'FEED') params.board = boardTab.toLowerCase();
    if (activeTab === 'MY PAGE' && myPageTab !== 'OVERVIEW') params.sub = myPageTab.toLowerCase();
    if (selectedProduct) params.productId = String(selectedProduct.id);
    if (selectedNotice) params.noticeId = String(selectedNotice.id);
    if (activeTab === 'STORE') {
      if (storeArtist !== 'ALL') params.storeArtist = storeArtist;
      if (storeCategory !== '전체') params.category = storeCategory;
      if (storeSort !== '낮은가격순') params.sort = storeSort;
      if (storeSearch) params.q = storeSearch;
    }
    setSearchParams(params, { replace: true });
  }, [boardTab, myPageTab, selectedArtist?.id, storeArtist, storeCategory, storeSort, storeSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // 새로고침 후 favoriteArtists 로드 완료 시 URL의 artistId 복원
  useEffect(() => {
    if (favoriteArtists.length === 0 || selectedArtist) return;
    const artistIdParam = searchParams.get('artistId');
    if (!artistIdParam) return;
    const found = favoriteArtists.find(a => a.id === parseInt(artistIdParam));
    if (found) void (async () => { setSelectedArtist(found); setBoardTab(searchParams.get('board')?.toUpperCase() ?? 'FEED'); })();
  }, [favoriteArtists]); // eslint-disable-line react-hooks/exhaustive-deps

  // 새로고침 후 storeItems 로드 완료 시 URL의 productId 복원
  useEffect(() => {
    if (storeItems.length === 0 || selectedProduct) return;
    const productIdParam = searchParams.get('productId');
    if (!productIdParam) return;
    const found = storeItems.find(p => String(p.id) === productIdParam);
    if (found) void (async () => { setSelectedProduct(found); })();
  }, [storeItems]); // eslint-disable-line react-hooks/exhaustive-deps

  // 새로고침 시 mode=checkout이지만 checkoutData가 없으면 상품 상세로 복원
  useEffect(() => {
    if (activeTab === 'CHECKOUT' && !checkoutData) void (async () => { setActiveTab('STORE'); })();
  }, [activeTab, checkoutData]);

  // CHECKOUT 탈출(인앱 취소) 시 mode=checkout 파라미터 제거
  useEffect(() => {
    if (activeTab !== 'CHECKOUT' && searchParams.get('mode') === 'checkout') {
      setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('mode'); return p; }, { replace: true });
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // 선택한 아티스트 피드 로드
  useEffect(() => {
    if (!selectedArtist) return;
    void (async () => {
      setFeedsLoading(true);
      try {
        const res = await getFeeds(selectedArtist.id);
        setFeeds(res.items);
      } catch (e) {
        console.error(e);
      } finally {
        setFeedsLoading(false);
      }
    })();
  }, [selectedArtist?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (!storeNextCursor || storeLoading) return;
    setStoreLoading(true);
    getProducts('regular', storeNextCursor)
      .then(res => {
        setStoreItems(prev => [...prev, ...(res.items ?? [])]);
        setStoreNextCursor(res.nextCursor ?? null);
        setStoreHasMore(res.hasMore ?? false);
      })
      .catch(console.error)
      .finally(() => setStoreLoading(false));
  };

  if (role === 'ARTIST' && !isArtistAuthorized) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center font-sans p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-10 w-full max-w-md shadow-[0_32px_64px_rgba(0,0,0,0.08)] border border-[#EDE8E2]"
        >
          <div className="text-center mb-10">
            <div className="font-mono text-xs tracking-[4px] text-[#C2507A] font-bold mb-4 uppercase">Artist Portal</div>
            <h2 className="text-3xl font-black tracking-tight text-[#111]">Artist Login</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#888] uppercase tracking-wider ml-1">Email or ID</label>
              <input 
                type="text" 
                defaultValue="starlight_admin"
                className="w-full bg-[#F7F3EE] border border-[#EDE8E2] px-6 py-4 rounded-2xl focus:outline-none focus:border-[#C2507A] transition-all font-medium" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#888] uppercase tracking-wider ml-1">Password</label>
              <input 
                type="password" 
                defaultValue="password"
                className="w-full bg-[#F7F3EE] border border-[#EDE8E2] px-6 py-4 rounded-2xl focus:outline-none focus:border-[#C2507A] transition-all font-medium" 
              />
            </div>

            <button 
              onClick={() => {
                setIsArtistAuthorized(true);
                setActiveTab('WORKSPACE');
                if (favoriteArtists.length > 0) {
                  setSelectedArtist(favoriteArtists[0]);
                  setBoardTab('FEED');
                }
              }}
              className="w-full bg-[#111] text-white py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-4"
            >
              Artist 로그인하기
            </button>
            
            <div className="pt-6 border-t border-[#F7F3EE] text-center">
              <button 
                onClick={() => { logout(); localStorage.removeItem(ROLE_KEY); navigate('/login', { replace: true }); }}
                className="text-sm font-bold text-[#888] hover:text-[#C2507A] transition-colors"
              >
                ← Back to main
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fandrops-container" ref={containerRef}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');

        :root {
          --bg-cream: #F7F3EE;
          --bg-white: #FFFFFF;
          --point-rose: #C2507A;
          --point-violet: #7F77DD;
          --text-main: #111111;
          --text-sub: #888888;
          --border: rgba(200, 190, 180, 0.4);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          background-color: var(--bg-cream); 
          color: var(--text-main); 
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .fandrops-container::after {
          content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          pointer-events: none; z-index: 9999; opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .reveal { 
          opacity: 0; 
          transform: translateY(30px); 
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        .reveal.is-revealed { 
          opacity: 1; 
          transform: translateY(0); 
        }
        
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }

        .wrapper { max-width: 1200px; margin: 0 auto; width: 100%; padding: 0 40px; }

        .floating-header {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
          width: calc(100% - 80px); max-width: 1200px; height: 64px;
          background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 16px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; z-index: 100; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .floating-header.is-scrolled {
          background: rgba(255, 255, 255, 0.9); box-shadow: 0 12px 32px rgba(0,0,0,0.05); border-color: rgba(255, 255, 255, 1);
        }

        .logo { font-size: 16px; font-weight: 800; letter-spacing: 4px; cursor: pointer; }
        nav { display: flex; gap: 40px; }
        .n-item { font-size: 13px; font-weight: 600; color: var(--text-sub); cursor: pointer; transition: color 0.3s; position: relative; letter-spacing: 0.5px; }
        .n-item:hover, .n-item.active { color: var(--text-main); }
        .n-item.active::after { content: ''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: var(--point-rose); border-radius: 50%; }

        .h-icons { display: flex; align-items: center; gap: 24px; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #E8E0D8, #D0C6BE); border: 2px solid white; cursor: pointer; transition: transform 0.2s; }
        .avatar:hover { transform: scale(1.05); }

        .section { padding: 60px 0; }
        .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .s-title-group h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
        .s-title-group p { font-size: 14px; color: var(--text-sub); font-weight: 500; letter-spacing: 0.5px; }

        /* Community Bar */
        .community-bar { margin: 20px 0 60px; }
        .community-scroll { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px; -ms-overflow-style: none; scrollbar-width: none; }
        .community-scroll::-webkit-scrollbar { display: none; }
        
        .c-add-btn {
          width: 64px; height: 64px; border-radius: 50%; border: 2px dashed var(--border);
          background: transparent; color: var(--text-sub); display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: all 0.2s;
        }
        .c-add-btn:hover { border-color: var(--point-rose); color: var(--point-rose); transform: scale(1.05); }

        .c-artist-item { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: transform 0.2s; }
        .c-artist-item:hover { transform: translateY(-4px); }
        .c-artist-avatar {
          width: 64px; height: 64px; border-radius: 50%; background: var(--bg-white);
          border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .c-artist-item span { font-size: 12px; font-weight: 700; color: var(--text-main); }

        /* Grids */
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }

        /* Standard Cards */
        .card { background: var(--bg-white); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease; display: flex; flex-direction: column; }
        .card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(194, 80, 122, 0.1); border-color: var(--point-rose); }
        .c-img { height: 240px; position: relative; background: #EDE8E2; }
        .c-tag { position: absolute; top: 16px; left: 16px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; }
        .c-status { position: absolute; top: 16px; right: 16px; background: var(--point-rose); color: white; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; }
        .c-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
        .c-body h3 { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.4; margin-bottom: 24px; flex: 1; }
        .c-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 24px; border-top: 1px dashed var(--border); }
        .c-price { font-size: 20px; font-weight: 800; color: var(--point-rose); }
        .c-btn { background: var(--bg-cream); color: var(--text-main); border: 1px solid var(--border); padding: 10px 20px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .card:hover .c-btn { background: var(--point-rose); color: white; border-color: var(--point-rose); }

        /* Artist Card */
        .artist-card { background: var(--bg-white); border-radius: 24px; padding: 32px 24px; text-align: center; border: 1px solid var(--border); transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
        .artist-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(194, 80, 122, 0.1); border-color: var(--point-rose); }
        .ac-avatar { width: 100px; height: 100px; border-radius: 50%; margin-bottom: 20px; background: #EDE8E2; border: 4px solid var(--bg-cream); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .ac-name { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .ac-desc { font-size: 13px; color: var(--text-sub); font-weight: 500; margin-bottom: 24px; line-height: 1.4; }
        .ac-btn { background: var(--bg-cream); border: 1px solid var(--border); padding: 10px 24px; border-radius: 20px; font-size: 12px; font-weight: 700; transition: all 0.2s; color: var(--text-main); width: 100%; }
        .artist-card:hover .ac-btn { background: var(--point-rose); color: white; border-color: var(--point-rose); }

        /* Store List Banner */
        .store-banner { background: linear-gradient(135deg, #2D2B3B, #1A1924); border-radius: 24px; padding: 60px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; box-shadow: 0 24px 48px rgba(0,0,0,0.1); }
        .sb-title { font-size: 32px; font-weight: 800; margin-bottom: 12px; }
        .sb-desc { font-size: 15px; color: rgba(255,255,255,0.7); font-weight: 500; }
        
        /* Filter Bar */
        .filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
        .fb-tabs { display: flex; gap: 24px; }
        .f-tab { font-size: 14px; font-weight: 700; color: var(--text-sub); cursor: pointer; transition: color 0.2s; }
        .f-tab.active { color: var(--text-main); }
        .f-tab:hover { color: var(--text-main); }

        /* Page Layout Pad */
        .page-content { padding-top: 140px; min-height: 80vh; }

        /* Countdown & Community Restored */
        .countdown-divider {
          width: 100%;
          background: linear-gradient(90deg, var(--point-rose), var(--point-violet));
          border-radius: 24px;
          padding: 40px 64px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 40px 0 60px;
          box-shadow: 0 20px 40px rgba(194, 80, 122, 0.2);
        }
        .community-bar { 
          background: var(--bg-white);
          border-radius: 24px;
          padding: 32px 40px;
          border: 1px solid var(--border);
          box-shadow: 0 12px 32px rgba(0,0,0,0.03);
          margin: 20px 0 60px; 
        }

        /* --- Artist Board (Weverse Style) --- */
        .ab-layout { display: flex; gap: 32px; max-width: 1100px; margin: 0 auto; align-items: flex-start; }
        .media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .media-card { display: flex; flex-direction: column; gap: 12px; cursor: pointer; }
        .media-item { border-radius: 12px; background: #eee; height: 180px; overflow: hidden; position: relative; transition: transform 0.2s, box-shadow 0.2s; }
        .media-card:hover .media-item { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
        .media-item img { width: 100%; height: 100%; object-fit: cover; }
        .media-item:hover .mi-overlay { opacity: 1; }
        .mi-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; color: white; }
        .mi-title { font-size: 15px; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .mi-meta { font-size: 13px; color: var(--text-sub); display: flex; gap: 8px; align-items: center; margin-top: 4px; }
        .yt-badge { background: #FF0000; color: white; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; gap: 2px; }

        .notice-list { display: flex; flex-direction: column; gap: 16px; }
        .notice-item { padding: 24px; background: var(--bg-white); border-radius: 16px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .notice-item:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.03); }
        .ni-tag { color: var(--point-rose); font-weight: 800; font-size: 11px; margin-bottom: 8px; }
        .ni-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .ni-date { font-size: 13px; color: var(--text-sub); }
        
        .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 40px; }
        .page-btn { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border); background: var(--bg-white); color: var(--text-sub); }
        .page-btn.active { background: var(--text-main); color: white; border-color: var(--text-main); }
        .page-btn:hover:not(.active) { background: #f5f5f5; color: var(--text-main); }

        /* Schedule & Forms */
        .schedule-list { display: flex; flex-direction: column; gap: 16px; }
        .schedule-month { font-size: 20px; font-weight: 800; border-bottom: 2px solid var(--text-main); padding-bottom: 12px; margin-top: 24px; margin-bottom: 8px; }
        .schedule-month:first-child { margin-top: 0; }
        .schedule-item { display: flex; gap: 24px; align-items: center; padding: 20px; background: var(--bg-white); border-radius: 16px; border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .schedule-item:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.03); }
        .si-date { font-size: 24px; font-weight: 800; color: var(--point-violet); width: 40px; text-align: center; }
        .si-info { flex: 1; }
        .si-time { font-size: 12px; font-weight: 800; color: var(--text-sub); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .si-title { font-size: 16px; font-weight: 700; }
        
        /* Auth Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); padding: 20px; }
        .modal-content { background: var(--bg-white); width: 100%; max-width: 440px; border-radius: 24px; padding: 40px; position: relative; box-shadow: 0 24px 48px rgba(0,0,0,0.1); }
        .m-close { position: absolute; right: 24px; top: 24px; cursor: pointer; color: var(--text-sub); transition: color 0.2s; }
        .m-close:hover { color: var(--text-main); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--text-sub); }
        .form-input { width: 100%; border: 1px solid var(--border); background: var(--bg-cream); padding: 14px 16px; border-radius: 12px; font-family: inherit; font-size: 15px; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--text-main); background: var(--bg-white); }
        .btn-primary { width: 100%; background: var(--text-main); color: white; border: none; padding: 16px; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; transition: transform 0.2s; margin-top: 8px; }
        .btn-primary:active { transform: scale(0.98); }
        .social-btn { width: 100%; border: 1px solid var(--border); background: var(--bg-white); padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 12px; transition: background 0.2s; }
        .social-btn:hover { background: #f5f5f5; }
        .auth-switch { text-align: center; margin-top: 24px; font-size: 13px; font-weight: 600; color: var(--text-sub); }
        .auth-switch span { color: var(--text-main); cursor: pointer; text-decoration: underline; margin-left: 6px; }

        /* Goods Voting Styles */
        .vote-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 24px; }
        .vote-card { background: var(--bg-white); border-radius: 20px; overflow: hidden; border: 1px solid var(--border); transition: all 0.3s; position: relative; }
        .vote-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }
        .vote-img { height: 240px; width: 100%; display: flex; align-items: center; justify-content: center; }
        .vote-img img { max-height: 80%; max-width: 80%; object-fit: contain; }
        .vote-body { padding: 24px; }
        .vote-info { margin-bottom: 20px; }
        .vote-category { font-size: 12px; font-weight: 800; color: var(--point-rose); margin-bottom: 4px; text-transform: uppercase; }
        .vote-title { font-size: 18px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
        .vote-count { font-size: 14px; font-weight: 600; color: var(--text-sub); display: flex; align-items: center; gap: 6px; }
        .vote-btn { width: 100%; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; transition: all 0.2s; border: none; }
        .vote-btn.active { background: var(--point-rose); color: white; }
        .vote-btn.disabled { background: var(--border); color: var(--text-sub); cursor: default; }

        /* Attendance Modal Styles */
        .attendance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 32px 0; }
        .day-cell { 
          aspect-ratio: 1; border-radius: 16px; background: var(--bg-cream); border: 1px solid var(--border);
          display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
          transition: all 0.3s; overflow: hidden;
        }
        .day-cell.active { border-color: var(--point-rose); background: #fff; box-shadow: 0 4px 12px rgba(194, 80, 122, 0.1); }
        .day-num { font-size: 12px; font-weight: 800; color: var(--text-sub); margin-bottom: 4px; }
        .day-cell.active .day-num { color: var(--point-rose); }
        .stamp-icon { color: var(--point-rose); }
        .final-day { grid-column: span 2; aspect-ratio: auto !important; min-height: 80px; }
        
        .reward-reveal {
          text-align: center;
          padding: 20px;
        }
        .photocard-preview {
          width: 200px; height: 280px; border-radius: 16px; margin: 0 auto 24px;
          background: linear-gradient(135deg, #FF9A9E, #FECFEF);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2); border: 4px solid white;
          overflow: hidden; position: relative;
        }
        .photocard-preview img { width: 100%; height: 100%; object-fit: cover; filter: brightness(1.1) contrast(1.1); }
        .shine {
          position: absolute; inset: 0; 
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%);
          animation: shine-sweep 3s infinite;
        }
        @keyframes shine-sweep { 
          0% { transform: translateX(-150%) skewX(-25deg); }
          50% { transform: translateX(150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }

        /* My Page Dashboard */
        .mp-sidebar { width: 280px; flex-shrink: 0; background: var(--bg-white); border-radius: 24px; padding: 32px 24px; border: 1px solid var(--border); }
        .mp-nav-item { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 12px; cursor: pointer; font-weight: 700; color: var(--text-sub); transition: all 0.2s; margin-bottom: 4px; }
        .mp-nav-item:hover, .mp-nav-item.active { background: var(--bg-cream); color: var(--text-main); }
        .mp-stat { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed var(--border); }
        .mp-stat:last-child { border-bottom: none; }
        
        /* Cart Drawer */
        .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; justify-content: flex-end; backdrop-filter: blur(8px); }
        .cart-drawer { background: var(--bg-white); width: 100%; max-width: 480px; height: 100%; display: flex; flex-direction: column; animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .cart-header { padding: 32px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .cart-body { flex: 1; overflow-y: auto; padding: 32px; }
        .cart-item { display: flex; gap: 16px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px dashed var(--border); }
        .cart-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .ci-img { width: 80px; height: 80px; background: var(--bg-cream); border-radius: 12px; }
        .ci-info { flex: 1; }
        .ci-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
        .ci-price { font-size: 14px; font-weight: 800; color: var(--point-rose); }
        .cart-footer { padding: 32px; border-top: 1px solid var(--border); background: var(--bg-white); }
        .cf-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; font-weight: 700; }
        .cf-total { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 20px; font-weight: 800; color: var(--point-rose); }

        .ab-main { flex: 1; min-width: 0; }
        .ab-sidebar { width: 320px; flex-shrink: 0; position: sticky; top: 120px; display: flex; flex-direction: column; gap: 24px; }

        .live-banner { background: linear-gradient(90deg, #ff0f7b, #f89b29); border-radius: 16px; padding: 16px 24px; color: white; display: flex; align-items: center; gap: 16px; margin-bottom: 32px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .live-banner:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(255, 15, 123, 0.3); }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.7); opacity: 1; } 70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); opacity: 0.6; } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); opacity: 1; } }
        .lb-pulse { width: 10px; height: 10px; background: white; border-radius: 50%; animation: pulse 1.5s infinite; flex-shrink: 0; }
        .lb-content { flex: 1; }
        .lb-title { font-weight: 800; font-size: 15px; margin-bottom: 2px; }
        .lb-desc { font-weight: 500; font-size: 13px; opacity: 0.9; }

        /* Sidebar Widgets */
        .widget { background: var(--bg-white); border-radius: 20px; border: 1px solid var(--border); padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .w-header { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 800; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border); padding-bottom: 12px; }
        .w-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px dashed var(--border); cursor: pointer; transition: opacity 0.2s; }
        .w-item:hover { opacity: 0.7; }
        .w-item:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: -8px; }
        .w-item-icon { padding: 8px; background: var(--bg-cream); border-radius: 10px; color: var(--point-rose); display: flex; align-items: center; justify-content: center; }
        .w-item-content { flex: 1; }
        .w-item-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; line-height: 1.3; }
        .w-item-date { font-size: 12px; color: var(--text-sub); }

        .tag-pill { display: inline-block; padding: 6px 12px; background: var(--bg-cream); color: var(--text-main); border-radius: 20px; font-size: 12px; font-weight: 700; margin: 0 8px 8px 0; cursor: pointer; transition: all 0.2s; }
        .tag-pill:hover { background: var(--point-rose); color: white; }

        .board-header { position: relative; border-radius: 24px; overflow: hidden; margin-bottom: 32px; background: #111; color: white; display:flex; align-items:flex-end; padding: 40px; height: 320px; }
        .bh-bg { position: absolute; inset: 0; opacity: 0.6; mix-blend-mode: overlay; background-image: linear-gradient(to top, rgba(0,0,0,0.8), transparent); transition: transform 0.5s; }
        .bh-bg-color { position: absolute; inset: 0; opacity: 0.8; }
        .board-header:hover .bh-bg { transform: scale(1.05); }
        .bh-content { position: relative; z-index: 10; display: flex; align-items: center; gap: 24px; width: 100%; }
        .bh-avatar { width: 100px; height: 100px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.2); background: var(--bg-cream); flex-shrink: 0; }
        .bh-info { flex: 1; }
        .bh-name { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
        .bh-stats { font-size: 14px; font-weight: 500; opacity: 0.8; }
        .bh-join-btn { background: var(--point-rose); color: white; border: none; padding: 12px 32px; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.2s; }
        .bh-join-btn:hover { background: #E26F96; }

        .board-nav { display: flex; gap: 32px; margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 0px; }
        .bn-item { font-size: 16px; font-weight: 700; color: var(--text-sub); cursor: pointer; position: relative; transition: color 0.2s; padding-bottom: 16px; margin-bottom: -1px; }
        .bn-item.active { color: var(--text-main); }
        .bn-item.active::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: var(--text-main); border-radius: 3px 3px 0 0; }

        .post-composer { background: var(--bg-white); border-radius: 20px; border: 1px solid var(--border); padding: 20px; margin-bottom: 32px; display: flex; gap: 16px; align-items: flex-start; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .pc-avatar { width: 40px; height: 40px; border-radius: 50%; background: #E8E0D8; flex-shrink: 0; }
        .pc-input-area { flex: 1; }
        .pc-input { width: 100%; min-height: 40px; border: none; font-family: inherit; font-size: 15px; outline: none; background: transparent; resize: none; color: var(--text-main); padding-top: 10px; }
        .pc-input::placeholder { color: #BBB; }
        .pc-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 12px; }
        .pc-tools { display: flex; gap: 16px; color: var(--text-sub); }
        .pc-tools svg { cursor: pointer; transition: color 0.2s; }
        .pc-tools svg:hover { color: var(--point-rose); }
        .pc-submit { background: var(--text-main); color: white; border: none; padding: 8px 24px; border-radius: 20px; font-size: 13px; font-weight: 700; cursor: pointer; }

        .feed-post { background: var(--bg-white); border-radius: 20px; border: 1px solid var(--border); padding: 24px; margin-bottom: 24px; transition: transform 0.2s; cursor: pointer; }
        .feed-post:hover { border-color: rgba(0,0,0,0.1); box-shadow: 0 8px 24px rgba(0,0,0,0.03); }
        .fp-header { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
        .fp-avatar { width: 48px; height: 48px; border-radius: 50%; background: #eee; }
        .fp-avatar.artist-badge { border: 2px solid var(--point-rose); }
        .fp-meta { flex: 1; }
        .fp-author { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
        .fp-badge { background: #f0f0f0; color: #666; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 800; }
        .fp-badge.artist { 
          background: linear-gradient(135deg, var(--point-rose), var(--point-violet)); 
          color: white; 
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(194, 80, 122, 0.2);
        }
        .fp-time { font-size: 12px; color: var(--text-sub); margin-top: 2px; }
        .fp-content { font-size: 15px; line-height: 1.6; margin-bottom: 16px; word-break: break-word; }
        .fp-image { width: 100%; border-radius: 12px; height: 300px; margin-bottom: 16px; background: #f5f5f5; }
        .fp-footer { display: flex; gap: 24px; color: var(--text-sub); font-size: 13px; font-weight: 600; }
        .fp-action { display: flex; align-items: center; gap: 6px; cursor: pointer; transition: color 0.2s; }
        .fp-action:hover { color: var(--point-rose); }
        .fp-comments { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
        .fp-comment-item { margin-bottom: 12px; font-size: 13px; }
        .fp-comment-author { font-weight: 800; margin-right: 8px; color: var(--text-main); }
        .fp-comment-content { color: var(--text-sub); line-height: 1.4; }
        .fp-comment-input-area { display: flex; gap: 12px; margin-top: 16px; align-items: center; }
        .fp-comment-input { flex: 1; background: var(--bg-cream); border: 1px solid var(--border); padding: 8px 16px; border-radius: 20px; font-size: 13px; outline: none; }
        .fp-comment-input:focus { border-color: var(--point-rose); background: white; }
        .fp-comment-submit { color: var(--point-rose); font-weight: 800; font-size: 13px; border: none; background: none; cursor: pointer; }
        .fp-comment-submit:disabled { color: var(--text-sub); opacity: 0.5; cursor: default; }

        /* New Responsive Modal & Overlay Styles */
        .modal-content-custom {
          background: white;
          width: 90%;
          max-width: 440px;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          position: relative;
          box-sizing: border-box;
        }
        .modal-header-accent {
          height: 160px;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 32px;
          flex-shrink: 0;
          text-align: center;
          box-sizing: border-box;
        }
        .modal-header-bg {
          position: absolute;
          inset: 0;
          opacity: 0.15;
          background: linear-gradient(135deg, #C2507A, #7F77DD);
        }
        .modal-body-custom {
          padding: 32px;
          flex: 1;
          overflow-y: auto;
          background: white;
          box-sizing: border-box;
        }
        .schedule-grid-50 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }
        .schedule-info-box {
          padding: 16px;
          background: #F7F3EE;
          border-radius: 20px;
          border: 1px solid #EDE8E2;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notice-full-overlay {
          position: fixed;
          inset: 0;
          background: #F7F3EE;
          z-index: 2000;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .notice-detail-container {
          width: 100%;
          max-width: 768px;
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .notice-detail-header {
          position: sticky;
          top: 0;
          background: rgba(247, 243, 238, 0.85);
          backdrop-filter: blur(12px);
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #EDE8E2;
          z-index: 100;
        }
        .notice-detail-main {
          flex: 1;
          background: white;
          margin: 16px 16px 0 16px;
          border-radius: 40px 40px 0 0;
          padding: 64px 40px;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.03);
          border: 1px solid #EDE8E2;
          border-bottom: none;
          box-sizing: border-box;
        }
        @media (max-width: 640px) {
          .notice-detail-main {
            padding: 40px 24px;
            margin: 12px 12px 0 12px;
          }
        }
      `}</style>

      {/* Shared Header */}
      {activeTab !== 'CHECKOUT' && (!selectedArtist && role !== 'ARTIST') && (
      <header className="floating-header">
        <div className="logo" onClick={() => { 
          if (role === 'ARTIST') {
            setBoardTab('FEED');
            return;
          }
          setActiveTab('HOME'); 
          setSelectedArtist(null); 
        }}>FANDROPS</div>
        <nav>
          {(role === 'ARTIST' ? ['WORKSPACE'] : ['HOME', 'ARTISTS', 'STORE', 'MY PAGE']).map(tab => (
            <div 
              key={tab} 
              className={`n-item ${(activeTab === tab && !selectedArtist) || (role === 'ARTIST' && tab === 'WORKSPACE') ? 'active' : ''}`}
              onClick={() => { 
                if (role === 'ARTIST') return;
                setActiveTab(tab); 
                setSelectedArtist(null); 
                setSelectedProduct(null); 
              }}
            >
              {tab}
            </div>
          ))}
        </nav>
        <div className="h-icons">
          {role !== 'ARTIST' && (
            <>
              <Search size={20} color="var(--text-main)" style={{cursor:'pointer'}} />
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveTab('NOTIFICATIONS')}>
                <Bell size={20} color="var(--text-main)" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--point-rose)', color: 'white', fontSize: '10px', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {notifications.filter(n => !n.isRead).length}
                  </div>
                )}
              </div>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowCart(true)}>
                <ShoppingBag size={20} color="var(--text-main)" />
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--point-rose)', color: 'white', fontSize: '10px', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
              </div>
            </>
          )}
          <div className="avatar" onClick={() => { 
            if (role === 'ARTIST') return;
            setActiveTab('MY PAGE'); 
            setSelectedArtist(null); 
          }}></div>
          {role === 'ARTIST' && (
            <button 
              onClick={() => { logout(); localStorage.removeItem(ROLE_KEY); navigate('/login', { replace: true }); }}
              style={{ padding: '8px 12px', background: '#F7F3EE', border: '1px solid #EDE8E2', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              로그아웃
            </button>
          )}
        </div>
      </header>
      )}

      {activeTab === 'CHECKOUT' && (
        <header style={{ position: 'absolute', top: '24px', left: '40px', background: 'transparent', zIndex: 10 }}>
           <button onClick={() => { setActiveTab('HOME'); setCheckoutData(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer', border: 'none', background: 'none' }}>
              <ChevronLeft size={20} /> 취소하고 주문 페이지 나가기
           </button>
        </header>
      )}

      {activeTab === 'NOTIFICATIONS' && (
        <div style={{ background: 'var(--bg-white)', minHeight: '100vh', padding: '120px 40px 60px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 900 }}>알림</h1>
              <button 
                onClick={() => setActiveTab('HOME')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}
              >
                닫기
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-sub)', fontWeight: 600 }}>새로운 알림이 없습니다.</div>
              ) : (
                [...notifications]
                  .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                  .map(n => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      if (n.isRead) return;
                      await markAsRead(n.id).catch(() => {});
                      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                    }}
                    style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', position: 'relative', opacity: n.isRead ? 0.7 : 1, cursor: n.isRead ? 'default' : 'pointer' }}
                  >
                    {!n.isRead && <div style={{ position: 'absolute', top: 24, right: 24, width: '8px', height: '8px', background: 'var(--point-rose)', borderRadius: '50%' }}></div>}
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--point-rose)', marginBottom: '8px' }}>{n.type}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>{n.message}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>{formatTime(n.sentAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CART DRAWER --- */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>장바구니 ({cartItems.length})</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowCart(false)} />
            </div>

            <div className="cart-body">
              {cartLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>불러오는 중...</div>
              ) : cartItems.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>장바구니가 비어있습니다.</div>
              ) : (
                cartItems.map(item => {
                  const productName = storeItems.find(p => p.id === item.productId)?.name ?? `상품 #${item.productId}`;
                  return (
                    <div key={item.cartItemId} className="cart-item">
                      <div className="ci-img" style={{ background: 'linear-gradient(135deg, #E8E0D8, #D5CCC2)' }}></div>
                      <div className="ci-info">
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', marginBottom: '4px' }}>상품 #{item.productId}</div>
                        <div className="ci-title">{productName}</div>
                        <div className="ci-price">₩{item.price.toLocaleString()}</div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                            <button
                              style={{ background: 'var(--bg-white)', border: 'none', padding: '4px 12px', cursor: 'pointer' }}
                              onClick={async () => {
                                if (item.quantity <= 1) return;
                                await updateCartItem(item.cartItemId, item.quantity - 1);
                                setCartItems(prev => prev.map(ci => ci.cartItemId === item.cartItemId ? { ...ci, quantity: ci.quantity - 1 } : ci));
                              }}
                            >-</button>
                            <div style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 700, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>{item.quantity}</div>
                            <button
                              style={{ background: 'var(--bg-white)', border: 'none', padding: '4px 12px', cursor: 'pointer' }}
                              onClick={async () => {
                                await updateCartItem(item.cartItemId, item.quantity + 1);
                                setCartItems(prev => prev.map(ci => ci.cartItemId === item.cartItemId ? { ...ci, quantity: ci.quantity + 1 } : ci));
                              }}
                            >+</button>
                          </div>
                          <span
                            style={{ fontSize: '12px', color: 'var(--text-sub)', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={async () => {
                              await removeCartItem(item.cartItemId);
                              setCartItems(prev => prev.filter(ci => ci.cartItemId !== item.cartItemId));
                            }}
                          >삭제</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cartItems.length > 0 && (() => {
              const subtotal = cartItems.reduce((s, ci) => s + ci.price * ci.quantity, 0);
              return (
                <div className="cart-footer">
                  <div className="cf-row"><span>상품 합계</span><span>₩{subtotal.toLocaleString()}</span></div>
                  <div className="cf-row"><span>배송비</span><span>₩3,000</span></div>
                  <div className="cf-total"><span>합계</span><span>₩{(subtotal + 3000).toLocaleString()}</span></div>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowCart(false);
                      setCheckoutData({ title: `장바구니 상품 (${cartItems.length}개)`, price: subtotal, qty: 1, option: '', productId: cartItems[0]?.productId ?? null, accessTicket: null });
                      setActiveTab('CHECKOUT');
                    }}
                  >주문하기</button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- AUTH MODAL --- */}

      <div className="wrapper">
        {/* --- NOTIFICATION STACK --- */}
        {showNotifications && (
          <div style={{ position: 'fixed', top: '80px', right: '40px', width: '360px', maxHeight: '500px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Notifications</h3>
              <button onClick={async () => { const unread = notifications.filter(n => !n.isRead); await Promise.all(unread.map(n => markAsRead(n.id).catch(() => {}))); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--point-rose)', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all as read</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="hide-scrollbar">
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '16px 24px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.03)', background: n.isRead ? 'transparent' : 'rgba(194, 80, 122, 0.03)', transition: 'background 0.2s' }} className="hover-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: n.isRead ? 'var(--text-main)' : 'var(--point-rose)' }}>{n.type}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{formatTime(n.sentAt)}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.4 }}>{n.message}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
               <button className="btn-secondary" style={{ width: '100%', fontSize: '13px' }}>View all activities</button>
            </div>
          </div>
        )}

        {/* --- ARTIST SEARCH MODAL --- */}
        {showArtistSearch && (
          <div className="cart-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowArtistSearch(false)}>
            <div style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '32px', padding: '40px', position: 'relative' }} onClick={e => e.stopPropagation()}>
               <X size={24} style={{ position: 'absolute', top: 32, right: 32, cursor: 'pointer', color: '#888' }} onClick={() => setShowArtistSearch(false)} />
               <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>아티스트 검색</h2>
               <div style={{ position: 'relative', marginBottom: '32px' }}>
                 <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                 <input 
                   type="text" 
                   autoFocus
                   placeholder="아티스트 이름을 입력하세요" 
                   style={{ width: '100%', padding: '16px 16px 16px 52px', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '16px', outline: 'none', background: 'var(--bg-cream)' }} 
                 />
               </div>
               
               <div style={{ marginBottom: '32px' }}>
                 <p style={{ fontSize: '13px', fontWeight: 800, color: '#888', marginBottom: '16px', letterSpacing: '1px' }}>팔로우 중인 아티스트</p>
                 {favoriteArtists.length === 0 ? (
                   <p style={{ fontSize: '13px', color: '#bbb', textAlign: 'center', padding: '24px 0' }}>팔로우한 아티스트가 없습니다.</p>
                 ) : (
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                     {favoriteArtists.map(a => (
                       <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setShowArtistSearch(false)}>
                         <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: a.bg ?? '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                           {a.name.substring(0, 3)}
                         </div>
                         <span style={{ fontSize: '13px', fontWeight: 700 }}>{a.name}</span>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* --- EDIT PROFILE MODAL --- */}
        {showEditProfile && (
          <div className="cart-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowEditProfile(false)}>
            <div style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '32px', padding: '40px', position: 'relative' }} onClick={e => e.stopPropagation()}>
               <X size={24} style={{ position: 'absolute', top: 32, right: 32, cursor: 'pointer', color: '#888' }} onClick={() => setShowEditProfile(false)} />
               <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px' }}>프로필 수정</h2>
               
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                 <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #E8E0D8, #D5CCC2)', marginBottom: '16px', border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}></div>
                 <button className="c-btn" style={{ background: 'var(--bg-cream)', padding: '8px 16px', borderRadius: '20px' }}>사진 변경</button>
               </div>

               <div className="form-group" style={{ marginBottom: '20px' }}>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-sub)' }}>닉네임</label>
                 <input type="text" defaultValue="Dreamer99" className="form-input" style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-cream)', padding: '14px 16px', borderRadius: '12px', fontSize: '15px' }} />
               </div>
               
               <div className="form-group" style={{ marginBottom: '32px' }}>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-sub)' }}>소개말</label>
                 <textarea rows={3} placeholder="자신을 소개해 보세요!" className="form-input" style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-cream)', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', resize: 'none' }}></textarea>
               </div>

               <button className="btn-primary" onClick={() => {
                 setShowEditProfile(false);
               }} style={{ width: '100%', background: 'var(--text-main)', color: 'white', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: 800 }}>저장하기</button>
            </div>
          </div>
        )}

        {/* --- ARTIST BOARD PAGE --- */}
        {selectedArtist && (
          <div className="page-content reveal" style={{ 
            paddingTop: role === 'ARTIST' ? '120px' : '40px', 
            paddingRight: '40px',
            paddingBottom: '100px',
            paddingLeft: '40px',
            maxWidth: '1200px', 
            margin: '0 auto' 
          }}>
            {role !== 'ARTIST' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', fontWeight: 800, color: 'var(--text-main)', transition: 'color 0.2s', width: 'fit-content' }} onClick={() => setSelectedArtist(null)}>
                <ChevronLeft size={24} /> 뒤로가기
              </div>
            )}
            <div className="board-header">
              <div className="bh-bg-color" style={{ background: selectedArtist.bg }}></div>
              <div className="bh-bg"></div>
              <div className="bh-content">
                <div className="bh-avatar" style={{ background: selectedArtist.bg }}></div>
                <div className="bh-info">
                  <div className="bh-name">{selectedArtist.name}</div>
                  <div className="bh-stats">{selectedArtist.type || 'Artist'} · {selectedArtist.followers || '10K'} 팔로워</div>
                </div>
                {role === 'ARTIST' ? (
                  <button className="bh-join-btn" onClick={() => { logout(); localStorage.removeItem(ROLE_KEY); navigate('/login', { replace: true }); }} style={{ background: '#333' }}>로그아웃</button>
                ) : (
                  <button className="bh-join-btn" onClick={handleFollowToggle}>
                    {favoriteArtists.some(a => a.id === selectedArtist.id) ? '언팔로우' : '팔로우'}
                  </button>
                )}
              </div>
            </div>

            <div className="board-nav reveal delay-100">
              {['FEED', 'ARTIST', 'VOTE', 'MEDIA', 'NOTICE', 'SCHEDULE'].map(tab => (
                <div 
                  key={tab} 
                  className={`bn-item ${boardTab === tab ? 'active' : ''}`}
                  onClick={() => setBoardTab(tab)}
                >
                  {tab === 'FEED' ? '피드' : tab === 'ARTIST' ? '아티스트' : tab === 'VOTE' ? '굿즈투표' : tab === 'MEDIA' ? '미디어' : tab === 'NOTICE' ? '공지사항' : tab === 'SCHEDULE' ? '스케줄' : tab}
                </div>
              ))}
            </div>

            <div className="ab-layout">
              <div className="ab-main">
                {/* FEED TAB */}
                {boardTab === 'FEED' && (
                  <div className="reveal">
                    {/* Live Banner */}
                    <div className="live-banner">
                      <div className="lb-pulse"></div>
                      <div className="lb-content">
                        <div className="lb-title">{selectedArtist.name} 라이브 방송 중! 🔴</div>
                        <div className="lb-desc">{selectedArtist.name} 라이브 방송 중...</div>
                      </div>
                      <button className="c-btn" style={{ background: 'white', color: '#ff0f7b', padding: '8px 16px' }}>스트리밍 시청</button>
                    </div>

                    {/* Attendance Event Banner */}
                    {showAttendanceBanner && (
                      <motion.div 
                        className="live-banner" 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                          background: 'linear-gradient(135deg, #FF9A8B, #FF6A88, #FF99AC)', 
                          border: 'none', 
                          marginBottom: '24px', 
                          cursor: 'pointer',
                          boxShadow: '0 10px 25px rgba(255, 106, 136, 0.2)',
                          padding: '20px 24px'
                        }}
                        onClick={async () => {
                          setShowAttendance(true);
                          setAttendanceStep('STAMPING');
                          setTriggeredArtists(prev => [...prev, selectedArtist.id]);
                          setShowAttendanceBanner(false);
                          if (activeAttendanceEvent) {
                            checkIn(activeAttendanceEvent.id).catch(() => {});
                          }
                        }}
                      >
                        <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(4px)' }}>
                          <Calendar size={22} />
                        </div>
                        <div className="lb-content" style={{ marginLeft: '16px' }}>
                          <div className="lb-title" style={{ color: 'white', fontSize: '16px', fontWeight: 800 }}>7일 출석 챌린지 ✨</div>
                          <div className="lb-desc" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500 }}>미공개 디지털 포토카드를 획득할 수 있는 마지막 기회!</div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 800, fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
                          참여하기 <ChevronRight size={16} />
                        </div>
                      </motion.div>
                    )}

                    {role === 'ARTIST' && (
                      <div className="post-composer">
                        <div className="pc-avatar"></div>
                        <div className="pc-input-area">
                          <textarea 
                            className="pc-input" 
                            placeholder="팬들에게 전할 소식을 작성해 보세요!"
                            value={postInput}
                            onChange={(e) => setPostInput(e.target.value)}
                          ></textarea>
                          <div className="pc-actions">
                            <div className="pc-tools">
                              <ImageIcon size={20} />
                              <Smile size={20} />
                              <span className="text-[10px] font-bold text-[#C2507A] opacity-60 ml-2">
                                아티스트 공식 포스트 작성 중
                              </span>
                            </div>
                            <button 
                              className="pc-submit"
                              style={{ background: 'linear-gradient(135deg, #C2507A, #7F77DD)' }}
                              onClick={handlePostSubmit}
                              disabled={!postInput.trim()}
                            >
                              게시
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      {currentArtistPosts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)', fontWeight: 600 }}>
                          {feedsLoading ? '불러오는 중...' : '게시물이 없습니다. 첫 게시물을 작성해보세요!'}
                        </div>
                      ) : (
                        currentArtistPosts.map(post => (
                          <motion.div
                            key={post.id}
                            initial={false}
                            animate={false}
                            className={`feed-post ${post.artistMemberId != null ? 'artist-post' : ''}`}
                            style={post.artistMemberId != null ? { background: 'rgba(194, 80, 122, 0.03)', border: '1px solid rgba(194, 80, 122, 0.15)' } : {}}
                          >
                            <div className="fp-header">
                              <div className={`fp-avatar ${post.artistMemberId != null ? 'artist-badge' : ''}`} style={post.artistMemberId != null ? { background: selectedArtist.bg } : {}}></div>
                              <div className="fp-meta">
                                <div className="fp-author">
                                  {selectedArtist.name}
                                  {post.artistMemberId != null && (
                                    <span className="fp-badge artist" style={{ background: 'var(--point-rose)' }}>
                                      <CheckCircle2 size={10} fill="currentColor" /> Official
                                    </span>
                                  )}
                                  {post.artistMemberId == null && <span className="fp-badge">팬</span>}
                                </div>
                                <div className="fp-time">{formatTime(post.createdAt)}</div>
                              </div>
                              <MoreHorizontal size={20} color="var(--text-sub)" />
                            </div>
                            <div className="fp-content">{post.content}</div>
                            {post.imageUrls.length > 0 && (
                              <div className="fp-image" style={{ background: selectedArtist.bg, backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ImageIcon size={48} color="white" opacity={0.5} />
                              </div>
                            )}
                            <div className="fp-footer">
                              <div className="fp-action" style={{ cursor: 'pointer', color: post.isLiked ? 'var(--point-rose)' : undefined }} onClick={() => handleLikeFeed(post)}>
                                <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} /> {formatCount(post.likeCount)}
                              </div>
                              <div className="fp-action"><MessageSquare size={18} /> {String(post.commentCount)}</div>
                              <div className="fp-action"><Share2 size={18} /> Share</div>
                            </div>

                            {/* Comment Section */}
                            <div className="fp-comments">
                              {(commentsMap[String(post.id)] || []).map((comment: any) => (
                                <div key={comment.id} className="fp-comment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <span className="fp-comment-author">{comment.author}</span>
                                    <span className="fp-comment-content">{comment.content}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: comment.isLiked ? '#C2507A' : '#888' }} onClick={() => {
                                    setCommentsMap(prev => ({
                                      ...prev,
                                      [String(post.id)]: (prev[String(post.id)] || []).map((c: any) => c.id === comment.id ? { ...c, isLiked: !c.isLiked, likes: (c.likes || 0) + (c.isLiked ? -1 : 1) } : c)
                                    }));
                                  }}>
                                    <Heart size={12} fill={comment.isLiked ? "currentColor" : "none"} />
                                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{comment.likes || 0}</span>
                                  </div>
                                </div>
                              ))}

                              <div className="fp-comment-input-area">
                                <input
                                  type="text"
                                  className="fp-comment-input"
                                  placeholder="댓글을 입력하세요..."
                                  value={commentInputs[String(post.id)] || ''}
                                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [String(post.id)]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                />
                                <button
                                  className="fp-comment-submit"
                                  onClick={() => handleCommentSubmit(post.id)}
                                  disabled={!(commentInputs[String(post.id)]?.trim())}
                                >
                                  게시
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ARTIST TAB */}
                {boardTab === 'ARTIST' && (
                  <div className="reveal">
                    {currentOfficialPosts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)', fontWeight: 600 }}>아티스트의 게시물이 없습니다.</div>
                    ) : (
                      currentOfficialPosts.map(post => (
                        <div
                          key={post.id}
                          className="feed-post artist-post"
                          style={{ background: 'rgba(194, 80, 122, 0.03)', border: '1px solid rgba(194, 80, 122, 0.15)' }}
                        >
                          <div className="fp-header">
                            <div className="fp-avatar artist-badge" style={{ background: selectedArtist.bg }}></div>
                            <div className="fp-meta">
                              <div className="fp-author">
                                {selectedArtist.name}
                                <span className="fp-badge artist" style={{ background: 'var(--point-rose)' }}>
                                  <CheckCircle2 size={10} fill="currentColor" /> Official
                                </span>
                              </div>
                              <div className="fp-time">{formatTime(post.createdAt)}</div>
                            </div>
                            <MoreHorizontal size={20} color="var(--text-sub)" />
                          </div>
                          <div className="fp-content">{post.content}</div>
                          {post.imageUrls.length > 0 && (
                            <div className="fp-image" style={{ background: selectedArtist.bg, backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon size={48} color="white" opacity={0.5} />
                            </div>
                          )}
                          <div className="fp-footer">
                            <div className="fp-action" style={{ cursor: 'pointer', color: post.isLiked ? 'var(--point-rose)' : undefined }} onClick={() => handleLikeFeed(post)}>
                              <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} /> {formatCount(post.likeCount)}
                            </div>
                            <div className="fp-action"><MessageSquare size={18} /> {String(post.commentCount)}</div>
                            <div className="fp-action"><Share2 size={18} /> Share</div>
                          </div>

                          {/* Comment Section */}
                          <div className="fp-comments">
                            {(commentsMap[String(post.id)] || []).map((comment: any) => (
                              <div key={comment.id} className="fp-comment-item">
                                <span className="fp-comment-author">{comment.author}</span>
                                <span className="fp-comment-content">{comment.content}</span>
                              </div>
                            ))}

                            <div className="fp-comment-input-area">
                              <input
                                type="text"
                                className="fp-comment-input"
                                placeholder="댓글을 입력하세요..."
                                value={commentInputs[String(post.id)] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [String(post.id)]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                              />
                              <button
                                className="fp-comment-submit"
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={!(commentInputs[String(post.id)]?.trim())}
                              >
                                게시
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* VOTE TAB */}
                {boardTab === 'VOTE' && (
                  <div className="reveal">
                    <div style={{ marginBottom: '32px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>굿즈 투표</h2>
                      <p style={{ color: 'var(--text-sub)', fontSize: '15px' }}>아티스트에게 제작을 제안할 신규 굿즈 디자인을 선택해주세요!</p>
                    </div>
                    
                    <div className="vote-grid">
                      {goodsVotes.flatMap(vote =>
                        vote.options.map(opt => ({ voteId: vote.id, voteTitle: vote.title, opt }))
                      ).map(({ voteId, voteTitle, opt }) => (
                        <div key={`${voteId}-${opt.id}`} className="vote-card">
                          <div className="vote-img">
                            {opt.imageUrl && <img src={opt.imageUrl} alt={opt.label} />}
                          </div>
                          <div className="vote-body">
                            <div className="vote-info">
                              <div className="vote-category">{voteTitle}</div>
                              <div className="vote-title">{opt.label}</div>
                              <div className="vote-count">
                                <ThumbsUp size={14} /> {opt.voteCount.toLocaleString()} 투표됨
                              </div>
                            </div>
                            <button
                              className={`vote-btn ${hasVoted.includes(voteId) ? 'disabled' : 'active'}`}
                              disabled={hasVoted.includes(voteId)}
                              onClick={async () => {
                                await castBallot(voteId, opt.id).catch(() => {});
                                setHasVoted(prev => [...prev, voteId]);
                              }}
                            >
                              {hasVoted.includes(voteId) ? '투표 완료' : '투표하기'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MEDIA TAB */}
                {boardTab === 'MEDIA' && (
                  <div className="media-grid reveal">
                    {[
                      { id: 1, title: `${selectedArtist.name} - 'ECHO' Official M/V`, views: '12M', time: '2 days ago', duration: '3:45' },
                      { id: 2, title: `[BEHIND] ${selectedArtist.name} Jacket Shooting`, views: '1.2M', time: '1 week ago', duration: '12:20' },
                      { id: 3, title: `${selectedArtist.name} Dance Practice (Fixed Cam)`, views: '4.5M', time: '2 weeks ago', duration: '3:50' },
                      { id: 4, title: `[VLOG] Weekend with ${selectedArtist.name}`, views: '2M', time: '1 month ago', duration: '18:15' },
                      { id: 5, title: `${selectedArtist.name} - 'ECHO' Comeback Stage`, views: '5M', time: '1 month ago', duration: '4:10' },
                      { id: 6, title: `[LIVE] Surprise Birthday Party 🎂`, views: '8M', time: '2 months ago', duration: '45:00' },
                    ].map((video) => (
                      <div key={video.id} className="media-card">
                        <div className="media-item" style={{ background: `hsl(${video.id * 50}, 40%, 80%)`, backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))' }}>
                          <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>{video.duration}</span>
                          <div className="mi-overlay">
                            <Play size={48} fill="currentColor" color="white" />
                          </div>
                        </div>
                        <div>
                          <div className="mi-title">{video.title}</div>
                          <div className="mi-meta">
                            <span className="yt-badge"><Youtube size={12} fill="currentColor" /> YouTube</span>
                            <span>{video.views} 조회수 • {video.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* NOTICE TAB */}
                {boardTab === 'NOTICE' && (
                  <div className="reveal">
                    <div className="notice-list">
                      {notices.map((notice) => (
                          <div 
                            key={notice.id} 
                            className="notice-item" 
                            onClick={() => setSelectedNotice(notice)}
                            style={{ 
                              padding: '12px 16px',
                              borderLeft: `3px solid ${notice.type === 'TICKET' ? '#C2507A' : notice.type === 'EVENT' ? 'var(--point-rose)' : 'var(--point-violet)'}` 
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div className="ni-tag" style={{ color: notice.type === 'TICKET' ? '#C2507A' : notice.type === 'EVENT' ? 'var(--point-rose)' : 'var(--point-violet)', marginBottom: '2px', fontSize: '10px' }}>
                                {notice.tag}
                              </div>
                              <div className="ni-title" style={{ fontSize: '13px', marginBottom: '1px', fontWeight: 'bold' }}>{notice.title}</div>
                              <div className="ni-date" style={{ fontSize: '11px', opacity: 0.7 }}>{notice.date}</div>
                            </div>
                            <ChevronRight size={16} color="var(--text-sub)" />
                          </div>
                      ))}
                    </div>

                    <div className="pagination">
                      <div className="page-btn"><ChevronLeft size={16} /></div>
                      <div className="page-btn active">1</div>
                      <div className="page-btn">2</div>
                      <div className="page-btn">3</div>
                      <div className="page-btn">4</div>
                      <div className="page-btn">5</div>
                      <div className="page-btn"><ChevronRight size={16} /></div>
                    </div>
                  </div>
                )}

                {/* SCHEDULE TAB */}
                {boardTab === 'SCHEDULE' && (
                  <div className="schedule-list reveal">
                    {schedules.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)', fontWeight: 600 }}>등록된 스케줄이 없습니다.</div>
                    ) : (
                      groupSchedulesByMonth(schedules).map(([month, events]) => (
                        <div key={month}>
                          <div className="schedule-month">{month}</div>
                          {events.map(s => {
                            const { date, time } = scheduleDateTime(s.startTime);
                            return (
                              <div key={s.id} className="schedule-item" onClick={() => { setSelectedSchedule(s); setShowScheduleModal(true); }}>
                                <div className="si-date">{date}</div>
                                <div className="si-info">
                                  <div className="si-time">
                                    {s.type === 'DROP' && <span style={{color: 'var(--point-rose)', fontWeight: 800}}>발매</span>}
                                    {s.type === 'LIVE' && <Calendar size={14} />}
                                    {s.type === 'EVENT' && <Calendar size={14} />}
                                    {s.type === 'NOTICE' && <Bell size={14} />}
                                    {time}
                                  </div>
                                  <div className="si-title">{s.title}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {['FEED', 'ARTIST', 'MEDIA'].includes(boardTab) && (
                <div className="ab-sidebar reveal delay-400">
                <div className="widget">
                  <div className="w-header">
                    <Pin size={18} fill="currentColor" />
                    공지사항
                  </div>
                  <div className="w-item">
                    <div className="w-item-content">
                      <div className="w-item-title">[공지] {selectedArtist.name} 공식 팬클럽 멤버십 키트 배송 지연 안내</div>
                      <div className="w-item-date">2026.05.14</div>
                    </div>
                  </div>
                  <div className="w-item">
                    <div className="w-item-content">
                      <div className="w-item-title">[이벤트] Echo 특별판 포토북 출시 기념 팬사인회</div>
                      <div className="w-item-date">2026.05.10</div>
                    </div>
                  </div>
                </div>

                <div className="widget">
                  <div className="w-header">
                    인기 태그
                  </div>
                  <div>
                    <span className="tag-pill">#{selectedArtist.name}_컴백</span>
                    <span className="tag-pill">#에코포토북</span>
                    <span className="tag-pill">#해피팬클럽데이지</span>
                    <span className="tag-pill">#스트리밍이벤트</span>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        )}

        {/* --- HOME PAGE --- */}
        {!selectedArtist && activeTab === 'HOME' && (
          <div className="page-content reveal wrapper">
            <section className="hero" style={{ paddingTop: 0, minHeight: 'auto', marginBottom: 60 }}>
              <div className="hero-date reveal">UPCOMING DROP // 06.01 KST</div>
              <h1 className="reveal delay-100" style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 32, textAlign:'center' }}>
                Limited Editions.<br/>Exclusive Artist Merch.
              </h1>
              
              <div className="reveal delay-200" style={{ width: '100%', height: '400px', borderRadius: '24px', background: 'linear-gradient(135deg, #C8BEB6, #A89890)', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.08)' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,26,26,0.5) 0%, transparent 50%)' }}></div>
                <div style={{ position: 'absolute', bottom: '40px', left: '40px', textAlign: 'left', color: 'white' }}>
                  <span style={{ background: 'white', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', display: 'inline-block', marginBottom: '16px' }}>FANDROPS</span>
                  <h2 style={{fontSize: '32px', fontWeight: 800, letterSpacing: '-1px'}}>Echo 특별판 포토북</h2>
                </div>
              </div>
            </section>

            {/* Countdown Divider */}
            <div className="countdown-divider reveal">
              <div className="cd-info">
                <div className="label" style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '4px', opacity: 0.9, marginBottom: 12 }}>공식 드롭 오픈까지</div>
                <div className="cd-timer" style={{ 
                  fontFamily: '"JetBrains Mono", monospace', 
                  fontSize: '56px', 
                  fontWeight: 900, 
                  letterSpacing: '2px', 
                  lineHeight: 1,
                  color: 'white',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))'
                }}>
                  01 <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '24px', verticalAlign: 'middle' }}>:</span> 22 <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '24px', verticalAlign: 'middle' }}>:</span> 47 <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '24px', verticalAlign: 'middle' }}>:</span> 13
                </div>
              </div>
              <div className="cd-action">
                <button style={{ background: 'white', color: 'var(--point-rose)', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.25s', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>알림 받기</button>
              </div>
            </div>

            {/* My Artist Section */}
            <section className="community-bar reveal">
              <div className="section-header" style={{ marginBottom: 20 }}>
                <div className="s-title-group">
                  <h2 style={{ fontSize: '18px' }}>마이 아티스트</h2>
                  <p style={{ fontSize: '13px' }}>즐겨찾기한 아티스트로 빠르게 이동</p>
                </div>
              </div>
              <div className="community-scroll">
                <button className="c-add-btn" onClick={() => setShowArtistSearch(true)}>
                  <Plus size={24} />
                </button>
                
                {favoriteArtists.map((artist, idx) => (
                  <div key={idx} className="c-artist-item" onClick={() => { setSelectedArtist(artist); setBoardTab('FEED'); }}>
                    <div style={{ position: 'relative' }}>
                      <div className="c-artist-avatar" style={{ background: artist.bg }}></div>
                    </div>
                    <span>{artist.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Drops Grid */}
            <section className="section" style={{ paddingTop: 0 }}>
              <div className="section-header reveal">
                <div className="s-title-group">
                  <h2>인기 드롭</h2>
                  <p>지금 가장 핫한 익스클루시브 아이템들을 만나보세요.</p>
                </div>
                <div className="view-all" onClick={() => setActiveTab('STORE')} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--point-rose)', cursor: 'pointer' }}>전체 보기 →</div>
              </div>

              <div className="grid-3">
                <div className="card reveal delay-100">
                  <div className="c-img" style={{background:'linear-gradient(135deg, #E8E0D8, #D5CCC2)'}}>
                    <span className="c-tag">NOVA</span>
                    <span className="c-status">40 LEFT</span>
                  </div>
                  <div className="c-body">
                    <h3>NOVA 특별판<br/>3D 아트 포토북</h3>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:'700', marginBottom:'8px'}}>
                      <span style={{color:'var(--text-sub)'}}>진행률</span>
                      <span>80%</span>
                    </div>
                    <div style={{height:'6px', background:'rgba(237, 232, 226, 0.8)', borderRadius:'3px', overflow:'hidden', marginBottom:'12px'}}>
                      <div style={{height:'100%', borderRadius:'3px', width:'80%', background:'linear-gradient(90deg, var(--point-rose), var(--point-violet))'}}></div>
                    </div>
                    <div className="c-footer">
                      <span className="c-price">₩49,000</span>
                      <button className="c-btn">구매하기</button>
                    </div>
                  </div>
                </div>

                <div className="card reveal delay-200">
                  <div className="c-img" style={{background:'linear-gradient(135deg, #DDD8F0, #D0CAEC)'}}>
                    <span className="c-tag">LUNA</span>
                    <span className="c-status" style={{background:'var(--point-violet)'}}>275 LEFT</span>
                  </div>
                  <div className="c-body">
                    <h3>LUNA 1주년 기념<br/>베스트 포토카드 세트</h3>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:'700', marginBottom:'8px'}}>
                      <span style={{color:'var(--text-sub)'}}>진행률</span>
                      <span>45%</span>
                    </div>
                    <div style={{height:'6px', background:'rgba(237, 232, 226, 0.8)', borderRadius:'3px', overflow:'hidden', marginBottom:'12px'}}>
                      <div style={{height:'100%', borderRadius:'3px', width:'45%', background:'var(--point-violet)'}}></div>
                    </div>
                    <div className="c-footer">
                      <span className="c-price" style={{color:'var(--point-violet)'}}>₩29,000</span>
                      <button className="c-btn">구매하기</button>
                    </div>
                  </div>
                </div>

                <div className="card sold-out reveal delay-300">
                  <div className="c-img" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#1A1A1A'}}>
                    <span style={{color:'var(--point-rose)', fontWeight:900, fontSize:'28px', letterSpacing:'2px'}}>SOLD OUT</span>
                    <span style={{color:'white', opacity:0.6, fontSize:'12px', marginTop:'8px', fontWeight:600}}>Sold in 23s</span>
                  </div>
                  <div className="c-body" style={{opacity:0.6}}>
                    <h3>NOVA 1주년 콘서트<br/>멤버십 얼리버드 티켓</h3>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:'700', marginBottom:'8px'}}>
                      <span style={{color:'var(--text-sub)'}}>진행률</span>
                      <span>100%</span>
                    </div>
                    <div style={{height:'6px', background:'rgba(237, 232, 226, 0.8)', borderRadius:'3px', overflow:'hidden', marginBottom:'12px'}}>
                      <div style={{height:'100%', borderRadius:'3px', width:'100%', background:'#555'}}></div>
                    </div>
                    <div className="c-footer">
                      <span className="c-price" style={{color:'#888'}}>₩0</span>
                      <button className="c-btn" style={{background:'#E0E0E0', color:'#888', cursor:'not-allowed'}}>품절</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* My Artists' Drops Grid */}
            <section className="section" style={{ paddingTop: '60px' }}>
              <div className="section-header reveal">
                <div className="s-title-group">
                  <h2>마이 아티스트 추천</h2>
                  <p>즐겨찾기한 아티스트의 특별한 굿즈를 확인하세요.</p>
                </div>
                <div className="view-all" onClick={() => setActiveTab('STORE')} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--point-rose)', cursor: 'pointer' }}>전체 보기 →</div>
              </div>

              <div className="grid-3">
                <div className="card reveal delay-100">
                  <div className="c-img" style={{background:'linear-gradient(135deg, #E8E0D8, #D5CCC2)'}}>
                    <span className="c-tag">NOVA</span>
                    <span className="c-status">NEW</span>
                  </div>
                  <div className="c-body">
                    <h3>NOVA 2주년 기념<br/>쿠션 필로우</h3>
                    <div className="c-footer">
                      <span className="c-price">₩32,000</span>
                      <button className="c-btn">구매하기</button>
                    </div>
                  </div>
                </div>

                <div className="card reveal delay-200">
                  <div className="c-img" style={{background:'linear-gradient(135deg, #fccb90, #d57eeb)'}}>
                    <span className="c-tag">ECHO</span>
                    <span className="c-status" style={{background:'var(--point-violet)'}}>120 LEFT</span>
                  </div>
                  <div className="c-body">
                    <h3>ECHO 1st Solo Album<br/>Limited Vinyl</h3>
                    <div className="c-footer">
                      <span className="c-price" style={{color:'var(--point-violet)'}}>₩45,000</span>
                      <button className="c-btn">구매하기</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* --- ARTISTS PAGE --- */}
        {!selectedArtist && activeTab === 'ARTISTS' && (
          <div className="page-content reveal wrapper">
            <div className="section-header">
              <div className="s-title-group">
                <h1 style={{fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12}}>아티스트 & 크리에이터</h1>
                <p style={{fontSize: '16px', color: 'var(--text-sub)'}}>좋아하는 버추얼 그룹과 아이돌을 찾아보고 팔로우하세요.</p>
              </div>
            </div>

            <div className="filter-bar reveal delay-100">
              <div className="fb-tabs">
                <span className="f-tab active">전체</span>
                <span className="f-tab">버추얼 아이돌</span>
                <span className="f-tab">K-팝</span>
                <span className="f-tab">인디 크리에이터</span>
              </div>
              <div>
                <button style={{background:'var(--bg-white)', border:'1px solid var(--border)', padding:'8px 16px', borderRadius:'12px', fontSize:'12px', fontWeight:700, display:'flex', alignItems:'center', gap:8, cursor:'pointer'}}>
                  <Filter size={14} /> 필터
                </button>
              </div>
            </div>

            <div className="grid-4">
              {[
                { id: 1, name: 'NOVA', type: '버추얼 아이돌 그룹', followers: '-', bg: 'linear-gradient(135deg, #FF9A9E, #FECFEF)' },
                { id: 2, name: 'LUNA', type: 'K-Pop 걸그룹', followers: '-', bg: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
                { id: 3, name: 'ECHO', type: '솔로 아티스트', followers: '-', bg: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
              ].map((artist, idx) => (
                <div className={`artist-card reveal delay-${(idx % 4) * 100}`} key={artist.id} onClick={() => { setSelectedArtist(artist); setBoardTab('FEED'); }}>
                  <div className="ac-avatar" style={{ background: artist.bg }}></div>
                  <div className="ac-name">{artist.name}</div>
                  <div className="ac-desc">{artist.type}<br/>{artist.followers} 팔로워</div>
                  <button className="ac-btn">+ 팔로우</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- STORE PAGE --- */}
        {!selectedArtist && activeTab === 'STORE' && (
          <div className="page-content reveal wrapper">
            {selectedProduct ? (
              
              <div className="store-detail" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <button className="c-btn" style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', marginBottom: '32px' }} onClick={() => setSelectedProduct(null)}>
                  <ChevronLeft size={16} /> 스토어로 돌아가기
                </button>
                <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', marginBottom: '64px' }}>
                  {/* Left: Images */}
                  <div style={{ flex: 1 }}>
                    <div style={{ background: `linear-gradient(135deg, hsl(${selectedProduct.id * 40}, 30%, 85%), #fff)`, borderRadius: '16px', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <ImageIcon size={64} color="rgba(0,0,0,0.1)" />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {[0,1,2,3,4].map(idx => (
                        <div key={idx} onClick={() => setProductMainImg(idx)} style={{ width: '80px', height: '80px', borderRadius: '8px', cursor: 'pointer', background: `hsl(${selectedProduct.id * 40}, 30%, ${85 - idx*5}%)`, border: productMainImg === idx ? '2px solid #C2507A' : 'none' }}></div>
                      ))}
                    </div>
                  </div>
                  {/* Right: Info */}
                  <div style={{ width: '420px', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#C2507A', letterSpacing: '2px', marginBottom: '8px' }}>아티스트 #{selectedProduct.artistId}</div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.2 }}>{selectedProduct.name}</h1>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#C2507A', marginBottom: '24px' }}>₩{Number(selectedProduct.price).toLocaleString()}</div>
                    
                    <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '24px 0' }} />
                    
                    {/* Options */}
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                      <div onClick={() => setShowOptionDropdown(!showOptionDropdown)} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 600 }}>
                        <span>{productOption}</span>
                        <span>▼</span>
                      </div>
                      {showOptionDropdown && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '8px', marginTop: '4px', zIndex: 10 }}>
                          {['버전 A', '버전 B', '버전 C'].map(opt => (
                            <div key={opt} onClick={() => { setProductOption(opt); setShowOptionDropdown(false); }} style={{ padding: '16px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>{opt}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '24px 0' }} />
                    
                    {/* Quantity & Stock */}
                    {selectedProduct.status !== 'SOLD_OUT' ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                          <button onClick={() => setProductQty(Math.max(1, productQty - 1))} style={{ padding: '12px 16px', background: 'var(--bg-cream)', fontWeight: 800 }}>-</button>
                          <span style={{ padding: '0 24px', fontWeight: 800 }}>{productQty}</span>
                          <button onClick={() => setProductQty(Math.min(selectedProduct.remainingQty, productQty + 1))} style={{ padding: '12px 16px', background: 'var(--bg-cream)', fontWeight: 800 }}>+</button>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '4px' }}>{selectedProduct.remainingQty}개 남음</div>
                          <div style={{ width: '100px', height: '6px', background: 'var(--bg-cream)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${selectedProduct.totalQty > 0 ? (selectedProduct.remainingQty / selectedProduct.totalQty) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #C2507A, #7F77DD)' }}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 800, color: '#E11D48' }}>
                        현재 품절된 상품입니다.
                      </div>
                    )}

                    <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '24px 0' }} />

                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                  {selectedProduct.status === 'SOLD_OUT' ? (
                    <button
                      onClick={async () => {
                        const pid = selectedProduct.id;
                        if (restockSubscribed.has(pid)) {
                          await unsubscribeRestock(pid).catch(() => {});
                          setRestockSubscribed(prev => { const s = new Set(prev); s.delete(pid); return s; });
                        } else {
                          await subscribeRestock(pid).catch(() => {});
                          setRestockSubscribed(prev => new Set(prev).add(pid));
                        }
                      }}
                      style={{ flex: 1, padding: '16px', borderRadius: '12px', background: restockSubscribed.has(selectedProduct.id) ? '#888' : '#111', color: 'white', fontWeight: 800, textAlign: 'center', cursor: 'pointer' }}
                    >
                      {restockSubscribed.has(selectedProduct.id) ? '알림 취소' : '재입고 알림 신청하기'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            await addCartItem(selectedProduct.id, productQty);
                            setShowCart(true);
                          } catch {
                            alert('장바구니 담기에 실패했습니다.');
                          }
                        }}
                        style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #C2507A', color: '#C2507A', fontWeight: 800, textAlign: 'center', cursor: 'pointer' }}
                      >장바구니 담기</button>
                      <button
                        onClick={() => {
                          setCheckoutData({ type: 'product', title: selectedProduct.name, price: Number(selectedProduct.price), qty: productQty, option: productOption, productId: selectedProduct.id, accessTicket: null });
                          setActiveTab('CHECKOUT');
                        }}
                        style={{ flex: 1, padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #C2507A, #7F77DD)', color: 'white', fontWeight: 800, textAlign: 'center', cursor: 'pointer' }}
                      >바로 구매하기</button>
                    </>
                  )}
                </div>

                    <div style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text-sub)', background: 'var(--bg-cream)', padding: '16px', borderRadius: '8px' }}>
                      <div>📦 일반배송 3,000원 · 3~5일 소요</div>
                      <div>🔄 7일 이내 교환/반품 가능</div>
                      <div>✅ 정품 보증</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '48px' }}>
                  {[{ id: 'DETAIL', label: '상품설명' }, { id: 'DELIVERY', label: '배송/교환' }, { id: 'REVIEW', label: '구매후기(24)' }].map(tab => (
                    <button key={tab.id} onClick={() => setProductTab(tab.id)} style={{ flex: 1, padding: '24px 0', fontWeight: 800, fontSize: '16px', color: productTab === tab.id ? 'var(--text-main)' : 'var(--text-sub)', borderBottom: productTab === tab.id ? '2px solid var(--text-main)' : 'none', transition: 'all 0.2s' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {productTab === 'DETAIL' && (
                  <div>
                    <div style={{ width: '100%', height: '600px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', borderRadius: '16px', marginBottom: '48px' }}>
                      [상품 상세 이미지 영역]
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>상품 스펙</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '48px', fontSize: '14px' }}>
                      <tbody>
                        {[
                          { k: '상품명', v: '한정 포토북 3D에디션' },
                          { k: '구성', v: '포토북 1권 + 포토카드 3장' },
                          { k: '크기', v: 'A4 (210 × 297mm)' },
                          { k: '페이지', v: '200P' },
                          { k: '제조사', v: 'FANDROPS x 별빛스튜디오' },
                        ].map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '16px', background: 'var(--bg-cream)', width: '200px', fontWeight: 700 }}>{row.k}</td>
                            <td style={{ padding: '16px' }}>{row.v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p style={{ fontSize: '12px', color: 'var(--text-sub)', lineHeight: 1.6 }}>* 본 상품 이미지는 이해를 돕기 위한 예시 컷으로 실제 상품과 다를 수 있습니다.</p>
                  </div>
                )}
                {productTab === 'DELIVERY' && (
                  <div style={{ fontSize: '15px', lineHeight: 1.8 }}>
                    <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>배송 정보</h3>
                    <ul style={{ listStyle: 'disc', paddingLeft: '24px', marginBottom: '32px' }}>
                      <li>배송 방법: 택배배송</li>
                      <li>배송 지역: 전국 (일부 지역 제외)</li>
                      <li>배송 비용: 3,000원 (도서산간 지역 추가 비용 발생)</li>
                      <li>배송 기간: 결제 완료 후 3~5 영업일 이내</li>
                    </ul>
                    <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>교환/반품 안내</h3>
                    <ul style={{ listStyle: 'disc', paddingLeft: '24px' }}>
                      <li>상품 수령 후 7일 이내에 교환/반품이 가능합니다.</li>
                      <li>단순 변심으로 인한 교환/반품 시 배송비는 고객 부담입니다.</li>
                      <li>상품이 훼손되거나 사용 흔적이 있는 경우 교환/반품이 불가합니다.</li>
                    </ul>
                  </div>
                )}
                {productTab === 'REVIEW' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px', padding: '32px', background: 'var(--bg-cream)', borderRadius: '16px' }}>
                      <div style={{ fontSize: '48px', fontWeight: 800 }}>4.2</div>
                      <div>
                        <div style={{ color: '#F59E0B', fontSize: '24px', letterSpacing: '4px', marginBottom: '8px' }}>★★★★☆</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-sub)' }}>총 24개의 리뷰가 있습니다.</div>
                      </div>
                    </div>
                    {[1,2,3].map(item => (
                      <div key={item} style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#ccc' }}></div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>FanUser{item}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>2025-09-1{item} | 버전 A 구매</div>
                          </div>
                        </div>
                        <div style={{ color: '#F59E0B', fontSize: '14px', letterSpacing: '2px', marginBottom: '12px' }}>★★★★★</div>
                        <p style={{ fontSize: '14px', lineHeight: 1.6 }}>너무 예뻐요! 배송도 빠르고 포장도 꼼꼼하게 잘 되어 왔습니다. 특전 포카도 최애가 나와서 너무 행복해요 ㅠㅠ</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              
              <>

<div style={{ padding: '0', maxWidth: 'none', marginTop: '-40px' }}>
  <div style={{ padding: '20px 0 0 0' }}>
    <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '200px', marginBottom: '20px', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
      {banners.length === 0 ? (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #C8BEB6, #9A8B82)', display: 'flex', alignItems: 'flex-end', padding: '24px 60px' }}>
          <div style={{ color: 'white' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>FANDROPS STORE</h2>
          </div>
        </div>
      ) : (
        <>
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              style={{
                position: 'absolute',
                inset: 0,
                background: banner.imageUrl
                  ? `url(${banner.imageUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #C8BEB6, #9A8B82)',
                opacity: storeBannerIdx === i ? 1 : 0,
                transition: 'opacity 0.55s ease',
                pointerEvents: storeBannerIdx === i ? 'auto' : 'none',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,26,26,0.48) 0%, transparent 58%)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '60px', right: '80px', color: 'white' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '10px', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{banner.title}</h2>
              </div>
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 2 }}>
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`배너 ${i + 1}`}
                onClick={() => setStoreBannerIdx(i)}
                style={{
                  width: storeBannerIdx === i ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  border: 'none',
                  background: storeBannerIdx === i ? 'white' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="이전 배너"
            onClick={() => setStoreBannerIdx((idx) => (idx - 1 + banners.length) % banners.length)}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#111', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="다음 배너"
            onClick={() => setStoreBannerIdx((idx) => (idx + 1) % banners.length)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#111', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  </div>
  <div style={{ padding: '8px 0 0 0' }}>
    <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '24px', marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0 }}>마이 아티스트</h3>
         <button 
           onClick={() => setShowArtistSearch(true)}
           style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#888', fontSize: '13px', fontWeight: 600 }}
         >
           <Search size={14} />
           아티스트 검색
         </button>
       </div>
       <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '40px', marginTop: '-15px', alignItems: 'flex-start', paddingTop: '20px' }} className="hide-scrollbar">
          {/* ALL option */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '72px' }} onClick={() => setStoreArtist('ALL')}>
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: (storeArtist === 'ALL') ? '2px solid #111' : '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '15px', fontWeight: 800 }}>ALL</span>
             </div>
             <span style={{ fontSize: '13px', color: '#111', fontWeight: 600 }}>전체</span>
          </div>

          {favoriteArtists.map(a => (
                        <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '72px' }} onClick={() => {
                          if (activeTab === 'STORE') setStoreArtist(String(a.id));
                        }}>
                           <div style={{ position: 'relative' }}>
                             <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: (storeArtist === String(a.id)) ? '2px solid #111' : '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', whiteSpace: 'nowrap', transition: 'all 0.2s', fontWeight: 800, fontSize: '14px' }}>
                                {a.name.substring(0,3)}
                             </div>
                           </div>
                           <span style={{ fontSize: '13px', color: '#111', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.name}</span>
                        </div>
          ))}

          {/* ADD MORE button at the end */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '72px' }} onClick={() => setShowArtistSearch(true)}>
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px dashed #DDD', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
                <Plus size={24} color="#888" />
             </div>
             <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>조회</span>
          </div>
       </div>
    </div>
  </div>
  <div style={{ padding: '16px 0 32px 0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
      {/* 카테고리 필터: BE API에 category 필드 추가 후 활성화 예정 */}
      <div />
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input 
            type="text" 
            placeholder="상품 검색" 
            value={storeSearch}
            onChange={(e) => { setStoreSearch(e.target.value); setStorePage(1); }}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '20px', border: '1px solid #EDE8E2', fontSize: '13px', outline: 'none' }} 
          />
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setIsStoreSortDropdownOpen(!isStoreSortDropdownOpen)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#111' }}>
            {storeSort} <span style={{ fontSize: '10px' }}>▼</span>
          </button>
          {isStoreSortDropdownOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '1px solid #EDE8E2', borderRadius: '8px', zIndex: 100, width: '140px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              {SORT_OPTIONS.map(s => (
                <div key={s} onClick={() => { setStoreSort(s); setIsStoreSortDropdownOpen(false); setStorePage(1); }} style={{ padding: '12px 16px', fontSize: '13px', cursor: 'pointer', color: storeSort === s ? '#111' : '#888', fontWeight: storeSort === s ? 700 : 500 }}>{s}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    {(storeArtist !== 'ALL' || storeCategory !== '전체') && (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
        {storeArtist !== 'ALL' && (
          <span style={{ background: '#F7F3EE', border: '1px solid #EDE8E2', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#111', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {favoriteArtists.find(a => String(a.id) === storeArtist)?.name ?? storeArtist} <X size={12} cursor="pointer" onClick={() => setStoreArtist('ALL')} />
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
    {storeLoading && storeItems.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '64px', color: '#888', fontWeight: 600 }}>상품을 불러오는 중...</div>
    ) : (
    <>{(() => {
      const searchLower = storeSearch.toLowerCase();
      const filteredItems = getSortedItems(
        storeSearch
          ? storeItems.filter(item => item.name.toLowerCase().includes(searchLower))
          : storeItems,
        storeSort,
      );

      const renderGridCard = (item: ProductResponse) => {
        const isSoldOut = item.status === 'SOLD_OUT';
        const progress = isSoldOut ? 100 : item.totalQty > 0 ? (item.remainingQty / item.totalQty) * 100 : 0;
        return (
          <div
            key={item.id}
            className="card reveal"
            style={{ opacity: isSoldOut ? 0.6 : 1, cursor: 'pointer' }}
            onClick={() => { setSelectedProduct(item); }}
          >
            <div style={{ position: 'relative', height: '220px', background: 'var(--bg-cream)' }}>
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                아티스트 #{item.artistId}
              </div>
              {item.remainingQty > 0 && !isSoldOut && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: (item.remainingQty / Math.max(1, item.totalQty)) <= 0.3 ? '#E11D48' : '#10B981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                  {item.remainingQty}개 남음
                </div>
              )}
              {isSoldOut && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: '20px', fontWeight: 900, letterSpacing: '2px' }}>품 절</span>
                </div>
              )}
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ height: '4px', background: '#F0F0F0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: isSoldOut ? '#ccc' : 'linear-gradient(90deg, #C2507A, #7F77DD)' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#111', flex: 1 }}>₩{Number(item.price).toLocaleString()}</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {!isSoldOut && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await addCartItem(item.id, 1);
                          setShowCart(true);
                        } catch {
                          alert('장바구니 담기에 실패했습니다.');
                        }
                      }}
                      style={{ background: 'white', color: '#111', border: '1px solid #EDE8E2', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="장바구니 담기"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  )}
                  {isSoldOut && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const pid = item.id;
                        if (restockSubscribed.has(pid)) {
                          await unsubscribeRestock(pid).catch(() => {});
                          setRestockSubscribed(prev => { const s = new Set(prev); s.delete(pid); return s; });
                        } else {
                          await subscribeRestock(pid).catch(() => {});
                          setRestockSubscribed(prev => new Set(prev).add(pid));
                        }
                      }}
                      style={{ background: restockSubscribed.has(item.id) ? '#f0f0f0' : 'white', color: restockSubscribed.has(item.id) ? '#888' : '#C2507A', border: '1px solid #EDE8E2', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title={restockSubscribed.has(item.id) ? '알림 취소' : '재입고 알림'}
                    >
                      <Bell size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isSoldOut}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSoldOut) {
                        setCheckoutData({ type: 'product', title: item.name, price: Number(item.price), qty: 1, option: 'Version A', productId: item.id, accessTicket: null });
                        setActiveTab('CHECKOUT');
                      }
                    }}
                    style={{ background: isSoldOut ? '#ccc' : '#111', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: isSoldOut ? 'not-allowed' : 'pointer' }}
                  >
                    구매
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#888', fontWeight: 600, background: 'white', borderRadius: '20px', border: '1px solid #EDE8E2' }}>조건에 맞는 상품이 없습니다.</div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: 0 }}>전체 상품</h3>
                <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>{filteredItems.length} items</span>
                <div style={{ flex: 1, minWidth: '48px', height: '1px', background: '#EDE8E2' }} />
              </div>

              <div className="grid-3" style={{ gap: '24px' }}>
                {filteredItems.map((item) => renderGridCard(item))}
              </div>

              {storeHasMore && (
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={storeLoading}
                    style={{ padding: '12px 32px', borderRadius: '24px', border: '1px solid #EDE8E2', background: 'white', color: '#111', fontSize: '14px', fontWeight: 700, cursor: storeLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: storeLoading ? 0.6 : 1 }}
                    onMouseOver={(e) => { if (!storeLoading) e.currentTarget.style.background = '#FAFAFA'; }}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {storeLoading ? '불러오는 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    })()}</>
    )}
  </div>
</div>
              </>

            )}
          </div>
        )}


      </div>
      


      
        {/* --- QUEUE WAIT --- */}
        {activeTab === 'QUEUE_WAIT' && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-cream)' }}>
            <div style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '440px', width: '100%' }}>
              {queueState.phase === 'EXPIRED' ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚠️</div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>대기열이 만료되었습니다</h2>
                  <p style={{ color: 'var(--text-sub)', marginBottom: '32px' }}>다시 시도해 주세요.</p>
                  <button onClick={() => { resetQueue(); setActiveTab('STORE'); setCheckoutData(null); }} style={{ padding: '14px 32px', background: '#111', color: 'white', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', border: 'none' }}>스토어로 돌아가기</button>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    style={{ width: '64px', height: '64px', border: '6px solid #EDE8E2', borderTopColor: '#C2507A', borderRadius: '50%', margin: '0 auto 32px' }}
                  />
                  <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>대기열 입장 중</h2>
                  {queueState.position > 0 && (
                    <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--point-rose)', marginBottom: '8px' }}>{queueState.position}번째</p>
                  )}
                  {queueState.estimatedWaitSec > 0 && (
                    <p style={{ color: 'var(--text-sub)', marginBottom: '24px' }}>예상 대기 {Math.ceil(queueState.estimatedWaitSec / 60)}분</p>
                  )}
                  <p style={{ fontSize: '13px', color: 'var(--text-sub)' }}>순서가 되면 자동으로 결제 화면으로 이동합니다.</p>
                  <button onClick={() => { resetQueue(); setActiveTab('STORE'); setCheckoutData(null); }} style={{ marginTop: '32px', padding: '12px 24px', background: 'none', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>취소하기</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- CHECKOUT PAGE --- */}
        {activeTab === 'CHECKOUT' && checkoutData && (
          <div className="page-content reveal" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '80px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>주문서 작성</h1>
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '24px', fontSize: '15px', fontWeight: 700, color: 'var(--text-sub)' }}>
                <span>01 장바구니</span>
                <span style={{ color: 'var(--border)' }}>&gt;</span>
                <span style={{ color: 'transparent', background: 'linear-gradient(135deg, #C2507A, #7F77DD)', WebkitBackgroundClip: 'text', backgroundClip: 'text', fontWeight: 900, borderBottom: '2px solid #C2507A', paddingBottom: '4px' }}>02 주문/결제</span>
                <span style={{ color: 'var(--border)' }}>&gt;</span>
                <span>03 주문완료</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
              {/* Left Form Area */}
              <div style={{ flex: 1 }}>
                
                {/* Section 1 */}
                <section style={{ marginBottom: '48px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', borderBottom: '2px solid #111', paddingBottom: '12px' }}>주문 상품 확인</h3>
                  <div style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#e5e5e5', borderRadius: '8px' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}>{checkoutData.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '4px' }}>옵션: {checkoutData.option}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>수량: {checkoutData.qty}개</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '18px' }}>₩{(checkoutData.price * checkoutData.qty).toLocaleString()}</div>
                  </div>
                </section>

                {/* Section 2: Address */}
                <section style={{ marginBottom: '48px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', borderBottom: '2px solid #111', paddingBottom: '12px' }}>배송지 입력</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>받는 분 *</label>
                      <input value={checkoutForm.name} onChange={e=>setCheckoutForm({...checkoutForm, name: e.target.value})} type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>연락처 *</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input value={checkoutForm.phone1} onChange={e=>setCheckoutForm({...checkoutForm, phone1: e.target.value})} type="text" style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }} />
                        <span style={{ padding: '12px 0' }}>-</span>
                        <input value={checkoutForm.phone2} onChange={e=>setCheckoutForm({...checkoutForm, phone2: e.target.value})} type="text" style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }} />
                        <span style={{ padding: '12px 0' }}>-</span>
                        <input value={checkoutForm.phone3} onChange={e=>setCheckoutForm({...checkoutForm, phone3: e.target.value})} type="text" style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>주소 *</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input value={checkoutForm.zipcode} readOnly type="text" placeholder="우편번호" style={{ width: '150px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: '#f5f5f5' }} />
                        <button onClick={() => setCheckoutForm({...checkoutForm, zipcode: '12345 서울시 강남구 테헤란로 123'})} style={{ padding: '0 24px', background: 'var(--text-main)', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}>우편번호 검색 🔍</button>
                      </div>
                      <input type="text" placeholder="도로명 주소 자동 입력" value={checkoutForm.zipcode.length > 5 ? checkoutForm.zipcode.substring(6) : ''} readOnly style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px', background: '#f5f5f5' }} />
                      <input type="text" placeholder="상세 주소 입력" style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>배송 요청사항</label>
                      <select style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 140 140\' width=\'12\' height=\'12\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M30 40 L70 90 L110 40\' stroke=\'black\' stroke-width=\'10\' fill=\'none\'/></svg>") no-repeat right 16px center' }}>
                        <option>부재시 문앞에 놓아주세요</option>
                        <option>경비실에 맡겨주세요</option>
                        <option>배송 전 연락주세요</option>
                        <option>직접 입력</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        <input type="checkbox" checked={checkoutForm.defaultAddr} onChange={e=>setCheckoutForm({...checkoutForm, defaultAddr: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                        기본 배송지로 저장
                      </label>
                    </div>
                  </div>
                </section>

                {/* Section 3: Payment */}
                <section style={{ marginBottom: '48px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', borderBottom: '2px solid #111', paddingBottom: '12px' }}>결제 수단</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={payMethod === 'toss'} onChange={() => setPayMethod('toss')} name="pay" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontWeight: 700 }}>● 토스페이먼츠 (파란 로고)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={payMethod === 'kakao'} onChange={() => setPayMethod('kakao')} name="pay" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontWeight: 700 }}>○ 카카오페이 (노란 로고)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={payMethod === 'card'} onChange={() => setPayMethod('card')} name="pay" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontWeight: 700 }}>○ 신용/체크카드</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={payMethod === 'bank'} onChange={() => setPayMethod('bank')} name="pay" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontWeight: 700 }}>○ 무통장 입금</span>
                    </label>
                  </div>
                </section>

                {/* Section 4: Coupons */}
                <section style={{ marginBottom: '48px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', borderBottom: '2px solid #111', paddingBottom: '12px' }}>할인 혜택</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '80px', fontSize: '14px', fontWeight: 700 }}>쿠폰</span>
                      <select style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 140 140\' width=\'12\' height=\'12\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M30 40 L70 90 L110 40\' stroke=\'black\' stroke-width=\'10\' fill=\'none\'/></svg>") no-repeat right 16px center' }}>
                        <option>쿠폰을 선택하세요</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '80px', fontSize: '14px', fontWeight: 700 }}>포인트</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '8px' }}>보유 12,450P</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="0" style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'right' }} />
                          <button style={{ padding: '0 24px', background: 'var(--text-main)', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}>전액 사용</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 5: Toss */}
                <section style={{ marginBottom: '48px' }}>
                  <div style={{ padding: '24px', background: 'var(--bg-cream)', borderRadius: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px', marginBottom: '16px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '20px', height: '20px' }} />
                      전체 동의
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                        주문 내용 확인 및 결제 동의 (필수)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                        개인정보 제3자 제공 동의 (필수)
                      </label>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Summary */}
              <div style={{ width: '380px', position: 'sticky', top: '120px', background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>주문 요약</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>
                   <span>{checkoutData.title}</span>
                   <span>{checkoutData.qty}개</span>
                   <span>₩{(checkoutData.price * checkoutData.qty).toLocaleString()}</span>
                </div>
                <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '24px 0' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-sub)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>상품 금액</span>
                    <span>₩{(checkoutData.price * checkoutData.qty).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>배송비</span>
                    <span>₩3,000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>쿠폰 할인</span>
                    <span>-₩0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>포인트 사용</span>
                    <span>-₩0</span>
                  </div>
                </div>

                <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '24px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, color: '#C2507A', marginBottom: '32px' }}>
                  <span>최종 결제 금액</span>
                  <span>₩{(checkoutData.price * checkoutData.qty + 3000).toLocaleString()}</span>
                </div>

                {paymentStatus === 'failed' && paymentError && (
                  <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#FFF0F3', border: '1px solid #FFC1CC', borderRadius: '8px', color: '#C0392B', fontSize: '14px', fontWeight: 600 }}>
                    {paymentError}
                  </div>
                )}
                <button
                  onClick={handlePay}
                  id="checkout-btn"
                  style={{ width: '100%', padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, #C2507A, #7F77DD)', color: 'white', fontWeight: 800, fontSize: '18px', textAlign: 'center', transition: 'all 0.2s' }}>
                  ₩{(checkoutData.price * checkoutData.qty + 3000).toLocaleString()} 결제하기
                </button>
              </div>
            </div>
          </div>
        )}


        {/* --- ORDER COMPLETE --- */}
        {activeTab === 'ORDER_COMPLETE' && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-cream)' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '480px', width: '100%' }}
            >
              <CheckCircle2 size={72} color="var(--point-rose)" style={{ marginBottom: '28px' }} />
              <h2 style={{ fontSize: '30px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>주문이 완료되었습니다!</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-sub)', fontWeight: 500, marginBottom: '48px', lineHeight: 1.6 }}>
                결제가 정상적으로 처리되었습니다.<br />마이페이지에서 주문 내역을 확인하세요.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => { setActiveTab('MY PAGE'); setMyPageTab('ORDERS'); resetCheckout(); }}
                  style={{ padding: '16px 32px', background: '#111', color: 'white', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', border: 'none' }}
                >주문 내역 보기</button>
                <button
                  onClick={() => { setActiveTab('HOME'); resetCheckout(); }}
                  style={{ padding: '16px 32px', background: 'var(--bg-white)', color: '#111', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', border: '1px solid var(--border)' }}
                >홈으로</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* --- MY PAGE --- */}
      {!selectedArtist && activeTab === 'MY PAGE' && (
        <div className="page-content reveal wrapper">
          <div className="board-header" style={{height: '240px', marginBottom: '40px', padding: '40px 60px'}}>
            <div className="bh-bg-color" style={{ background: '#1A1A1A' }}></div>
            <div className="bh-content">
              <div className="bh-avatar" style={{ background: 'linear-gradient(135deg, #E8E0D8, #D0C6BE)', width: '120px', height: '120px' }}></div>
              <div className="bh-info">
                <div className="bh-name" style={{ fontSize: '40px' }}>{fanProfile?.nickname ?? '—'}</div>
                <div className="bh-stats" style={{ fontSize: '16px', opacity: 1, color: '#DDD' }}>
                  <span style={{ color: 'var(--point-rose)', fontWeight: 800 }}>VIP 멤버</span> · {fanProfile ? `${new Date(fanProfile.createdAt).getFullYear()}년 가입` : '—'}
                </div>
              </div>
              <button className="c-btn" onClick={() => setShowEditProfile(true)} style={{background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)'}}>프로필 수정</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px' }}>
            <div className="mp-sidebar reveal delay-100">
              <div style={{ marginBottom: '32px' }}>
                <div className={`mp-nav-item ${myPageTab === 'OVERVIEW' ? 'active' : ''}`} onClick={() => setMyPageTab('OVERVIEW')}><User size={18} /> 전체 개요</div>
                <div className={`mp-nav-item ${myPageTab === 'ORDERS' ? 'active' : ''}`} onClick={() => setMyPageTab('ORDERS')}><ShoppingBag size={18} /> 주문 내역</div>
                <div className={`mp-nav-item ${myPageTab === 'TICKETS' ? 'active' : ''}`} onClick={() => setMyPageTab('TICKETS')}><Ticket size={18} /> 나의 티켓</div>
                <div className={`mp-nav-item ${myPageTab === 'COLLECTION' ? 'active' : ''}`} onClick={() => setMyPageTab('COLLECTION')}><ImageIcon size={18} /> 나의 컬렉션</div>
                <div className={`mp-nav-item ${myPageTab === 'SETTINGS' ? 'active' : ''}`} onClick={() => setMyPageTab('SETTINGS')}><Settings size={18} /> 설정</div>
                <div className="mp-nav-item" style={{ color: '#FF4444', marginTop: '20px' }} onClick={() => { logout(); localStorage.removeItem(ROLE_KEY); navigate('/login', { replace: true }); }}><LogOut size={18} /> 로그아웃</div>
              </div>
              
              <div style={{ background: 'var(--bg-cream)', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', marginBottom: '16px', letterSpacing: '1px' }}>계정 정보</h4>
                <div className="mp-stat">
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>포인트</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--point-rose)' }}>12,450 P</span>
                </div>
                <div className="mp-stat">
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>쿠폰</span>
                  <span style={{ fontSize: '16px', fontWeight: 800 }}>3</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {myPageTab === 'OVERVIEW' && (
                <div className="reveal">
                  <h3 style={{fontSize: '24px', fontWeight: 800, marginBottom: '24px'}}>전체 개요</h3>
                  <div className="card" style={{padding: '32px'}}>
                    {activities.length === 0 ? (
                      <p style={{ color: 'var(--text-sub)', fontSize: '15px' }}>최근 활동 내역이 없습니다.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {activities.map(a => (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ flexShrink: 0, color: a.type === 'FEED_LIKE' ? 'var(--point-rose)' : 'var(--point-violet)' }}>
                              {a.type === 'FEED_LIKE' ? <Heart size={16} /> : <MessageSquare size={16} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                                {a.type === 'FEED_LIKE' ? '피드 좋아요' : '댓글 작성'}
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '4px' }}>{a.content}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{formatTime(a.createdAt)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {myPageTab === 'ORDERS' && (
                <div className="reveal">
                  <h3 style={{fontSize: '24px', fontWeight: 800, marginBottom: '24px'}}>주문 내역</h3>
                  <div className="card" style={{padding: '32px'}}>
                    {myOrders.length === 0 ? (
                      <p style={{ color: 'var(--text-sub)', fontSize: '15px' }}>주문 내역이 없습니다.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {myOrders.map(order => {
                          const statusLabel: Record<string, string> = {
                            PENDING: '결제 대기', PAID: '결제 완료', COMPLETED: '구매 완료', CANCELLED: '취소됨', REFUNDED: '환불 완료',
                          };
                          const statusColor: Record<string, string> = {
                            PENDING: '#F5A623', PAID: '#4CAF50', COMPLETED: '#4CAF50', CANCELLED: '#999', REFUNDED: '#7F77DD',
                          };
                          return (
                            <div key={order.orderId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', gap: '16px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 800, color: statusColor[order.status] ?? '#111', background: `${statusColor[order.status] ?? '#111'}18`, padding: '2px 10px', borderRadius: '20px' }}>
                                    {statusLabel[order.status] ?? order.status}
                                  </span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>#{order.orderId}</span>
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 800 }}>
                                  {order.totalAmount.toLocaleString()}원
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>
                                  {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                                </div>
                              </div>
                              {order.status === 'PENDING' && (
                                <button
                                  onClick={async () => {
                                    setCancellingOrderId(order.orderId);
                                    try {
                                      await cancelOrder(order.orderId);
                                      setMyOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: 'CANCELLED' } : o));
                                    } catch {
                                      alert('주문 취소에 실패했습니다.');
                                    } finally {
                                      setCancellingOrderId(null);
                                    }
                                  }}
                                  disabled={cancellingOrderId === order.orderId}
                                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #FF4444', background: 'transparent', color: '#FF4444', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: cancellingOrderId === order.orderId ? 0.5 : 1 }}
                                >
                                  {cancellingOrderId === order.orderId ? '취소 중...' : '주문 취소'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {myPageTab === 'TICKETS' && (
                <div className="reveal">
                  <h3 style={{fontSize: '24px', fontWeight: 800, marginBottom: '24px'}}>나의 티켓</h3>
                  <div className="card" style={{padding: '32px'}}>
                    <p style={{ color: 'var(--text-sub)', fontSize: '15px' }}>보유한 티켓이 없습니다.</p>
                  </div>
                </div>
              )}

              {myPageTab === 'COLLECTION' && (
                <div className="reveal">
                  <h3 style={{fontSize: '24px', fontWeight: 800, marginBottom: '24px'}}>나의 컬렉션</h3>
                  {collectedCards.length > 0 ? (
                    <div className="grid-3">
                      {collectedCards.map(card => (
                        <div key={card.id} className="card" style={{ height: 'fit-content' }}>
                          <div className="c-img" style={{ height: '300px' }}>
                            <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="c-tag">DIGITAL PC</div>
                          </div>
                          <div className="c-body" style={{ padding: '20px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--point-rose)', marginBottom: '4px' }}>{card.artistName}</div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>{card.title}</h3>
                            <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>획득일: {card.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card" style={{padding: '48px', textAlign: 'center'}}>
                      <Gift size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
                      <p style={{ color: 'var(--text-sub)', fontSize: '15px' }}>아직 수집한 아이템이 없습니다. 아티스트 출석 이벤트에 참여해보세요!</p>
                    </div>
                  )}
                </div>
              )}

              {myPageTab === 'SETTINGS' && (
                <div className="reveal">
                  <h3 style={{fontSize: '24px', fontWeight: 800, marginBottom: '24px'}}>설정</h3>
                  <div className="card" style={{padding: '32px'}}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px' }}>알림 설정</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>모든 알림 수신 동의</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>비활성화 시 모든 푸시 알림이 중단됩니다</div>
                      </div>
                      
                      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', opacity: isNotifUpdating ? 0.5 : 1, cursor: isNotifUpdating ? 'not-allowed' : 'pointer' }}>
                        <input 
                          type="checkbox" 
                          style={{ opacity: 0, width: 0, height: 0 }} 
                          checked={isAllowNotification}
                          disabled={isNotifUpdating}
                          onChange={async (e) => {
                            const newVal = e.target.checked;
                            setIsNotifUpdating(true);
                            try {
                              const updated = await updateMyProfile({ allowNotification: newVal });
                              setIsAllowNotification(updated.allowNotification);
                              setFanProfile(prev => prev ? { ...prev, allowNotification: updated.allowNotification } : prev);
                            } catch {
                              // 실패 시 토글 원복 없음 — 다음 API 호출에서 서버 값으로 덮어씌워짐
                            } finally {
                              setIsNotifUpdating(false);
                            }
                          }}
                        />
                        <span style={{
                          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: isAllowNotification ? 'var(--point-rose)' : '#e5e7eb',
                          transition: '.4s', borderRadius: '34px'
                        }}>
                          <span style={{
                            position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
                            backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                            transform: isAllowNotification ? 'translateX(20px)' : 'translateX(0)'
                          }}></span>
                        </span>
                      </label>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px', marginTop: '24px' }}>보안</h4>
                    <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>계정 보안 설정을 관리하세요.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* --- ATTENDANCE MODAL --- */}
      <AnimatePresence>
        {showAttendance && (
          <motion.div 
            className="modal-overlay" 
            style={{ zIndex: 2000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              style={{ maxWidth: '480px', padding: '40px', position: 'relative' }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <button 
                onClick={() => setShowAttendance(false)}
                style={{ 
                  position: 'absolute', top: '20px', right: '20px', 
                  background: 'var(--bg-cream)', border: 'none', borderRadius: '50%', 
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-main)', zIndex: 10
                }}
              >
                <X size={18} />
              </button>
              {attendanceStep !== 'REWARD' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--point-rose)', letterSpacing: '2px', marginBottom: '8px' }}>ATTENDANCE EVENT</div>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>데일리 출석 완료!</h2>
                    <p style={{ color: 'var(--text-sub)', fontSize: '15px' }}>7일간의 꾸준한 팬심을 증명하셨네요!</p>
                  </div>

                  <div className="attendance-grid">
                    {[1, 2, 3, 4, 5, 6].map(day => (
                      <div key={day} className="day-cell active">
                        <span className="day-num">{day}일차</span>
                        <CheckCircle2 size={24} className="stamp-icon" />
                      </div>
                    ))}
                    
                    <div className="day-cell active final-day">
                      <span className="day-num">7일차</span>
                      <motion.div
                        initial={{ scale: 3, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: -5 }}
                        transition={{ 
                          type: 'spring', 
                          damping: 25, 
                          stiffness: 70, 
                          delay: 0.1 
                        }}
                        onAnimationComplete={() => {
                          setTimeout(() => setAttendanceStep('REWARD'), 20);
                        }}
                      >
                        <CheckCircle2 size={32} className="stamp-icon" style={{ filter: 'drop-shadow(0 4px 8px rgba(194, 80, 122, 0.4))' }} />
                      </motion.div>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--bg-cream)', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--text-sub)' }}>
                    7일 완성 시 <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>미공개 디지털 포토카드</span> 제공
                  </div>
                </>
              ) : (
                <div className="reward-reveal">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ 
                        display: 'inline-flex', padding: '8px 16px', background: 'var(--point-rose)', color: 'white', 
                        borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '16px' 
                      }}>
                        REWARD UNLOCKED
                      </div>
                      <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>미공개 포토카드 획득!</h2>
                      <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>내 보관함에서 언제든 확인할 수 있습니다!</p>
                    </div>

                    <motion.div 
                      className="photocard-preview"
                      initial={{ filter: "blur(30px)", x: 0, rotate: 0 }}
                      animate={{ 
                        filter: ["blur(30px)", "blur(30px)", "blur(0px)"],
                        x: [0, -30, 30, -30, 30, -30, 30, -30, 30, -30, 30, -30, 30, -30, 30, -30, 30, 0, 0, 0],
                        rotate: [0, -6, 6, -6, 6, -6, 6, -6, 6, -6, 6, -6, 6, -6, 6, -6, 6, 0, 0, 0],
                      }}
                      transition={{ 
                        filter: { duration: 2.2, times: [0, 0.85, 1], ease: "easeOut" },
                        x: { 
                          duration: 2.2, 
                          times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.95, 1],
                          ease: "linear"
                        },
                        rotate: { 
                          duration: 2.2, 
                          times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.95, 1],
                          ease: "linear"
                        }
                      }}
                    >
                      <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=600" alt="Special Photocard" />
                      <div className="shine"></div>
                      <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', textAlign: 'left' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.8 }}>EXCLUSIVE DROP</div>
                        <div style={{ fontSize: '16px', fontWeight: 900 }}>{selectedArtist?.name || 'NOVA'}: Behind</div>
                      </div>
                    </motion.div>

                    <button
                      className="btn-primary"
                      style={{ background: 'var(--point-rose)' }}
                      onClick={() => {
                        const newCard = {
                          id: Date.now(),
                          artistName: selectedArtist?.name || 'NOVA',
                          title: `${selectedArtist?.name || 'NOVA'}: Behind`,
                          img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=600',
                          date: new Date().toLocaleDateString()
                        };
                        setCollectedCards(prev => [...prev, newCard]);
                        setShowAttendance(false);
                        setActiveTab('MY PAGE');
                        setMyPageTab('COLLECTION');
                        setSelectedArtist(null);
                      }}
                    >
                      보관함으로 가기
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Footer Placeholder */}
      
        <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 100 }}>
          <button style={{ 
            background: 'white', 
            border: '1px solid var(--border)', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 800, 
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            KOR | ENG
          </button>
        </div>

      {/* Schedule Detail Modal */}
      {showScheduleModal && selectedSchedule && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div 
            className="modal-content-custom" 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header-accent">
               <div className="modal-header-bg" />
               <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                 <div style={{ fontSize: '10px', fontWeight: 900, color: '#7F77DD', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
                   Official Schedule
                 </div>
                 <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', lineHeight: 1.2, margin: '0 0 12px 0', padding: '0 20px' }}>
                   {selectedSchedule.title}
                 </h3>
                 <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '20px', fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   {selectedSchedule.type} EVENT
                 </div>
               </div>
               <div 
                 style={{ position: 'absolute', right: '20px', top: '20px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} 
                 onClick={() => setShowScheduleModal(false)}
                 onMouseEnter={e => e.currentTarget.style.color = 'white'}
                 onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
               >
                 <X size={18} />
               </div>
            </div>

            <div className="modal-body-custom">
              <div className="schedule-grid-50">
                <div className="schedule-info-box">
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#A0958C', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Event Date</span>
                  <div style={{ fontWeight: 900, color: '#111', fontSize: '14px' }}>{scheduleDateTime(selectedSchedule.startTime).fullDate}</div>
                </div>
                <div className="schedule-info-box">
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#A0958C', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Time (KST)</span>
                  <div style={{ fontWeight: 900, color: '#111', fontSize: '14px' }}>{scheduleDateTime(selectedSchedule.startTime).time}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedSchedule.noticeId ? (
                  <button 
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      fontSize: '14px', 
                      fontWeight: 900, 
                      color: 'white', 
                      background: '#C2507A', 
                      border: 'none', 
                      cursor: 'pointer', 
                      boxShadow: '0 10px 20px -5px rgba(194, 80, 122, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onClick={() => {
                      const linkedNotice = notices.find(n => n.id === selectedSchedule.noticeId);
                      if (linkedNotice) {
                        setSelectedNotice(linkedNotice);
                        setShowScheduleModal(false);
                      }
                    }}
                  >
                    <Bell size={16} /> 공지사항 보러가기
                  </button>
                ) : (
                  <button 
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      fontSize: '14px', 
                      fontWeight: 900, 
                      color: '#B0AAA4', 
                      background: '#E0D8D0', 
                      border: 'none', 
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    disabled
                  >
                    <Bell size={16} /> 상세 공지사항이 없습니다
                  </button>
                )}
                <button 
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    color: '#888', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowScheduleModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notice Detail Page Overlay */}
      {selectedNotice && (
        <div className="notice-full-overlay">
          <div className="notice-detail-container">
            <header className="notice-detail-header">
              <button 
                onClick={() => setSelectedNotice(null)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '11px', 
                  fontWeight: 900, 
                  color: '#111', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px' 
                }}
              >
                <ChevronLeft size={16} /> Close notice
              </button>
              <div style={{ fontSize: '10px', fontWeight: 900, color: '#C2507A', letterSpacing: '4px', textTransform: 'uppercase' }}>Official Notice</div>
              <div style={{ width: '40px' }} />
            </header>

            <main className="notice-detail-main">
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', padding: '4px 16px', background: '#111', borderRadius: '20px', fontSize: '10px', fontWeight: 900, color: 'white', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px' }}>
                    {selectedNotice.tag}
                  </div>
                  <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#111', lineHeight: 1.2, margin: '0 0 32px 0' }}>
                    {selectedNotice.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '11px', fontWeight: 700, color: '#A0958C', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span>FANDROPS</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(194, 80, 122, 0.2)' }} />
                    <span>{selectedNotice.date}</span>
                  </div>
                </div>

                <div style={{ fontSize: '16px', color: '#444', lineHeight: 1.8, fontWeight: 500, paddingTop: '48px', borderTop: '1px solid #EDE8E2' }}>
                  <p style={{ marginBottom: '32px' }}>안녕하세요, FANDROPS입니다.</p>
                  
                  <div style={{ padding: '32px', background: '#F7F3EE', borderRadius: '24px', border: '1px solid #EDE8E2', marginBottom: '48px' }}>
                    <p style={{ fontWeight: 900, color: '#111', fontSize: '18px', marginBottom: '16px' }}>안내 말씀</p>
                    <p style={{ color: '#666', lineHeight: 1.6 }}>
                      "{selectedNotice.title}"와 관련하여 팬 여러분께 안내 말씀 드립니다. 
                      아티스트를 아껴주시는 팬 여러분께 진심으로 감사드리며, 상세 일정 및 참여 방법은 추후 공식 채널을 통해 다시 한 번 안내해 드릴 예정입니다.
                    </p>
                  </div>

                  <p style={{ marginBottom: '32px', fontWeight: 600 }}>
                    팬 여러분의 많은 관심과 응원 부탁드립니다.
                  </p>
                  
                  <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px dashed #EDE8E2' }}>
                    <p style={{ fontWeight: 900, color: '#111' }}>감사합니다.</p>
                  </div>
                  
                  {selectedNotice.type === 'TICKET' && (
                    <div style={{ 
                      marginTop: '64px', 
                      padding: '40px', 
                      background: '#111', 
                      borderRadius: '40px', 
                      color: 'white', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                      position: 'relative', 
                      overflow: 'hidden' 
                    }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: '#C2507A', opacity: 0.15, filter: 'blur(60px)' }} />
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <h4 style={{ fontWeight: 900, color: 'white', fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Ticket size={24} color="#C2507A" /> 티켓 예매 정보 안내
                        </h4>
                        <div style={{ marginBottom: '40px', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '16px' }}>
                             <span>선예매 일정</span>
                             <span style={{ fontWeight: 900, color: 'white' }}>2026.06.10 20:00 KST</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                             <span>일반 예매</span>
                             <span style={{ fontWeight: 900, color: 'white' }}>2026.06.12 20:00 KST</span>
                          </div>
                        </div>
                        <button style={{ width: '100%', padding: '20px', borderRadius: '16px', background: 'linear-gradient(to right, #C2507A, #7F77DD)', color: 'white', fontWeight: 900, fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(194, 80, 122, 0.4)' }}>
                          예매 사이트 바로가기
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ height: '120px' }} />
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      <footer style={{marginTop: 100, padding: '60px 40px', background: 'var(--bg-white)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '2px', marginBottom: '16px' }}>FANDROPS<span style={{ color: '#C2507A' }}>.</span></div>
          <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '32px' }}>© 2026 FANDROPS. All rights reserved.</div>
          
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '40px' }}>
            <span style={{ cursor: 'pointer' }}>서비스 이용약관</span>
            <span style={{ cursor: 'pointer', color: 'var(--text-main)' }}>개인정보처리방침</span>
            <span style={{ cursor: 'pointer' }}>고객센터</span>
            <span style={{ cursor: 'pointer' }}>공지사항</span>
          </div>

          <hr style={{ width: '100%', borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '0 0 32px 0' }} />

          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '16px' }}>비즈니스 문의</div>
          <button onClick={() => navigate('/apply')} style={{ background: '#111', color: 'white', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, marginBottom: '16px' }}>
            파트너 입점 신청 →
          </button>
          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>기획사/아티스트 전용 플랫폼입니다</div>
        </div>
      </footer>

    </div>
  );
}
