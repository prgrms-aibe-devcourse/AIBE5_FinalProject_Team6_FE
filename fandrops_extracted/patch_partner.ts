import fs from 'fs';
let code = fs.readFileSync('src/apps/PartnershipApplication.tsx', 'utf8');

// Add new fields to state
code = code.replace(
  "companyName: '',",
  "companyName: '',\n    businessRegistrationNumber: '',\n    ceoName: '',"
);

// Add isSubmitting state
code = code.replace(
  "const [isSubmitted, setIsSubmitted] = useState(false);",
  "const [isSubmitted, setIsSubmitted] = useState(false);\n  const [isSubmitting, setIsSubmitting] = useState(false);"
);

// Add validation
code = code.replace(
  "if (form.companyName.trim().length < 2) newErrors.companyName = '기획사/운영자명을 2자 이상 입력해주세요.';",
  "if (form.companyName.trim().length < 2) newErrors.companyName = '기획사/운영자명을 2자 이상 입력해주세요.';\n    if (!form.businessRegistrationNumber.trim()) newErrors.businessRegistrationNumber = '사업자등록번호를 입력해주세요.';\n    if (!form.ceoName.trim()) newErrors.ceoName = '대표자명을 입력해주세요.';"
);
code = code.replace(
  "if (!form.contactNumber.trim()) newErrors.contactNumber = '담당자 전화번호를 입력해주세요.';",
  ""
);
code = code.replace(
  "if (!form.businessEmail.trim()) {",
  "if (!form.contactNumber?.trim()) newErrors.contactNumber = '담당자 전화번호를 입력해주세요.';\n    if (!form.businessEmail.trim()) {"
);

// Update newApp struct
code = code.replace(
  "companyName: form.companyName,",
  "companyName: form.companyName,\n      businessRegistrationNumber: form.businessRegistrationNumber,\n      ceoName: form.ceoName,"
);

// Update handleSubmit
code = code.replace(
  /setIsSubmitted\(true\);\s*onSubmit\(newApp\);\s*if \(form\.autoApproveTest\) \{/,
  `setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSubmit(newApp);

      if (form.autoApproveTest) {`
);
code = code.replace(
  `        setToast('승인되었습니다! Artist 대시보드로 이동합니다');
      }, 1000);
    }`,
  `        setToast('승인되었습니다! Artist 대시보드로 이동합니다');
        }, 1000);
      }
    }, 1500);`
);

// We need to fix the submit button code which is at the bottom, handling isSubmitting and disabled
code = code.replace(
  /onClick=\{handleSubmit\}[\s\S]*?입점 신청하기\s*<\/button>/,
  `onClick={handleSubmit}
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
              </button>`
);

// Add the success message
code = code.replace(
  `<h2 className="text-2xl font-black mb-12">✉️ 신청이 접수되었습니다</h2>`,
  `<h2 className="text-2xl font-black mb-12">✉️ 신청이 접수되었습니다</h2>\n             <p className="text-[#C2507A] font-bold mb-4">신청이 완료되었습니다. 검토 후 이메일로 결과를 안내드립니다.</p>`
);

// Add new form fields to the JSX
code = code.replace(
  `<div ref={el => errorRefs.current.managerName = el}>`,
  `<div ref={el => errorRefs.current.businessRegistrationNumber = el}>
                  <label className="block text-sm font-bold mb-2">사업자등록번호 *</label>
                  <input 
                    type="text" 
                    value={form.businessRegistrationNumber}
                    onChange={e => setForm({...form, businessRegistrationNumber: e.target.value})}
                    placeholder="000-00-00000" 
                    className={\`w-full bg-[#fcfcfc] border \${errors.businessRegistrationNumber ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20\`} 
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
                    className={\`w-full bg-[#fcfcfc] border \${errors.ceoName ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20\`} 
                  />
                  {errors.ceoName && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.ceoName}</p>}
                </div>

                <div ref={el => errorRefs.current.managerName = el}>`
);

// Update contactNumber required
code = code.replace(
  `<label className="block text-sm font-bold mb-2">연락처 (선택)</label>`,
  `<label className="block text-sm font-bold mb-2">담당자 전화번호 *</label>`
);

code = code.replace(
  `<div>
                  <label className="block text-sm font-bold mb-2">담당자 전화번호 *</label>
                  <input 
                    type="tel" 
                    value={form.contactNumber}`,
  `<div ref={el => errorRefs.current.contactNumber = el}>
                  <label className="block text-sm font-bold mb-2">담당자 전화번호 *</label>
                  <input 
                    type="tel" 
                    value={form.contactNumber}`
);

// make sure contactNumber errors show
code = code.replace(
  `className="w-full bg-[#fcfcfc] border border-[#EDE8E2] px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A]" 
                  />
                </div>`,
  `className={\`w-full bg-[#fcfcfc] border \${errors.contactNumber ? 'border-[#FF4444]' : 'border-[#EDE8E2]'} px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:border-[#C2507A] focus:ring-1 focus:ring-[#C2507A]/20\`} 
                  />
                  {errors.contactNumber && <p className="text-[#FF4444] text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.contactNumber}</p>}
                </div>`
);

fs.writeFileSync('src/apps/PartnershipApplication.tsx', code);
console.log('done');
