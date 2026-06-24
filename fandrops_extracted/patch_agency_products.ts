import fs from 'fs';
let code = fs.readFileSync('src/apps/AgencyApp.tsx', 'utf8');

// Also Add Camera import
code = code.replace(
  "import { LayoutDashboard, PenTool, Image, Calendar as CalendarIcon, Package, ShoppingCart, Users, UserCircle, LogOut, CheckCircle2, Activity, History, ArrowUpRight, ArrowDownRight, Clock, Plus } from 'lucide-react';",
  "import { LayoutDashboard, PenTool, Image, Calendar as CalendarIcon, Package, ShoppingCart, Users, UserCircle, LogOut, CheckCircle2, Activity, History, ArrowUpRight, ArrowDownRight, Clock, Plus, Camera, Upload, X } from 'lucide-react';"
);

// Add product image upload UI
code = code.replace(
  `<div>
                            <label className="block text-sm font-bold text-[#888] mb-1">상품 썸네일 이미지 URL</label>
                            <input type="text" placeholder="https://..." className="w-full bg-[#F7F3EE] border border-[#ede8e2] px-4 py-2 rounded-xl focus:outline-none focus:border-[#C2507A]" />
                          </div>`,
  `<div>
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
                                    Array.from(files).slice(0, 5).forEach(f => {
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
                                    alert('최대 5장 업로드 로직 시작: ' + Array.from(files).map(f => f.name).join(', '));
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
                          </div>`
);

fs.writeFileSync('src/apps/AgencyApp.tsx', code);
