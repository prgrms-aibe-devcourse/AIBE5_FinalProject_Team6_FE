import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#F7F3EE', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Pretendard, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid rgba(200, 190, 180, 0.4)', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/fan');
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 800, color: '#111', marginBottom: '24px', padding: 0 }}
        >
          <ChevronLeft size={20} /> 뒤로가기
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: '#111', letterSpacing: '-0.5px' }}>서비스 이용약관</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '32px' }}>시행일자: 2026년 6월 24일</p>

        <div style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>제1조 (목적)</h2>
            <p>본 약관은 FANDROPS(이하 "회사"라 함)가 제공하는 가상 아티스트 크리에이터 플랫폼 서비스(이하 "서비스"라 함)의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>제2조 (용어의 정의)</h2>
            <p>1. "서비스"란 회사가 FANDROPS 플랫폼을 통해 회원에게 제공하는 아티스트 정보 제공, 커뮤니티, 디지털 굿즈 판매, 일정 조회 등의 제반 서비스를 의미합니다.<br />
            2. "회원"이란 플랫폼에 접속하여 본 약관에 동의하고 가입한 고객을 의미합니다.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>제3조 (약관의 효력 및 변경)</h2>
            <p>1. 본 약관은 회원이 동의함으로써 효력이 발생하며, 회사는 합리적인 사유가 발생할 경우 관련 법령을 위배하지 않는 범위 내에서 약관을 개정할 수 있습니다.<br />
            2. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 서비스 내 공지사항을 통해 공지합니다.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>제4조 (회사의 의무)</h2>
            <p>1. 회사는 관련법과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.<br />
            2. 회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보 보호를 위한 보안시스템을 구축하며 개인정보 처리방침을 준수합니다.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>제5조 (회원의 의무)</h2>
            <p>회원은 아래 행위를 하여서는 안 됩니다.<br />
            - 신청 또는 변경 시 허위내용의 등록<br />
            - 타인의 정보도용<br />
            - 회사가 게시한 정보의 변경 및 침해<br />
            - 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</p>
          </section>
        </div>
      </div>
    </div>
  );
}
