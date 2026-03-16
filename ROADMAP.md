# 역기획서 생성기 -- 프로젝트 로드맵

## 개요

- **프로젝트 목표**: URL 입력 한 번으로 AI가 UI분석 + 기능명세 + 비즈니스 로직을 포함한 역기획서를 자동 생성하는 서비스
- **전체 예상 기간**: 3주 (Phase 0~3, 해커톤 MVP + 후속 개선)
- **현재 진행 단계**: Phase 1 완료 (MVP 배포 완료)

## 진행 상태 범례

- ✅ 완료
- 🔄 진행 중
- 📋 예정
- ⏸️ 보류

---

## 📊 프로젝트 현황 대시보드

| 항목 | 내용 |
|------|------|
| 전체 진행률 | **40%** (Phase 1/3 완료) |
| 현재 Phase | Phase 1 완료, Phase 2 예정 |
| 다음 마일스톤 | 안정성 강화 및 UX 고도화 |
| 팀 규모 | 1인 (PM/기획자 + AI 바이브코딩) |

---

## 🏗️ 기술 아키텍처 결정 사항

| 결정 사항 | 선택 | 이유 |
|-----------|------|------|
| 백엔드 프레임워크 | Python FastAPI | 비동기 지원, 빠른 프로토타이핑, 자동 API 문서 |
| 프론트엔드 | HTML + CSS + Vanilla JS | 빌드 도구 불필요, 해커톤에 적합한 단순함 |
| AI 모델 | Google Gemini (gemini-flash-latest) | 빠른 응답, REST API 직접 호출 가능 |
| 크롤링 | httpx + BeautifulSoup | 경량, 비동기 HTTP 지원 |
| 스크린샷 | Google PageSpeed Insights API | 별도 브라우저 설치 불필요, 안정적 |
| 마크다운 렌더링 | marked.js (CDN) | 클라이언트 사이드 렌더링, 의존성 최소화 |
| 배포 | Render (Docker) | 무료 티어, GitHub 연동 자동 배포 |

---

## 🔗 의존성 맵

```
Phase 0: 프로젝트 초기 설정
    └── Phase 1: MVP 구현 (Sprint 1)
         ├── Phase 2: 안정성 강화 + UX 고도화 (Sprint 2)
         │    └── Phase 3: 확장 기능 (Sprint 3)
         └── [독립] 해커톤 데모
```

- Phase 2는 Phase 1의 MVP 코드베이스 위에 개선
- Phase 3는 Phase 2의 안정화된 기반 위에 새 기능 추가
- 각 Phase는 독립 배포 가능한 단위

---

## Phase 0: 프로젝트 초기 설정 ✅

### 목표
개발 인프라와 프로세스를 갖추어 즉시 기능 개발에 착수할 수 있는 상태 확보

### 작업 목록
- ✅ **저장소 생성**: GitHub 저장소 생성 및 브랜치 전략 설정 (main/develop/sprint)
- ✅ **Claude Code 설정**: CLAUDE.md, 에이전트 구성, 개발 프로세스 문서화
- ✅ **문서 체계**: PRD, 개발 프로세스, CI 정책 문서 작성

### 완료 기준 (Definition of Done)
- ✅ GitHub 저장소에 코드 push 가능
- ✅ Claude Code 에이전트 정상 작동
- ✅ PRD, CLAUDE.md, dev-process.md 작성 완료

---

## Phase 1: MVP 구현 ✅ (Sprint 1)

### 목표
해커톤 데모가 가능한 최소 기능 제품(MVP) -- URL 입력부터 역기획서 생성, 결과 활용까지 전체 E2E 플로우 구현 및 배포

### 작업 목록

#### 백엔드 핵심 기능
- ✅ **FastAPI 프로젝트 구조**: `backend/main.py` 기반 앱 + 정적 파일 서빙
  - `/api/health` 헬스체크 엔드포인트
  - `/api/analyze` 역기획서 생성 엔드포인트
  - `/api/wireframe` AI 와이어프레임 생성 엔드포인트
- ✅ **URL 크롤링 서비스** (`backend/services/crawler.py`): httpx + BeautifulSoup으로 HTML 텍스트, 메타데이터, 네비게이션 구조 추출
  - URL 정규화 (http/https 자동 추가)
  - 403/404/타임아웃 에러 처리 및 사용자 친화적 메시지
- ✅ **Google PageSpeed Insights 스크린샷**: 대상 사이트 실제 화면 캡처
  - 스크린샷 실패 시 텍스트 전용 분석으로 자동 전환 (fallback)
- ✅ **AI 분석 서비스** (`backend/services/analyzer.py`): Gemini API (gemini-flash-latest) REST 직접 호출
  - 6개 섹션 역기획서 마크다운 생성 (서비스 개요, UI/UX 분석, 기능 명세, 비즈니스 로직, 경쟁우위, 기술 스택)
- ✅ **AI 와이어프레임 서비스** (`backend/services/wireframe.py`): Gemini가 HTML+CSS 와이어프레임 코드 생성

#### 프론트엔드
- ✅ **메인 페이지** (`frontend/index.html`): URL 입력 폼 + 예시 URL 버튼
- ✅ **로딩 UI**: 단계별 로딩 상태 메시지 표시
- ✅ **결과 렌더링**: marked.js로 마크다운 렌더링, 와이어프레임 iframe 표시
- ✅ **UX 편의 기능**: 마크다운 복사, .md 다운로드, 섹션 접기/펼치기

#### 배포
- ✅ **Docker 설정**: Dockerfile + render.yaml 작성
- ✅ **Render 배포**: 무료 티어 배포 완료

### 완료 기준 (Definition of Done)
- ✅ URL 입력 후 60초 이내 역기획서 생성
- ✅ 생성된 역기획서에 6개 섹션 모두 포함
- ✅ 실제 스크린샷 + AI 와이어프레임 표시
- ✅ 마크다운 복사/다운로드 정상 작동
- ✅ Render에 배포되어 외부 접속 가능
- ✅ 3개 이상 사이트(notion.so, linear.app 등)에서 정상 생성 확인

### 🧪 Playwright MCP 검증 시나리오
```
1. browser_navigate -> http://localhost:8000 접속
2. browser_snapshot -> 메인 페이지 렌더링 확인 (URL 입력 폼, 예시 URL 버튼 표시)
3. browser_click -> 예시 URL 버튼 클릭
4. browser_snapshot -> URL 입력란에 예시 URL 자동 입력 확인
5. browser_click -> 분석 시작 버튼 클릭
6. browser_snapshot -> 로딩 상태 표시 확인
7. (60초 대기)
8. browser_snapshot -> 역기획서 결과 렌더링 확인 (6개 섹션, 스크린샷, 와이어프레임)
9. browser_click -> 마크다운 복사 버튼 클릭
10. browser_snapshot -> 복사 완료 피드백 확인
11. browser_console_messages(level: "error") -> 콘솔 에러 없음 확인
```

### 기술 고려사항
- Gemini API 키는 `.env` 파일로 관리 (gitignore 필수)
- Render 무료 플랜 콜드 스타트 시 첫 요청 15~30초 지연 허용
- 크롤링 차단 사이트(403)는 명확한 에러 메시지로 안내

---

## Phase 2: 안정성 강화 + UX 고도화 📋 (Sprint 2, 2주)

### 목표
MVP의 에러 처리와 사용자 경험을 개선하여 실무 활용 가능 수준으로 품질 향상. 프론트엔드를 먼저 개선하고, 백엔드 보강을 이어서 진행.

### 작업 목록

#### Must Have (필수)

- ⬜ **에러 핸들링 고도화**: 모든 API 엔드포인트에 일관된 에러 응답 구조 적용
  - 크롤링 실패 유형별 구체적 안내 메시지 (403 차단, DNS 실패, 타임아웃, 빈 페이지)
  - Gemini API 한도 초과/키 만료 시 안내 메시지
  - 프론트엔드에서 에러 유형별 UI 분기 처리
  - 예상 복잡도: 중 (1~2일)

- ⬜ **입력 유효성 검증 강화**: URL 형식 검증 + 접근 불가 도메인 사전 체크
  - 유효하지 않은 URL 즉시 프론트엔드 피드백
  - 비공개/localhost URL 차단
  - 예상 복잡도: 낮 (반나절)

- ⬜ **응답 시간 최적화**: 크롤링과 스크린샷 병렬 실행으로 전체 소요 시간 단축
  - 현재: 크롤링 -> 스크린샷 -> AI 분석 (직렬)
  - 목표: 크롤링 + 스크린샷 동시 실행 -> AI 분석
  - 목표 응답 시간: 평균 45초 이내
  - 예상 복잡도: 중 (1일)

#### Should Have (권장)

- ⬜ **로딩 UX 개선**: 분석 진행률 단계별 표시 (크롤링 중 -> AI 분석 중 -> 와이어프레임 생성 중)
  - SSE(Server-Sent Events) 또는 단계별 상태 폴링
  - 예상 소요 시간 표시
  - 예상 복잡도: 중 (1일)

- ⬜ **모바일 반응형 레이아웃**: 스마트폰/태블릿 대응
  - 입력 폼, 결과 카드, 와이어프레임 영역 반응형 CSS
  - 예상 복잡도: 중 (1일)

- ⬜ **결과 화면 UI 개선**: 역기획서 섹션 디자인 고도화
  - 섹션별 아이콘, 시각적 구분선, 접기/펼치기 애니메이션
  - 와이어프레임 영역 리사이즈 핸들
  - 예상 복잡도: 중 (1일)

#### Could Have (선택)

- ⬜ **다크 모드 지원**: 시스템 설정 연동 + 토글 버튼
  - 예상 복잡도: 낮 (반나절)

### 완료 기준 (Definition of Done)
- 크롤링 실패 시 유형별 에러 메시지가 사용자에게 명확히 표시됨
- 유효하지 않은 URL 입력 시 즉시 경고 표시
- 평균 응답 시간 45초 이내 (공개 사이트 5개 테스트 기준)
- 모바일(375px 너비)에서 주요 기능 정상 사용 가능
- 기존 기능 회귀 없음

### 🧪 Playwright MCP 검증 시나리오
```
# 에러 처리 검증
1. browser_navigate -> http://localhost:8000 접속
2. browser_type -> URL 입력란에 "not-a-valid-url" 입력
3. browser_click -> 분석 시작 버튼 클릭
4. browser_snapshot -> URL 유효성 에러 메시지 표시 확인
5. browser_type -> URL 입력란에 "https://httpstat.us/403" 입력
6. browser_click -> 분석 시작 버튼 클릭
7. browser_snapshot -> 크롤링 차단 에러 메시지 확인

# 정상 플로우 + UX 개선 검증
8. browser_type -> URL 입력란에 "https://www.notion.so" 입력
9. browser_click -> 분석 시작 버튼 클릭
10. browser_snapshot -> 단계별 로딩 상태 표시 확인
11. (결과 대기)
12. browser_snapshot -> 역기획서 정상 렌더링 + 개선된 UI 확인

# 모바일 반응형 검증
13. browser_resize(width: 375, height: 812) -> 모바일 뷰포트
14. browser_snapshot -> 레이아웃 정상 표시 확인
15. browser_console_messages(level: "error") -> 콘솔 에러 없음 확인
```

### 기술 고려사항
- SSE 도입 시 FastAPI의 `StreamingResponse` 활용
- 반응형 CSS는 미디어 쿼리 기준점: 768px (태블릿), 480px (모바일)
- 에러 응답 포맷 통일: `{"error": {"code": "CRAWL_BLOCKED", "message": "..."}}`

---

## Phase 3: 확장 기능 📋 (Sprint 3, 2주)

### 목표
역기획서 생성기의 활용 범위를 넓히는 부가 기능 추가. 사용자 피드백 기반으로 우선순위 조정 가능.

### 작업 목록

#### Should Have (권장)

- ⬜ **이미지 업로드 분석**: URL 외에 스크린샷 이미지 직접 업로드하여 역기획서 생성
  - 파일 업로드 UI (드래그앤드롭 지원)
  - 이미지를 Gemini 멀티모달 분석에 전달
  - 지원 포맷: PNG, JPG, WEBP (최대 5MB)
  - 예상 복잡도: 높 (2~3일)

- ⬜ **역기획서 PDF 내보내기**: 마크다운 결과를 PDF로 변환하여 다운로드
  - 클라이언트 사이드 PDF 생성 (html2pdf.js 또는 jsPDF)
  - 스크린샷, 와이어프레임 포함
  - 예상 복잡도: 중 (1~2일)

#### Could Have (선택)

- ⬜ **분석 히스토리**: 최근 분석 결과를 로컬스토리지에 저장
  - 최근 10건 목록 표시
  - 결과 다시 보기 기능
  - 예상 복잡도: 중 (1일)

- ⬜ **여러 페이지 비교 분석**: 2개 URL을 입력하여 비교 역기획서 생성
  - 병렬 크롤링 + 비교 분석 프롬프트
  - 사이드바이사이드 결과 표시
  - 예상 복잡도: 높 (2~3일)

### 완료 기준 (Definition of Done)
- 이미지 업로드 후 역기획서 정상 생성 (3개 이상 테스트 이미지)
- PDF 다운로드 파일에 모든 섹션 + 이미지 포함
- 히스토리에서 이전 결과 정상 조회
- 기존 URL 분석 기능 회귀 없음

### 🧪 Playwright MCP 검증 시나리오
```
# 이미지 업로드 검증
1. browser_navigate -> http://localhost:8000 접속
2. browser_snapshot -> 이미지 업로드 영역 표시 확인
3. browser_file_upload -> 테스트 스크린샷 이미지 업로드
4. browser_click -> 분석 시작 버튼 클릭
5. browser_snapshot -> 역기획서 결과 정상 생성 확인

# PDF 내보내기 검증
6. browser_click -> PDF 다운로드 버튼 클릭
7. browser_snapshot -> 다운로드 시작 확인

# 히스토리 검증
8. browser_click -> 히스토리 버튼/탭 클릭
9. browser_snapshot -> 이전 분석 결과 목록 표시 확인
10. browser_click -> 목록 항목 클릭
11. browser_snapshot -> 저장된 결과 정상 표시 확인
12. browser_console_messages(level: "error") -> 콘솔 에러 없음 확인
```

### 기술 고려사항
- 이미지 업로드 시 Gemini Vision API의 이미지 크기 제한(20MB) 확인 필요
- PDF 생성은 클라이언트 사이드(html2pdf.js)가 서버 부하 없이 적합
- 로컬스토리지 용량 제한(5MB) 고려, 결과 텍스트만 저장 (이미지 제외)
- 비교 분석 시 Gemini API 호출 2회 + 비교 프롬프트 1회로 비용 증가 주의

---

## ⚠️ 리스크 및 완화 전략

| 리스크 | 영향도 | 발생 가능성 | 완화 방안 |
|--------|--------|------------|----------|
| 크롤링 차단 사이트 (403/CORS) | 중 | 높 | 에러 유형별 구체적 안내 메시지 + "이 사이트는 분석이 제한됩니다" 표시 |
| Gemini API 응답 지연 (>60초) | 중 | 중 | 로딩 단계별 표시 + 타임아웃 90초 설정 + 재시도 안내 |
| Gemini API 할당량 초과 | 높 | 중 | 무료 티어 한도 모니터링 + 한도 초과 시 안내 메시지 |
| Render 무료 플랜 콜드 스타트 | 낮 | 높 | 첫 요청 시 "서버 준비 중" 안내 (15~30초) |
| 마크다운 파싱 오류 | 낮 | 중 | Gemini 프롬프트에 마크다운 포맷 강제 + 클라이언트 fallback 렌더링 |
| 1인 개발 병목 | 중 | 높 | Phase별 MoSCoW 우선순위로 Must Have에 집중, Could Have는 여력 시 진행 |

---

## 📈 마일스톤

| 마일스톤 | 목표 날짜 | 상태 | 설명 |
|---------|----------|------|------|
| MVP 개발 완료 | 2026-03-13 | ✅ 완료 | 핵심 E2E 플로우 구현 |
| Render 배포 | 2026-03-13 | ✅ 완료 | 외부 접속 가능한 서비스 배포 |
| 해커톤 데모 | 2026-03-13 | ✅ 완료 | 3개+ 사이트 실시간 생성 시연 |
| 안정성 강화 완료 | 미정 | 📋 예정 | Phase 2 완료 -- 에러 처리, 응답 최적화, 반응형 |
| 확장 기능 완료 | 미정 | 📋 예정 | Phase 3 완료 -- 이미지 업로드, PDF, 히스토리 |

---

## 🔮 향후 계획 (Backlog) -- Won't Have (현재 범위 밖)

아래 항목은 PRD의 제외 범위(Out of Scope)이거나, MVP 이후 장기적으로 검토할 수 있는 기능입니다.

- ⏸️ **로그인 필요 페이지 분석**: 인증 토큰/쿠키 전달 방식 검토 필요
- ⏸️ **모바일 앱 분석**: 스크린샷 기반 분석으로 우회 가능성 검토
- ⏸️ **PDF/문서 파일 분석**: 문서 업로드 -> 파싱 -> 분석 파이프라인
- ⏸️ **다국어 지원**: 프롬프트에 언어 파라미터 추가
- ⏸️ **사용자 계정 + 클라우드 저장**: 서버 사이드 DB 필요, 인프라 비용 증가
- ⏸️ **분석 결과 공유 링크**: 고유 URL 생성 + 결과 영구 저장

---

## 🛠️ 기술 부채 관리

| 항목 | 현재 상태 | 개선 방향 | 배분 Phase |
|------|----------|----------|-----------|
| 에러 처리 일관성 | 엔드포인트별 에러 포맷 상이 | 공통 에러 응답 미들웨어 | Phase 2 |
| 환경 변수 관리 | `.env` 파일 직접 참조 | pydantic-settings 기반 config 클래스 | Phase 2 |
| 프론트엔드 코드 구조 | 단일 index.html + app.js | 모듈별 분리 (선택적) | Phase 3 |
| 테스트 코드 부재 | 테스트 없음 | 핵심 API 엔드포인트 통합 테스트 추가 | Phase 2~3 |
| API 문서화 | FastAPI 자동 docs만 존재 | 사용 예제 및 에러 코드 문서화 | Phase 3 |
