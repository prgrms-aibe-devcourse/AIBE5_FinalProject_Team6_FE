import fs from 'fs';
let code = fs.readFileSync('src/apps/AgencyApp.tsx', 'utf8');

// I will just use text replacement for the checkbox part
const oldCheckbox = `{['LIVE', 'EVENT', 'DROP'].some(t => newNotice.tag.includes(t)) && (
                            <div className="flex items-center gap-2 mt-2">
                               <input type="checkbox" id="auto-cal" defaultChecked className="w-4 h-4 text-[#C2507A]" />
                               <label htmlFor="auto-cal" className="text-sm font-bold text-[#C2507A]">해당 공지사항 캘린더 일정 및 알림 자동 연동 (Auto-sync to Calendar)</label>
                            </div>
                          )}`;

const newCheckbox = `<div className="mt-4 border-t border-[#ede8e2] pt-4">
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
                          </div>`;

code = code.replace(oldCheckbox, newCheckbox);
fs.writeFileSync('src/apps/AgencyApp.tsx', code);
