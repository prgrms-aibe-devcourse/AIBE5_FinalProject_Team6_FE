import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: '#111', letterSpacing: '-0.5px' }}>개인정보처리방침</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '32px' }}>시행일자: 2026년 6월 24일</p>

        <div style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>1. 수집하는 개인정보 항목</h2>
            <p>회사는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 최초 회원가입 당시 아래와 같은 개인정보를 수집하고 있습니다.<br />
            - 필수항목: 이메일 주소, 비밀번호, 닉네임<br />
            - 선택항목: 프로필 사진 이미지 데이터</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>2. 개인정보의 수집 및 이용목적</h2>
            <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.<br />
            - 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산, 콘텐츠 제공, 구매 및 요금 결제, 물품배송 또는 청구지 등 발송<br />
            - 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 불만처리 등 민원처리</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>3. 개인정보의 보유 및 이용기간</h2>
            <p>원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.<br />
            - 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래등에서의 소비자보호에 관한 법률)<br />
            - 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래등에서의 소비자보호에 관한 법률)<br />
            - 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래등에서의 소비자보호에 관한 법률)</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>4. 개인정보의 파기절차 및 방법</h2>
            <p>회사는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 파기의 절차 및 방법은 다음과 같습니다.<br />
            - 파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 파기됩니다.<br />
            - 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
