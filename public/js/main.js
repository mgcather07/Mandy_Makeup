/* =============================================================================
   Lumière Beauty Studio — interactions
   Vanilla JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ footer year */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------- sticky header -- */
  var header = $('#header');
  var toTop = $('#toTop');

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 12);
    if (toTop) toTop.classList.toggle('is-shown', y > 700);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------------------------- mobile nav - */
  var burger = $('#burger');
  var nav = $('#nav');
  var scrim = $('#navScrim');

  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
    if (burger) burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (scrim) scrim.hidden = !open;
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setNav(!document.body.classList.contains('nav-open'));
    });
  }

  if (scrim) scrim.addEventListener('click', function () { setNav(false); });

  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }

  /* ------------------------------------------------------------- scrollspy */
  var navLinks = $$('.nav__link');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------- reveal on scroll */
  var revealEls = $$('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      revealer.observe(el);
    });
  }

  /* ------------------------------------------------------- gallery filters */
  var filters = $$('.filter');
  var items = $$('.gallery__item');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var want = btn.dataset.filter;

      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });

      items.forEach(function (item) {
        var show = want === 'all' || item.dataset.cat === want;
        item.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* -------------------------------------------------------------- lightbox */
  var lb = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCap = $('#lbCap');
  var lastFocus = null;
  var current = 0;

  function visibleItems() {
    return items.filter(function (i) { return !i.classList.contains('is-hidden'); });
  }

  function showAt(index) {
    var list = visibleItems();
    if (!list.length) return;
    current = (index + list.length) % list.length;
    var item = list[current];
    var img = $('img', item);
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.getAttribute('alt') || '';
    lbCap.textContent = item.dataset.cap || '';
  }

  function openLb(item) {
    lastFocus = document.activeElement;
    showAt(visibleItems().indexOf(item));
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }

  function closeLb() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () { openLb(item); });
  });

  if (lb) {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { showAt(current - 1); });
    $('#lbNext').addEventListener('click', function () { showAt(current + 1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLb();
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setNav(false);
        return;
      }
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') showAt(current - 1);
      if (e.key === 'ArrowRight') showAt(current + 1);
    });
  }

  /* --------------------------------------------------- testimonial slider - */
  var track = $('#quotesTrack');
  var dotsWrap = $('#quotesDots');

  if (track && dotsWrap) {
    var slides = $$('.quote', track);
    var index = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'quotes__dot' + (i === 0 ? ' is-active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      dot.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(dot);
    });

    var dots = $$('.quotes__dot', dotsWrap);

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + -index * 100 + '%)';
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === index); });
    }

    function restart() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 6500);
    }

    restart();

    var quotes = $('#quotes');
    quotes.addEventListener('mouseenter', function () { clearInterval(timer); });
    quotes.addEventListener('mouseleave', restart);

    // touch swipe
    var startX = 0;
    quotes.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      clearInterval(timer);
    }, { passive: true });

    quotes.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
      restart();
    });
  }

  /* --------------------------------------------------------------- faq --- */
  $$('.faq__item').forEach(function (item) {
    var btn = $('.faq__q', item);
    btn.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      $$('.faq__item').forEach(function (other) {
        other.classList.remove('is-open');
        $('.faq__q', other).setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ------------------------------------------------------------- the form - */
  var form = $('#bookingForm');

  if (form) {
    // Set an endpoint (Formspree, Firebase Function, etc.) to POST instead of
    // falling back to the visitor's mail client.
    var ENDPOINT = form.dataset.endpoint || '';
    var status = $('#formStatus');

    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      service: function (v) { return v !== ''; }
    };

    function validateField(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var ok = rule(input.value);
      input.closest('.field').classList.toggle('is-invalid', !ok);
      return ok;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('is-invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      var firstBad = null;

      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        if (!input) return;
        if (!validateField(input)) {
          valid = false;
          if (!firstBad) firstBad = input;
        }
      });

      if (!valid) {
        status.className = 'form__status is-shown';
        status.textContent = 'Please check the highlighted fields and try again.';
        if (firstBad) firstBad.focus();
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        service: form.elements.service.value,
        date: form.elements.date.value || 'Not specified',
        message: form.elements.message.value.trim() || 'No extra details.'
      };

      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.textContent = 'Sending…';

      function done(msg) {
        status.className = 'form__status is-shown';
        status.textContent = msg;
        btn.disabled = false;
        btn.textContent = 'Send enquiry';
      }

      if (ENDPOINT) {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        })
          .then(function (r) {
            if (!r.ok) throw new Error('bad status');
            form.reset();
            done('Thank you, ' + data.name + '. Your enquiry is in — we reply within one business day.');
          })
          .catch(function () {
            done('Sorry, something went wrong. Please email hello@lumierebeauty.com directly.');
          });
        return;
      }

      // No endpoint configured: hand off to the visitor's mail client.
      var body =
        'Name: ' + data.name +
        '\nEmail: ' + data.email +
        '\nService: ' + data.service +
        '\nPreferred date: ' + data.date +
        '\n\n' + data.message;

      window.location.href =
        'mailto:hello@lumierebeauty.com' +
        '?subject=' + encodeURIComponent('Booking enquiry — ' + data.service) +
        '&body=' + encodeURIComponent(body);

      done('Opening your email app so you can send the enquiry. If nothing happens, email hello@lumierebeauty.com.');
    });
  }
})();
