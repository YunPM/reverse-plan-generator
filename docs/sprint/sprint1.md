# Sprint 1 — 역기획서 생성기 MVP 구현

## 개요
바이브코딩 해커톤(2026-03-13)용 역기획서 자동 생성 서비스 MVP 구현

## 개발 과정 — 문제 발생 및 해결 기록

### 문제 1: Playwright 스크린샷 Docker 빌드 실패
- **발생**: Dockerfile에서 `playwright install chromium` 실행 시 `playwright: not found` 오류
- **원인 분석**: requirements.txt에 playwright 미포함 → CLI 없이 명령 실행 시도
- **해결**: 실제 코드에서 Playwright 미사용 확인 → Dockerfile 설치 명령 제거 (Hotfix)
- **교훈**: 배포 전 Docker 빌드 로컬 검증 필수

### 문제 2: 환경변수 키 이름 불일치
- **발생**: render.yaml에 `ANTHROPIC_API_KEY`로 선언, 실제 코드는 `GEMINI_API_KEY` 사용
- **원인 분석**: AI 모델 Claude → Gemini 변경 시 render.yaml 업데이트 누락
- **해결**: render.yaml 환경변수 키를 `GEMINI_API_KEY`로 수정
- **교훈**: 의존성 변경 시 설정 파일 전체 점검 필요

### 문제 3: 일부 사이트 크롤링 실패 (403)
- **발생**: 특정 사이트 접근 시 403 Forbidden 응답
- **원인 분석**: 봇 차단 정책 (User-Agent, IP 필터링)
- **해결**: 에러 유형별 사용자 친화적 메시지 표시 (`friendlyError` 함수)
- **현재 한계**: 크롤링 차단 사이트는 분석 불가 (Out of Scope로 정의)

## 구현 완료 항목

- ✅ Task 1: 프로젝트 뼈대 (FastAPI + 정적 프론트엔드 서빙, /api/health)
- ✅ Task 2: URL 크롤링 (httpx + BeautifulSoup, PageSpeed API 스크린샷 + fallback)
- ✅ Task 3: Gemini API 분석 연동 (gemini-2.0-flash, REST 직접 호출)
- ✅ Task 4: 프론트엔드 E2E 플로우 (URL 입력 → 로딩 → 결과 렌더링)
- ✅ Task 5: UX 개선 (복사/다운로드, 섹션 접기/펼치기, 예시 URL)
- ✅ Task 6: Dockerfile + render.yaml 배포 설정

## 주요 기술 의사결정

### 1. AI 모델: Claude → Gemini 변경
- **초기 계획**: Anthropic Claude API 사용
- **변경 이유**: Google Gemini API는 무료 티어 제공, SDK 없이 REST 직접 호출 가능, 해커톤 환경에서 의존성 최소화
- **결과**: `gemini-2.0-flash-latest` 모델로 평균 50초 이내 역기획서 생성 달성

### 2. 스크린샷: Playwright → Google PageSpeed API 변경
- **초기 계획**: Playwright로 실제 브라우저 스크린샷 캡처
- **문제 발생**: Docker 이미지에서 `playwright install chromium` 실행 시 패키지 없음 오류 → 빌드 실패
- **변경 이유**: PageSpeed Insights API는 별도 브라우저 설치 불필요, API 키도 불필요, 안정적
- **결과**: Hotfix로 Dockerfile playwright 명령 제거, PageSpeed API로 정상 스크린샷 제공

### 3. 프론트엔드: Vanilla JS 선택
- **결정**: React/Vue 대신 순수 HTML+CSS+JS
- **이유**: 해커톤 시간 제약 + 빌드 도구 불필요 + marked.js CDN으로 마크다운 렌더링 충분
- **트레이드오프**: 확장성 낮으나 빠른 개발 속도 확보

### 4. 배포: Render 무료 티어 선택
- **이유**: GitHub 연동 자동 배포, Docker 지원, 무료 플랜 가능
- **제약**: 콜드 스타트 15~30초, 월 750시간 제한
- **대응**: 첫 요청 시 "서버 준비 중" 안내 메시지 표시

## 파일 구조

```
my_project/
├── backend/
│   ├── __init__.py
│   ├── main.py                # FastAPI 앱 + 라우터
│   ├── requirements.txt
│   ├── services/
│   │   ├── __init__.py
│   │   ├── crawler.py         # URL 크롤링 + Playwright 스크린샷
│   │   └── analyzer.py        # Claude API 분석
│   └── prompts/
│       ├── __init__.py
│       └── reverse_plan.py    # 역기획서 프롬프트 (6섹션)
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env                       # ANTHROPIC_API_KEY (gitignore됨)
├── Dockerfile
└── render.yaml
```

## 로컬 실행 방법

### 1. 환경 준비
```bash
# Python 가상환경 생성 (선택사항)
python -m venv .venv
.venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r backend/requirements.txt

# Playwright 브라우저 설치 (스크린샷 기능용)
playwright install chromium
```

### 2. API 키 설정
`.env` 파일에 Claude API 키 입력:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. 서버 실행
```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. 접속
브라우저에서 `http://localhost:8000` 열기

### 5. 테스트 (curl)
```bash
# 헬스 체크
curl http://localhost:8000/api/health

# 크롤링 테스트
curl -X POST http://localhost:8000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.notion.so"}'

# 역기획서 생성
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://linear.app"}'
```

## Render 배포 방법
1. GitHub에 코드 push
2. Render 대시보드 → New → Web Service → GitHub 연결
3. `render.yaml` 자동 감지됨
4. Environment Variables에서 `ANTHROPIC_API_KEY` 입력
5. Deploy 클릭

## 주요 기술 결정사항
- **Playwright fallback**: 스크린샷 실패 시 텍스트 전용 분석으로 자동 전환
- **URL 정규화**: http/https 접두사 없어도 자동 추가
- **마크다운 섹션 분리**: h2 기준으로 섹션화하여 접기/펼치기 지원
- **모델**: gemini-flash-latest (Google Gemini, REST API 직접 호출)

## 검증 보고서

- 코드 리뷰 및 검증 기록: [`docs/deploy-history/2026-03-13.md`](../deploy-history/2026-03-13.md)
