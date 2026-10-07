(function () {
  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  var toast = document.getElementById("toast");
  var toastTimer;

  function say(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  window.addEventListener("scroll", function () {
    header.classList.toggle("is-stuck", window.scrollY > 12);
  }, { passive: true });

  burger.addEventListener("click", function () {
    var open = header.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      header.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  var msgs = Array.prototype.slice.call(document.querySelectorAll(".topbar__msg"));
  var msgIndex = 0;
  setInterval(function () {
    msgs[msgIndex].classList.remove("is-on");
    msgIndex = (msgIndex + 1) % msgs.length;
    msgs[msgIndex].classList.add("is-on");
  }, 4200);

  var CA = "0x9811ea1264592cdd442ca4216808dc81c645ac7b";

  function copyCA() {
    var done = function () { say("Contract copied"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CA).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      var box = document.createElement("textarea");
      box.value = CA;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.left = "-999px";
      document.body.appendChild(box);
      box.select();
      try { document.execCommand("copy"); done(); } catch (err) { say(CA); }
      box.remove();
    }
  }
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", copyCA);
  });

  function compact(n) {
    n = Number(n);
    if (!isFinite(n)) return "--";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + n.toFixed(2);
  }
  function priceText(n) {
    n = Number(n);
    if (!isFinite(n)) return "--";
    if (n >= 1) return "$" + n.toFixed(4);
    if (n >= 0.01) return "$" + n.toFixed(4);
    return "$" + n.toPrecision(4);
  }
  function fillStats(pair) {
    var change = pair.priceChange && pair.priceChange.h24;
    document.querySelectorAll('[data-stat="price"]').forEach(function (el) {
      el.textContent = priceText(pair.priceUsd);
    });
    document.querySelectorAll('[data-stat="cap"]').forEach(function (el) {
      el.textContent = compact(pair.marketCap || pair.fdv);
    });
    document.querySelectorAll('[data-stat="vol"]').forEach(function (el) {
      el.textContent = compact(pair.volume && pair.volume.h24);
    });
    document.querySelectorAll('[data-stat="liq"]').forEach(function (el) {
      el.textContent = compact(pair.liquidity && pair.liquidity.usd);
    });
    document.querySelectorAll('[data-stat="change"]').forEach(function (el) {
      if (change == null || !isFinite(Number(change))) {
        el.textContent = "";
        return;
      }
      var n = Number(change);
      var body = Math.abs(n) >= 100 ? Math.round(n).toLocaleString() : n.toFixed(2);
      el.textContent = (n > 0 ? "+" : "") + body + "% 24h";
      el.classList.toggle("is-down", n < 0);
    });
  }
  fetch("https://api.dexscreener.com/latest/dex/tokens/" + CA)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var pairs = (data && data.pairs) || [];
      var pair = pairs.filter(function (item) { return item.chainId === "bsc"; })
        .sort(function (a, b) { return (b.liquidity && b.liquidity.usd || 0) - (a.liquidity && a.liquidity.usd || 0); })[0];
      if (pair) fillStats(pair);
    })
    .catch(function () {});

  var sections = ["lore", "road", "market", "scenes", "memes", "buy"].map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);
  var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
  function spy() {
    var mark = window.scrollY + 140;
    var current = null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= mark) current = sec;
    });
    links.forEach(function (link) {
      link.classList.toggle("on", current && link.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-shot]"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbIndex = 0;

  function openShot(index) {
    lbIndex = (index + shots.length) % shots.length;
    var btn = shots[lbIndex];
    lbImg.src = btn.getAttribute("data-src");
    lbImg.alt = btn.getAttribute("data-alt") || "";
    lbCap.textContent = btn.getAttribute("data-alt") || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeShot() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  shots.forEach(function (btn, index) {
    btn.addEventListener("click", function () { openShot(index); });
  });
  document.querySelector(".lb__close").addEventListener("click", closeShot);
  document.getElementById("lbPrev").addEventListener("click", function () { openShot(lbIndex - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { openShot(lbIndex + 1); });
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) closeShot();
  });
  document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeShot();
    if (event.key === "ArrowLeft") openShot(lbIndex - 1);
    if (event.key === "ArrowRight") openShot(lbIndex + 1);
  });

  var sceneButtons = Array.prototype.slice.call(document.querySelectorAll("[data-scene]"));
  var sceneImg = document.getElementById("sceneImg");
  var sceneTitle = document.getElementById("sceneTitle");
  var scenePoster = document.getElementById("scenePoster");
  var sceneCursor = 0;

  function showScene(index) {
    var visible = sceneButtons.filter(function (btn) {
      return btn.closest("li").style.display !== "none";
    });
    if (!visible.length) return;
    sceneCursor = (index + visible.length) % visible.length;
    var btn = visible[sceneCursor];
    sceneButtons.forEach(function (item) { item.classList.remove("is-on"); });
    btn.classList.add("is-on");
    sceneImg.src = btn.getAttribute("data-src");
    sceneImg.alt = btn.getAttribute("data-alt");
    sceneTitle.textContent = btn.getAttribute("data-title");
    scenePoster.setAttribute("data-src", btn.getAttribute("data-src"));
    scenePoster.setAttribute("data-alt", btn.getAttribute("data-alt"));
  }
  sceneButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var visible = sceneButtons.filter(function (item) {
        return item.closest("li").style.display !== "none";
      });
      showScene(visible.indexOf(btn));
    });
  });
  document.getElementById("scenePrev").addEventListener("click", function () { showScene(sceneCursor - 1); });
  document.getElementById("sceneNext").addEventListener("click", function () { showScene(sceneCursor + 1); });

  document.querySelectorAll(".eps-tabs button").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".eps-tabs button").forEach(function (item) {
        item.classList.remove("is-on");
      });
      tab.classList.add("is-on");
      var filter = tab.getAttribute("data-filter");
      var shown = 0;
      document.querySelectorAll("#sceneList li").forEach(function (li) {
        var on = filter === "all" || li.getAttribute("data-cat") === filter;
        li.style.display = on ? "" : "none";
        if (on) shown += 1;
      });
      document.getElementById("sceneCount").textContent = shown + (shown === 1 ? " still" : " stills");
      showScene(0);
    });
  });

  var rail = document.getElementById("rail");
  var railBar = document.getElementById("railBar");
  function railBy(dir) {
    rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.8, 420), behavior: "smooth" });
  }
  document.getElementById("railPrev").addEventListener("click", function () { railBy(-1); });
  document.getElementById("railNext").addEventListener("click", function () { railBy(1); });
  function railProgress() {
    var max = rail.scrollWidth - rail.clientWidth;
    var ratio = max > 0 ? rail.scrollLeft / max : 0;
    railBar.style.transform = "translateX(" + (ratio * 316) + "%)";
  }
  rail.addEventListener("scroll", railProgress, { passive: true });
  railProgress();
})();
