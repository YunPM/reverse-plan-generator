"""
역기획서 생성기 — FastAPI 백엔드
"""

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from backend.services.crawler import crawl
from backend.services.analyzer import analyze

app = FastAPI(title="역기획서 생성기", version="1.0.0")

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


# ─── 스키마 ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    url: str


class AnalyzeResponse(BaseModel):
    url: str
    markdown: str
    has_screenshot: bool
    screenshot_url: Optional[str] = None


# ─── 라우터 ─────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_path = FRONTEND_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.html 파일을 찾을 수 없습니다.")
    return HTMLResponse(content=index_path.read_text(encoding="utf-8"))


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_url(req: AnalyzeRequest):
    url = req.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        crawl_result = await crawl(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"크롤링 실패: {str(e)}")

    try:
        markdown = await analyze(
            url=crawl_result["url"],
            text=crawl_result["text"],
            screenshot_b64=crawl_result.get("screenshot_b64"),
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 분석 실패: {str(e)}")

    return AnalyzeResponse(
        url=url,
        markdown=markdown,
        has_screenshot=crawl_result["has_screenshot"],
        screenshot_url=crawl_result.get("screenshot_url"),
    )


@app.post("/api/wireframe")
async def generate_wireframe(req: AnalyzeRequest):
    url = req.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        crawl_result = await crawl(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"크롤링 실패: {str(e)}")

    try:
        from backend.services.wireframe import generate
        html = await generate(url=url, text=crawl_result["text"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"와이어프레임 생성 실패: {str(e)}")

    return {"html": html}
