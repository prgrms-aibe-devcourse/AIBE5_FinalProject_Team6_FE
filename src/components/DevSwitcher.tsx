// Common dummy data and designs are shared inside the components.

export default function DevSwitcher({ currentRole, onRoleChange }: { currentRole: 'FAN' | 'ARTIST' | 'ADMIN' | 'AGENCY', onRoleChange: (r: 'FAN'|'ARTIST'|'ADMIN'|'AGENCY') => void }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      borderRadius: '20px',
      padding: '6px 10px',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
    }}>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontWeight: 'bold' }}>
        🛠 DEV ONLY · 배포 시 제거
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {['FAN', 'ARTIST', 'AGENCY', 'ADMIN'].map((role) => (
          <button
            key={role}
            onClick={() => onRoleChange(role as any)}
            style={{
              background: currentRole === role ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: currentRole === role ? '#fff' : 'rgba(255,255,255,0.6)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              transition: 'background 0.2s, color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {role === 'FAN' && '👤'}
            {role === 'ARTIST' && '🎙️'}
            {role === 'AGENCY' && '🏢'}
            {role === 'ADMIN' && '⚙️'}
            <span style={{ textTransform: 'capitalize' }}>{role.toLowerCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
