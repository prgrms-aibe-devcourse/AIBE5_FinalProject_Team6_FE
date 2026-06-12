import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, MessageSquare, ShoppingBag, AlertTriangle, Image as ImageIcon, Activity, Menu, X, Check, XCircle, ChevronRight, Search, Loader2 } from 'lucide-react';
import type { AgencyApplication, ApplicationStatus } from '../types/partnership';
import { getAdminApplications, reviewApplication } from '../api/agencyApplications';
import { logout } from '../api/auth';
import { ROLE_KEY } from '../App';

export default function AdminApp() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('agencies');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agencyTab, setAgencyTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [selectedApp, setSelectedApp] = useState<AgencyApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    getAdminApplications()
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setAppsLoading(false));
  }, []);

  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'agencies', icon: Building2, label: 'Agency Applications' },
    { id: 'artists', icon: Users, label: 'Artist Management' },
    { id: 'content', icon: MessageSquare, label: 'Content Monitoring' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders & Payments' },
    { id: 'reports', icon: AlertTriangle, label: 'Reports & CS' },
    { id: 'banners', icon: ImageIcon, label: 'Banner & Settings' },
  ];

  const filteredApps = applications.filter(app => {
    if (agencyTab === 'ALL') return true;
    return app.status === agencyTab;
  });

  const handleApprove = async (id: string) => {
    setLoading('APPROVING');
    try {
      await reviewApplication(id, 'APPROVED');
      setApplications(prev => prev.map(app =>
        app.id === id ? { ...app, status: 'APPROVED' as ApplicationStatus } : app,
      ));
      setToast('Artist 계정이 생성되었습니다');
    } catch {
      setToast('승인 처리 중 오류가 발생했습니다');
    } finally {
      setLoading(null);
      setSelectedApp(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }
    setLoading('REJECTING');
    try {
      await reviewApplication(id, 'REJECTED', rejectionReason);
      setApplications(prev => prev.map(app =>
        app.id === id
          ? { ...app, status: 'REJECTED' as ApplicationStatus, rejectionReason }
          : app,
      ));
      setToast('반려 완료되었습니다');
    } catch {
      setToast('반려 처리 중 오류가 발생했습니다');
    } finally {
      setLoading(null);
      setSelectedApp(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F3EE] overflow-hidden font-sans relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-[#111] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Check className="w-5 h-5 text-green-400" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Dark Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1A1A1A] text-white transition-all duration-300 flex flex-col shrink-0 relative z-20`}
      >
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-[#333]">
          {sidebarOpen && <div className="font-bold tracking-[3px] text-lg">FD OPS</div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#888] hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3 relative z-10 hidden-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeMenu === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-[#888] hover:bg-white/5 hover:text-white'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-[#333]">
          <button onClick={() => { logout(); localStorage.removeItem(ROLE_KEY); navigate('/login', { replace: true }); }} className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-[#888] hover:text-white hover:bg-white/5 transition-colors ${sidebarOpen ? '' : 'px-0'}`}>
            <XCircle className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        {/* Top Header */}
        <div className="h-[72px] bg-white border-b border-[#EDE8E2] px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-bold text-[#111] uppercase tracking-[1px]">{activeMenu.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium font-mono text-[#888]">SYSTEM OPERATIONAL</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-sm font-bold">
              OP
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="p-8 pb-32">
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: '45,281' },
                  { label: 'Active Artists', value: '124' },
                  { label: 'Today Orders', value: '₩12.4M' },
                  { label: 'Open Reports', value: '3' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-[#EDE8E2] shadow-sm">
                    <div className="text-xs text-[#888] uppercase tracking-[1px] mb-2">{stat.label}</div>
                    <div className="text-3xl font-bold text-[#111]">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'agencies' && (
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex bg-white rounded-xl p-1 border border-[#EDE8E2] shadow-sm overflow-hidden">
                    {[
                      { id: 'ALL', label: '전체' },
                      { id: 'PENDING', label: '대기' },
                      { id: 'APPROVED', label: '승인' },
                      { id: 'REJECTED', label: '반려' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setAgencyTab(tab.id as ApplicationStatus | 'ALL')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                          agencyTab === tab.id
                            ? 'bg-[#111] text-white'
                            : 'text-[#888] hover:text-[#111]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                 </div>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                   <input
                    type="text"
                    placeholder="기획사/아티스트 검색"
                    className="pl-10 pr-4 py-2 border border-[#EDE8E2] rounded-xl bg-white text-sm focus:outline-none w-64"
                   />
                 </div>
               </div>

               <div className="bg-white rounded-[32px] border border-[#EDE8E2] shadow-sm overflow-hidden min-h-[400px]">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-[#F7F3EE]/50 border-b border-[#EDE8E2] text-xs uppercase tracking-[2px] text-[#888]">
                       <th className="p-6 font-bold">기획사/아티스트</th>
                       <th className="p-6 font-bold">담당자 / 이메일</th>
                       <th className="p-6 font-bold">신청일</th>
                       <th className="p-6 font-bold">상태</th>
                       <th className="p-6 font-bold text-right">상세</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#EDE8E2]">
                     {appsLoading ? (
                       <tr>
                         <td colSpan={5} className="p-32 text-center">
                           <Loader2 className="w-8 h-8 animate-spin text-[#888] mx-auto" />
                         </td>
                       </tr>
                     ) : filteredApps.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="p-32 text-center text-[#888]">
                            신청 목록이 없습니다.
                         </td>
                       </tr>
                     ) : (
                       filteredApps.map(app => (
                        <tr
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className="hover:bg-black/[0.02] cursor-pointer transition-colors group"
                        >
                          <td className="p-6">
                            <div className="font-black text-[#111] mb-1">{app.companyName}</div>
                            <div className="text-xs font-bold text-[#888] flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-[#C2507A]"></span>
                              {app.artistName} ({app.artistType})
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="text-sm font-bold text-[#111] mb-1">{app.managerName}</div>
                            <div className="text-xs font-mono text-[#888]">{app.businessEmail}</div>
                          </td>
                          <td className="p-6 text-xs font-mono text-[#888]">{app.appliedAt.split(' ')[0]}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                              app.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                              app.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100' :
                              'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {app.status === 'PENDING' ? '심사대기' : app.status === 'APPROVED' ? '승인완료' : '반려됨'}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                             <ChevronRight className="w-5 h-5 text-[#EDE8E2] group-hover:text-[#111] ml-auto transition-colors" />
                          </td>
                        </tr>
                      ))
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeMenu === 'artists' && (
            <div className="bg-white rounded-2xl border border-[#EDE8E2] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#EDE8E2] flex justify-between items-center bg-[#F7F3EE]">
                <h3 className="font-bold text-[#111]">Artist Management</h3>
                <input type="text" placeholder="Search artists..." className="text-sm px-3 py-1.5 rounded-lg border border-[#EDE8E2] w-64 focus:outline-none" />
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Starlight', agency: 'Starlight Ent.', status: 'ACTIVE', followers: '124K' },
                  { name: 'Luna Girls', agency: 'Moonlight Records', status: 'ACTIVE', followers: '89K' },
                  { name: 'Eclipse', agency: 'Starlight Ent.', status: 'BLOCKED', followers: '12K' },
                ].map((a, i) => (
                  <div key={i} className="border border-[#EDE8E2] rounded-xl p-4 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C2507A] to-[#7F77DD] mb-3"></div>
                    <div className="font-bold text-[#111]">{a.name}</div>
                    <div className="text-xs text-[#888] mb-3">{a.agency}</div>
                    <div className="flex justify-between w-full text-xs font-mono mb-4 text-[#555]">
                      <span>Followers: {a.followers}</span>
                      <span className={a.status === 'ACTIVE' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{a.status}</span>
                    </div>
                    <div className="flex w-full gap-2 mt-auto">
                      <button className="flex-1 bg-[#F7F3EE] hover:bg-[#EDE8E2] text-[#111] py-1.5 rounded-lg text-xs font-bold transition-colors">Edit</button>
                      <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-bold transition-colors">Suspend</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'content' && (
            <div className="bg-white rounded-2xl border border-[#EDE8E2] shadow-sm overflow-hidden">
               <div className="p-4 border-b border-[#EDE8E2] bg-[#F7F3EE]">
                 <h3 className="font-bold text-[#111]">Content Monitoring</h3>
               </div>
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-[#EDE8E2] text-xs uppercase tracking-[1px] text-[#888]">
                     <th className="p-4 font-medium">Type</th>
                     <th className="p-4 font-medium">Author</th>
                     <th className="p-4 font-medium">Content Preview</th>
                     <th className="p-4 font-medium">Date</th>
                     <th className="p-4 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {[
                     { type: 'POST', author: 'Starlight', content: 'Thank you so much to everyone...', date: '2026-05-14 10:20' },
                     { type: 'COMMENT', author: 'User_492', content: 'This is amazing!', date: '2026-05-14 10:25' },
                     { type: 'POST', author: 'SpammerX', content: 'Click here for free tickets!!!', date: '2026-05-14 09:12' },
                   ].map((c, i) => (
                     <tr key={i} className={`border-b border-[#EDE8E2] last:border-0 hover:bg-black/5 transition-colors ${i === 2 ? 'bg-red-50/50' : ''}`}>
                       <td className="p-4"><span className="text-[10px] font-bold bg-[#111] text-white px-2 py-1 rounded">{c.type}</span></td>
                       <td className="p-4 text-sm font-bold">{c.author}</td>
                       <td className="p-4 text-sm max-w-[200px] truncate text-[#555]">{c.content}</td>
                       <td className="p-4 text-xs font-mono text-[#888]">{c.date}</td>
                       <td className="p-4 text-right">
                         <button className="text-xs font-bold text-red-600 hover:underline">Delete</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}

          {activeMenu === 'orders' && (
            <div className="bg-white rounded-2xl border border-[#EDE8E2] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#EDE8E2] bg-[#F7F3EE] flex justify-between items-center">
                <h3 className="font-bold text-[#111]">Platform Orders & Revenue</h3>
                <span className="text-sm font-bold text-[#C2507A] bg-pink-50 px-3 py-1 rounded-full">Total: ₩12,450,000 Today</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EDE8E2] text-xs uppercase tracking-[1px] text-[#888]">
                    <th className="p-4 font-medium">Order ID</th>
                    <th className="p-4 font-medium">Buyer</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: '20260514-001', buyer: 'fan_1', amount: '₩45,000', status: 'Payment Complete' },
                    { id: '20260514-002', buyer: 'luna_fan', amount: '₩128,000', status: 'Shipping' },
                    { id: '20260514-003', buyer: 'user_999', amount: '₩15,000', status: 'Refunded' },
                  ].map((o, i) => (
                    <tr key={i} className="border-b border-[#EDE8E2] last:border-0 hover:bg-black/5 transition-colors">
                      <td className="p-4 text-sm font-mono font-bold text-[#111]">{o.id}</td>
                      <td className="p-4 text-sm">{o.buyer}</td>
                      <td className="p-4 text-sm font-bold text-[#333]">{o.amount}</td>
                      <td className="p-4 text-xs text-[#888]">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeMenu === 'reports' && (
            <div className="bg-white rounded-2xl border border-[#EDE8E2] shadow-sm overflow-hidden">
               <div className="p-4 border-b border-[#EDE8E2] bg-[#F7F3EE]">
                 <h3 className="font-bold text-[#111]">Customer Service & Reports</h3>
               </div>
               <div className="p-6">
                  <div className="border border-red-100 bg-red-50 rounded-xl p-4 mb-4 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-red-600 mb-1">URGENT REPORT</div>
                      <div className="text-sm">User 'Hater01' reported for malicious comments on Starlight's feed.</div>
                    </div>
                    <button className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-50">Review</button>
                  </div>
                  <div className="border border-[#EDE8E2] rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-[#888] mb-1">PAYMENT INQUIRY</div>
                      <div className="text-sm">Order #20260510-123 missing shipment updates.</div>
                    </div>
                    <button className="bg-[#111] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black/80">Respond</button>
                  </div>
               </div>
            </div>
          )}

          {activeMenu === 'banners' && (
            <div className="bg-white rounded-2xl border border-[#EDE8E2] shadow-sm p-6">
              <h3 className="font-bold text-[#111] mb-6">Home Banner Management</h3>
              <div className="space-y-4">
                 {[
                   { title: 'Global Audition 2026', desc: 'Join the next generation of stars.', color: 'bg-indigo-100 text-indigo-800' },
                   { title: 'Starlight Live Concert', desc: 'Ticket open now!', color: 'bg-purple-100 text-purple-800' },
                 ].map((b, i) => (
                   <div key={i} className="flex gap-4 items-center border border-[#EDE8E2] p-4 rounded-xl">
                      <div className={`w-32 h-16 rounded-lg flex items-center justify-center font-bold text-xs text-center p-2 ${b.color}`}>
                        {b.title}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{b.title}</div>
                        <div className="text-xs text-[#888]">{b.desc}</div>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2 border border-[#EDE8E2] rounded hover:bg-gray-50 text-xs">Edit</button>
                         <button className="p-2 border border-[#EDE8E2] rounded hover:bg-red-50 text-red-600 text-xs">Remove</button>
                      </div>
                   </div>
                 ))}
                 <button className="w-full border-2 border-dashed border-[#EDE8E2] rounded-xl p-4 text-[#888] text-sm font-bold hover:border-[#111] hover:text-[#111] transition-colors flex items-center justify-center gap-2">
                   <ImageIcon size={16} /> Add New Banner
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-[#111]/40 backdrop-blur-[4px]" onClick={() => setSelectedApp(null)}></div>
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden border border-[#EDE8E2]">
            <div className="p-8 border-b border-[#EDE8E2] flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                 <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider ${
                    selectedApp.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                    selectedApp.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {selectedApp.status === 'PENDING' ? '심사대기' : selectedApp.status === 'APPROVED' ? '승인완료' : '반려됨'}
                 </span>
                 <h2 className="text-2xl font-black">{selectedApp.companyName} 입점 신청서</h2>
               </div>
               <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-[#F7F3EE] rounded-full transition-colors"><X/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="grid grid-cols-2 gap-x-12 gap-y-16">

                {/* Section: Applicant */}
                <div className="space-y-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-6 bg-[#C2507A] rounded-full"></span>
                    <h3 className="font-black uppercase tracking-wider text-[#111]">신청자 기본 정보</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-1">COMPANY NAME</div>
                      <div className="font-bold text-[#111]">{selectedApp.companyName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-1">MANAGER</div>
                      <div className="font-bold text-[#111]">{selectedApp.managerName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-1">EMAIL</div>
                      <div className="font-mono text-[#111] font-bold">{selectedApp.businessEmail}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-1">CONTACT</div>
                      <div className="font-mono text-[#111] font-bold">{selectedApp.contactNumber || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Section: Artist */}
                <div className="space-y-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-6 bg-[#C2507A] rounded-full"></span>
                    <h3 className="font-black uppercase tracking-wider text-[#111]">아티스트 정보</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-1">ARTIST NAME</div>
                      <div className="font-bold text-[#111] text-lg">{selectedApp.artistName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-1">TYPE</div>
                      <div className="font-bold text-[#111]">{selectedApp.artistType}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-1">PLATFORMS</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedApp.platforms.map(p => (
                          <span key={p} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">{p}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-1">CHANNEL URL</div>
                      <div className="text-xs font-mono text-blue-500 hover:underline">{selectedApp.channelUrl || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Section: Services */}
                <div className="col-span-2 space-y-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-6 bg-[#C2507A] rounded-full"></span>
                    <h3 className="font-black uppercase tracking-wider text-[#111]">희망 서비스 및 소개</h3>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-3">DESIRED SERVICES</div>
                      <div className="flex gap-3">
                        {selectedApp.services.map(s => (
                          <div key={s} className="px-4 py-2 border border-green-200 bg-green-50 text-green-600 rounded-xl text-xs font-black flex items-center gap-2">
                            <Check className="w-3 h-3" /> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] font-bold text-[#888] mb-3">INTRODUCTION</div>
                      <div className="bg-[#F7F3EE] p-8 rounded-3xl text-[15px] leading-relaxed text-[#111] whitespace-pre-wrap min-h-[160px] font-medium border border-[#EDE8E2]">
                        {selectedApp.introduction}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              {selectedApp.status === 'PENDING' && (
                <div className="mt-16 pt-12 border-t border-[#EDE8E2]">
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-black mb-4">반려 사유 입력 <span className="text-[#888] font-medium">(반려 시 필수)</span></label>
                      <textarea
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="심사에 통과하지 못한 구체적 사유를 입력해주세요. 신청자 이메일로 발송됩니다."
                        className="w-full h-32 bg-white border border-[#EDE8E2] rounded-2xl p-6 focus:outline-none focus:border-[#C2507A] resize-none text-sm transition-all"
                      ></textarea>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleReject(selectedApp.id)}
                        disabled={loading !== null}
                        className="flex-1 h-16 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 font-black text-lg transition-all hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading === 'REJECTING' ? <Loader2 className="w-6 h-6 animate-spin" /> : '반려'}
                      </button>
                      <button
                        onClick={() => handleApprove(selectedApp.id)}
                        disabled={loading !== null}
                        className="flex-[2] h-16 rounded-2xl bg-[#111] text-white font-black text-lg transition-all hover:bg-black/90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading === 'APPROVING' ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                          <>
                            <Check className="w-6 h-6" /> 승인 처리
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedApp.status === 'REJECTED' && (
                <div className="mt-16 pt-12 border-t border-[#EDE8E2]">
                  <div className="bg-red-50 border border-red-100 p-8 rounded-3xl">
                    <div className="text-xs font-black text-red-600 mb-2 uppercase tracking-[1px]">REJECTION REASON</div>
                    <div className="text-[#111] font-medium">{selectedApp.rejectionReason}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}