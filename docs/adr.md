# ADR (Architecture Decision Records)

기술 의사결정 기록입니다. 주요 선택과 그 배경, 결과를 추적합니다.

---

## ADR-001: AI 모델 — Claude → Gemini 변경

- **날짜**: 2026-03-13
- **상태**: 확정

### 배경
초기 설계에서는 Anthropic Claude API를 사용할 계획이었음. sprint1.md에 `claude-sonnet-4-6` 모델 연동으로 기록됨.

### 문제
- Claude API는 유료 플랜 필요 (해커톤 무료 환경 부적합)
- SDK 의존성 추가 시 Docker 이미지 크기 증가

### 결정
Google Gemini API (`gemini-2.0-flash-latest`)로 전환

### 이유
- 무료 티어 제공 (분당 15회, 일 1500회)
- SDK 없이 REST API 직접 호출 가능 → 의존성 최소화
- 멀티모달(텍스트+이미지) 지원
- 응답 속도 빠름 (Flash 모델)

### 결과
- 평균 50초 이내 역기획서 생성 달성
- requirements.txt에 google-sdk 불필요
- render.yaml 환경변수를 `GEMINI_API_KEY`로 통일 (초기 `ANTHROPIC_API_KEY` 오기입 → hotfix로 수정)

---

## ADR-002: 스크린샷 — Playwright → Google PageSpeed API 변경

- **날짜**: 2026-03-13 (Hotfix: 2026-03-16)
- **상태**: 확정

### 배경
초기 구현에서 Playwright로 실제 브라우저 스크린샷을 캡처하는 방식을 선택.

### 문제
Dockerfile에서 `playwright install chromium` 실행 시 오류 발생:
```
/bin/sh: 1: playwright: not found (exit code 127)
```
원인: `requirements.txt`에 playwright 패키지 미포함 상태에서 CLI 실행 시도.

### 시도한 해결책
1. playwright를 requirements.txt에 추가하는 방안 검토
2. → 그러나 실제 백엔드 코드에서 playwright를 사용하지 않음을 확인
3. → 스크린샷은 이미 Google PageSpeed Insights API로 대체되어 있었음

### 결정
Dockerfile에서 playwright 설치 명령 제거 (Hotfix `hotfix/remove-playwright-dockerfile`)

### 이유
- PageSpeed Insights API: 별도 브라우저 설치 불필요, API 키 불필요, 안정적
- Playwright 유지 시 Docker 이미지 크기 대폭 증가 (Chromium ~300MB)
- 실제 코드에서 미사용이므로 제거가 올바른 선택

### 결과
- Docker 빌드 성공
- 이미지 크기 감소
- Render 배포 정상화

---

## ADR-003: 프론트엔드 — Vanilla JS 선택

- **날짜**: 2026-03-13
- **상태**: 확정

### 배경
웹 프론트엔드 구현 방식 결정 필요.

### 검토한 옵션
| 옵션 | 장점 | 단점 |
|------|------|------|
| React | 컴포넌트 재사용, 생태계 풍부 | 빌드 도구 필요, 초기 세팅 시간 소요 |
| Vue | 러닝커브 낮음 | 빌드 도구 필요 |
| Vanilla JS | 빌드 도구 불필요, 즉시 개발 가능 | 대규모 확장 어려움 |

### 결정
Vanilla JS (HTML + CSS + JS) + marked.js CDN

### 이유
- 해커톤 시간 제약 (1일): 빌드 도구 세팅 시간 절약
- FastAPI의 `StaticFiles`로 바로 서빙 가능
- marked.js CDN으로 마크다운 렌더링 충분히 구현 가능
- MVP 수준에서 컴포넌트 재사용 필요성 낮음

### 트레이드오프
- 확장성 낮음 (Phase 3 이후 React 전환 고려)
- 번들러 없어 코드 최적화 미적용

### 결과
- 빌드 없이 즉시 개발 및 배포
- 예상 개발 시간 단축 (React 대비 약 2시간 절약 추정)

---

## ADR-004: 배포 플랫폼 — Render 선택

- **날짜**: 2026-03-13
- **상태**: 확정

### 검토한 옵션
| 플랫폼 | 무료 티어 | Docker 지원 | GitHub 연동 |
|--------|---------|-----------|-----------|
| Render | ✅ | ✅ | ✅ |
| Railway | 제한적 | ✅ | ✅ |
| Fly.io | ✅ | ✅ | 수동 설정 |
| AWS | 복잡 | ✅ | 복잡 |

### 결정
Render 무료 티어 (Docker 배포)

### 이유
- `render.yaml` 하나로 배포 설정 완결
- GitHub main 브랜치 push 시 자동 배포
- 무료 플랜에서 Docker 지원
- 별도 서버 관리 불필요

### 제약 및 대응
- 콜드 스타트 15~30초: 프론트엔드에서 "서버 준비 중" 안내 메시지 표시
- 월 750시간 무료 제한: 해커톤 기간 내 충분
