document.addEventListener("DOMContentLoaded", () => {
  // ——— Helpers ——————————————————————————————————————————

  function loadHtml(id, url) {
    const el = document.getElementById(id);
    if (!el) return Promise.reject(`No #${id}`);
    return fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`${url} status ${r.status}`);
        return r.text();
      })
      .then(html => {
        el.innerHTML = html;
      });
  }

  function setupMarkdown(id) {
    const el = document.getElementById(id);
    if (!el) return;
    fetch(el.dataset.mdSrc)
      .then(r => r.text())
      .then(md => {
        el.innerHTML = marked.parse(md);
        makeToc(el);
        el.scrollTop = 0;
      })
      .catch(e => console.error("Markdown error:", e));
  }

  function clearMarkdown(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
    const toc = document.getElementById("toc");
    if (toc) toc.innerHTML = "";
  }

  function makeToc(container) {
    const toc = document.getElementById("toc");
    if (!toc) return;
    toc.innerHTML = "";
    container.querySelectorAll("h1, h2, h3, h4").forEach(h => {
      if (!h.id) {
        h.id = h.textContent.trim().toLowerCase().replace(/[^\w]+/g, "-");
      }
      const lvl = +h.tagName[1];
      const li = document.createElement("li");
      li.style.paddingLeft = (lvl - 1) * 10 + "px";
      const a = document.createElement("a");
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      li.appendChild(a);
      toc.appendChild(li);
    });
  }

  // ——— Toggle logic for Section 2 ————————————————————————————

  function bindWrapToggle() {
    const wrap = document.getElementById("wrapToggle");
    if (!wrap) return;

    let opened = false;

    wrap.addEventListener("click", e => {
      const doc = e.target.closest(".docPlaceholder");
      if (!doc) return;

      if (!opened) {
        loadHtml("wrapToggle", "components/doc.html")
          .then(() => setupMarkdown("doc-markdown"))
          .then(() => loadHtml("assetCard", "components/assets.html"))
          .catch(console.error);
      } else {
        clearMarkdown("doc-markdown");
      }

      wrap.classList.toggle("shrink");
      setTimeout(() => wrap.classList.toggle("show-sections"), 500);
      opened = !opened;
    });
  }

  // ——— Create Overlay ——————————————————————————————————

  function createOverlay(container, htmlPath) {
    if (container.querySelector('.overlay-backdrop')) return;

    fetch(htmlPath)
      .then(res => res.text())
      .then(innerHTML => {
        const backdrop = document.createElement('div');
        backdrop.className = 'overlay-backdrop';
        backdrop.innerHTML = `
          <div class="overlay">
            ${innerHTML}
          </div>
        `;
        container.appendChild(backdrop);
        requestAnimationFrame(() => backdrop.classList.add('overlay-backdrop--visible'));
      })
      .catch(console.error);
  }

  // ——— Overlay Delegation ——————————————————————————————————

  document.body.addEventListener('click', e => {
    const trigger = e.target.closest('.overlay-trigger');
    if (!trigger) return;

    const selector = trigger.dataset.target;
    const container = document.querySelector(selector);
    if (container) {
      createOverlay(container, "components/overlay.html");
    }
  });

  // ——— Overlay Removal ——————————————————————————————————————————

  document.body.addEventListener('click', e => {
    const backdrop = document.querySelector('.overlay-backdrop');
    if (!backdrop) return;

    if (e.target.closest('.overlay-trigger')) return;

    // Click on close icon
    if (e.target.matches('.overlay__btnClose')) {
      backdrop.remove();
      return;
    }

    // Click outside overlay
    if (!e.target.closest('.overlay')) {
      backdrop.remove();
    }
  });

  // ——— Bootstrapping —————————————————————————————————————

  Promise.all([
    loadHtml("section1", "components/section1.html"),
    loadHtml("section2", "components/section2.html"),
    loadHtml("section3", "components/section3.html")
  ]).then(() => {
    bindWrapToggle();
    setupMarkdown("about-markdown");
  }).catch(console.error);
});
