"""
Google Gemini REST API를 httpx로 직접 호출합니다.
회사 네트워크 SSL 프록시 환경에서도 동작합니다.
"""

import os
from typing import Optional

import httpx
from dotenv import load_dotenv

from backend.prompts.reverse_plan import REVERSE_PLAN_PROMPT

load_dotenv()

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"


async def analyze(url: str, text: str, screenshot_b64: Optional[str] = None) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

    system_prompt = REVERSE_PLAN_PROMPT.replace("{url}", url)

    if screenshot_b64:
        user_text = f"위 이미지는 {url} 의 스크린샷입니다.\n\n아래는 페이지 텍스트입니다:\n\n{text}"
        parts = [
            {"inline_data": {"mime_type": "image/jpeg", "data": screenshot_b64}},
            {"text": user_text},
        ]
    else:
        parts = [{"text": f"URL: {url}\n\n{text}"}]

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"maxOutputTokens": 4096},
    }

    async with httpx.AsyncClient(verify=False, timeout=120.0) as client:
        response = await client.post(
            GEMINI_URL,
            params={"key": api_key},
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    return data["candidates"][0]["content"]["parts"][0]["text"]
