"""
Gemini API를 사용하여 HTML+CSS 와이어프레임을 생성합니다.
"""

import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

WIREFRAME_PROMPT = """
아래 웹사이트 정보를 바탕으로 해당 페이지의 **HTML+CSS 와이어프레임**을 생성하세요.

요구사항:
- 완전한 단일 HTML 파일로 작성 (<!DOCTYPE html> 포함)
- 실제 페이지 레이아웃 구조를 최대한 반영
- 와이어프레임 스타일: 회색조(grayscale), 실선 테두리, 깔끔한 폰트
- 이미지 자리는 회색 박스 + 이미지 아이콘(📷)으로 표현
- 텍스트는 실제 내용 또는 의미있는 placeholder 사용 (Lorem ipsum 금지)
- 네비게이션, 히어로, 주요 섹션, 푸터 모두 포함
- 반응형 불필요, 고정 너비(1200px) 기준
- 외부 리소스(CDN, 폰트 등) 사용 금지, 순수 HTML+CSS만 사용

와이어프레임 CSS 스타일 기준:
- 배경: #f5f5f5
- 컨테이너 배경: #ffffff
- 테두리: 1px solid #cccccc 또는 2px solid #999999
- 텍스트: #333333 (본문), #666666 (보조)
- 버튼: 테두리만 있는 outline 스타일 (#444444)
- 이미지 자리: #dddddd 배경, 회색 박스

주의:
- ```html 코드블록으로 감싸서 반환하세요
- body 태그 안에 전체 페이지가 들어와야 합니다
- 실제 사이트와 유사한 섹션 구성을 갖추세요
"""


async def generate(url: str, text: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

    user_message = f"URL: {url}\n\n{text}"

    payload = {
        "system_instruction": {"parts": [{"text": WIREFRAME_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": user_message}]}],
        "generationConfig": {"maxOutputTokens": 8192},
    }

    async with httpx.AsyncClient(verify=False, timeout=120.0) as client:
        response = await client.post(
            GEMINI_URL,
            params={"key": api_key},
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    raw = data["candidates"][0]["content"]["parts"][0]["text"]

    # ```html ... ``` 코드블록 추출
    match = re.search(r"```html\s*([\s\S]*?)```", raw)
    html = match.group(1).strip() if match else raw.strip()

    # 모든 링크 클릭 비활성화 (와이어프레임 내 페이지 이동 방지)
    disable_links = """<style>a { pointer-events: none !important; cursor: default !important; }</style>"""
    if "</head>" in html:
        html = html.replace("</head>", disable_links + "</head>")
    else:
        html = disable_links + html

    return html
