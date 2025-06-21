document.addEventListener("DOMContentLoaded", () => {
    // Load an HTML file into a div
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
      if (el) {
        const mdUrl = el.dataset.mdSrc;
        fetch(mdUrl)
          .then(r => r.text())
          .then(md => {
            el.innerHTML = marked.parse(md);
            makeToc(el);
            el.scrollTop = 0;
          })
          .catch(e => console.error("Markdown error:", e));
      }
  
      const overlay = document.getElementById("assetOverlay");
      if (overlay) {
        document.querySelectorAll("#section2 .asset")
          .forEach(a => a.onclick = () => (overlay.style.display = "flex"));
        window.closeOverlay = () => (overlay.style.display = "none");
      }
    }
  
    function clearMarkdown(id) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    
      const toc = document.getElementById("toc");
      if (toc) toc.innerHTML = "";
    }

    // Build a simple list of headings
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

    function bindWrapToggle() {
      let markdownVisible = false;

      document.addEventListener("click", function (e) {
        const doc = e.target.closest(".doc");
        const wrap = e.target.closest("#wrapToggle");
        if (!doc && wrap) return;

        wrap.classList.toggle("shrink");
        setTimeout(() => {
          wrap.classList.toggle("show-sections");
        }, 500);

        if (markdownVisible) {
          clearMarkdown("doc-markdown");
        } else {
          setupMarkdown("doc-markdown");
        }

      markdownVisible = !markdownVisible;
      });
    }
  
    // Start here
    loadHtml("section2", "components/section2.html")
    .then(() => {
     // render markdown & TOC
      bindWrapToggle();     // attach your click handler
    })

    .catch(e => console.error("Section2 load failed:", e));

    setupMarkdown("about-markdown")

  });
  