import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Ticket, CreditCard, Bot, Clock,
  ShoppingBag, Activity,
  CheckCircle, X, ShoppingCart,
  Loader2, ArrowRight, Server, Play, ShieldAlert, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Product Interface
interface Product {
  id: string;
  name: string;
  price: number;
  type: 'regular' | 'drops';
  status: 'ON_SALE' | 'SOLD_OUT';
  availableQty: number;
  totalQty: number;
  dropsStartAt?: string;
  dropsEndAt?: string;
  imageUrl: string;
}

// Message Interface for Gemini Chat
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function App() {
  // Mode selection: Sandbox Simulation vs Real API
  const [isSandbox, setIsSandbox] = useState<boolean>(true);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  // Products state
  const [products] = useState<Product[]>(() => [
    {
      id: 'prod_regular_001',
      name: '아티스트 공식 응원봉 Ver.2',
      price: 49000,
      type: 'regular',
      status: 'ON_SALE',
      availableQty: 120,
      totalQty: 200,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prod_drops_001',
      name: '[오픈런 드롭스] 한정판 스페셜 포토북 패키지',
      price: 89000,
      type: 'drops',
      status: 'ON_SALE',
      availableQty: 15,
      totalQty: 15,
      dropsStartAt: new Date(Date.now() + 1000 * 60 * 3).toISOString(), // Starts in 3 mins
      dropsEndAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prod_drops_002',
      name: '[오픈런 드롭스] 아티스트 친필 사인 LP 레코드',
      price: 150000,
      type: 'drops',
      status: 'ON_SALE',
      availableQty: 5,
      totalQty: 5,
      dropsStartAt: new Date(Date.now() - 1000 * 30).toISOString(), // Already started
      dropsEndAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1539628399243-734011af406e?auto=format&fit=crop&w=300&q=80'
    }
  ]);

  // Cart state
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Queue state
  const [queueStatus, setQueueStatus] = useState<'IDLE' | 'WAITING' | 'PROCESSING' | 'DONE'>('IDLE');
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [queueTicket, setQueueTicket] = useState<string | null>(null);
  const [queueProgress, setQueueProgress] = useState<number>(0);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  // Order & Payment state
  const [orderState, setOrderState] = useState<'NONE' | 'CREATING' | 'RESERVED' | 'CHECKOUT' | 'PAID' | 'FAILED'>('NONE');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderPaymentKey, setOrderPaymentKey] = useState<string | null>(null);
  const [tossPaymentKey, setTossPaymentKey] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [checkoutSelectedCard, setCheckoutSelectedCard] = useState<string>('toss');

  // Gemini state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: '안녕하세요! FANDROPS AI 어시스턴트입니다. 대기열 작동 방식, 결제 식별자 정책 등에 대해 궁금한 점을 질문해 보세요!',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // System simulated metrics
  const [activeConnections, setActiveConnections] = useState<number>(342);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Check Backend Connection status
  useEffect(() => {
    const checkConnection = async () => {
      const start = Date.now();
      try {
        const res = await fetch('/api/v1/fans/me', {
          headers: { 'Authorization': 'Bearer test-token' }
        });
        if (res.ok || res.status === 401) {
          setBackendConnected(true);
          setBackendLatency(Date.now() - start);
          // If backend is active, default to Real API mode
          setIsSandbox(false);
        } else {
          setBackendConnected(false);
          setIsSandbox(true);
        }
      } catch {
        setBackendConnected(false);
        setIsSandbox(true);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update dynamic metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnections(prev => {
        const delta = Math.floor(Math.random() * 21) - 10;
        const next = prev + delta;
        return next > 0 ? next : 10;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer calculation for drops products
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Wait Queue Simulation Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (queueStatus === 'WAITING' && isSandbox) {
      timer = setInterval(() => {
        setQueuePosition(pos => {
          if (pos <= 1) {
            setQueueStatus('PROCESSING');
            setQueueProgress(100);
            // Simulate ticket generation
            const mockTicket = 'tkt_' + Math.random().toString(36).substring(2, 12);
            setQueueTicket(mockTicket);
            return 0;
          }
          const nextPos = pos - Math.max(1, Math.floor(Math.random() * 5));
          const totalSteps = 150; // Total starting pos
          setQueueProgress(Math.floor(((totalSteps - nextPos) / totalSteps) * 100));
          return nextPos;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [queueStatus, isSandbox]);

  // SSE/Polling for real backend queue
  useEffect(() => {
    let sse: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    if (queueStatus === 'WAITING' && !isSandbox && targetProduct) {
      if (window.EventSource) {
        // SSE mode
        sse = new EventSource(`/api/v1/queue/stream/${targetProduct.id}`);
        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setQueuePosition(data.position);
            if (data.status === 'PROCESSING' || data.status === 'DONE') {
              setQueueStatus('PROCESSING');
              setQueueTicket(data.token || 'tkt_backend_verified');
              sse?.close();
            }
          } catch (e) {
            console.error('SSE JSON error', e);
          }
        };
        sse.onerror = () => {
          console.warn('SSE disconnected, falling back to Polling');
          sse?.close();
        };
      }

      // Fallback/Simultaneous Poll
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/v1/queue/status?productId=${targetProduct.id}`);
          if (res.ok) {
            const data = await res.json();
            setQueuePosition(data.position);
            if (data.status === 'PROCESSING' || data.status === 'DONE') {
              setQueueStatus('PROCESSING');
              setQueueTicket(data.token || 'tkt_backend_verified');
              if (pollInterval) clearInterval(pollInterval);
            }
          }
        } catch (e) {
          console.error('Polling error', e);
        }
      }, 2000);
    }

    return () => {
      sse?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [queueStatus, isSandbox, targetProduct]);

  // Handle Buy Now (Triggers Wait Queue)
  const handleBuyNow = (product: Product) => {
    setTargetProduct(product);
    setPaymentAmount(product.price);
    
    if (product.type === 'drops') {
      // Put user in Wait Queue
      setQueueStatus('WAITING');
      setQueuePosition(150);
      setQueueProgress(0);
      setQueueTicket(null);
      setOrderState('NONE');

      if (!isSandbox) {
        // Call real queue join backend
        fetch(`/api/v1/queue/join/${product.id}`, { method: 'POST' })
          .catch(e => console.error('Failed to join queue', e));
      }
    } else {
      // Regular product: Directly create order
      triggerCreateOrder(product, null);
    }
  };

  // Trigger Create Order (F04-04)
  const triggerCreateOrder = async (product: Product, ticket: string | null) => {
    setOrderState('CREATING');
    
    if (isSandbox) {
      // Simulate API request delay
      setTimeout(() => {
        const mockOrderId = 'ord_' + Math.random().toString(36).substring(2, 10);
        const mockOrderPaymentKey = 'opk_' + Math.random().toString(36).substring(2, 15);
        setOrderId(mockOrderId);
        setOrderPaymentKey(mockOrderPaymentKey);
        setOrderState('CHECKOUT');
      }, 1200);
    } else {
      try {
        const res = await fetch('/api/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            accessTicket: ticket,
            items: [{ productId: product.id, quantity: 1 }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          setOrderId(data.orderId);
          setOrderPaymentKey(data.orderPaymentKey);
          setOrderState('CHECKOUT');
        } else {
          setOrderState('FAILED');
          alert('주문 생성 실패. 재고 부족 또는 대기열 티켓 검증 오류.');
        }
      } catch (e) {
        setOrderState('FAILED');
        console.error('Create order API error', e);
      }
    }
  };

  // Handle PG Payment Confirm (F06-01, F06-02)
  const handlePaymentConfirm = async () => {
    if (!orderId) return;
    setOrderState('CREATING'); // Shows loading spinner during confirm

    const mockTossKey = 'tosspk_' + Math.random().toString(36).substring(2, 16);
    setTossPaymentKey(mockTossKey);

    if (isSandbox) {
      setTimeout(() => {
        setOrderState('PAID');
        // Clear queue
        setQueueStatus('IDLE');
      }, 1500);
    } else {
      try {
        const res = await fetch('/api/v1/payments/toss/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            tossPaymentKey: mockTossKey,
            orderId: orderId,
            amount: paymentAmount
          })
        });
        if (res.ok) {
          setOrderState('PAID');
          setQueueStatus('IDLE');
        } else {
          setOrderState('FAILED');
          alert('결제 승인 거절됨.');
        }
      } catch (e) {
        setOrderState('FAILED');
        console.error('Payment confirm API error', e);
      }
    }
  };

  // Simulate Webhook status completion / fail rollback (F06-03)
  const simulateWebhook = async (status: 'SUCCESS' | 'FAILED') => {
    if (!orderId || !tossPaymentKey) {
      alert('승인 완료된 결제 건이 있어야 웹훅을 시뮬레이션할 수 있습니다.');
      return;
    }

    if (isSandbox) {
      alert(`[로컬 시뮬레이션] 결제 웹훅 수신 완료: ${status}. 재고 차감 및 Saga 트랜잭션이 완료되었습니다.`);
    } else {
      try {
        const res = await fetch('/api/v1/payments/toss/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Signature-256': 'sha256=mock-signature-here'
          },
          body: JSON.stringify({
            eventType: 'PAYMENT_STATUS_CHANGED',
            createdAt: new Date().toISOString(),
            data: {
              paymentKey: tossPaymentKey,
              orderId: orderId,
              status: status === 'SUCCESS' ? 'DONE' : 'ABORTED',
              method: '카드',
              totalAmount: paymentAmount,
              approvedAt: new Date().toISOString()
            }
          })
        });
        if (res.ok) {
          alert(`웹훅 시뮬레이션 성공! (${status === 'SUCCESS' ? '결제완료 재고확정' : '결제취소 Saga 보상 실행됨'})`);
        } else {
          alert('웹훅 호출에 실패했습니다.');
        }
      } catch (e) {
        console.error(e);
        alert('웹훅 시뮬레이션 중 오류가 발생했습니다.');
      }
    }
  };

  // Add Item to Cart
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const newCart = [...prev];
        newCart[idx].qty += 1;
        return newCart;
      }
      return [...prev, { product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  // Format time utility
  const formatTimeLeft = (targetTime: string) => {
    const diff = new Date(targetTime).getTime() - now;
    if (diff <= 0) return '진행 중';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Chat with Gemini API (Express proxy)
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: new Date() }]);
    setChatInput('');
    setIsChatLoading(true);

    // Context from FANDROPS spec to make the bot knowledgeable
    const fDropsContext = `
      FANDROPS is a K-Pop open-run commerce app.
      Wait queue status flow: WAITING -> PROCESSING -> DONE.
      Access Ticket: generated in PROCESSING/DONE state, required in "accessTicket" body for POST /api/v1/orders.
      Order state machine: RESERVED -> PAID -> COMPLETED. If cancel/fail, goes to FAILED -> CANCELLED.
      Payment keys: orderPaymentKey (from server on POST /orders) vs tossPaymentKey (from Toss PG Widget).
      Spring Boot backend runs on http://localhost:8080.
      Express frontend server runs on port 3000.
    `;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, context: fDropsContext })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply, timestamp: new Date() }]);
      } else {
        const err = await res.json();
        setChatMessages(prev => [...prev, { sender: 'bot', text: `오류가 발생했습니다: ${err.error || '연결 실패'}`, timestamp: new Date() }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Gemini API 서버에 접속할 수 없습니다. .env에 GEMINI_API_KEY가 등록되어 있는지 확인하세요.', timestamp: new Date() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Suggestion chips handler
  const handleSuggestionClick = (prompt: string) => {
    setChatInput(prompt);
  };

  return (
    <div className="relative min-h-screen bg-[#06070b] overflow-hidden text-slate-100 flex flex-col font-sans">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-500/10 blur-[160px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-card px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 shadow-lg glow-primary">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              FANDROPS <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">Sandbox</span>
            </h1>
            <p className="text-[10px] text-slate-400">K-Pop 오픈런 트래픽 게이트 시뮬레이터</p>
          </div>
        </div>

        {/* Global Control Status */}
        <div className="flex items-center space-x-4">
          {/* Backend API Connection Status */}
          <div className="flex items-center bg-slate-900/60 rounded-full px-3 py-1.5 border border-white/5 space-x-2">
            <Server className={`w-3.5 h-3.5 ${backendConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-xs font-medium">
              API Server: {backendConnected ? `${backendLatency}ms` : '오프라인'}
            </span>
          </div>

          {/* Sandbox Toggle */}
          <div className="flex items-center bg-slate-900/60 rounded-full px-3 py-1 border border-white/5">
            <span className="text-xs font-medium mr-2 text-slate-400">시뮬레이션 모드</span>
            <button 
              onClick={() => {
                if (!backendConnected) {
                  alert('백엔드가 오프라인 상태이므로 시뮬레이션 모드만 활성화할 수 있습니다.');
                  return;
                }
                setIsSandbox(!isSandbox);
              }}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isSandbox ? 'bg-violet-600' : 'bg-slate-700'}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSandbox ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Cart GNB Toggle */}
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 rounded-xl bg-slate-800/60 border border-white/5 hover:bg-slate-800 transition"
          >
            <ShoppingCart className="w-5 h-5 text-slate-300" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden max-w-[1600px] w-full mx-auto">
        
        {/* Left Column: Products & Store (40%) */}
        <section className="lg:col-span-5 flex flex-col space-y-6 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">아티스트 스토어</h2>
            </div>
            <span className="text-xs text-slate-400">FANDROPS MVP 스토어</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {products.map(product => {
              const started = product.dropsStartAt ? new Date(product.dropsStartAt).getTime() <= now : true;
              return (
                <div key={product.id} className="glass-card rounded-2xl overflow-hidden glass-card-hover p-4 flex space-x-4 relative">
                  {/* Product Tag */}
                  <div className="absolute top-3 right-3 flex space-x-1">
                    {product.type === 'drops' ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 tracking-wider">
                        LIMITED DROPS
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        상시 상품
                      </span>
                    )}
                  </div>

                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-24 h-24 rounded-xl object-cover border border-white/5 flex-shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm md:text-base pr-20 line-clamp-1">{product.name}</h3>
                      <div className="mt-1 flex items-baseline space-x-2">
                        <span className="text-lg font-extrabold text-white">{product.price.toLocaleString()}원</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Available Qty */}
                      <span className="text-xs text-slate-400 flex items-center">
                        재고수량: <strong className="ml-1 text-slate-200">{product.availableQty}개</strong> / {product.totalQty}개
                      </span>

                      {/* Buy Buttons */}
                      <div className="flex space-x-1.5">
                        {product.type === 'regular' ? (
                          <>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition"
                            >
                              카트
                            </button>
                            <button 
                              onClick={() => handleBuyNow(product)}
                              className="px-3 py-1.5 rounded-lg text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold transition"
                            >
                              구매
                            </button>
                          </>
                        ) : (
                          // Drops Countdown Timer / Action
                          <div>
                            {!started ? (
                              <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/5">
                                <Clock className="w-3.5 h-3.5 text-pink-400" />
                                <span className="text-xs font-mono font-bold text-pink-400">
                                  {formatTimeLeft(product.dropsStartAt!)}
                                </span>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleBuyNow(product)}
                                className="px-4 py-2 rounded-lg text-xs bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-extrabold shadow-md glow-secondary transition"
                              >
                                오픈런 구매
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart View Panel */}
          <AnimatePresence>
            {isCartOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card rounded-2xl p-4 border border-white/5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <ShoppingCart className="w-4 h-4 text-violet-400" />
                    <span>내 장바구니 (RDB 영속화)</span>
                  </span>
                  <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">카트가 비어있습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">{item.product.name}</span>
                        <div className="flex space-x-4 items-center">
                          <span className="text-slate-400">{item.qty}개</span>
                          <span className="font-semibold text-slate-200">{(item.product.price * item.qty).toLocaleString()}원</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-white/5 pt-3 flex justify-between items-center text-sm font-bold">
                      <span>총 결제금액</span>
                      <span className="text-pink-400">
                        {cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0).toLocaleString()}원
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        // Regular product checkout simulation from cart
                        alert('장바구니 통합 결제가 진행됩니다.');
                        setIsCartOpen(false);
                        const firstItem = cart[0].product;
                        setTargetProduct(firstItem);
                        setPaymentAmount(cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0));
                        triggerCreateOrder(firstItem, null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition"
                    >
                      장바구니 주문서 작성
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Middle Column: Traffic Gate & Wait Queue (35%) */}
        <section className="lg:col-span-4 flex flex-col space-y-6">
          <div className="flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-pink-400" />
            <h2 className="text-lg font-bold text-white">트래픽 게이트 (대기열)</h2>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/5 relative flex-1 flex flex-col justify-between min-h-[380px]">
            
            {/* Real-time simulation status overlay */}
            <div className="absolute top-4 right-4 flex items-center space-x-1.5">
              <span className={`h-2 w-2 rounded-full ${queueStatus !== 'IDLE' ? 'bg-pink-500 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{queueStatus}</span>
            </div>

            {/* Waiting State */}
            {queueStatus === 'IDLE' && (
              <div className="my-auto flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-500">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">진입 대기 없음</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                    한정판 드롭스 상품의 [오픈런 구매]를 클릭하시면 트래픽 안정성 대기열에 진입합니다.
                  </p>
                </div>
              </div>
            )}

            {/* WAITING status (Queue Progress Ring) */}
            {queueStatus === 'WAITING' && (
              <div className="my-auto flex flex-col items-center justify-center space-y-6">
                <div className="relative flex items-center justify-center">
                  {/* Progress circle */}
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle 
                      cx="72" cy="72" r="62" 
                      className="text-slate-800" 
                      strokeWidth="6" stroke="currentColor" fill="transparent" 
                    />
                    <circle 
                      cx="72" cy="72" r="62" 
                      className="text-pink-500 transition-all duration-500" 
                      strokeWidth="6" strokeDasharray={389.5} 
                      strokeDashoffset={389.5 - (389.5 * queueProgress) / 100} 
                      strokeLinecap="round" stroke="currentColor" fill="transparent" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-[10px] text-slate-400 font-bold">대기 순서</span>
                    <span className="text-3xl font-extrabold text-white tracking-tight">{queuePosition}</span>
                    <span className="text-[10px] text-pink-400 font-mono mt-0.5">Estimated 15s</span>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-slate-200 text-sm">서버 진입을 대기하고 있습니다</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                    Nginx Rate Limit 및 SSE 대기열을 통해 API 트래픽을 순차 분산 공급하고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* PROCESSING / DONE queue status (Token Received) */}
            {queueStatus === 'PROCESSING' && (
              <div className="my-auto flex flex-col items-center justify-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 glow-primary">
                  <CheckCircle className="w-8 h-8 animate-bounce" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-emerald-400 text-sm">대기열 검증 통과 (Access Ticket 발급)</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
                    일회용 진입 토큰이 생성되었습니다. 주문서 제출 시 검증이 수반됩니다.
                  </p>
                </div>
                <div className="w-full bg-slate-900/80 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold">TICKET TOKEN</span>
                  <code className="text-xs text-emerald-400 font-mono font-bold">{queueTicket}</code>
                </div>

                {orderState === 'NONE' && (
                  <button 
                    onClick={() => targetProduct && triggerCreateOrder(targetProduct, queueTicket)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-xs shadow-md transition"
                  >
                    주문서 작성 단계로 진행
                  </button>
                )}
              </div>
            )}

            {/* Toss PG Simulation Overlay (Checkout Drawer) */}
            {orderState === 'CHECKOUT' && (
              <div className="absolute inset-0 bg-[#0d0e15] rounded-3xl p-5 border border-white/10 flex flex-col justify-between z-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold font-serif">T</div>
                    <span className="text-xs font-bold text-white">Toss Payments 결제 시뮬레이터</span>
                  </div>
                  <button onClick={() => setOrderState('NONE')} className="text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="my-auto space-y-4 py-4">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400">최종 승인 요청 금액</span>
                    <h4 className="text-2xl font-extrabold text-white mt-0.5">{paymentAmount.toLocaleString()}원</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">결제 수단 선택</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setCheckoutSelectedCard('toss')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 transition ${checkoutSelectedCard === 'toss' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-white/5 text-slate-400'}`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>토스 페이</span>
                      </button>
                      <button 
                        onClick={() => setCheckoutSelectedCard('card')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 transition ${checkoutSelectedCard === 'card' ? 'bg-violet-600/10 border-violet-500 text-violet-400' : 'bg-slate-900 border-white/5 text-slate-400'}`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>일반 신용카드</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-[10px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Order ID (주문번호)</span>
                      <span className="font-mono text-slate-300">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Payment Key</span>
                      <span className="font-mono text-slate-300">{orderPaymentKey?.substring(0, 10)}...</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePaymentConfirm}
                  className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-sm shadow-md transition"
                >
                  결제하기 (confirm API 요청)
                </button>
              </div>
            )}

            {/* PAYMENT SUCCESS State */}
            {orderState === 'PAID' && (
              <div className="my-auto flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 glow-primary">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-base">결제 및 주문 완료!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                    토스 결제가 완료되었습니다. Webhook을 통한 재고 복구 및 Saga 정합성 동작을 테스트해 보세요.
                  </p>
                </div>

                {/* Webhook sandbox controls */}
                <div className="w-full border border-white/5 bg-slate-900/40 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    PG Webhook 시뮬레이터 (F06-03)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => simulateWebhook('SUCCESS')}
                      className="py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    >
                      성공 웹훅 수신
                    </button>
                    <button 
                      onClick={() => simulateWebhook('FAILED')}
                      className="py-2 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition"
                    >
                      실패 복구 웹훅
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setOrderState('NONE');
                    setQueueStatus('IDLE');
                    setOrderId(null);
                    setOrderPaymentKey(null);
                    setTossPaymentKey(null);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  처음으로 돌아가기
                </button>
              </div>
            )}

            {/* Spinner Overlay for API call loading */}
            {orderState === 'CREATING' && (
              <div className="absolute inset-0 bg-[#0d0e15]/80 rounded-3xl flex flex-col items-center justify-center z-20 space-y-3">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <span className="text-xs font-medium text-slate-400">데이터 처리 중...</span>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Gemini Chat Bot & Stats Panel (25%) */}
        <section className="lg:col-span-3 flex flex-col space-y-6">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">FANDROPS AI 가이드</h2>
          </div>

          {/* Gemini Chatbox widget */}
          <div className="glass-card rounded-3xl p-4 border border-white/5 flex flex-col h-[340px] justify-between">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[90%] p-2.5 rounded-2xl text-[11px] leading-normal ${
                      msg.sender === 'user' 
                        ? 'bg-violet-600 text-white rounded-br-none' 
                        : 'bg-slate-850 border border-white/5 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini가 작성하고 있습니다...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="mt-2 py-1.5 border-t border-white/5 flex flex-wrap gap-1">
              <button 
                onClick={() => handleSuggestionClick('대기열 진입 토큰 검증 규칙이 뭐야?')}
                className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 py-1 px-1.5 rounded-md transition"
              >
                # 대기열토큰검증
              </button>
              <button 
                onClick={() => handleSuggestionClick('토스 결제 식별자 종류를 설명해줘')}
                className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 py-1 px-1.5 rounded-md transition"
              >
                # 결제식별자
              </button>
            </div>

            <form onSubmit={handleSendChatMessage} className="mt-2 flex space-x-1.5">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="질문을 입력하세요..."
                className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50"
              />
              <button 
                type="submit"
                className="p-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* System Performance stats (F08-02, F08-01) */}
          <div className="glass-card rounded-3xl p-4 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-violet-400" />
              <span>실시간 플랫폼 트래픽 통계</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-2.5">
                <span className="text-[10px] text-slate-500 font-medium">동시 SSE 커넥션</span>
                <p className="text-lg font-extrabold text-white mt-0.5">{activeConnections}명</p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-2.5">
                <span className="text-[10px] text-slate-500 font-medium">RateLimit 상태</span>
                <p className="text-lg font-extrabold text-emerald-400 mt-0.5 flex items-center justify-center space-x-1">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">정상</span>
                </p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-2.5">
                <span className="text-[10px] text-slate-500 font-medium">JVM 응답 속도</span>
                <p className="text-lg font-extrabold text-white mt-0.5">~12ms</p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-2.5">
                <span className="text-[10px] text-slate-500 font-medium">CPU 사용률</span>
                <p className="text-lg font-extrabold text-white mt-0.5 flex items-center justify-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>4.2%</span>
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer System Spec Info */}
      <footer className="glass-card py-3 px-6 text-center border-t border-white/5 text-[10px] text-slate-500 flex items-center justify-between">
        <span>© 2026 FANDROPS TEAM 6. All Rights Reserved.</span>
        <span>MVP F01-F08 E2E Sandbox Dashboard</span>
      </footer>

    </div>
  );
}
