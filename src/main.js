import './styles.css'

const header = document.querySelector('#header')
const menuButton = document.querySelector('#menu-toggle')
const mobileMenu = document.querySelector('#mobile-menu')

const updateHeader = () => header.classList.toggle('header-scrolled', window.scrollY > 50)
const closeMenu = () => {
  mobileMenu.classList.remove('is-open')
  menuButton.classList.remove('is-open')
  menuButton.setAttribute('aria-expanded', 'false')
  menuButton.setAttribute('aria-label', 'Abrir menu')
}

window.addEventListener('scroll', updateHeader, { passive: true })
updateHeader()

menuButton.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('is-open')
  mobileMenu.classList.toggle('is-open', open)
  menuButton.classList.toggle('is-open', open)
  menuButton.setAttribute('aria-expanded', String(open))
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
})

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))
window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu() })

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  })
}, { threshold: 0.12 })

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
document.querySelector('#year').textContent = new Date().getFullYear()

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
