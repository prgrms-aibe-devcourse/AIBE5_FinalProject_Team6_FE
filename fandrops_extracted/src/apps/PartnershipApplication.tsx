import { useState, useRef } from 'react';
import { Check, AlertCircle, Mail, Send } from 'lucide-react';
import { AgencyApplication } from '../types/partnership';

interface PartnershipApplicationProps {
  onBack: () => void;
  onSubmit: (app: AgencyApplication) => void;
}

export default function PartnershipApplication({ onBack, onSubmit }: PartnershipApplicationProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    businessRegistrationNumber: '',
    ceoName: '',
    managerName: '',
    businessEmail: '',
    contactNumber: '',
    artistName: '',
    artistType: '',
    platforms: [] as string[],
    channelUrl: '',
    services: [] as string[],
    introduction: '',
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
    autoApproveTest: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (form.companyName.trim().length < 2) newErrors.companyName = '기획사/운영자명을 2자 이상 입력해주세요.';
    if (!form.businessRegistrationNumber.trim()) newErrors.businessRegistrationNumber = '사업자등록번호를 입력해주세요.';
    if (!form.ceoName.trim()) newErrors.ceoName = '대표자명을 입력해주세요.';
    if (form.managerName.trim().length < 2) newErrors.managerName = '담당자 이름을 2자 이상 입력해주세요.';
    
    if (!form.contactNumber?.trim()) newErrors.contactNumber = '담당자 전화번호를 입력해주세요.';
    if (!form.businessEmail.trim()) {
      newErrors.businessEmail = '심사 결과 발송을 위해 이메일은 필수입니다';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail)) {
      newErrors.businessEmail = '올바른 이메일 형식을 입력해주세요';
    }
    
    if (!form.artistName.trim()) newErrors.artistName = '아티스트/그룹명을 입력해주세요.';
    if (!form.artistType) newErrors.artistType = '활동 유형을 선택해주세요.';
    if (form.services.length === 0) newErrors.services = '이용하고 싶은 서비스를 하나 이상 선택해주세요.';
    
    if (form.introduction.trim().length < 50) {
      newErrors.introduction = `아티스트 소개를 최소 50자 이상 작성해주세요. (현재 ${form.introduction.trim().length}자)`;
    }

    if (!form.termsAgreed || !form.privacyAgreed) {
      newErrors.terms = '필수 약관에 모두 동의해주세요.';
    }

    setErrors(newErrors);

    // Auto-scroll to first error
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey && errorRefs.current[firstErrorKey]) {
      errorRefs.current[firstErrorKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!validate()) return;

    const newApp: AgencyApplication = {
      id: `app-${Date.now()}`,
      companyName: form.companyName,
      businessRegistrationNumber: form.businessRegistrationNumber,
      ceoName: form.ceoName,
      managerName: form.managerName,
      businessEmail: form.businessEmail,
      contactNumber: form.contactNumber,
      artistName: form.artistName,
      artistType: form.artistType,
      platforms: form.platforms,
      channelUrl: form.channelUrl,
      services: form.services,
      introduction: form.introduction,
      status: form.autoApproveTest ? 'APPROVED' : 'PENDING',
      appliedAt: new Date().toLocaleString(),
    };

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSubmit(newApp);

      if (form.autoApproveTest) {
      setTimeout(() => {
        setToast('승인되었습니다! Artist 대시보드로 이동합니다');
        }, 1000);
      }
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex flex-col font-sans relative">
        {toast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-[#111] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Check className="w-5 h-5 text-green-400" />
            <span className="font-bold">{toast}</span>
          </div>
        )}

        <header className="h-[72px] bg-white/88 backdrop-blur-[10px] border-b border-[#EDE8E2] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-50">
          <div className="font-bold tracking-[3px] text-lg">FANDROPS <span className="text-[#C2507A]">AGENCIES</span></div>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white p-12 rounded-3xl w-full max-w-xl border border-[#EDE8E2] shadow-sm text-center">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
               <Mail className="w-10 h-10 text-blue-500" />
             </div>
             <h2 className="text-2xl font-black mb-12">✉️ 신청이 접수되었습니다</h2>
             <p className="text-[#C2507A] font-bold mb-4">신청이 완료되었습니다. 검토 후 이메일로 결과를 안내드립니다.</p>

             <div className="space-y-8 text-left mb-12">
               <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-[#111]"></div>
                  <div className="absolute left-[4.5px] top-4 w-0.5 h-16 bg-[#EDE8E2]"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#111]">신청 완료</span>
                    <span className="text-sm font-mono text-[#888]">{new Date().toLocaleDateString()} {new Date().getHours()}:{new Date().getMinutes()}</span>
                  </div>
               </div>
               <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-[#888] bg-white"></div>
                  <div className="absolute left-[4.5px] top-4 w-0.5 h-16 bg-[#EDE8E2]"></div>
                  <div className="font-bold text-[#888]">서류 검토 중</div>
               </div>
               <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-[#888] bg-white"></div>
                  <div className="font-bold text-[#888]">심사 완료</div>
               </div>
             </div>

             <div className="bg-[#F7F3EE] p-6 rounded-2xl mb-8">
               <p className="text-sm text-[#555] mb-2 leading-relaxed">
                 심사 결과는 입력하신 이메일로 발송됩니다<br/>
                 <strong className="text-[#111]">{form.businessEmail}</strong>
               </p>
               <p className="text-xs text-[#888]">예상 심사 기간: 영업일 기준 3~5일</p>
             </div>

             <button 
                onClick={onBack}
                className="w-full py-4 rounded-xl font-bold bg-[#111] text-white transition-transform hover:scale-[0.98] mb-6"
             >
               홈으로 돌아가기
             </button>

             <p className="text-sm text-[#888]">문의: contact@fandrops.com</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col font-sans pb-20">
      <header className="h-[72px] bg-white/88 backdrop-blur-[10px] border-b border-[#EDE8E2] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-50">
        <div className="font-bold tracking-[3px] text-lg">FANDROPS <span className="text-[#C2507A]">AGENCIES</span></div>
        <button onClick={onBack} className="text-sm font-medium text-[#888] hover:text-[#111]">Cancel</button>
      </header>
      
      <div className="flex-1 flex flex-col items-center p-8">
        <div className="w-full max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-black mb-4 tracking-tight">기획사 입점 신청</h1>
          <p className="text-[#555] mb-2">중소/버추얼 아티스트를 위한 전용 플랫폼</p>
          <p className="text-[#888] text-sm">FANDROPS에 입점하여 팬과 함께하세요</p>
        </div>

        <div className="bg-white rounded-[32px] w-full max-w-2xl border border-[#EDE8E2] shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 space-y-12">
            
            {/* 기본 정보 */}
            <section>
              <div className="flex items-center gap-2 mb-8">
                <span className="w-1.5 h-6 bg-[#C2507A] rounded-full"></span>
                <h3 className="text-lg font-bold tracking-tight">기본 정보</h3>
              </div>
              <div className="space-y-6">
                <div ref={el => errorRefs.current.companyName = el}>
                  <label className="block text-sm font-bold mb-2">기획사/운영자명 *</label>
                  <input 
                    type="text" 
                    value={form.companyName}
                    onChange={e => setForm({...form, companyName: e.target.value})}
                    placeholder="기획사 또는 운영 주체 명칭" 
                    className={`w-full bg-[#fcfcfc] border ${errors.companyName ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20`} 
                  />
                  {errors.companyName && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.companyName}</p>}
                </div>

                <div ref={el => errorRefs.current.businessRegistrationNumber = el}>
                  <label className="block text-sm font-bold mb-2">사업자등록번호 *</label>
                  <input 
                    type="text" 
                    value={form.businessRegistrationNumber}
                    onChange={e => setForm({...form, businessRegistrationNumber: e.target.value})}
                    placeholder="000-00-00000" 
                    className={`w-full bg-[#fcfcfc] border ${errors.businessRegistrationNumber ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20`} 
                  />
                  {errors.businessRegistrationNumber && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.businessRegistrationNumber}</p>}
                </div>

                <div ref={el => errorRefs.current.ceoName = el}>
                  <label className="block text-sm font-bold mb-2">대표자명 *</label>
                  <input 
                    type="text" 
                    value={form.ceoName}
                    onChange={e => setForm({...form, ceoName: e.target.value})}
                    placeholder="대표자 실명" 
                    className={`w-full bg-[#fcfcfc] border ${errors.ceoName ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20`} 
                  />
                  {errors.ceoName && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.ceoName}</p>}
                </div>

                <div ref={el => errorRefs.current.managerName = el}>
                  <label className="block text-sm font-bold mb-2">담당자 이름 *</label>
                  <input 
                    type="text" 
                    value={form.managerName}
                    onChange={e => setForm({...form, managerName: e.target.value})}
                    placeholder="신청서 담당자 실명" 
                    className={`w-full bg-[#fcfcfc] border ${errors.managerName ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20`} 
                  />
                  {errors.managerName && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.managerName}</p>}
                </div>

                <div ref={el => errorRefs.current.businessEmail = el}>
                  <label className="block text-sm font-bold mb-2">비즈니스 이메일 *</label>
                  <input 
                    type="email" 
                    value={form.businessEmail}
                    onChange={e => setForm({...form, businessEmail: e.target.value})}
                    placeholder="example@company.com" 
                    className={`w-full bg-[#fcfcfc] border ${errors.businessEmail ? 'border-[#FF4444]' : 'border-[#C2507A]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20`} 
                  />
                  <p className="text-[#888] text-xs mt-2">이 이메일로 심사 결과 및 계정 정보가 발송됩니다</p>
                  {errors.businessEmail && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.businessEmail}</p>}
                </div>

                <div ref={el => errorRefs.current.contactNumber = el}>
                  <label className="block text-sm font-bold mb-2">담당자 전화번호 *</label>
                  <input 
                    type="tel" 
                    value={form.contactNumber}
                    onChange={e => setForm({...form, contactNumber: e.target.value})}
                    placeholder="010-0000-0000" 
                    className={`w-full bg-[#fcfcfc] border ${errors.contactNumber ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20`} 
                  />
                  {errors.contactNumber && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.contactNumber}</p>}
                </div>
              </div>
            </section>

            {/* 아티스트 정보 */}
            <section>
              <div className="flex items-center gap-2 mb-8">
                <span className="w-1.5 h-6 bg-[#C2507A] rounded-full"></span>
                <h3 className="text-lg font-bold tracking-tight">아티스트 정보</h3>
              </div>
              <div className="space-y-8">
                <div ref={el => errorRefs.current.artistName = el}>
                  <label className="block text-sm font-bold mb-2">아티스트/그룹명 *</label>
                  <input 
                    type="text" 
                    value={form.artistName}
                    onChange={e => setForm({...form, artistName: e.target.value})}
                    placeholder="아티스트명 또는 팀명" 
                    className={`w-full bg-[#fcfcfc] border ${errors.artistName ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A]`} 
                  />
                  {errors.artistName && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.artistName}</p>}
                </div>

                <div ref={el => errorRefs.current.artistType = el}>
                  <label className="block text-sm font-bold mb-4">활동 유형 *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['중소 아이돌', '버추얼 아이돌', '솔로 아티스트', '기타'].map(type => (
                      <button
                        key={type}
                        onClick={() => setForm({...form, artistType: type})}
                        className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                          form.artistType === type 
                            ? 'bg-[#111] text-white border-[#111]' 
                            : 'bg-white text-[#555] border-[#EDE8E2] hover:border-[#111]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {errors.artistType && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.artistType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-4">주요 활동 플랫폼 (복수 선택)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['유튜브', '치지직', '트위치', '인스타그램', '트위터/X', '틱톡'].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          const next = form.platforms.includes(p) 
                            ? form.platforms.filter(item => item !== p)
                            : [...form.platforms, p];
                          setForm({...form, platforms: next});
                        }}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                          form.platforms.includes(p) 
                            ? 'bg-blue-50 text-blue-600 border-blue-200' 
                            : 'bg-white text-[#888] border-[#EDE8E2] hover:border-[#111]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">유튜브/공식 채널 URL (선택)</label>
                  <input 
                    type="url" 
                    value={form.channelUrl}
                    onChange={e => setForm({...form, channelUrl: e.target.value})}
                    placeholder="https://" 
                    className="w-full bg-[#fcfcfc] border border-[#EDE8E2] px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A]" 
                  />
                </div>
              </div>
            </section>

            {/* 입점 희망 서비스 */}
            <section>
               <div className="flex items-center gap-2 mb-8">
                <span className="w-1.5 h-6 bg-[#C2507A] rounded-full"></span>
                <h3 className="text-lg font-bold tracking-tight">입점 희망 서비스</h3>
              </div>
              <div ref={el => errorRefs.current.services = el}>
                <p className="text-sm text-[#888] mb-4">이용하고 싶은 서비스를 선택해주세요</p>
                <div className="grid grid-cols-2 gap-3">
                  {['굿즈 판매', '팬미팅 예약', '커뮤니티 운영', '티켓 판매'].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        const next = form.services.includes(s) 
                          ? form.services.filter(item => item !== s)
                          : [...form.services, s];
                        setForm({...form, services: next});
                      }}
                      className={`flex items-center justify-between py-4 px-5 rounded-xl text-sm font-bold border transition-all ${
                        form.services.includes(s) 
                          ? 'bg-green-50 text-green-600 border-green-200' 
                          : 'bg-white text-[#555] border-[#EDE8E2] hover:border-[#111]'
                      }`}
                    >
                      {s}
                      {form.services.includes(s) && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
                {errors.services && <p className="text-[#FF4444] text-xs mt-3 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.services}</p>}
              </div>
            </section>

            {/* 소개 */}
            <section>
              <div className="flex items-center gap-2 mb-8">
                <span className="w-1.5 h-6 bg-[#C2507A] rounded-full"></span>
                <h3 className="text-lg font-bold tracking-tight">아티스트 소개 *</h3>
              </div>
              <div ref={el => errorRefs.current.introduction = el}>
                <textarea 
                  value={form.introduction}
                  onChange={e => setForm({...form, introduction: e.target.value})}
                  placeholder="팬덤 규모, 활동 내역, 입점 희망 이유 등을 자유롭게 작성해주세요 (최소 50자)" 
                  className={`w-full h-48 bg-[#fcfcfc] border ${errors.introduction ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-5 py-4 rounded-2xl transition-all focus:outline-none focus:border-[#C2507A] resize-none text-[15px] leading-relaxed`}
                ></textarea>
                <div className="flex justify-between mt-2 px-1">
                  {errors.introduction && <p className="text-[#FF4444] text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.introduction}</p>}
                  <p className={`text-xs ml-auto font-mono ${form.introduction.length >= 50 ? 'text-green-600' : 'text-[#888]'}`}>
                    {form.introduction.length} / 50자
                  </p>
                </div>
              </div>
            </section>

            {/* 약관 동의 */}
            <section className="bg-[#fcfcfc] border border-[#EDE8E2] rounded-2xl p-6 space-y-4">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={form.termsAgreed}
                    onChange={e => setForm({...form, termsAgreed: e.target.checked})}
                    className="w-5 h-5 rounded border-[#EDE8E2]" 
                  />
                  <span className="text-sm font-medium group-hover:text-[#111] transition-colors flex items-center gap-1">
                    서비스 이용약관 동의 <span className="text-[#C2507A]">(필수)</span>
                  </span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={form.privacyAgreed}
                    onChange={e => setForm({...form, privacyAgreed: e.target.checked})}
                    className="w-5 h-5 rounded border-[#EDE8E2]" 
                  />
                  <span className="text-sm font-medium group-hover:text-[#111] transition-colors flex items-center gap-1">
                    개인정보 수집 및 이용 동의 <span className="text-[#C2507A]">(필수)</span>
                  </span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={form.marketingAgreed}
                    onChange={e => setForm({...form, marketingAgreed: e.target.checked})}
                    className="w-5 h-5 rounded border-[#EDE8E2]" 
                  />
                  <span className="text-sm font-medium text-[#888] group-hover:text-[#111] transition-colors">
                    마케팅 정보 수신 동의 (선택)
                  </span>
               </label>
               {errors.terms && <p className="text-[#FF4444] text-xs pt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.terms}</p>}
            </section>

            <div className="pt-8">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl font-black text-lg text-white transition-all shadow-xl shadow-[#C2507A]/20 hover:scale-[0.99] active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #C2507A 0%, #7F77DD 100%)' }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? '신청 처리 중...' : '입점 신청하기'}
              </button>
              
              <div className="mt-8 flex justify-center">
                <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                  <input 
                    type="checkbox" 
                    checked={form.autoApproveTest}
                    onChange={e => setForm({...form, autoApproveTest: e.target.checked})}
                    className="w-3 h-3 rounded" 
                  />
                  <span className="text-[10px] font-bold text-[#888]">
                    [DEV] 자동 승인 테스트 (배포 시 제거 예정)
                  </span>
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
