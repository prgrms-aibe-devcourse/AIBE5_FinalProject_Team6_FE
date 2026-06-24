import fs from 'fs';
let code = fs.readFileSync('src/apps/FanApp.tsx', 'utf8');

if (!code.includes('isAllowNotification')) {
  code = code.replace(
    "const [showAttendance, setShowAttendance] = useState(false);",
    "const [showAttendance, setShowAttendance] = useState(false);\n  const [isAllowNotification, setIsAllowNotification] = useState(true);\n  const [isNotifUpdating, setIsNotifUpdating] = useState(false);"
  );

  const newToggleUI = `<div className="card" style={{padding: '32px'}}>
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
                          onChange={(e) => {
                             const newVal = e.target.checked;
                             setIsNotifUpdating(true);
                             setTimeout(() => {
                               setIsAllowNotification(newVal);
                               setIsNotifUpdating(false);
                               alert('알림 설정이 변경되었습니다');
                             }, 800);
                          }}
                        />
                        <span style={{
                          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: isAllowNotification ? 'var(--primary)' : '#e5e7eb',
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
                  </div>`;

  code = code.replace(
    /<div className="card" style=\{\{padding: '32px'\}\}>\s*<h4 style=\{\{ fontSize: '16px', fontWeight: 800, marginBottom: '24px' \}\}>알림 및 보안<\/h4>\s*<p style=\{\{ color: 'var\(--text-sub\)', fontSize: '14px' \}\}>계정 알림 및 보안 설정을 관리하세요\.<\/p>\s*<\/div>/,
    newToggleUI
  );

  fs.writeFileSync('src/apps/FanApp.tsx', code);
  console.log('done fan');
}
