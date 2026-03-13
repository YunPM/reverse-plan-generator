# Sprint 1 — 역기획서 생성기 MVP 구현

## 개요
바이브코딩 해커톤(2026-03-13)용 역기획서 자동 생성 서비스 MVP 구현

## 구현 완료 항목

- ✅ Sprint 1: 프로젝트 뼈대 (FastAPI + 정적 프론트엔드 서빙, /api/health)
- ✅ Sprint 2: URL 크롤링 (httpx + BeautifulSoup, Playwright 스크린샷 + fallback)
- ✅ Sprint 3: Claude API 분석 연동 (멀티모달, claude-sonnet-4-6)
- ✅ Sprint 4: 프론트엔드 E2E 플로우 (URL 입력 → 로딩 → 결과 렌더링)
- ✅ Sprint 5: UX 개선 (복사/다운로드, 섹션 접기/펼치기, 예시 URL)
- ✅ Sprint 6: Dockerfile + render.yaml 배포 설정

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
- **모델**: claude-sonnet-4-6 (최신 모델)
