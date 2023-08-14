window.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger")
  const body = document.querySelector("body")
  const modal = document.querySelector("#my-modal")

  burger.addEventListener("click", function() {
    body.classList.toggle("menu-opened")
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
      body.classList.remove("menu-opened")
    }
  })

  window.addEventListener('click', e => {
    const target = e.target

    if (!target.closest('.header__menu') && !target.closest('.burger')) {
      body.classList.remove('menu-opened')
    }

  })

  // -----------------Fancybox-----------------

  Fancybox.bind("[data-fancybox]", {
    // Your custom options
  })

  // Modal: закрыть на esc

  window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
      modal.classList.remove("open")
    }
  })

  // Modal: закрыть кликом вне блока

  modal.addEventListener('click', event => {
    event._isClickWithInModal = true
  })

  modal.addEventListener('click', event => {
    console.log(event._isClickWithInModal)
    if (event._isClickWithInModal) return

    event.currentTarget.classList.remove('open')
  })


  // Подгрузка карточек

  const CARD_TOTAL = 30
  const CARD_LIMIT = 5
  const TOTAL_PAGE = Math.ceil(CARD_TOTAL / CARD_LIMIT)
  const URL = 'https://jsonplaceholder.typicode.com/posts'
  let currentPage = 0

  const btnMore = document.querySelector('.cardspage__button--more')

  const fetchCards = async (page = 0) => {
    const response = await fetch(`${URL}/?_page=${page}&_limit=${CARD_LIMIT}`)
    const result = await response.json()

    return result
  }

  const getRandomArbitrary = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const setCards = (content, cards = []) => {
    const cardsContent = cards.map(({
      userId,
      title,
      body
    }) => {
      return `<article class="card"> <div class="card__image">
        <img
          src="../img/cards/Bitmap(${getRandomArbitrary(0, 9)}).jpg"
          alt="Изображение"
          class="img-responsice"
        />
      </div>
      <div class="card__content">
        <div class="card__tag">
          bridge
        </div>
        <div class="card__title">
          <h3>${title}</h3>
        </div>
        <div class="card__text">
          <p>
           ${body}
          </p>
        </div>
        <div class="card__date">
          <span>Posted by </span>
          <span>Name_${userId}</span>
          <span>, on July 24</span>
        </div>
        <button class="card__button">Continue reading</button>
      </div>
    </article>`
    })

    content.insertAdjacentHTML('beforeend', cardsContent.join(''))
  }

  const checkDisabledBtn = (currentPage) => {
    if (currentPage === TOTAL_PAGE) {
      btnMore.classList.add('is-disabled')

      return null
    }
  }

  const loadMoreCards = async () => {
    const cardsElement = document.querySelector('.js-page')

    currentPage += 1
    try {
      const fetchedCards = await fetchCards(currentPage)

      setCards(cardsElement, fetchedCards)
      checkDisabledBtn(currentPage)
    } catch (error) {
      console.log(error)
    }
  }

  btnMore.addEventListener('click', loadMoreCards)
})