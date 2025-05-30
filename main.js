// Burger-Menü Toggle
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => { navLinks.classList.toggle('open');
});

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 900 && navLinks.classList.contains('open')) { setTimeout(() => { navLinks.classList.remove('open');}, 200);}
    });
  });
};

// Sticky Header
const header = document.getElementById('header');
let lastScroll = 0;
if (header) {
  window.addEventListener('scroll', () => { const curr = window.scrollY;
    if (curr > lastScroll && curr > 80) { header.style.boxShadow = 'none'; } else { header.style.boxShadow = ''; } lastScroll = curr; });
  }

// --- Theme & Logo ---
function updateLogo() {
  const logoImg = document.querySelector('.logo img');
  const theme = document.documentElement.getAttribute('data-theme');
  if (logoImg) {
    logoImg.src = theme === 'dark' ? '/logo1.svg' : '/logo.svg';
    console.log('Logo gesetzt auf:', logoImg.src, 'Theme:', theme);
  }
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateLogo();
}

//--- Theme beim Laden setzen ---
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

// --- Mode Toggle ---
  const modeToggle = document.getElementById('modeToggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }
// --- Cookie Banner ---
  const cookieBanner = document.querySelector('.cookie-banner');
  const cookieAccept = document.getElementById('cookieAccept');
  if (cookieBanner) {
    if (document.cookie.indexOf('cookieAccepted=true') === -1) {
      cookieBanner.classList.remove('hide');
      if (cookieAccept) {
        cookieAccept.addEventListener('click', function() {
          cookieBanner.classList.add('hide');
          document.cookie = "cookieAccepted=true; path=/; max-age=31536000";
        });
      }
    } else {
      cookieBanner.classList.add('hide');
    }
  }
});

// --- Kontaktformular: Ladezustand und Feedback
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('formStatus');
if (contactForm && submitBtn && statusMsg) { contactForm.addEventListener('submit', async (e) => { e.preventDefault();
 submitBtn.disabled = true;
 statusMsg.textContent = 'Wird gesendet...';
 const formData = new FormData(contactForm);
 const data = Object.fromEntries(formData.entries());
 console.log('Formulardaten:', data);

// Feld 'message' in 'nachricht' umbenennen (Backend erwartet 'nachricht')
if (data.message !== undefined) {
  data.nachricht = data.message;
  delete data.message;
}
// Feld 'privacy' in 'dsgvoZustimmung' umbenennen (Backend erwartet 'dsgvoZustimmung')
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
      if (res.success) {
        statusMsg.textContent = 'Nachricht gesendet!';
        contactForm.reset();
      } else {
        statusMsg.textContent = res.error || 'Fehler beim Senden.';
      }
    } catch (err) {
      statusMsg.textContent = 'Serverfehler.';
    }
    submitBtn.disabled = false;
  });
}

// --- DEMO-FORMULAR: gleiche Datenumwandlung wie beim Kontaktformular
const demoForm = document.getElementById('demoForm');
if (demoForm) {
  // Hole Button und Status nur aus dem Demo-Formular-Kontext!
  const demoSubmitBtn = demoForm.querySelector('button[type="submit"]');
  const demoStatusMsg = demoForm.querySelector('.formStatus');
  demoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (demoSubmitBtn) demoSubmitBtn.disabled = true;
    if (demoStatusMsg) demoStatusMsg.textContent = 'Wird gesendet...';
    const formData = new FormData(demoForm);
    const data = Object.fromEntries(formData.entries());
    // Name-Feld aufteilen in Vor- und Nachname (optional)
    if (data.name) {
      const [vorname, ...rest] = data.name.trim().split(' ');
      data.vorname = vorname;
      data.nachname = rest.join(' ');
      delete data.name;
    }
    // Feld 'message' in 'nachricht' umbenennen
    if (data.message !== undefined) {
      data.nachricht = data.message;
      delete data.message;
    }
    // Feld 'privacy' in 'dsgvoZustimmung' umbenennen
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
      if (res.success) {
        if (demoStatusMsg) demoStatusMsg.textContent = 'Nachricht gesendet!';
        demoForm.reset();
      } else {
        if (demoStatusMsg) demoStatusMsg.textContent = res.error || 'Fehler beim Senden.';
      }
    } catch (err) {
      if (demoStatusMsg) demoStatusMsg.textContent = 'Serverfehler.';
    }
    if (demoSubmitBtn) demoSubmitBtn.disabled = false;
  });
}

// --- Blog Filter + Suche ---
document.addEventListener('DOMContentLoaded', function() {
  // Blog Filter + Suche
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

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.blog-card').forEach(function(card) {
    var category = card.getAttribute('data-category') || 'LINQSEC';
    var img = card.querySelector('.blog-image');
    if (img) {
      img.src = 'https://placehold.co/600x400?text=' + encodeURIComponent(category);
    }
  });
});

//--- Ollama-Abfrage ---
  async function queryOllama(prompt) {
    const response = await fetch('/api/linqsec-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.2:latest', // Passe ggf. den Modellnamen an
        prompt: prompt,
        stream: false
      })
    });
    if (!response.ok) {
      throw new Error('Ollama-Server nicht erreichbar oder Fehler: ' + response.status);
    }
    const data = await response.json();
    return data.response;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-user-input');
    const history = document.getElementById('ai-chat-history');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userText = input.value.trim();
      if (!userText) return;
      // Nutzerfrage anzeigen
      const userDiv = document.createElement('div');
      userDiv.className = 'ai-chat-message user';
      userDiv.textContent = userText;
      history.appendChild(userDiv);
      input.value = '';
      // Ladeanzeige für KI-Antwort
      const aiDiv = document.createElement('div');
      aiDiv.className = 'ai-chat-message ai';
      aiDiv.textContent = 'LINQSEC AI denkt...';
      history.appendChild(aiDiv);
      history.scrollTop = history.scrollHeight;
      try {
        const aiResponse = await queryOllama(userText);
        aiDiv.textContent = aiResponse;
      } catch (err) {
        aiDiv.textContent = 'Fehler bei der Anfrage an die KI: ' + err.message;
      }
      history.scrollTop = history.scrollHeight;
    });
  });

// LINQSEC AI Chat (nur auf linqsec-ai.html aktiv)
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
    chatForm.addEventListener('submit', async function(e) {
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
        // Entferne den Ladeplatzhalter
        const loadingMsg = chatHistory.querySelector('.ai-msg-ai .ai-typing');
        if (loadingMsg) loadingMsg.parentElement.parentElement.remove();
        if (res.ok) {
          const data = await res.json();
          appendMessage('ai', data.answer || 'Es ist ein Fehler aufgetreten.');
        } else {
          appendMessage('ai', 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
        }
      } catch {
        const loadingMsg = chatHistory.querySelector('.ai-msg-ai .ai-typing');
        if (loadingMsg) loadingMsg.parentElement.parentElement.remove();
        appendMessage('ai', 'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.');
      } finally {
        sendBtn.disabled = false;
      }
    });
  }
  return { cookieAccept, cookieBanner };
});

