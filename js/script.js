/* ============================================================
   FOR SERVICE — логика макета
   ============================================================ */
(function () {
  'use strict';

  /* ---------- иконки Lucide ---------- */
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  /* ---------- шапка при скролле ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- мобильное меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });

  /* ---------- активная ссылка навигации ---------- */
  const sections = ['services', 'prices', 'reviews', 'about', 'contacts']
    .map(id => document.getElementById(id)).filter(Boolean);
  const links = [...nav.querySelectorAll('.nav__link')];
  const visible = new Set();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) visible.add(en.target.id);
      else visible.delete(en.target.id);
    });
    const current = sections.find(s => visible.has(s.id));
    links.forEach(l => l.classList.toggle('is-active', !!current && l.getAttribute('href') === '#' + current.id));
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- появление блоков ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ============================================================
     ФОРМА ЗАПИСИ В ШАПКЕ (вкладки + маска телефона)
     ============================================================ */
  const services = {
    to: ['Замена масла ДВС', 'Замена свечей зажигания', 'Сезонное ТО', 'Шиномонтаж'],
    repair: ['Компьютерная диагностика', 'Осмотр ходовой части', 'Эндоскопия двигателя', 'Ремонт двигателя', 'Ремонт АКПП / КПП', 'Ремонт ходовой и тормозов', 'Электрика и рулевое', 'Система охлаждения', 'Заправка кондиционера'],
    osago: ['Ремонт по ОСАГО', 'Предрейсовый техосмотр', 'Установка доп. оборудования']
  };

  const bookingService = document.getElementById('bookingService');
  const bookingDate = document.getElementById('bookingDate');
  const bookingPhone = document.getElementById('bookingPhone');
  const bookingForm = document.getElementById('bookingForm');
  const bookingDone = document.getElementById('bookingDone');

  function fillServices(key) {
    bookingService.innerHTML = services[key].map(s => `<option>${s}</option>`).join('');
  }
  fillServices('to');

  document.querySelectorAll('.booking__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.booking__tab').forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      fillServices(tab.dataset.tab);
    });
  });

  /* дата — не раньше сегодняшней */
  const today = new Date();
  const iso = d => d.toISOString().slice(0, 10);
  bookingDate.min = iso(today);

  /* маска телефона +7 (___) ___-__-__ */
  function attachPhoneMask(input) {
    input.addEventListener('input', () => {
      let d = input.value.replace(/\D/g, '');
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (d && !d.startsWith('7')) d = '7' + d;
      d = d.slice(0, 11);
      let out = '';
      if (d.length) out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 4) out += ')';
      if (d.length > 4) out += ' ' + d.slice(4, 7);
      if (d.length > 7) out += '-' + d.slice(7, 9);
      if (d.length > 9) out += '-' + d.slice(9, 11);
      input.value = out;
    });
  }
  attachPhoneMask(bookingPhone);

  function validPhone(v) { return v.replace(/\D/g, '').length === 11; }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      bookingPhone.classList.toggle('is-error', !validPhone(bookingPhone.value));
      bookingDate.classList.toggle('is-error', !bookingDate.value);
      if (!validPhone(bookingPhone.value) || !bookingDate.value) return;
      // В макете отправки нет: при интеграции подключить CRM/Telegram-бот/телефонию
      bookingDone.hidden = false;
      bookingForm.reset();
      setTimeout(() => { bookingDone.hidden = true; }, 6000);
    });
  }

  /* ============================================================
     МИНИ-ФОРМА В КОНТАКТАХ
     ============================================================ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const cName = document.getElementById('contactName');
    const cPhone = document.getElementById('contactPhone');
    attachPhoneMask(cPhone);
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      ok &= cName.value.trim().length > 1;
      ok &= validPhone(cPhone.value);
      cName.classList.toggle('is-error', cName.value.trim().length <= 1);
      cPhone.classList.toggle('is-error', !validPhone(cPhone.value));
      if (!ok) return;
      document.getElementById('contactDone').hidden = false;
      contactForm.reset();
      setTimeout(() => { document.getElementById('contactDone').hidden = true; }, 6000);
    });
  }

  /* ============================================================
     ПОИСК ПО ПРАЙСУ
     ============================================================ */
  const priceSearch = document.getElementById('priceSearch');
  const priceRows = [...document.querySelectorAll('.price-row')];
  const priceEmpty = document.getElementById('priceEmpty');
  priceSearch.addEventListener('input', () => {
    const q = priceSearch.value.trim().toLowerCase();
    let visible = 0;
    priceRows.forEach(row => {
      const hit = !q || (row.dataset.name + ' ' + row.textContent).toLowerCase().includes(q);
      row.style.display = hit ? '' : 'none';
      if (hit) visible++;
    });
    priceEmpty.hidden = visible !== 0;
  });

  /* ============================================================
     СЛАЙДЕР ОТЗЫВОВ
     ============================================================ */
  const track = document.getElementById('reviewsTrack');
  const prev = document.getElementById('revPrev');
  const next = document.getElementById('revNext');
  function cardStep() {
    const card = track && track.firstElementChild;
    return card ? card.getBoundingClientRect().width + 18 : 320;
  }
  prev.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));

  /* год в футере */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
