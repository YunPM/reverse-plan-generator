# 역기획서 생성기 (Reverse PRD Generator)

> URL을 입력하면 AI가 역기획서를 자동으로 생성해주는 웹 서비스

바이브코딩 해커톤 2026 출품작

---

## 왜 만들었나

PM/기획자가 경쟁사 서비스를 분석해 역기획서를 작성하는 데 평균 **2~3시간**이 소요됩니다.
이 도구는 URL 하나로 **5분 안에 초안**을 생성해 분석 시간을 70% 이상 단축합니다.

### 타겟 사용자
- **PM/기획자**: 경쟁사 서비스를 빠르게 분석해야 하는 실무자
- **UX 디자이너**: 벤치마킹 사이트의 UI 패턴을 파악하고 싶은 디자이너
- **스타트업 창업자**: 유사 서비스를 빠르게 분석해 사업 방향을 잡으려는 초기 창업자

### 기존 도구와의 차이
| 방법 | 소요 시간 | 스크린샷 | 와이어프레임 | 구조화 문서 |
|------|---------|---------|------------|----------|
| 수동 작성 | 2~3시간 | 직접 캡처 | 직접 제작 | 직접 작성 |
| ChatGPT 직접 사용 | 30분~1시간 | ❌ | ❌ | 반구조화 |
| **역기획서 생성기** | **1분 이내** | ✅ 자동 | ✅ 자동 | ✅ 6섹션 |

---

## 주요 기능

- **URL 입력 한 번**으로 역기획서 자동 생성
- **6개 섹션** 구성 (서비스 개요 · UI/UX 분석 · 기능 명세 · 비즈니스 로직 · 차별점 · 기술 스택)
- **실제 스크린샷** 자동 캡처 (Google PageSpeed API)
- **AI 와이어프레임** 생성 (HTML+CSS 렌더링)
- 마크다운 **복사 / 다운로드**
- 섹션별 **접기/펼치기**

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Python FastAPI |
| 프론트엔드 | HTML + CSS + Vanilla JS |
| AI | Google Gemini API (gemini-2.0-flash) |
| 크롤링 | httpx + BeautifulSoup |
| 배포 | Render (Docker) |

> **Gemini API를 선택한 이유**: 무료 티어 제공, REST API 직접 호출 가능(SDK 불필요), 멀티모달(텍스트+이미지) 지원, 빠른 응답 속도(Flash 모델)

---

## 검증 결과

해커톤(2026-03-13) 현장 검증 기준:

| 지표 | 목표 | 결과 |
|------|------|------|
| 생성 성공률 | 80% 이상 | **100%** (3/3 사이트) |
| 평균 생성 시간 | 60초 이내 | **약 50초** |
| 6개 섹션 완성 | 100% | **100%** |

자세한 검증 계획 및 가설: [docs/validation.md](docs/validation.md)

---

## 로컬 실행

### 1. 의존성 설치
```bash
pip install -r backend/requirements.txt
```

### 2. 환경변수 설정
`.env` 파일 생성 후 Gemini API 키 입력:
```
GEMINI_API_KEY=your-api-key-here
```

### 3. 서버 실행
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

### 4. 브라우저 접속
```
http://localhost:8000
```

---

## 디렉토리 구조

```
reverse-plan-generator/
├── backend/
│   ├── main.py                # FastAPI 앱
│   ├── requirements.txt
│   ├── services/
│   │   ├── crawler.py         # URL 크롤링 + 스크린샷
│   │   ├── analyzer.py        # Gemini AI 분석
│   │   └── wireframe.py       # 와이어프레임 생성
│   └── prompts/
│       └── reverse_plan.py    # 역기획서 프롬프트
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── docs/
│   └── PRD.md
├── Dockerfile
└── render.yaml
```

---

## 배포

[Render](https://render.com)를 통해 Docker로 배포합니다.

Environment Variables 설정:
- `GEMINI_API_KEY`: Google Gemini API 키
