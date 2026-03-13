# 역기획서 생성기 (Reverse PRD Generator)

> URL을 입력하면 AI가 역기획서를 자동으로 생성해주는 웹 서비스

바이브코딩 해커톤 2026 출품작

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
| AI | Google Gemini API |
| 크롤링 | httpx + BeautifulSoup |
| 배포 | Render (Docker) |

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
