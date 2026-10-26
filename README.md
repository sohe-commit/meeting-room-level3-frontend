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
| `/reservations/new` | 예약 등록 | 모두 |
| `/ai` | AI로 예약하기 | 모두 |
| `/my` | 내 예약 (상태별, 취소) | 모두 |
| `/reservations/[id]` | 예약 상세 (예약자 연락처는 관리자·본인만) | 모두 |
| `/admin` | 관리자 현황판 | 관리자 |
| `/admin/rooms` | 회의실 관리 (등록·수정·사용 중지) | 관리자 |
| `/admin/reservations` | 전체 예약 목록 (필터·검색) | 관리자 |
| `/admin/issues` | 시설 제보 관리 (처리 완료) | 관리자 |
| `/admin/seed` | 데이터 초기화 | 관리자 |

## Vercel에 올릴 때

- Environment Variables에 `NEXT_PUBLIC_API_URL` = Render 백엔드 주소를 넣어요.
- 백엔드의 `FRONTEND_URL`에 Vercel 주소를 넣어야 화면에서 백엔드를 부를 수 있어요.
