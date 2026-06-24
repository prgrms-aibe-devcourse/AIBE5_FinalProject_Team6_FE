import fs from 'fs';
let code = fs.readFileSync('src/apps/AgencyApp.tsx', 'utf8');

// B-1 Artist Image Update
code = code.replace(
  `<div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">프로필 이미지 URL</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-2xl focus:outline-none focus:border-[#C2507A] font-bold"
                            value={editingArtist.profileImg}
                            onChange={(e) => setEditingArtist({...editingArtist, profileImg: e.target.value})}
                          />
                        </div>`,
  `<div className="flex flex-col items-center mb-6">
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-4 w-full text-left">프로필 이미지</label>
                          <label className="relative flex items-center justify-center w-24 h-24 rounded-full border border-[#ede8e2] bg-[#F7F3EE] cursor-pointer overflow-hidden group shadow-sm transition-all hover:border-[#C2507A]">
                            {editingArtist.profileImg ? (
                              <img src={editingArtist.profileImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center text-[#888]">
                                <Camera size={20} className="mb-1" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold">업로드</span>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => setEditingArtist({...editingArtist, profileImg: e.target?.result as string});
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>`
);

// B-2 Member Image Update
code = code.replace(
  `<div>
                          <label className="block text-[11px] font-black text-[#888] uppercase tracking-widest mb-2">이미지 URL</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-5 py-3 rounded-16 focus:outline-none focus:border-[#C2507A] font-black"
                            value={editingMember.img}
                            onChange={(e) => setEditingMember({...editingMember, img: e.target.value})}
                          />
                        </div>`,
  ``
);

code = code.replace(
  `<div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-[#F7F3EE] relative group">
                           <img src={editingMember.img} alt="" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                              <span className="text-white font-bold text-[10px]">사진 변경</span>
                           </div>
                        </div>`,
  `<label className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-[#F7F3EE] relative group block cursor-pointer">
                           {editingMember.img ? (
                             <img src={editingMember.img} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-[#F7F3EE] flex items-center justify-center text-[10px] font-bold text-[#888]">No Image</div>
                           )}
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white font-bold text-[10px]">사진 변경</span>
                           </div>
                           <input
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 const reader = new FileReader();
                                 reader.onload = (e) => setEditingMember({...editingMember, img: e.target?.result as string});
                                 reader.readAsDataURL(file);
                               }
                             }}
                           />
                        </label>`
);

fs.writeFileSync('src/apps/AgencyApp.tsx', code);
