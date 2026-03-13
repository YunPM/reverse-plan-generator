"""
웹 크롤러: URL에서 HTML 텍스트와 스크린샷을 추출합니다.
스크린샷은 Google PageSpeed API로 캡처합니다 (무료, API 키 불필요).
"""

import asyncio
from typing import Optional

import httpx
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}


async def fetch_html(url: str) -> str:
    """httpx로 원본 HTML을 가져옵니다."""
    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=30.0, verify=False) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text


def parse_text(html: str) -> str:
    """HTML에서 텍스트와 메타 정보를 추출합니다."""
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "noscript", "svg", "iframe"]):
        tag.decompose()

    meta_title = soup.title.string.strip() if soup.title else ""
    meta_desc = ""
    meta_og_desc = ""
    for meta in soup.find_all("meta"):
        if meta.get("name", "").lower() == "description":
            meta_desc = meta.get("content", "")
        if meta.get("property", "").lower() == "og:description":
            meta_og_desc = meta.get("content", "")

    body_text = soup.get_text(separator="\n", strip=True)
    lines = [line for line in body_text.splitlines() if len(line.strip()) > 1]
    body_text = "\n".join(lines)[:5000]

    nav_links = []
    for nav in soup.find_all(["nav", "header"]):
        for a in nav.find_all("a", href=True):
            text = a.get_text(strip=True)
            if text and len(text) < 50:
                nav_links.append(text)
    nav_text = " | ".join(nav_links[:20]) if nav_links else ""

    result = f"[페이지 제목] {meta_title}\n"
    if meta_desc:
        result += f"[메타 설명] {meta_desc}\n"
    if meta_og_desc and meta_og_desc != meta_desc:
        result += f"[OG 설명] {meta_og_desc}\n"
    if nav_text:
        result += f"[네비게이션] {nav_text}\n"
    result += f"\n[본문 텍스트]\n{body_text}"

    return result


async def fetch_text(url: str) -> str:
    html = await fetch_html(url)
    return parse_text(html)


async def take_screenshot_pagespeed(url: str) -> Optional[str]:
    """
    Google PageSpeed Insights API로 스크린샷을 가져옵니다.
    무료이며 API 키가 필요 없습니다.
    반환: data URL 문자열 (예: "data:image/jpeg;base64,...")
    """
    try:
        api_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
        params = {"url": url, "strategy": "desktop", "category": "performance"}

        async with httpx.AsyncClient(verify=False, timeout=30.0) as client:
            response = await client.get(api_url, params=params)
            response.raise_for_status()
            data = response.json()

        screenshot_data = (
            data.get("lighthouseResult", {})
            .get("audits", {})
            .get("final-screenshot", {})
            .get("details", {})
            .get("data")
        )

        if screenshot_data:
            print(f"[crawler] PageSpeed 스크린샷 캡처 성공")
            return screenshot_data  # "data:image/jpeg;base64,..." 형식
        return None
    except Exception as e:
        print(f"[crawler] PageSpeed 스크린샷 실패: {e}")
        return None


async def crawl(url: str) -> dict:
    """URL을 크롤링하여 텍스트와 스크린샷을 반환합니다."""
    main_html, screenshot_url = await asyncio.gather(
        fetch_html(url),
        take_screenshot_pagespeed(url),
    )
    return {
        "url": url,
        "text": parse_text(main_html),
        "screenshot_b64": None,
        "screenshot_url": screenshot_url,
        "has_screenshot": screenshot_url is not None,
    }
