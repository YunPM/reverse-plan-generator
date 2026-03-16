# Sprint Planner 메모리

이 파일은 sprint-planner 에이전트의 영구 메모리입니다.
프로젝트 진행 상황, 기술 스택, 패턴 등을 기록합니다.

---

## 프로젝트 정보

- **프로젝트명**: 역기획서 생성기
- **저장소**: https://github.com/YunPM/reverse-plan-generator
- **목표**: URL 입력 → AI가 역기획서(UI분석 + 기능명세 + 비즈니스 로직) 자동 생성
- **배포**: Render (Docker, 무료 플랜)

## 기술 스택

- **백엔드**: FastAPI, Python 3.11, httpx, BeautifulSoup4
- **AI**: Google Gemini API (gemini-flash-latest), REST API 직접 호출
- **스크린샷**: Google PageSpeed Insights API (무료, 키 불필요)
- **프론트엔드**: 순수 HTML + CSS + JS (marked.js CDN)
- **배포**: Render + Docker

## 스프린트 현황

| 스프린트 | 목표 | 상태 | 완료일 |
|---------|------|------|--------|
| Sprint 1 | 역기획서 생성기 MVP | ✅ 완료 | 2026-03-13 |

- **다음 사용 가능한 스프린트 번호**: Sprint 2

## 핵심 주의사항

1. **환경변수 불일치**: `render.yaml`에 `ANTHROPIC_API_KEY`로 선언되어 있으나 실제 코드는 `GEMINI_API_KEY`를 사용함. Render 대시보드에서 `GEMINI_API_KEY`로 입력해야 함.

2. **SSL 검증 비활성화**: `crawler.py`, `analyzer.py`, `wireframe.py` 모두 `verify=False` 사용 중. 회사 네트워크 프록시 환경 대응 목적. 프로덕션 강화 시 환경변수로 제어 권장.

3. **브랜치 전략 예외**: 해커톤 특성상 sprint 브랜치 없이 main에서 직접 작업함. 정규 프로젝트 전환 시 브랜치 전략 복원 필요.

4. **테스트 없음**: 해커톤 일정상 pytest 테스트 파일 없음. 후속 개발 시 추가 필요.

## 스프린트 브랜치 이력

- Sprint 1: main 브랜치 직접 작업 (해커톤 예외)
