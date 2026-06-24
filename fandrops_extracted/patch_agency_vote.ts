import fs from 'fs';
let code = fs.readFileSync('src/apps/AgencyApp.tsx', 'utf8');

if (!code.includes('voteOptions')) {
  // Add state for vote options
  code = code.replace(
    "const [showVoteModal, setShowVoteModal] = useState(false);",
    "const [showVoteModal, setShowVoteModal] = useState(false);\n  const [voteOptions, setVoteOptions] = useState<any[]>([{id: 1, label: '', image: ''}, {id: 2, label: '', image: ''}]);"
  );
  
  // Update the vote modal
  const oldVoteModal = `<div className="space-y-4">
                             <div>
                                <label className="block text-xs font-black text-[#888] uppercase mb-2">투표 제목</label>
                                <input type="text" id="voteTitle" className="w-full bg-[#F7F3EE] p-4 rounded-xl border border-transparent focus:border-[#C2507A] focus:outline-none" placeholder="예: 차기 응원봉 디자인 투표" />
                             </div>
                             <div>
                                <label className="block text-xs font-black text-[#888] uppercase mb-2">종료 기한</label>
                                <input type="date" id="voteEndDate" className="w-full bg-[#F7F3EE] p-4 rounded-xl border border-transparent focus:border-[#C2507A] focus:outline-none" />
                             </div>
                          </div>
                          <div className="flex gap-4 mt-8">
                             <button onClick={() => setShowVoteModal(false)} className="flex-1 p-4 bg-[#F7F3EE] rounded-2xl font-bold">취소</button>
                             <button onClick={() => {
                                 const title = (document.getElementById('voteTitle') as HTMLInputElement).value;
                                 const end = (document.getElementById('voteEndDate') as HTMLInputElement).value;
                                 setVotesList([{ id: 'v'+Date.now(), title, artist: 'Starlight', totalVotes: '0', endDate: end, status: 'ONGOING' }, ...votesList]);
                                 setShowVoteModal(false);
                             }} className="flex-1 p-4 bg-[#C2507A] text-white rounded-2xl font-bold">생성</button>
                          </div>`;

  const newVoteModal = `<div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
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
                                        placeholder={\`옵션 \${idx+1} 라벨 (예: 핑크블러썸)\`}
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
                             <button onClick={() => {
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
                                 setVotesList([{ id: 'v'+Date.now(), title, artist: 'Starlight', totalVotes: '0', endDate: end, status: 'ONGOING' }, ...votesList]);
                                 setShowVoteModal(false);
                                 setVoteOptions([{id: 1, label: '', image: ''}, {id: 2, label: '', image: ''}]); // reset
                                 alert('투표가 등록되었습니다!');
                             }} className="flex-1 p-4 bg-[#C2507A] text-white rounded-2xl font-bold">투표 등록 (생성)</button>
                          </div>`;

  code = code.replace(oldVoteModal, newVoteModal);
  fs.writeFileSync('src/apps/AgencyApp.tsx', code);
  console.log('done vote option sync');
} else {
  console.log('already patched');
}
