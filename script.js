const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible')
  })
}, { threshold: 0.12 })

document.querySelectorAll('.reveal').forEach(el => io.observe(el))

const track = document.getElementById('services-track')

const form = document.getElementById('contact-form')
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    sendToTelegram(data)
    alert('Заявка отправлена. Мы свяжемся с вами.\n' + JSON.stringify(data, null, 2))
    form.reset()
  })
}

const miniForm = document.getElementById('mini-form')
if (miniForm) {
  miniForm.addEventListener('submit', e => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(miniForm))
    sendToTelegram(data)
    alert('Заявка отправлена.\n' + JSON.stringify(data, null, 2))
    miniForm.reset()
  })
}

const headlines = [
  'Найдём фабрику и проверим поставщика',
  'Закупим товар и проверим на брак',
  'Доставим: официально с документами или альтернативно — по запросу клиента',
  'Безопасные поставки из Китая — полный контроль на каждом этапе'
]
const headlineEl = document.getElementById('headline')
if (headlineEl) {
  let i = 0
  setInterval(() => {
    i = (i + 1) % headlines.length
    headlineEl.textContent = headlines[i]
  }, 3500)
}

try {
  const faqQs = Array.from(document.querySelectorAll('.faq-q'))
  const openOne = item => {
    const isOpen = item.classList.contains('open')
    const col = item.parentElement // .faq-col
    // clear answers and open state only within same column
    Array.from(col.querySelectorAll('.faq-answer')).forEach(a => {
      try {
        a.classList.remove('show')
        a.classList.add('closing')
        const onEnd = (e) => { if (e.propertyName === 'opacity') { a.removeEventListener('transitionend', onEnd); a.remove() } }
        a.addEventListener('transitionend', onEnd)
        setTimeout(() => { if (a && a.isConnected) a.remove() }, 220)
      } catch (_) { a.remove() }
    })
    Array.from(col.querySelectorAll('.faq-item.open')).forEach(it => it.classList.remove('open'))
    if (!isOpen) {
      item.classList.add('open')
      const aSrc = item.querySelector('.faq-a')
      if (aSrc) {
        const ans = document.createElement('div')
        ans.className = 'faq-answer'
        ans.innerHTML = aSrc.innerHTML
        item.insertAdjacentElement('afterend', ans)
        requestAnimationFrame(() => ans.classList.add('show'))
      }
    }
  }
  faqQs.forEach(q => {
    q.addEventListener('click', e => {
      e.stopPropagation()
      const item = q.closest('.faq-item')
      if (!item) return
      openOne(item)
    })
    const btn = q.querySelector('.faq-toggle')
    if (btn) btn.addEventListener('click', e => {
      e.stopPropagation()
      const item = q.closest('.faq-item')
      if (!item) return
      openOne(item)
    })
  })
} catch (_) {}
const logo = document.querySelector('.brand-logo')
if (logo) {
  logo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
const heroMap = document.querySelector('.hero-map')
if (heroMap) {
  const hero = document.querySelector('.hero')
  if (hero) {
    let rafId = null
    const updateMap = () => {
      if (window.innerWidth > 900) {
        const heroRect = hero.getBoundingClientRect()
        const scrollY = window.scrollY || window.pageYOffset
        const heroOffsetTop = hero.offsetTop
        const heroHeight = hero.offsetHeight || heroRect.height
        
        if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
          const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - heroRect.top) / (window.innerHeight + heroHeight)))
          const baseY = -60
          const maxMovement = 30
          const y = baseY + scrollProgress * maxMovement
          heroMap.style.transform = `translateX(-50%) translateY(${y}px)`
        } else if (heroRect.bottom <= 0) {
          heroMap.style.transform = `translateX(-50%) translateY(-30px)`
        } else {
          heroMap.style.transform = `translateX(-50%) translateY(-60px)`
        }
      } else {
        heroMap.style.transform = `translateX(-50%) translateY(0px)`
      }
    }
    
    window.addEventListener('scroll', () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        updateMap()
        rafId = null
      })
    }, { passive: true })
    
    window.addEventListener('resize', updateMap, { passive: true })
    updateMap()
  }
}
const slider = document.querySelector('.promo-slider .slides')
if (slider) {
  const slides = Array.from(slider.querySelectorAll('.slide'))
  const dotsEl = document.getElementById('promo-dots')
  let idx = 0
  const setActiveDots = () => {
    if (!dotsEl) return
    const dots = Array.from(dotsEl.querySelectorAll('.video-dot'))
    dots.forEach((d, n) => d.classList.toggle('active', n === idx))
  }
  const setFixedHeight = () => {
    if (window.innerWidth <= 900) {
      // На мобильных используем максимальную высоту из всех слайдов
      const heights = slides.map(s => {
        s.style.display = 'flex'
        const h = s.offsetHeight
        s.style.display = ''
        return h
      })
      const maxHeight = Math.max(...heights, 200)
      slider.style.height = maxHeight + 'px'
    } else {
      // На десктопе динамическая высота
      const activeSlide = slides.find(s => s.classList.contains('active'))
      if (activeSlide) {
        slider.style.height = activeSlide.offsetHeight + 'px'
      }
    }
  }
  const show = i => {
    slides.forEach((s, n) => s.classList.toggle('active', n === i))
    if (window.innerWidth > 900) {
      slider.style.height = slides[i].offsetHeight + 'px'
    }
    idx = i
    setActiveDots()
  }
  show(idx)
  setFixedHeight()
  if (dotsEl) {
    slides.forEach((_, i) => {
      const b = document.createElement('button')
      b.className = 'video-dot'
      b.addEventListener('click', () => show(i))
      dotsEl.appendChild(b)
    })
    setActiveDots()
  }
  let auto = setInterval(() => show((idx + 1) % slides.length), 4000)
  if (dotsEl) {
    dotsEl.addEventListener('click', () => { clearInterval(auto); auto = setInterval(() => show((idx + 1) % slides.length), 6000) })
  }
  window.addEventListener('resize', () => {
    setFixedHeight()
    show(idx)
  })
}

const serviceCards = document.querySelectorAll('#services .card')
if (serviceCards.length) {
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const rx = ((r.height / 2 - y) / (r.height / 2)) * 5
      const ry = ((x - r.width / 2) / (r.width / 2)) * 6
      card.style.setProperty('--rx', rx + 'deg')
      card.style.setProperty('--ry', ry + 'deg')
      card.style.setProperty('--tz', '8px')
      card.style.setProperty('--mx', (x / r.width * 100).toFixed(1) + '%')
      const shine = Math.min(0.35, Math.abs(rx) / 14 + Math.abs(ry) / 16)
      card.style.setProperty('--shine', shine.toFixed(2))
    })
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg')
      card.style.setProperty('--ry', '0deg')
      card.style.setProperty('--tz', '0px')
      card.style.setProperty('--shine', '0')
    })
  })
}

const wfCards = document.querySelectorAll('#workflow .work-card')
if (wfCards.length) {
  wfCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      card.style.setProperty('--mx', x + 'px')
      card.style.setProperty('--my', y + 'px')
    })
    card.addEventListener('mouseenter', () => {
      card.classList.add('ripple')
      setTimeout(() => card.classList.remove('ripple'), 700)
    })
  })
}

const rotator = document.querySelector('.type-rotator')
if (rotator) {
  const items = Array.from(rotator.querySelectorAll('.rot-item'))
  let i = 0
  setInterval(() => {
    items[i].classList.remove('active')
    i = (i + 1) % items.length
    items[i].classList.add('active')
  }, 3000)
}

const whoCard = document.querySelector('#who .who-card--ecom')
const whoOverlay = whoCard ? whoCard.querySelector('.who-overlay') : null
if (whoCard && whoOverlay) {
  whoCard.addEventListener('mousemove', e => {
    const r = whoCard.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const rx = ((r.height / 2 - y) / (r.height / 2)) * 3
    const ry = ((x - r.width / 2) / (r.width / 2)) * 5
    whoCard.style.setProperty('--rx', rx + 'deg')
    whoCard.style.setProperty('--ry', ry + 'deg')
    whoCard.style.setProperty('--mx', (x / r.width * 100).toFixed(1) + '%')
    whoCard.style.setProperty('--my', (y / r.height * 100).toFixed(1) + '%')
  })
  whoCard.addEventListener('mouseleave', () => {
    whoCard.style.setProperty('--rx', '0deg')
    whoCard.style.setProperty('--ry', '0deg')
  })
}

const typesPanel = document.querySelector('#types .types-panel')
if (typesPanel) {
  typesPanel.addEventListener('mousemove', e => {
    const r = typesPanel.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    typesPanel.style.setProperty('--mx', (x / r.width * 100).toFixed(1) + '%')
    typesPanel.style.setProperty('--my', (y / r.height * 100).toFixed(1) + '%')
    const dx = Math.abs(x - r.width / 2) / r.width
    const dy = Math.abs(y - r.height / 2) / r.height
    const shine = Math.min(0.6, 0.28 + (dx + dy) * 0.5)
    typesPanel.style.setProperty('--shine', shine.toFixed(2))
  })
  typesPanel.addEventListener('mouseleave', () => {
    typesPanel.style.setProperty('--mx', '22%')
    typesPanel.style.setProperty('--my', '26%')
    typesPanel.style.setProperty('--shine', '0.28')
  })
}

const setupVideo = (sectionSel, dotsId) => {
  const cards = Array.from(document.querySelectorAll(sectionSel + ' .video-card'))
  if (!cards.length) return
  let current
  const stop = card => {
    const embed = card.querySelector('.video-embed')
    if (embed) embed.remove()
    const closeBtn = card.querySelector('.video-close')
    if (closeBtn) closeBtn.remove()
    card.classList.remove('playing')
  }
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.video
      if (!id) return
      if (current && current !== card) stop(current)
      if (card.classList.contains('playing')) { stop(card); current = null; return }
      const embed = document.createElement('div')
      embed.className = 'video-embed'
      const iframe = document.createElement('iframe')
      iframe.src = 'https://rutube.ru/play/embed/' + id
      iframe.setAttribute('allow', 'autoplay; fullscreen')
      iframe.setAttribute('allowfullscreen', 'true')
      embed.appendChild(iframe)
      card.appendChild(embed)
      const closeBtn = document.createElement('button')
      closeBtn.className = 'video-close'
      closeBtn.textContent = '×'
      closeBtn.addEventListener('click', e => { e.stopPropagation(); stop(card); current = null })
      card.appendChild(closeBtn)
      card.classList.add('playing')
      current = card
      if (typeof setActive === 'function') setActive(cards.indexOf(card))
    })
  })
  let setActive
  const dotsEl = document.getElementById(dotsId)
  if (dotsEl) {
    const grid = document.querySelector(sectionSel + ' .video-grid')
    cards.forEach((card, i) => {
      const b = document.createElement('button')
      b.className = 'video-dot'
      b.addEventListener('click', () => {
        if (grid) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        if (typeof setActive === 'function') setActive(i)
      })
      dotsEl.appendChild(b)
    })
    const dots = Array.from(dotsEl.querySelectorAll('.video-dot'))
    let activeIdx = -1
    setActive = i => {
      if (i === activeIdx) return
      dots.forEach((d, n) => d.classList.toggle('active', n === i))
      activeIdx = i
    }
    setActive(0)
    if (grid) {
      let rafId = 0
      const update = () => {
        const center = grid.scrollLeft + grid.clientWidth / 2
        let best = Infinity
        let idx = 0
        cards.forEach((c, i) => {
          const x = c.offsetLeft + c.offsetWidth / 2
          const d = Math.abs(x - center)
          if (d < best) { best = d; idx = i }
        })
        const w = cards[idx] ? cards[idx].offsetWidth : 0
        if (w && Math.abs((cards[idx].offsetLeft + w / 2) - center) < w * 0.35) setActive(idx)
      }
      const onScroll = () => {
        if (rafId) return
        rafId = requestAnimationFrame(() => { update(); rafId = 0 })
      }
      grid.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', () => update())
      update()
    }
  }
}

setupVideo('#reviews-video', 'video-dots')
setupVideo('#reviews-clients', 'video-dots-clients')

// Simple dot slider for horizontal grids (team)
function setupDots(sectionSel, dotsId, itemSel) {
  const section = document.querySelector(sectionSel)
  if (!section) return
  const grid = section.querySelector('.team-slider')
  const items = grid ? Array.from(grid.querySelectorAll(itemSel)) : []
  const dotsEl = document.getElementById(dotsId)
  if (!grid || !items.length || !dotsEl) return
  items.forEach((_, i) => {
    const b = document.createElement('button')
    b.className = 'video-dot'
    b.addEventListener('click', () => items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }))
    dotsEl.appendChild(b)
  })
  const dots = Array.from(dotsEl.querySelectorAll('.video-dot'))
  let rafId = 0
  const setActive = i => dots.forEach((d, n) => d.classList.toggle('active', n === i))
  const update = () => {
    const center = grid.scrollLeft + grid.clientWidth / 2
    let best = Infinity
    let idx = 0
    items.forEach((c, i) => {
      const x = c.offsetLeft + c.offsetWidth / 2
      const d = Math.abs(x - center)
      if (d < best) { best = d; idx = i }
    })
    setActive(idx)
  }
  const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(() => { update(); rafId = 0 }) }
  grid.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', update)
  update()
}

setupDots('#team-advanced', 'team-dots', '.team-card')

// Fallback for missing images after path restructuring
try {
  Array.from(document.querySelectorAll('img')).forEach(img => {
    img.addEventListener('error', () => {
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = '1'
        img.src = 'assets/icons/image33.svg'
        img.style.objectFit = 'contain'
        img.style.background = '#EFF2F7'
      }
    }, { once: true })
  })
} catch (_) {}

function sendToTelegram(payload) {
  try {
    const cfg = window.TG_CONFIG || {}
    if (!cfg.token || !cfg.chatId) return Promise.resolve()
    const text = Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join('\n')
    return fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cfg.chatId, text })
    }).catch(() => {})
  } catch (_) { return Promise.resolve() }
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-target]')
  if (el) {
    const sel = el.getAttribute('data-target')
    const tgt = document.querySelector(sel)
    if (tgt) { e.preventDefault(); tgt.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  }
})
function setupCrossfadeSlider(selector, interval = 3000) {
  const container = document.querySelector(selector)
  if (!container) return
  const imgs = Array.from(container.querySelectorAll('img'))
  if (imgs.length <= 1) return
  const caption = container.parentElement.querySelector('.contact-caption')
  const setCaption = (idx) => {
    if (!caption) return
    const img = imgs[idx]
    const title = img.getAttribute('data-title') || ''
    const sub = img.getAttribute('data-sub') || ''
    const tEl = caption.querySelector('.cap-title')
    const sEl = caption.querySelector('.cap-sub')
    if (tEl) tEl.textContent = title
    if (sEl) sEl.textContent = sub
  }
  let i = 0
  imgs.forEach((img, idx) => img.classList.toggle('active', idx === 0))
  setCaption(0)
  setInterval(() => {
    imgs[i].classList.remove('active')
    i = (i + 1) % imgs.length
    imgs[i].classList.add('active')
    setCaption(i)
  }, interval)
}

setupCrossfadeSlider('#contact .contact-slider', 3000)

// mobile nav
try {
  const navToggle = document.querySelector('.nav-toggle')
  const navDrawer = document.querySelector('.nav-drawer')
  if (navToggle && navDrawer) {
    const open = () => { document.body.classList.add('menu-open'); navDrawer.setAttribute('aria-hidden', 'false') }
    const close = () => { document.body.classList.remove('menu-open'); navDrawer.setAttribute('aria-hidden', 'true') }
    const closeBtn = navDrawer.querySelector('.nav-close')
    navToggle.addEventListener('click', open)
    if (closeBtn) closeBtn.addEventListener('click', close)
    navDrawer.addEventListener('click', e => { if (e.target === navDrawer) close() })
    Array.from(navDrawer.querySelectorAll('a')).forEach(a => a.addEventListener('click', close))
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close() })
  }
} catch (_) {}