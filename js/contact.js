/* ==========================================================================
   Contact Form — client-side validation + mailto fallback
   ========================================================================== */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');
  const statusEl = document.getElementById('contact-status');

  const fields = {
    name: {
      input: document.getElementById('contact-name'),
      error: document.getElementById('name-error'),
    },
    email: {
      input: document.getElementById('contact-email'),
      error: document.getElementById('email-error'),
    },
    message: {
      input: document.getElementById('contact-message'),
      error: document.getElementById('message-error'),
    },
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---- helpers ---- */

  function setError(field, msg) {
    field.error.textContent = msg;
    field.input.classList.add('form-input--error');
    field.input.classList.remove('form-input--valid');
  }

  function clearError(field) {
    field.error.textContent = '';
    field.input.classList.remove('form-input--error');
  }

  function setValid(field) {
    clearError(field);
    field.input.classList.add('form-input--valid');
  }

  function showStatus(type, msg) {
    statusEl.className = 'contact-form__status contact-form__status--' + type;
    statusEl.textContent = msg;
  }

  function clearStatus() {
    statusEl.className = 'contact-form__status';
    statusEl.textContent = '';
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('btn--loading', on);
  }

  /* ---- per-field validation ---- */

  function validateField(name) {
    const field = fields[name];
    const val = field.input.value.trim();

    clearError(field);

    if (!val) {
      setError(field, 'This field is required.');
      return false;
    }

    if (name === 'email' && !EMAIL_RE.test(val)) {
      setError(field, 'Please enter a valid email address.');
      return false;
    }

    if (name === 'name' && val.length < 2) {
      setError(field, 'Name must be at least 2 characters.');
      return false;
    }

    if (name === 'message' && val.length < 10) {
      setError(field, 'Message must be at least 10 characters.');
      return false;
    }

    setValid(field);
    return true;
  }

  /* ---- blur validation ---- */

  Object.keys(fields).forEach(function (name) {
    fields[name].input.addEventListener('blur', function () {
      if (fields[name].input.value.trim()) {
        validateField(name);
      }
    });
  });

  /* ---- mailto fallback ---- */

  function sendViaMailto(data) {
    const subject = encodeURIComponent(
      'Contact from ' + data.name + ' — SlothitudeGames'
    );
    const body = encodeURIComponent(
      'Name: ' + data.name + '\n' +
      'Email: ' + data.email + '\n\n' +
      data.message
    );
    window.location.href = 'mailto:hello@slothitudegames.com?subject=' + subject + '&body=' + body;
  }

  /* ---- submit ---- */

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearStatus();

    var allValid = true;
    Object.keys(fields).forEach(function (name) {
      if (!validateField(name)) allValid = false;
    });

    if (!allValid) {
      showStatus('error', 'Please fix the errors above and try again.');
      return;
    }

    var data = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      message: fields.message.input.value.trim(),
    };

    setLoading(true);
    showStatus('info', 'Opening your email client…');

    setTimeout(function () {
      try {
        sendViaMailto(data);
        showStatus('success', 'Your email client should open now. If it didn\'t, you can email us directly at hello@slothitudegames.com.');
        form.reset();
        Object.keys(fields).forEach(function (name) {
          fields[name].input.classList.remove('form-input--valid');
          clearError(fields[name]);
        });
      } catch (err) {
        showStatus('error', 'Something went wrong. Please email us directly at hello@slothitudegames.com.');
      } finally {
        setLoading(false);
      }
    }, 400);
  });
})();
