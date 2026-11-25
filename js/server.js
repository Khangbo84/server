/* ===============================
   ELEMENTS
================================ */
const menuBtn = document.getElementById('menuBtn');
const panel = document.getElementById('sidePanel');
const overlay = document.getElementById('overlay');
const langToggle = document.getElementById('langToggle');
const langDropdown = document.getElementById('langDropdown');

/* ===============================
   PANEL TOGGLE
================================ */
menuBtn.addEventListener('click', ()=>{
  panel.classList.add('show');
  overlay.classList.add('show');
});

overlay.addEventListener('click', ()=>{
  panel.classList.remove('show');
  overlay.classList.remove('show');
  langDropdown.classList.remove('show');
});

/* ===============================
   LANGUAGE DROPDOWN
================================ */
langToggle.addEventListener('click', (e)=>{
  e.stopPropagation();
  langDropdown.classList.toggle('show');
});
langDropdown.addEventListener('click', e=>e.stopPropagation());

/* ===============================
   TRANSLATIONS
================================ */
const translations = {
  vi: {
    play: "Chơi",
    map: "Bản đồ",
    games: "Trò chơi",
    wiki: "Wiki",
    content: "Nội dung",
    language: "Ngôn ngữ",
    vi_lang:"Tiếng Việt",
    en_lang:"Tiếng Anh",

    lobby_title: "Sảnh",
    lobby_desc: "Khu trung tâm nơi người chơi bắt đầu hành trình của mình. Bạn đã sẵn sàng khám phá bữa tiệc này chưa?",

    games_title: "Trò chơi",
    games_desc: "Với 3 mini games đa dạng, độc đáo là: Mê cung tử thần, Bùng phát ngược và Tháp phản bội. Đem lại trải nghiệm mới lạ và hấp dẫn!",

    stall_title: "Gian hàng",
    stall_desc: "Khu gian hàng với nền ẩm thực độc đáo, những trang bị xịn xò. Mua vật phẩm bằng phiếu sự kiện.",

    stage_title: "Sân khấu",
    stage_desc: "Sân khấu chính cho sự kiện với buổi khai mạc hoành tráng.",

    dungeon_title: "Hầm ngục",
    dungeon_desc: "Thử thách cuối cùng cho người chơi dũng cảm. Đánh trùm và mang về chiến lợi phẩm.",

    suggest_title: "Tiếp theo là?",
    rule: "Luật",
    terms: "Điều khoản & Pháp lý"
  },

  en: {
    play: "Play",
    map: "Map",
    games: "Games",
    wiki: "Wiki",
    content: "Content",
    language: "Language",
    vi_lang:"Vietnamese",
    en_lang:"English",

    lobby_title: "Lobby",
    lobby_desc: "The central hub where players begin their journey. Are you ready to explore this party?",

    games_title: "Games",
    games_desc: "Three unique mini-games: Death Maze, Reverse Outbreak, and Traitor Tower — offering fresh and exciting experiences!",

    stall_title: "Stalls",
    stall_desc: "Food stalls and premium gear. Exchange event tickets for powerful items and collectibles.",

    stage_title: "Stage",
    stage_desc: "The main stage of the event, featuring a spectacular opening and battle arena.",

    dungeon_title: "Dungeon",
    dungeon_desc: "The ultimate challenge for brave players. Explore, fight bosses, and claim epic rewards.",

    suggest_title: "What’s next?",
    rule: "Rules",
    terms: "Terms & Legal"
  }
};

/* ===============================
   APPLY LANGUAGE
================================ */
let currentLang = 'vi';

function setLanguage(lang){
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.dataset.i18n;
    if(translations[lang]?.[key]){
      el.textContent = translations[lang][key];
    }
  });

  /* Panel buttons */
  document.querySelectorAll('.panel-btn').forEach(btn=>{
    const key = btn.dataset.i18n;
    if(key && translations[lang][key]){
      btn.textContent = translations[lang][key];
    }
  });

  renderBannerText();
}

/* ===============================
   LANGUAGE BUTTONS
================================ */
document.querySelectorAll('[data-lang]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    setLanguage(btn.dataset.lang);
    langDropdown.classList.remove('show');
    panel.classList.remove('show');
    overlay.classList.remove('show');
  });
});

/* ===============================
   DEFAULT
================================ */
setLanguage('vi');

/* ===============================
   CONFIG (config.json)
================================ */
const MAX_BANNERS = 5;

/* Dùng khi không tải được config.json (vd: mở file trực tiếp bằng file://) */
const DEFAULT_CONFIG = {
  links: {},
  banner: { autoplay: true, interval: 5000, items: [] }
};

async function loadConfig(){
  try{
    const res = await fetch('config.json', { cache: 'no-cache' });
    if(!res.ok) throw new Error(res.status);
    return await res.json();
  }catch(err){
    console.warn('Không tải được config.json, dùng cấu hình mặc định.', err);
    return DEFAULT_CONFIG;
  }
}

/* Gán link Play / Discord / Map... từ config */
function applyLinks(links = {}){
  document.querySelectorAll('[data-action]').forEach(el=>{
    const url = links[el.dataset.action];
    if(url && url !== '#') el.href = url;
  });
}

/* ===============================
   BANNER CAROUSEL
================================ */
const bannerEl    = document.getElementById('banner');
const bannerTrack = document.getElementById('bannerTrack');
const bannerDots  = document.getElementById('bannerDots');
const bannerPrev  = document.getElementById('bannerPrev');
const bannerNext  = document.getElementById('bannerNext');

let bannerItems = [];
let bannerIndex = 0;
let autoTimer = null;
let autoMs = 5000;

/* Lọc: bật, còn trong thời gian hiển thị, tối đa 5 */
function pickBanners(items = []){
  const now = Date.now();
  return items
    .filter(b => b && b.enabled !== false && b.image)
    .filter(b => !b.start || now >= new Date(b.start).getTime())
    .filter(b => !b.end   || now <= new Date(b.end).getTime() + 86399999)
    .slice(0, MAX_BANNERS);
}

function t(obj){                       // lấy chuỗi theo ngôn ngữ hiện tại
  if(!obj) return '';
  if(typeof obj === 'string') return obj;
  return obj[currentLang] || obj.vi || obj.en || '';
}

function buildBanner(items){
  bannerItems = items;
  bannerTrack.innerHTML = '';
  bannerDots.innerHTML = '';

  if(!items.length){ bannerEl.hidden = true; return; }
  bannerEl.hidden = false;

  items.forEach((b, i)=>{
    const slide = document.createElement(b.link ? 'a' : 'div');
    slide.className = 'banner-slide';
    if(b.link){
      slide.href = b.link;
      if(b.newTab){ slide.target = '_blank'; slide.rel = 'noopener noreferrer'; }
    }

    const img = document.createElement('img');
    img.src = b.image;
    img.alt = t(b.title);
    img.draggable = false;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.addEventListener('error', ()=> slide.classList.add('no-img'));

    const cap = document.createElement('div');
    cap.className = 'banner-caption';

    slide.append(img, cap);
    bannerTrack.appendChild(slide);

    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Banner ' + (i + 1));
    dot.addEventListener('click', ()=> goTo(i));
    bannerDots.appendChild(dot);
  });

  const multi = items.length > 1;
  bannerPrev.hidden = bannerNext.hidden = !multi;
  bannerDots.hidden = !multi;

  renderBannerText();
  updateDots();
}

/* Cập nhật chữ trên banner theo ngôn ngữ */
function renderBannerText(){
  bannerTrack.querySelectorAll('.banner-slide').forEach((slide, i)=>{
    const b = bannerItems[i];
    if(!b) return;
    const title = t(b.title), desc = t(b.desc);
    slide.querySelector('img').alt = title;
    slide.querySelector('.banner-caption').innerHTML =
      (title ? `<h3></h3>` : '') + (desc ? `<p></p>` : '');
    if(title) slide.querySelector('h3').textContent = title;
    if(desc)  slide.querySelector('p').textContent  = desc;
  });
}

function updateDots(){
  [...bannerDots.children].forEach((d, i)=> d.classList.toggle('active', i === bannerIndex));
}

function goTo(i){
  const n = bannerItems.length;
  if(!n) return;
  bannerIndex = (i + n) % n;
  bannerTrack.scrollTo({ left: bannerIndex * bannerTrack.clientWidth, behavior: 'smooth' });
  updateDots();
}

/* Theo dõi vuốt tay để cập nhật chấm */
let scrollRAF = null;
bannerTrack.addEventListener('scroll', ()=>{
  cancelAnimationFrame(scrollRAF);
  scrollRAF = requestAnimationFrame(()=>{
    const w = bannerTrack.clientWidth || 1;
    const i = Math.round(bannerTrack.scrollLeft / w);
    if(i !== bannerIndex){ bannerIndex = i; updateDots(); }
  });
}, { passive: true });

bannerPrev.addEventListener('click', ()=> goTo(bannerIndex - 1));
bannerNext.addEventListener('click', ()=> goTo(bannerIndex + 1));

/* Kéo chuột trên máy tính (cảm ứng đã có vuốt sẵn) */
let drag = null;
bannerTrack.addEventListener('pointerdown', e=>{
  if(e.pointerType !== 'mouse' || e.button !== 0) return;
  drag = { x: e.clientX, left: bannerTrack.scrollLeft, moved: false };
  bannerTrack.classList.add('dragging');
});
window.addEventListener('pointermove', e=>{
  if(!drag) return;
  const dx = e.clientX - drag.x;
  if(Math.abs(dx) > 5) drag.moved = true;
  bannerTrack.scrollLeft = drag.left - dx;
});
window.addEventListener('pointerup', ()=>{
  if(!drag) return;
  const moved = drag.moved;
  drag = null;
  bannerTrack.classList.remove('dragging');
  const w = bannerTrack.clientWidth || 1;
  goTo(Math.round(bannerTrack.scrollLeft / w));
  if(moved){                            // kéo xong thì không tính là click chuyển trang
    bannerTrack.addEventListener('click', e=> e.preventDefault(), { capture: true, once: true });
  }
});

/* Tự chuyển banner */
function stopAuto(){ clearInterval(autoTimer); autoTimer = null; }
function startAuto(){
  stopAuto();
  if(bannerItems.length < 2) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  autoTimer = setInterval(()=> goTo(bannerIndex + 1), autoMs);
}
let autoEnabled = true;
['pointerenter','focusin','touchstart'].forEach(ev=> bannerEl.addEventListener(ev, stopAuto, { passive: true }));
['pointerleave','focusout','touchend'].forEach(ev=> bannerEl.addEventListener(ev, ()=>{ if(autoEnabled) startAuto(); }, { passive: true }));
document.addEventListener('visibilitychange', ()=>{ document.hidden ? stopAuto() : (autoEnabled && startAuto()); });
window.addEventListener('resize', ()=> bannerTrack.scrollTo({ left: bannerIndex * bannerTrack.clientWidth }));

/* ===============================
   INIT
================================ */
loadConfig().then(cfg=>{
  applyLinks(cfg.links);
  const b = cfg.banner || {};
  autoEnabled = b.autoplay !== false;
  autoMs = Math.max(2000, Number(b.interval) || 5000);
  buildBanner(pickBanners(b.items));
  if(autoEnabled) startAuto();
});
