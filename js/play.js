/* ===============================
   PANEL + LANGUAGE
================================ */
const menuBtn = document.getElementById('menuBtn');
const panel = document.getElementById('sidePanel');
const overlay = document.getElementById('overlay');
const langToggle = document.getElementById('langToggle');
const langDropdown = document.getElementById('langDropdown');

menuBtn.addEventListener('click', ()=>{
  panel.classList.add('show');
  overlay.classList.add('show');
});
overlay.addEventListener('click', ()=>{
  panel.classList.remove('show');
  overlay.classList.remove('show');
  langDropdown.classList.remove('show');
});
langToggle.addEventListener('click', e=>{
  e.stopPropagation();
  langDropdown.classList.toggle('show');
});
langDropdown.addEventListener('click', e=> e.stopPropagation());

const translations = {
  vi: {
    play:"Chơi", map:"Bản đồ", games:"Trò chơi", wiki:"Wiki",
    content:"Nội dung", language:"Ngôn ngữ",
    vi_lang:"Tiếng Việt", en_lang:"Tiếng Anh",
    rule:"Luật", terms:"Điều khoản & Pháp lý"
  },
  en: {
    play:"Play", map:"Map", games:"Games", wiki:"Wiki",
    content:"Content", language:"Language",
    vi_lang:"Vietnamese", en_lang:"English",
    rule:"Rules", terms:"Terms & Legal"
  }
};

let currentLang = 'vi';
try{
  const saved = localStorage.getItem('lang');
  if(saved && translations[saved]) currentLang = saved;
}catch(e){}

function t(v){
  if(!v) return '';
  if(typeof v === 'string') return v;
  return v[currentLang] || v.vi || v.en || '';
}

function setLanguage(lang){
  currentLang = lang;
  try{ localStorage.setItem('lang', lang); }catch(e){}
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const v = translations[lang]?.[el.dataset.i18n];
    if(v) el.textContent = v;
  });
  renderPage();
}

document.querySelectorAll('[data-lang]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    setLanguage(btn.dataset.lang);
    langDropdown.classList.remove('show');
    panel.classList.remove('show');
    overlay.classList.remove('show');
  });
});

/* ===============================
   CONFIG (./config/play.json)
================================ */
/* Dùng khi không tải được play.json (vd: mở file:// trực tiếp) */
const DEFAULT_CONFIG = {
  "server": {
    "name": "MePhuHo Team",
    "ip": "play.example.com",
    "port": 19132
  },
  "hero": {
    "image": "./assets/play/hero.png"
  },
  "join": {
    "title": {
      "vi": "Cách tham gia",
      "en": "How to Join"
    },
    "image": "./assets/play/server-info.png",
    "imageAlt": {
      "vi": "Địa chỉ IP và cổng của server",
      "en": "Server IP address and port"
    },
    "addText": {
      "vi": "Hoặc bấm vào đây để thêm server",
      "en": "Or click here to add server"
    },
    "addButton": {
      "vi": "Thêm server",
      "en": "Add server"
    }
  },
  "faq": {
    "title": {
      "vi": "Hỏi & Đáp",
      "en": "Q&A"
    },
    "items": [
      {
        "q": {
          "vi": "Server hỗ trợ phiên bản Minecraft nào?",
          "en": "Which Minecraft versions are supported?"
        },
        "a": {
          "vi": "Server chạy Minecraft Bedrock. Bạn nên dùng phiên bản mới nhất để tránh lỗi kết nối.",
          "en": "The server runs Minecraft Bedrock. Use the latest version to avoid connection issues."
        }
      },
      {
        "q": {
          "vi": "Tôi không thể kết nối vào server?",
          "en": "I can't connect to the server?"
        },
        "a": {
          "vi": "Kiểm tra lại IP và cổng, cập nhật game lên bản mới nhất, rồi thử lại. Nếu vẫn lỗi, hãy nhắn trong Discord để được hỗ trợ.",
          "en": "Double-check the IP and port, update the game, then try again. If it still fails, ask for help on Discord."
        }
      },
      {
        "q": {
          "vi": "Tôi có thể chơi trên điện thoại không?",
          "en": "Can I play on mobile?"
        },
        "a": {
          "vi": "Có. Bạn có thể chơi trên điện thoại, máy tính hoặc console hỗ trợ Bedrock.",
          "en": "Yes. You can play on mobile, PC or any console that supports Bedrock."
        }
      }
    ]
  }
};

let cfg = DEFAULT_CONFIG;

async function loadConfig(){
  try{
    const res = await fetch('./config/play.json', { cache:'no-cache' });
    if(!res.ok) throw new Error(res.status);
    return await res.json();
  }catch(err){
    console.warn('Không tải được ./config/play.json, dùng cấu hình mặc định.', err);
    return DEFAULT_CONFIG;
  }
}

/* ===============================
   RENDER
================================ */
const $ = id => document.getElementById(id);
const openFaq = new Set();     // giữ trạng thái mở khi đổi ngôn ngữ

function addServerUrl(s = {}){
  if(!s.ip) return '#';
  return 'minecraft://?addExternalServer=' + encodeURIComponent(s.name || 'Server') + '|' + s.ip + ':' + (s.port || 19132);
}

function renderPage(){
  const join = cfg.join || {};
  const faq  = cfg.faq  || {};
  const srv  = cfg.server || {};

  $('joinTitle').textContent = t(join.title);
  $('joinImg').alt = t(join.imageAlt);
  $('addText').textContent = t(join.addText);
  $('addBtn').textContent = t(join.addButton);
  $('addBtn').href = addServerUrl(srv);

  $('joinFallback').innerHTML = '<div>IP: <b></b></div><div>Port: <b></b></div>';
  const bs = $('joinFallback').querySelectorAll('b');
  bs[0].textContent = srv.ip || '';
  bs[1].textContent = srv.port || '';

  $('faqTitle').textContent = t(faq.title);
  renderFaq(faq.items || []);
}

function renderFaq(items){
  const list = $('faqList');
  list.innerHTML = '';
  items.forEach((it, i)=>{
    const item = document.createElement('div');
    item.className = 'faq-item' + (openFaq.has(i) ? ' open' : '');

    const q = document.createElement('button');
    q.className = 'faq-q';
    q.type = 'button';
    q.id = 'faq-q-' + i;
    q.setAttribute('aria-controls', 'faq-a-' + i);
    q.setAttribute('aria-expanded', openFaq.has(i));
    q.textContent = t(it.q);

    const a = document.createElement('div');
    a.className = 'faq-a';
    a.id = 'faq-a-' + i;
    a.setAttribute('role', 'region');
    a.setAttribute('aria-labelledby', q.id);
    const inner = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = t(it.a);
    inner.appendChild(p);
    a.appendChild(inner);

    q.addEventListener('click', ()=>{
      const open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open);
      open ? openFaq.add(i) : openFaq.delete(i);
    });

    item.append(q, a);
    list.appendChild(item);
  });
}

/* Ảnh lỗi: ảnh hero ẩn đi, ảnh IP thay bằng chữ IP/Port */
function watchImg(img, onFail){
  const check = ()=>{ if(img.complete && img.naturalWidth === 0) onFail(); };
  img.addEventListener('error', onFail);
  img.addEventListener('load', ()=>{
    if(img.naturalWidth > 0) onFail.restore?.();
  });
  check();                      // lỗi đã xảy ra trước khi gắn listener
}
const heroImg = $('heroImg');
const joinImg = $('joinImg');
const failHero = ()=> heroImg.classList.add('broken');
failHero.restore = ()=> heroImg.classList.remove('broken');
const failJoin = ()=>{ joinImg.hidden = true; $('joinFallback').hidden = false; };
failJoin.restore = ()=>{ joinImg.hidden = false; $('joinFallback').hidden = true; };
watchImg(heroImg, failHero);
watchImg(joinImg, failJoin);

/* ===============================
   INIT
================================ */
setLanguage(currentLang);

loadConfig().then(c=>{
  cfg = c;
  if(c.hero?.image && !heroImg.src.endsWith(c.hero.image.replace('./',''))) heroImg.src = c.hero.image;
  if(c.join?.image && !joinImg.src.endsWith(c.join.image.replace('./',''))) joinImg.src = c.join.image;
  renderPage();
});