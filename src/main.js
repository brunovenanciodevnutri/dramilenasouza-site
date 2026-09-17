import './styles.css'

const navigationBar = document.querySelector('#cabecalho-principal')
const menuButton = document.querySelector('#menu-toggle')
const mobileMenu = document.querySelector('#mobile-menu')

const getNavigationChangePoint = () => Math.round(navigationBar.getBoundingClientRect().height * 0.7)
const refreshNavigationSurface = () => {
  const pageOffset = window.scrollY || document.documentElement.scrollTop
  navigationBar.classList.toggle('header-scrolled', pageOffset >= getNavigationChangePoint())
}
const closeMenu = () => {
  mobileMenu.classList.remove('is-open')
  menuButton.classList.remove('is-open')
  menuButton.setAttribute('aria-expanded', 'false')
  menuButton.setAttribute('aria-label', 'Abrir menu')
}

window.addEventListener('scroll', refreshNavigationSurface, { passive: true })
refreshNavigationSurface()

menuButton.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('is-open')
  mobileMenu.classList.toggle('is-open', open)
  menuButton.classList.toggle('is-open', open)
  menuButton.setAttribute('aria-expanded', String(open))
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
})

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))
window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu() })

const entranceWatcher = new IntersectionObserver((records, watcher) => {
  records.forEach((record) => {
    if (record.isIntersecting) {
      record.target.classList.add('is-present')
      watcher.unobserve(record.target)
    }
  })
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 })

document.querySelectorAll('.viewport-entry').forEach((element) => entranceWatcher.observe(element))

const formattedYear = new Intl.DateTimeFormat('pt-BR', { year: 'numeric' }).format(Date.now())
document.querySelectorAll('.current-year').forEach((element) => { element.textContent = formattedYear })

const methodVideo = document.querySelector('#method-video')
const methodVideoSound = document.querySelector('#method-video-sound')

if (methodVideo) {
  methodVideo.muted = false
  methodVideo.defaultMuted = false
  methodVideo.volume = 1

  const playMethodVideoWithSound = async () => {
    methodVideo.muted = false
    methodVideo.volume = 1

    try {
      await methodVideo.play()
      if (methodVideoSound) methodVideoSound.hidden = true
    } catch {
      if (methodVideoSound) methodVideoSound.hidden = false
    }
  }

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        playMethodVideoWithSound()
      } else {
        methodVideo.pause()
      }
    })
  }, { threshold: 0.5 })

  videoObserver.observe(methodVideo)

  methodVideoSound?.addEventListener('click', playMethodVideoWithSound)
  methodVideo.addEventListener('playing', () => {
    if (methodVideoSound) methodVideoSound.hidden = true
  })
}

const casesCarousel = document.querySelector('#cases-carousel')
const casesProgress = document.querySelector('#cases-progress')
const previousCaseButtons = document.querySelectorAll('[data-carousel-prev]')
const nextCaseButtons = document.querySelectorAll('[data-carousel-next]')
let carouselTimer

const getCarouselStep = () => {
  const card = casesCarousel?.querySelector('.case-card')
  if (!card) return 0
  return card.getBoundingClientRect().width + 20
}

const updateCarouselProgress = () => {
  if (!casesCarousel || !casesProgress) return
  const maxScroll = casesCarousel.scrollWidth - casesCarousel.clientWidth
  const progress = maxScroll > 0 ? casesCarousel.scrollLeft / maxScroll : 0
  const indicatorRatio = Math.max(.18, casesCarousel.clientWidth / casesCarousel.scrollWidth)
  const indicatorWidth = casesCarousel.clientWidth * indicatorRatio
  const indicatorTravel = casesCarousel.clientWidth - indicatorWidth
  casesProgress.style.width = `${indicatorWidth}px`
  casesProgress.style.transform = `translateX(${progress * indicatorTravel}px)`
}

const moveCarousel = (direction = 1) => {
  if (!casesCarousel) return
  const step = getCarouselStep()
  const maxScroll = casesCarousel.scrollWidth - casesCarousel.clientWidth
  const reachedEnd = casesCarousel.scrollLeft >= maxScroll - 8
  const reachedStart = casesCarousel.scrollLeft <= 8

  if (direction > 0 && reachedEnd) casesCarousel.scrollTo({ left: 0, behavior: 'smooth' })
  else if (direction < 0 && reachedStart) casesCarousel.scrollTo({ left: maxScroll, behavior: 'smooth' })
  else casesCarousel.scrollBy({ left: step * direction, behavior: 'smooth' })
}

const startCarousel = () => {
  window.clearInterval(carouselTimer)
  carouselTimer = window.setInterval(() => moveCarousel(1), 4500)
}

if (casesCarousel) {
  previousCaseButtons.forEach((button) => button.addEventListener('click', () => { moveCarousel(-1); startCarousel() }))
  nextCaseButtons.forEach((button) => button.addEventListener('click', () => { moveCarousel(1); startCarousel() }))
  casesCarousel.addEventListener('scroll', updateCarouselProgress, { passive: true })
  casesCarousel.addEventListener('pointerenter', () => window.clearInterval(carouselTimer))
  casesCarousel.addEventListener('pointerleave', startCarousel)
  casesCarousel.addEventListener('focusin', () => window.clearInterval(carouselTimer))
  casesCarousel.addEventListener('focusout', startCarousel)
  window.addEventListener('resize', updateCarouselProgress)
  updateCarouselProgress()
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startCarousel()
}
