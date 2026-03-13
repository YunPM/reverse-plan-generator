/**
 * 역기획서 생성기 — 프론트엔드 로직
 * URL 입력 → API 호출 → 마크다운 렌더링 + 섹션 접기/펼치기
 */

let currentMarkdown = "";
let currentUrl = "";
let wireframeLoaded = false;

// ─── 초기화 ──────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("urlInput");

  // Enter 키로 분석 시작
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startAnalysis();
  });

  // marked.js 옵션 설정
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
});

// ─── 예시 URL 설정 ────────────────────────────────────────────────────────

function setExample(url) {
  document.getElementById("urlInput").value = url;
  document.getElementById("urlInput").focus();
}

// ─── 분석 시작 ────────────────────────────────────────────────────────────

async function startAnalysis() {
  const input = document.getElementById("urlInput");
  const url = input.value.trim();

  if (!url) {
    input.focus();
    input.style.borderColor = "#dc2626";
    setTimeout(() => (input.style.borderColor = ""), 1500);
    return;
  }

  hideError();
  hideResult();
  showLoading("크롤링 중...");
  setAnalyzeBtnDisabled(true);

  try {
    setTimeout(() => setLoadingStatus("AI 분석 중..."), 5000);
    setTimeout(() => setLoadingStatus("역기획서 작성 중..."), 15000);
    setTimeout(() => setLoadingStatus("마무리 중..."), 35000);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "알 수 없는 오류" }));
      throw new Error(err.detail || `서버 오류 (${response.status})`);
    }

    const data = await response.json();
    currentMarkdown = data.markdown;
    currentUrl = data.url;
    wireframeLoaded = false;

    hideLoading();
    renderResult(data);
    generateWireframe(data.url);
  } catch (err) {
    hideLoading();
    showError(err.message);
  } finally {
    setAnalyzeBtnDisabled(false);
  }
}

// ─── 마크다운 렌더링 ──────────────────────────────────────────────────────

function renderResult(data) {
  // URL 표시
  document.getElementById("resultUrl").textContent = data.url;

  // 스크린샷 배지
  const badge = document.getElementById("screenshotBadge");
  if (data.has_screenshot) {
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }

  // 스크린샷 표시
  const container = document.getElementById("markdownOutput");
  let screenshotHtml = "";
  if (data.screenshot_url) {
    screenshotHtml = `
      <div class="screenshot-section">
        <h3 class="screenshot-title">📸 실제 화면 캡처</h3>
        <img src="${data.screenshot_url}" alt="페이지 스크린샷" class="screenshot-img" />
      </div>`;
  }

  // 마크다운 → HTML 변환 및 섹션 분리
  container.innerHTML = screenshotHtml + renderWithSections(data.markdown);

  // 결과 표시
  document.getElementById("resultSection").classList.remove("hidden");

  // 스크롤 이동
  setTimeout(() => {
    document.getElementById("resultSection").scrollIntoView({ behavior: "smooth" });
  }, 100);
}

/**
 * 마크다운을 파싱하여 h2 기준으로 섹션을 분리하고,
 * 접기/펼치기 가능한 HTML로 변환합니다.
 */
function renderWithSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let currentSection = null;
  let preLines = [];  // h2 이전 내용 (h1, 서문 등)

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentSection) {
        sections.push(currentSection);
      } else if (preLines.length > 0) {
        sections.push({ title: null, lines: [...preLines] });
        preLines = [];
      }
      currentSection = { title: line.replace(/^## /, "").trim(), lines: [] };
    } else {
      if (currentSection) {
        currentSection.lines.push(line);
      } else {
        preLines.push(line);
      }
    }
  }

  if (currentSection) sections.push(currentSection);
  if (preLines.length > 0 && sections.length === 0) {
    sections.push({ title: null, lines: preLines });
  }

  let html = "";

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    if (!sec.title) {
      // 서문 (h1 등) — 섹션 없이 바로 렌더링
      html += `<div class="md-preamble">${marked.parse(sec.lines.join("\n"))}</div>`;
    } else {
      const bodyHtml = marked.parse(sec.lines.join("\n"));
      html += `
        <div class="md-section" data-section="${i}">
          <div class="md-section-header" onclick="toggleSection(${i})">
            <h2 style="margin:0;font-size:16px;color:var(--primary)">${escapeHtml(sec.title)}</h2>
            <span class="md-section-toggle" id="toggle-${i}">▼</span>
          </div>
          <div class="md-section-body" id="body-${i}">
            ${bodyHtml}
          </div>
        </div>`;
    }
  }

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── 섹션 접기/펼치기 ─────────────────────────────────────────────────────

function toggleSection(index) {
  const body = document.getElementById(`body-${index}`);
  const toggle = document.getElementById(`toggle-${index}`);
  if (!body) return;
  const isHidden = body.classList.toggle("hidden");
  toggle.classList.toggle("collapsed", isHidden);
}

function collapseAll() {
  document.querySelectorAll(".md-section-body").forEach((el) => {
    el.classList.add("hidden");
  });
  document.querySelectorAll(".md-section-toggle").forEach((el) => {
    el.classList.add("collapsed");
  });
}

function expandAll() {
  document.querySelectorAll(".md-section-body").forEach((el) => {
    el.classList.remove("hidden");
  });
  document.querySelectorAll(".md-section-toggle").forEach((el) => {
    el.classList.remove("collapsed");
  });
}

// ─── 복사 / 다운로드 ─────────────────────────────────────────────────────

async function copyMarkdown() {
  if (!currentMarkdown) return;
  try {
    await navigator.clipboard.writeText(currentMarkdown);
    const btn = event.target.closest("button");
    const original = btn.textContent;
    btn.textContent = "✅ 복사됨!";
    setTimeout(() => (btn.textContent = original), 1500);
  } catch {
    alert("복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
  }
}

function downloadMarkdown() {
  if (!currentMarkdown) return;
  const domain = currentUrl
    ? new URL(currentUrl.startsWith("http") ? currentUrl : "https://" + currentUrl).hostname
    : "result";
  const filename = `역기획서_${domain}_${formatDate()}.md`;
  const blob = new Blob([currentMarkdown], { type: "text/markdown;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function formatDate() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

// ─── UI 헬퍼 ─────────────────────────────────────────────────────────────

function showLoading(message) {
  setLoadingStatus(message);
  document.getElementById("loadingSection").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingSection").classList.add("hidden");
}

function setLoadingStatus(message) {
  const el = document.getElementById("loadingStatus");
  if (el) el.textContent = message;
}

function friendlyError(raw) {
  if (!raw) return { title: "알 수 없는 오류가 발생했습니다.", desc: "잠시 후 다시 시도해주세요." };

  const r = raw.toLowerCase();

  if (r.includes("403") || r.includes("forbidden"))
    return { title: "이 사이트는 외부 접근을 차단하고 있습니다.", desc: "로그인이 필요하거나 크롤링을 허용하지 않는 사이트입니다. Notion, Figma, Linear 같은 공개 사이트를 시도해보세요." };

  if (r.includes("404") || r.includes("not found"))
    return { title: "페이지를 찾을 수 없습니다.", desc: "URL을 다시 확인해주세요. 주소가 정확한지 확인하세요." };

  if (r.includes("429") || r.includes("too many"))
    return { title: "요청이 너무 많습니다.", desc: "잠시 후(1~2분) 다시 시도해주세요." };

  if (r.includes("ssl") || r.includes("certificate"))
    return { title: "보안 인증서 오류가 발생했습니다.", desc: "네트워크 환경을 확인하거나 다른 URL을 시도해보세요." };

  if (r.includes("timeout") || r.includes("timed out"))
    return { title: "응답 시간이 초과되었습니다.", desc: "사이트가 느리거나 접근이 어렵습니다. 다시 시도해보세요." };

  if (r.includes("connection") || r.includes("refused") || r.includes("unreachable"))
    return { title: "사이트에 연결할 수 없습니다.", desc: "URL이 올바른지, 사이트가 정상 운영 중인지 확인해주세요." };

  if (r.includes("api key") || r.includes("authentication") || r.includes("401"))
    return { title: "AI 서비스 인증에 실패했습니다.", desc: "API 키를 확인해주세요." };

  if (r.includes("credit") || r.includes("billing"))
    return { title: "AI 서비스 크레딧이 부족합니다.", desc: "API 키의 크레딧을 충전해주세요." };

  if (r.includes("크롤링 실패"))
    return { title: "페이지 수집에 실패했습니다.", desc: "해당 사이트는 분석이 어렵습니다. 다른 URL을 시도해보세요." };

  if (r.includes("ai 분석 실패"))
    return { title: "AI 분석 중 오류가 발생했습니다.", desc: "잠시 후 다시 시도해주세요." };

  return { title: "오류가 발생했습니다.", desc: raw };
}

function showError(message) {
  const { title, desc } = friendlyError(message);
  document.getElementById("errorTitle").textContent = title;
  document.getElementById("errorMessage").textContent = desc;
  document.getElementById("errorSection").classList.remove("hidden");
}

function hideError() {
  document.getElementById("errorSection").classList.add("hidden");
}

function hideResult() {
  document.getElementById("resultSection").classList.add("hidden");
}


// ─── 와이어프레임 ──────────────────────────────────────────────────────────

async function generateWireframe(url) {
  const loading = document.getElementById("wireframeLoading");
  const frame = document.getElementById("wireframeFrame");
  loading.classList.remove("hidden");
  frame.classList.add("hidden");

  try {
    const response = await fetch("/api/wireframe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) throw new Error("와이어프레임 생성 실패");
    const data = await response.json();

    // iframe에 HTML 직접 주입 + 자동 축소
    frame.srcdoc = data.html;
    frame.classList.remove("hidden");
    wireframeLoaded = true;

    // 로드 후 iframe 내부를 컨테이너에 맞게 scale 조정
    frame.onload = () => {
      try {
        const iframeDoc = frame.contentDocument;
        const contentWidth = iframeDoc.body.scrollWidth;
        const containerWidth = frame.parentElement.clientWidth - 32;
        if (contentWidth > containerWidth) {
          const scale = containerWidth / contentWidth;
          iframeDoc.body.style.transformOrigin = "top left";
          iframeDoc.body.style.transform = `scale(${scale})`;
          iframeDoc.body.style.width = `${100 / scale}%`;
          frame.style.height = `${iframeDoc.body.scrollHeight * scale + 40}px`;
        }
      } catch (e) {
        console.log("iframe scale 조정 실패:", e);
      }
    };

    // 와이어프레임 탭 버튼에 완료 표시
    document.querySelector('[onclick="switchTab(\'wireframe\')"]').textContent = "🎨 와이어프레임 ✅";
  } catch (e) {
    loading.innerHTML = `<span style="color:#dc2626">와이어프레임 생성 실패: ${e.message}</span>`;
  } finally {
    loading.classList.add("hidden");
  }
}

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));

  if (tab === "doc") {
    document.querySelector('[onclick="switchTab(\'doc\')"]').classList.add("active");
    document.getElementById("tabDoc").classList.remove("hidden");
  } else {
    document.querySelector('[onclick="switchTab(\'wireframe\')"]').classList.add("active");
    document.getElementById("tabWireframe").classList.remove("hidden");
    if (!wireframeLoaded) {
      document.getElementById("wireframeLoading").classList.remove("hidden");
    }
  }
}

function setAnalyzeBtnDisabled(disabled) {
  const btn = document.getElementById("analyzeBtn");
  btn.disabled = disabled;
  btn.querySelector(".btn-text").textContent = disabled ? "분석 중..." : "역기획서 생성";
}
