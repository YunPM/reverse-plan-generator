# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

## 현재 미완료 항목 — Sprint 1 (2026-03-13)

### 로컬 동작 확인

- ⬜ `pip install -r backend/requirements.txt` 의존성 설치
- ⬜ `.env` 파일에 `GEMINI_API_KEY=...` 설정
- ⬜ `uvicorn backend.main:app --reload --port 8000` 실행
- ⬜ `http://localhost:8000` 브라우저 접속 확인
- ⬜ 예시 URL 입력 → 역기획서 생성 E2E 플로우 확인
- ⬜ 와이어프레임 탭 렌더링 확인
- ⬜ 복사/다운로드 버튼 동작 확인

### Render 배포 확인

- ⬜ GitHub push 후 Render 자동 배포 트리거 확인
- ⬜ Render 대시보드 → Environment → `GEMINI_API_KEY` 설정
  - **주의**: `render.yaml`에 `ANTHROPIC_API_KEY`로 표기되어 있으나, 실제 코드는 `GEMINI_API_KEY`를 사용합니다. 대시보드에서 `GEMINI_API_KEY`로 입력하세요.
- ⬜ 배포 완료 후 `/api/health` 응답 확인
- ⬜ 실서버에서 역기획서 생성 E2E 확인

---

## Hotfix: Dockerfile playwright 설치 명령 제거 (2026-03-16)

PR: hotfix/remove-playwright-dockerfile → main (GitHub에서 PR 생성 필요 — 아래 6단계 참조)

- ✅ 코드 리뷰 완료 (Critical/High 이슈 없음, 순수 삭제 패치)

- ⬜ 자동 검증 항목 (서버 미실행으로 미수행):
  - pytest -v
  - Dockerfile 변경이므로 API/Playwright 타겟 검증 해당 없음

- ⬜ 수동 검증 필요 항목:
  - `docker compose up --build` 실행 후 빌드 성공 확인 (playwright: not found 에러 사라짐 확인)
  - Render 자동 배포 트리거 확인 (main merge 후)
  - 배포 완료 후 `/api/health` 응답 확인

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- Sprint 1 검증 보고서: `docs/deploy-history/2026-03-13.md`
- Hotfix 2026-03-16 기록: `docs/deploy-history/2026-03-16.md`
