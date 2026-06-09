export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AgencyApplication {
  id: string;
  // 기본 정보
  companyName: string;
  businessRegistrationNumber: string;
  ceoName: string;
  managerName: string;
  businessEmail: string;
  contactNumber?: string;
  // 아티스트 정보
  artistName: string;
  artistType: string; // 중소 아이돌, 버추얼 아이돌, 솔로 아티스트, 기타
  platforms: string[]; // 유튜브, 치지직, 트위치, 인스타그램, 트위터/X, 틱톡
  channelUrl?: string;
  // 서비스
  services: string[]; // 굿즈 판매, 팬미팅 예약, 커뮤니티 운영, 티켓 판매
  // 소개
  introduction: string;
  // 기타
  status: ApplicationStatus;
  appliedAt: string;
  rejectionReason?: string;
}
