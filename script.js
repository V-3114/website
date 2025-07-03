document.addEventListener("DOMContentLoaded", () => {

  function setupObserver() {
    const headings = document.querySelectorAll("#docMarkdown h1, #docMarkdown h2, #docMarkdown h3, #docMarkdown h4");
    const tocLinks = document.querySelectorAll(".index.markdown-body a");
  
    if (!headings.length) {
      console.warn("⚠️ No headings found to observe.");
      return;
    }
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // remove previous active classes
            tocLinks.forEach(link => link.classList.remove("active"));
            // find corresponding ToC link
            const id = entry.target.id;
            const activeLink = document.querySelector(`.index.markdown-body a[href="#${id}"]`);
            if (activeLink) {
              activeLink.classList.add("active");
            }
          }
        });
      },
      {
        root: document.querySelector(".doc"),
        threshold: 0.2
      }
    );
  
    headings.forEach(h => observer.observe(h));
  }
  
  
  function typeWriter() {
    const text = "Research AI";
    let i = 0;
    const speed = 100;
    const pause = 1500;
  
    const textEl = document.getElementById("typewriter-text");
    if (!textEl) return;
  
    textEl.innerHTML = "";
  
    function writeLetter() {
      if (i < text.length) {
        textEl.innerHTML += text.charAt(i);
        i++;
        setTimeout(writeLetter, speed);
      } else {
        setTimeout(() => {
          textEl.innerHTML = "";
          i = 0;
          writeLetter();
        }, pause);
      }
    }
  
    writeLetter();
  }

  function loadHtml(id, url) {
    const el = document.getElementById(id);
    if (!el) return Promise.reject(`No #${id}`);
    return fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`${url} status ${res.status}`);
        return res.text();
      })
      .then(html => {
        el.innerHTML = html;
      });
  }

  function setupMarkdown(id) {
    const el = document.getElementById(id);
    if (!el) return Promise.resolve();

    return fetch(el.dataset.mdSrc)
      .then(res => res.text())
      .then(md => {
        el.innerHTML = marked.parse(md);
        el.scrollTop = 0;
      })
      .catch(e => console.error("Markdown error:", e));
  }

  function makeToc(id) {
    const el = document.getElementById(id);
    const toc = document.getElementById("toc");
    if (!toc) return;
    toc.innerHTML = "";

    el.querySelectorAll("h1, h2, h3, h4").forEach(h => {
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

  function getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    const jan4 = target.valueOf() + (((4 - (target.getDay() + 6) % 7)) * 86400000);
    return 1 + Math.round((firstThursday - jan4) / 604800000);
  }
  
  function updateDateTime() {
    const el = document.getElementById('datetime');
    if (el) {
      const now = new Date();
  
      const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
      const day     = String(now.getDate());
      const month   = now.toLocaleDateString('en-US', { month: 'long' });
      const year    = now.getFullYear();
      const week    = getWeekNumber(now);
  
      const hour   = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      const second = String(now.getSeconds()).padStart(2, "0");
  
      const timeStr = `<div class="time">${hour}:${minute}:${second}</div>`;
      const dateStr = `<div class="date">${weekday}, ${day} ${month}, ${year}, week ${week}</div>`;

  
      const formatted = `${timeStr}${dateStr}`;
  
      el.innerHTML = formatted;
    } else {
      console.warn("⚠️ #datetime element not found.");
    }
  }
  
  let musicAudio = null;
  let isPlaying = false;

  const actions = {
    createOverlay: (el, evt) => {
      const parentId = el.dataset.parentId;
      if (!parentId) return;

      const parentContainer = document.getElementById(parentId);
      if (!parentContainer) return;

      fetch("component/overlay.html")
        .then(res => res.text())
        .then(html => {
          parentContainer.insertAdjacentHTML("beforeend", html);

          const overlayContainer = document.getElementById("overlayContent");
          if (!overlayContainer) return;

          const componentPath = el.dataset.componentPath;
          if (!componentPath) return;

          return fetch(componentPath)
            .then(res => res.text())
            .then(innerHtml => {
              overlayContainer.insertAdjacentHTML("beforeend", innerHtml);

              const markdownEl = overlayContainer.querySelector("[data-md-src]");
              if (markdownEl) {
                fetch(markdownEl.dataset.mdSrc)
                  .then(res => res.text())
                  .then(md => {
                    markdownEl.innerHTML = marked.parse(md);
                    markdownEl.scrollTop = 0;
                  })
                  .catch(console.error);
              }
            });
        });
    },

    closeOverlay: (el, evt) => {
      const overlayContainer = document.querySelector('.overlay-backdrop');
      if (!overlayContainer) console.log("Error => No overlay to close");
      overlayContainer?.remove();
    },

    createPage: (el, evt) => {
      window.location.href = "casestudy.html";
    },

    docMode: (el, evt) => {
      const isLocked = document.body.classList.toggle("scroll-locked");
    
      document.querySelectorAll(".page").forEach(sec => {
        sec.style.overflow = isLocked ? "hidden" : "";
      });
    
      const section2 = document.getElementById("section2");
      section2.style.overflow = isLocked ? "auto" : "hidden";
    
      el.src = isLocked 
        ? "icon/lock.svg" 
        : "icon/unlock2.svg";
    
      const label = document.getElementById("lockLabel");
      label.innerText = isLocked
        ? "Locked"
        : "Unlocked";
    
      if (isLocked) {
        const el = document.getElementById("section2");
        el.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    },    

    openLink: (el, evt) => {
      const link = el.dataset.link;
      window.open(link, "_blank");
    },

    copyMail: (el, evt) => {
      if (el) {
        const email = el.dataset.email;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(email)
            .then(() => alert("Email copied to clipboard!"))
            .catch(err => console.error("Clipboard copy failed:", err));
        } else {
          alert("Clipboard API not supported in this browser or context.");
        }
      }
    },

    playMusic: (el, evt) => {
      const audioSrc = el.dataset.musicSrc;
  
      if (!musicAudio) {
        musicAudio = new Audio(audioSrc);
        musicAudio.loop = true;
        musicAudio.volume = 0.05;
      }
  
      const labelEl = el.querySelector(".card__label");
  
      if (isPlaying) {
        musicAudio.pause();
        if (labelEl) labelEl.textContent = "▶";
      } else {
        musicAudio.play().catch(console.error);
        if (labelEl) labelEl.textContent = "❚❚";
      }
  
      isPlaying = !isPlaying;
    },
  };

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-trigger]');
    if (!trigger) return;
    const name = trigger.dataset.function;
    const fn = actions[name];
    if (fn) fn(trigger, e);
  });

  Promise.all([
    loadHtml("section1", "component/section 1/section1.html")
      .then(() => {
        typeWriter();
      }),
  
    loadHtml("section2", "component/section 2/section2.html")
      .then(() => setupMarkdown("docMarkdown"))
      .then(() => makeToc("docMarkdown"))
      .then(() => setupObserver())    // ← add this here
      .catch(console.error),
  
    loadHtml("section3", "component/section 3/section3.html")
  ])
  .then(() => {
    setupMarkdown("aboutMarkdown");
  })
  .catch(console.error);
  

  // ✅ Now works!
  updateDateTime();
  setInterval(updateDateTime, 1000);
});
