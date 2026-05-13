import homeImage from '../assets/home.png'
import { FiCalendar, FiMapPin, FiHome, FiChevronLeft, FiChevronRight, FiArrowRight, FiUser } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { ListingCard } from '../features/listings'
import { useStore } from '../store/StoreContext'
import { useListings } from '../features/listings/hooks/useListings'

const steps = [
  {
    number: '01/',
    icon: FiMapPin,
    title: 'Input your location to start looking for landmarks.',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, amet?',
  },
  {
    number: '02/',
    icon: FiCalendar,
    title: 'Make an appointment at the place you want to visit.',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, amet?',
  },
  {
    number: '03/',
    icon: FiHome,
    title: 'Visit the place and enjoy the experience.',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, amet?',
  },
]

const testimonialItems = [
  {
    id: 1,
    kicker: 'Testimonial',
    title: 'See What Our Clients Say About Us',
    quote:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
    author: 'MARK, SOUTH EVERETT',
  },
  {
    id: 2,
    kicker: 'Testimonial',
    title: 'Guests Trust the Experience We Create',
    quote:
      'Travelers come back because the details feel cared for, the process is clear, and the support feels personal from start to finish.',
    author: 'JULIA, NORTH HARBOR',
  },
  {
    id: 3,
    kicker: 'Testimonial',
    title: 'Simple Booking. Better Memories.',
    quote:
      'A smooth search, strong recommendations, and reliable guidance make the journey feel easier before it even begins.',
    author: 'DAVID, WEST BAY',
  },
]

const articleItems = [
  {
    id: 1,
    imagePosition: 'center left',
    time: '9 hours ago',
    tag: 'Events',
    title: 'Etiam in lorem malesuada, gravida felis in, pretium lacus.',
    author: 'Alexander Kaminski',
    role: 'Engineer',
  },
  {
    id: 2,
    imagePosition: 'center right',
    time: '12 hours ago',
    tag: 'Travel',
    title: 'Curabitur congue ligula in mauris bibendum, nec cursus erat tristique.',
    author: 'Sophia Bennett',
    role: 'Writer',
  },
]

export default function Home() {
  const { state } = useStore()
  useListings()
  const items = state.listings.slice(0, 6)
  const getVisible = () => {
    if (typeof window === 'undefined') return 3
    const w = window.innerWidth
    if (w < 700) return 1
    if (w < 1100) return 2
    return 3
  }

  const [currentPage, setCurrentPage] = useState(0)
  const [visibleCount, setVisibleCount] = useState(getVisible())
  const [savedFeatured, setSavedFeatured] = useState<string[]>([])
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const pagesData = Array.from({ length: Math.max(1, Math.ceil(items.length / visibleCount)) }, (_, i) =>
    items.slice(i * visibleCount, i * visibleCount + visibleCount),
  )
  const pages = pagesData.length

  useEffect(() => {
    const onResize = () => setVisibleCount(getVisible())
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, pages - 1))
  }, [pages])

  function scrollByPage(delta: number) {
    setCurrentPage((prev) => Math.max(0, Math.min(pages - 1, prev + delta)))
  }

  function scrollToPage(i: number) {
    setCurrentPage(Math.max(0, Math.min(pages - 1, i)))
  }

  function toggleFeaturedSave(id: string) {
    setSavedFeatured((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    )
  }

  function scrollTestimonial(delta: number) {
    setTestimonialIndex((current) => (current + delta + testimonialItems.length) % testimonialItems.length)
  }

  const activeTestimonial = testimonialItems[testimonialIndex]

  return (
    <section className="home-page" aria-label="Home page" style={{ ['--home-hero-image' as string]: `url(${homeImage})` }}>
      <div className="home-page__hero">
        <div className="home-page__overlay" aria-hidden="true" />

        <div className="home-page__content">
          <div className="home-page__eyebrow-row">
            <span className="home-page__bar" aria-hidden="true" />
            <p className="home-page__eyebrow">We are #1 on the market</p>
          </div>

          <h1 className="home-page__headline">
            We&apos;re Here To Help You
            <span className="home-page__script-line">Navigate</span>
            <span className="home-page__headline-strong">While Traveling</span>
          </h1>

          <p className="home-page__subtext">
            You&apos;ll get comprehensive results based on the provided location.
          </p>

          <div className="home-page__search-card" role="search" aria-label="Search places">
            <div className="home-page__search-field">
              <span className="home-page__icon home-page__icon--search" aria-hidden="true" />
              <label className="home-page__field-group">
                <span className="home-page__field-label">What are you looking for?</span>
                <input className="home-page__field-input" type="text" placeholder="Search stays, hotels, apartments" />
              </label>
            </div>

            <div className="home-page__search-divider" aria-hidden="true" />

            <div className="home-page__search-field home-page__search-field--compact">
              <span className="home-page__icon home-page__icon--location" aria-hidden="true" />
              <label className="home-page__field-group">
                <span className="home-page__field-label">Location</span>
                <input className="home-page__field-input" type="text" placeholder="Where to?" />
              </label>
              <span className="home-page__chevron" aria-hidden="true" />
            </div>

            <button className="home-page__search-button" type="button">
              Search places
            </button>
          </div>
        </div>
      </div>

      <section className="home-page__steps" aria-labelledby="best-way-title">
        <div className="home-page__steps-heading">
          <p className="home-page__steps-kicker">Best Way</p>
          <h2 id="best-way-title" className="home-page__steps-title">
            Find Your Dream Place The Best Way
          </h2>
          <p className="home-page__steps-subtitle">
            Discover exciting categories. <span>Find what you’re looking for.</span>
          </p>
        </div>

        <div className="home-page__steps-grid">
          {steps.map((step) => {
            const Icon = step.icon

            return (
              <article key={step.number} className="home-page__step-card">
                <div className="home-page__step-topline">
                  <span className="home-page__step-number">{step.number}</span>
                  <Icon className="home-page__step-icon" aria-hidden="true" />
                </div>

                <h3 className="home-page__step-title">{step.title}</h3>
                <p className="home-page__step-description">{step.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="home-featured" aria-labelledby="featured-title">
        <div className="home-featured__head">
          <p className="home-featured__kicker">Places</p>
          <h2 id="featured-title" className="home-featured__title">Discover Your Favourite Place</h2>
          <p className="home-featured__sub">Discover exciting categories. <span>Find what you’re looking for.</span></p>
        </div>

        <div className="home-featured__wrap">
          <div className="home-featured__viewport">
            <div className="home-featured__track" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
              {pagesData.map((pageItems, pageIndex) => (
                <div key={pageIndex} className="home-featured__grid" style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }}>
                  {pageItems.map((item) => (
                    <ListingCard
                      key={item.id}
                      listing={item}
                      saved={savedFeatured.includes(item.id)}
                      onToggleSave={toggleFeaturedSave}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="home-featured__controls" aria-hidden="false">
            <button className="home-featured__arrow" aria-label="previous" onClick={() => scrollByPage(-1)}>
              <FiChevronLeft />
            </button>
            <div className="home-featured__dots">
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i} className={`home-featured__dot ${i === currentPage ? 'is-active' : ''}`} onClick={() => scrollToPage(i)} />
              ))}
            </div>
            <button className="home-featured__arrow" aria-label="next" onClick={() => scrollByPage(1)}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      </section>

      <section className="home-testimonial" aria-labelledby="testimonial-title">
        <div className="home-testimonial__overlay" aria-hidden="true" />
        <div className="home-testimonial__content">
          <p className="home-testimonial__kicker">{activeTestimonial.kicker}</p>
          <h2 id="testimonial-title" className="home-testimonial__title">
            {activeTestimonial.title}
          </h2>

          <p className="home-testimonial__sub">
            Discover exciting categories. <span>Find what you&apos;re looking for.</span>
          </p>

          <div className="home-testimonial__quote-mark" aria-hidden="true">
            &rdquo;
          </div>

          <p className="home-testimonial__quote">{activeTestimonial.quote}</p>

          <p className="home-testimonial__author">{activeTestimonial.author}</p>

          <div className="home-testimonial__nav">
            <button className="home-testimonial__arrow" type="button" aria-label="previous testimonial" onClick={() => scrollTestimonial(-1)}>
              ←
            </button>
            <button className="home-testimonial__arrow" type="button" aria-label="next testimonial" onClick={() => scrollTestimonial(1)}>
              →
            </button>
          </div>

          <button className="home-testimonial__top" type="button" aria-label="scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            ↑
          </button>
        </div>
      </section>

      <section className="home-articles" aria-labelledby="articles-title">
        <div className="home-articles__head">
          <p className="home-articles__kicker">Our Latest Articles</p>
          <h2 id="articles-title" className="home-articles__title">
            Discover Our Latest News And Articles
          </h2>
          <p className="home-articles__sub">
            Discover exciting categories. <span>Find what you&apos;re looking for.</span>
          </p>
        </div>

        <div className="home-articles__grid">
          {articleItems.map((article) => (
            <article key={article.id} className="home-articles__card">
              <div className="home-articles__media">
                <img src={homeImage} alt="Article preview" style={{ objectPosition: article.imagePosition }} />
                <button className="home-articles__bookmark" type="button" aria-label="bookmark article">
                  <FiArrowRight />
                </button>
              </div>

              <div className="home-articles__body">
                <div className="home-articles__meta">
                  <span>{article.time}</span>
                  <span className="home-articles__divider" aria-hidden="true" />
                  <span className="home-articles__tag">{article.tag}</span>
                </div>

                <h3 className="home-articles__card-title">{article.title}</h3>

                <div className="home-articles__author">
                  <span className="home-articles__avatar" aria-hidden="true">
                    <FiUser />
                  </span>
                  <div>
                    <p className="home-articles__author-name">By {article.author}</p>
                    <p className="home-articles__author-role">{article.role}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </section>
  )
}
