// Hilfsfunktion für Statusanzeige
function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('authStatus');
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'crimson' : 'green';
  }
  
  // LOGIN
  document.getElementById('loginForm').onsubmit = async function (e) {
    e.preventDefault();
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;
  
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('Login erfolgreich!');
        // Token speichern (z.B. localStorage) und ggf. weiterleiten
        localStorage.setItem('token', data.token);
        setTimeout(() => window.location.href = 'index.html', 1500);
      } else {
        showStatus(data.message || 'Login fehlgeschlagen.', true);
      }
    } catch (err) {
      showStatus('Serverfehler beim Login.', true);
    }
  };
  
  // REGISTRIERUNG
  document.getElementById('registerForm').onsubmit = async function (e) {
    e.preventDefault();
    const name = document.getElementById('name-register').value;
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;
    const role = document.getElementById('role').value;
  
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('Registrierung erfolgreich! Jetzt einloggen.');
        // Automatisch zum Login-Formular wechseln
        document.getElementById('showLogin').click();
      } else {
        showStatus(data.message || 'Registrierung fehlgeschlagen.', true);
      }
    } catch (err) {
      showStatus('Serverfehler bei Registrierung.', true);
    }
  };
  
  // PASSWORT-RESET
  document.getElementById('resetForm').onsubmit = async function (e) {
    e.preventDefault();
    const email = document.getElementById('email-reset').value;
  
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus(data.message || 'Falls registriert, wurde eine E-Mail gesendet.');
      } else {
        showStatus(data.message || 'Fehler beim Zurücksetzen.', true);
      }
    } catch (err) {
      showStatus('Serverfehler beim Zurücksetzen.', true);
    }
  };
