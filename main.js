// ========================
// 🔁 BURGER-MENÜ
// ========================
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 900 && navLinks.classList.contains('open')) {
        setTimeout(() => {
          navLinks.classList.remove('open');
        }, 200);
      }
    });
  });
}

// ========================
// 📌 STICKY HEADER
// ========================
const header = document.getElementById('header');
let lastScroll = 0;
if (header) {
  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    header.style.boxShadow = (curr > lastScroll && curr > 80) ? 'none' : '';
    lastScroll = curr;
  });
}

// ========================
// 🎨 THEME & LOGO
// ========================
function updateLogo() {
  const logoImg = document.querySelector('.logo img');
  const theme = document.documentElement.getAttribute('data-theme');
  if (logoImg) {
    logoImg.src = theme === 'dark' ? 'logo1.svg' : 'logo.svg';
    console.log('Logo gesetzt auf:', logoImg.src, 'Theme:', theme);
  }
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateLogo();
}

// ========================
// ⚙️ DOMContentLoaded
// ========================
document.addEventListener('DOMContentLoaded', function () {
  // Theme laden
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  // Theme Toggle
  const modeToggle = document.getElementById('modeToggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }

  // ========================
  // 🍪 COOKIE BANNER
  // ========================
  const cookieBanner = document.querySelector('.cookie-banner');
  const cookieAccept = document.getElementById('cookieAccept');
  if (cookieBanner) {
    if (document.cookie.indexOf('cookieAccepted=true') === -1) {
      cookieBanner.classList.remove('hide');
      if (cookieAccept) {
        cookieAccept.addEventListener('click', function () {
          cookieBanner.classList.add('hide');
          document.cookie = "cookieAccepted=true; path=/; max-age=31536000";
        });
      }
    } else {
      cookieBanner.classList.add('hide');
    }
  }

  // ========================
  // ✉️ KONTAKTFORMULAR
  // ========================
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const statusMsg = document.getElementById('formStatus');
  if (contactForm && submitBtn && statusMsg) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      statusMsg.textContent = 'Wird gesendet...';

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Feldzuordnung
      if (data.message !== undefined) {
        data.nachricht = data.message;
        delete data.message;
      }
      if (data.privacy !== undefined) {
        data.dsgvoZustimmung = (data.privacy === 'on' || data.privacy === true || data.privacy === 'true');
        delete data.privacy;
      }

      try {
        const response = await fetch(window.location.origin + '/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const res = await response.json();
        statusMsg.textContent = res.success ? 'Nachricht gesendet!' : res.error || 'Fehler beim Senden.';
        if (res.success) contactForm.reset();
      } catch (err) {
        statusMsg.textContent = 'Serverfehler.';
      }
      submitBtn.disabled = false;
    });
  }

  // ========================
  // 🧪 DEMO-FORMULAR
  // ========================
  const demoForm = document.getElementById('demoForm');
  if (demoForm) {
    const demoSubmitBtn = demoForm.querySelector('button[type="submit"]');
    const demoStatusMsg = demoForm.querySelector('.formStatus');

    demoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (demoSubmitBtn) demoSubmitBtn.disabled = true;
      if (demoStatusMsg) demoStatusMsg.textContent = 'Wird gesendet...';

      const formData = new FormData(demoForm);
      const data = Object.fromEntries(formData.entries());

      // Namen aufsplitten
      if (data.name) {
        const [vorname, ...rest] = data.name.trim().split(' ');
        data.vorname = vorname;
        data.nachname = rest.join(' ');
        delete data.name;
      }

      if (data.message !== undefined) {
        data.nachricht = data.message;
        delete data.message;
      }
      if (data.privacy !== undefined) {
        data.dsgvoZustimmung = (data.privacy === 'on' || data.privacy === true || data.privacy === 'true');
        delete data.privacy;
      }

      try {
        const response = await fetch(window.location.origin + '/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const res = await response.json();
        demoStatusMsg.textContent = res.success ? 'Nachricht gesendet!' : res.error || 'Fehler beim Senden.';
        if (res.success) demoForm.reset();
      } catch (err) {
        demoStatusMsg.textContent = 'Serverfehler.';
      }
      if (demoSubmitBtn) demoSubmitBtn.disabled = false;
    });
  }

  // ========================
  // 📰 BLOG: Filter + Suche
  // ========================
  const searchInput = document.getElementById('blogSearch');
  const filterSelect = document.getElementById('blogFilter');
  const cards = document.querySelectorAll('.blog-card');
  if (searchInput && filterSelect && cards.length > 0) {
    function filterArticles() {
      const search = searchInput.value.toLowerCase();
      const filter = filterSelect.value;
      cards.forEach(card => {
        const title = card.querySelector('.blog-title').textContent.toLowerCase();
        const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
        const category = card.querySelector('.blog-category').textContent;
        const matchesSearch = title.includes(search) || excerpt.includes(search);
        const matchesFilter = filter === '' || category === filter;
        card.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
      });
    }
    searchInput.addEventListener('input', filterArticles);
    filterSelect.addEventListener('change', filterArticles);
  }

  // Dummy-Bilder nach Kategorie setzen
  document.querySelectorAll('.blog-card').forEach(function (card) {
    const category = card.getAttribute('data-category') || 'LINQSEC';
    const img = card.querySelector('.blog-image');
    if (img) {
      img.src = 'https://placehold.co/600x400?text=' + encodeURIComponent(category);
    }
  });

  // ========================
  // 🤖 LINQSEC AI Chat
  // ========================
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-user-input');
  const chatHistory = document.getElementById('ai-chat-history');
  const sendBtn = document.getElementById('ai-send-btn');

  if (chatForm && chatInput && chatHistory && sendBtn) {
    function appendMessage(sender, text) {
      const msg = document.createElement('div');
      msg.className = 'ai-msg ' + (sender === 'user' ? 'ai-msg-user' : 'ai-msg-ai');
      msg.innerHTML = `<span class="ai-msg-sender">${sender === 'user' ? 'Sie' : 'LINQSEC AI'}:</span> <span class="ai-msg-text">${text}</span>`;
      chatHistory.appendChild(msg);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    chatForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const question = chatInput.value.trim();
      if (!question) return;
      appendMessage('user', question);
      chatInput.value = '';
      sendBtn.disabled = true;
      appendMessage('ai', '<span class="ai-typing">Antwort wird geladen...</span>');

      try {
        const res = await fetch('/api/linqsec-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        const loadingMsg = chatHistory.querySelector('.ai-msg-ai .ai-typing');
        if (loadingMsg) loadingMsg.parentElement.parentElement.remove();
        const data = await res.json();
        appendMessage('ai', data.answer || 'Es ist ein Fehler aufgetreten.');
      } catch {
        const loadingMsg = chatHistory.querySelector('.ai-msg-ai .ai-typing');
        if (loadingMsg) loadingMsg.parentElement.parentElement.remove();
        appendMessage('ai', 'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.');
      } finally {
        sendBtn.disabled = false;
      }
    });
  }
});

  const supabase = supabase.createClient('https://lmfmxembawehaliqnucg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZm14ZW1iYXdlaGFsaXFudWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDg2MTcsImV4cCI6MjA2NDM4NDYxN30.DPx3ieSuce1ZG623hABbNLrS66krXiPF9S5W2XEuqfE');

  // Session holen
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
      window.location.href = "/account.html";
    } else {
      const user = session.user;
      document.getElementById("userInfo").innerText =
        `Eingeloggt als: ${user.email}`;
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login.html";
  });