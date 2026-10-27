# 사내 회의실 예약 시스템 — 프론트엔드 (Next.js)

(주)가상테크 사내 회의실 예약 시스템의 화면이에요. 데이터와 규칙은 별도 저장소의 NestJS 백엔드가 맡아요.

> 화면에 나오는 이름, 연락처, 예약은 **모두 가상 데이터**예요.

## 내 컴퓨터에서 실행하기

먼저 백엔드를 켜 두세요 (기본 <http://localhost:4100>).

```bash
npm install
cp .env.example .env.local   # 백엔드 주소
npm run dev                  # http://localhost:3100
```

| 설정 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_URL` | 백엔드 주소. 비밀값이 아니에요. GPT 키 같은 비밀값은 프론트엔드에 넣지 않아요. |

## 확인용 가상 계정 (비밀번호 `test1234`)

- 관리자: admin@example.com
- 직원: user@example.com

## 화면 목록

| 주소 | 화면 | 누가 |
|---|---|---|
| `/login` | 로그인 | 모두 |
| `/rooms` | 회의실 목록 (정원·장비 필터) | 모두 |
| `/rooms/[id]` | 회의실 상세 + 날짜별 시간표 + 시설 제보 | 모두 |
| `/timeline` | 전체 예약표 (회의실 전체 하루 시간표) | 모두 |
| `/reservations/new` | 예약 등록 (회의 유형: 일반 회의 / 교육·행사) | 모두 |
| (모든 화면) | AI 예약 챗봇: 오른쪽 아래 주황 버튼 또는 상단 "● AI 예약" 메뉴로 열기 (`/ai` 주소는 예약표로 보내며 챗봇을 연다) | 모두 |
| `/my` | 내 예약: 목록(유형별·상태별, 취소) / 주간 보드(`?view=week`, 요일별 내 회의) | 모두 |
| `/reservations/[id]` | 예약 상세 (예약자 연락처는 관리자·본인만) | 모두 |
| `/admin` | 관리자 현황판 | 관리자 |
| `/admin/rooms` | 회의실 관리 (등록·수정·사용 중지) | 관리자 |
| `/admin/reservations` | 전체 예약 목록 (필터·검색) | 관리자 |
| `/admin/issues` | 시설 제보 관리 (처리 완료) | 관리자 |
| `/admin/seed` | 데이터 초기화 | 관리자 |

## Vercel에 올릴 때

- Environment Variables에 `NEXT_PUBLIC_API_URL` = Render 백엔드 주소를 넣어요.
- 백엔드의 `FRONTEND_URL`에 Vercel 주소를 넣어야 화면에서 백엔드를 부를 수 있어요.

## 디자인

화면 디자인은 [`DESIGN.md`](DESIGN.md)를 기준으로 해요. ([VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)의 Intercom 분석 문서, MIT)

- 크림색 바탕 + 흰 카드 + 검정 글씨·버튼, 그림자 대신 얇은 테두리
- 주황색은 **AI 예약에만** 써요 (챗봇 버튼, AI 배지)
- 글꼴은 Pretendard
