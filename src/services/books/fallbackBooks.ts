import type { CollectionDetails, SearchCandidate } from '../../data'

export type FallbackBook = SearchCandidate & {
  details: CollectionDetails
}

export const FALLBACK_BOOKS: FallbackBook[] = [
  {
    id: 'master-i-margarita',
    title: 'Мастер и Маргарита',
    subtitle: 'Михаил Булгаков',
    description:
      'Культовый роман об инфернальном визите Воланда в Москву тридцатых годов, о великой любви Мастера и Маргариты и о суде над Иешуа Га-Ноцри.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    year: 1967,
    tags: ['Классика', 'Мистика', 'Роман'],
    score: '4.9',
    details: {
      tagline: 'Рукописи не горят',
      facts: [
        { label: 'Автор', value: 'Михаил Булгаков' },
        { label: 'Год написания', value: '1940' },
        { label: 'Жанры', value: 'Классика, Мистика, Сатира' },
        { label: 'Язык', value: 'Русский' },
        { label: 'Страниц', value: '480' },
        { label: 'Рейтинг', value: '★ 4.9' },
      ],
      overview:
        'В Москве тридцатых годов появляется таинственный иностранец Воланд со свитой. В городе начинается череда необъяснимых происшествий, в то время как Маргарита готова продать душу дьяволу ради спасения Мастера.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=master-i-margarita' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Мастер_и_Маргарита' },
      ],
    },
  },
  {
    id: 'crime-and-punishment',
    title: 'Преступление и наказание',
    subtitle: 'Фёдор Достоевский',
    description:
      'Психологический детектив о петербургском студенте Родионе Раскольникове, решившем проверить теорию о праве сильной личности переступить закон.',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    year: 1866,
    tags: ['Классика', 'Драма', 'Психология'],
    score: '4.8',
    details: {
      tagline: 'Тварь ли я дрожащая или право имею?',
      facts: [
        { label: 'Автор', value: 'Фёдор Достоевский' },
        { label: 'Год издания', value: '1866' },
        { label: 'Жанры', value: 'Классика, Психологический роман, Драма' },
        { label: 'Язык', value: 'Русский' },
        { label: 'Страниц', value: '576' },
        { label: 'Рейтинг', value: '★ 4.8' },
      ],
      overview:
        'Родион Раскольников совершает убийство процентщицы ради великих целей. Но груз содеянного и муки совести оказываются несоизмеримо тяжелее любых умозрительных теорий.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=crime-and-punishment' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Преступление_и_наказание' },
      ],
    },
  },
  {
    id: '1984-george-orwell',
    title: '1984',
    subtitle: 'Джордж Оруэлл',
    description: 'Антиутопия о тотальном контроле, Большом Брате, полиции мыслей и министерстве правды в вымышленном государстве Океания.',
    imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=500&auto=format&fit=crop&q=80',
    year: 1949,
    tags: ['Антиутопия', 'Фантастика', 'Философия'],
    score: '4.8',
    details: {
      tagline: 'Большой Брат смотрит на тебя',
      facts: [
        { label: 'Автор', value: 'Джордж Оруэлл' },
        { label: 'Год издания', value: '1949' },
        { label: 'Жанры', value: 'Антиутопия, Фантастика, Социальная проза' },
        { label: 'Язык оригинала', value: 'Английский' },
        { label: 'Страниц', value: '320' },
        { label: 'Рейтинг', value: '★ 4.8' },
      ],
      overview:
        'Уинстон Смит работает в Министерстве правды и занимается непрерывным переписыванием истории. В глубине души он ненавидит партийный режим и пытается найти единомышленников.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=1984-orwell' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/1984_(роман)' },
      ],
    },
  },
  {
    id: 'war-and-peace',
    title: 'Война и мир',
    subtitle: 'Лев Толстой',
    description: 'Грандиозная эпопея, описывающая русское общество в эпоху войн против Наполеона с 1805 по 1812 годы.',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
    year: 1869,
    tags: ['Классика', 'История', 'Эпопея'],
    score: '4.7',
    details: {
      tagline: 'Жизнь народа и судьбы человечества в переломную эпоху',
      facts: [
        { label: 'Автор', value: 'Лев Толстой' },
        { label: 'Год издания', value: '1869' },
        { label: 'Жанры', value: 'Роман-эпопея, Исторический роман, Классика' },
        { label: 'Язык', value: 'Русский' },
        { label: 'Страниц', value: '1300' },
        { label: 'Рейтинг', value: '★ 4.7' },
      ],
      overview:
        'Сплетение сотен судеб — Андрея Болконского, Пьера Безухова, Наташи Ростовой — на фоне великих исторических битв и мира русской усадьбы.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=war-and-peace' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Война_и_мир' },
      ],
    },
  },
  {
    id: 'flowers-for-algernon',
    title: 'Цветы для Элджернона',
    subtitle: 'Дэниел Киз',
    description:
      'Трогательная история умственно отсталого Чарли Гордона, над которым проводят смелый медицинский эксперимент по повышению интеллекта.',
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80',
    year: 1966,
    tags: ['Фантастика', 'Драма', 'Психология'],
    score: '4.9',
    details: {
      tagline: 'Положите цветы на могилу Элджернона на заднем дворе',
      facts: [
        { label: 'Автор', value: 'Дэниел Киз' },
        { label: 'Год издания', value: '1966' },
        { label: 'Жанры', value: 'Научная фантастика, Драма, Психология' },
        { label: 'Язык оригинала', value: 'Английский' },
        { label: 'Страниц', value: '312' },
        { label: 'Рейтинг', value: '★ 4.9' },
      ],
      overview:
        'Чарли Гордон соглашается на операцию мозга вслед за лабораторной мышью Элджерноном. Его интеллект начинает стремительно расти, открывая правду о мире и друзьях.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=flowers-for-algernon' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Цветы_для_Элджернона' },
      ],
    },
  },
  {
    id: 'the-little-prince',
    title: 'Маленький принц',
    subtitle: 'Антуан де Сент-Экзюпери',
    description: 'Философская сказка о мальчике с далекого астероида, его Розе, Лисе и самом главном, чего глазами не увидишь.',
    imageUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=80',
    year: 1943,
    tags: ['Сказка', 'Философия', 'Классика'],
    score: '4.9',
    details: {
      tagline: 'Зорко одно лишь сердце. Самого главного глазами не увидишь',
      facts: [
        { label: 'Автор', value: 'Антуан де Сент-Экзюпери' },
        { label: 'Год издания', value: '1943' },
        { label: 'Жанры', value: 'Философская притча, Сказка, Классика' },
        { label: 'Язык оригинала', value: 'Французский' },
        { label: 'Страниц', value: '112' },
        { label: 'Рейтинг', value: '★ 4.9' },
      ],
      overview:
        'Летчик совершает вынужденную посадку в пустыне Сахара и встречает необыкновенного мальчика — Маленького принца, прилетевшего с другой планеты.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=the-little-prince' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Маленький_принц' },
      ],
    },
  },
  {
    id: 'harry-potter-philosophers-stone',
    title: 'Гарри Поттер и философский камень',
    subtitle: 'Дж. К. Роулинг',
    description:
      'Одиннадцатилетний сирота Гарри Поттер узнает, что он волшебник, и отправляется учиться в школу чародейства и волшебства Хогвартс.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    year: 1997,
    tags: ['Фэнтези', 'Приключения'],
    score: '4.8',
    details: {
      tagline: 'Путешествие в мир волшебства начинается',
      facts: [
        { label: 'Автор', value: 'Дж. К. Роулинг' },
        { label: 'Год издания', value: '1997' },
        { label: 'Жанры', value: 'Фэнтези, Приключения' },
        { label: 'Язык оригинала', value: 'Английский' },
        { label: 'Страниц', value: '432' },
        { label: 'Рейтинг', value: '★ 4.8' },
      ],
      overview:
        'Обычная жизнь Гарри Поттера в чулане под лестницей заканчивается с письмом из Хогвартса. Впереди тайны замка, верные друзья и схватка со злом.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=harry-potter-1' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Гарри_Поттер_и_философский_камень' },
      ],
    },
  },
  {
    id: 'the-lord-of-the-rings-fellowship',
    title: 'Властелин колец: Братство Кольца',
    subtitle: 'Дж. Р. Р. Толкин',
    description:
      'Хоббит Фродо Бэггинс получает Единое Кольцо Всевластия и вместе с верными спутниками отправляется в смертельно опасный путь к Роковой Горе.',
    imageUrl: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?w=500&auto=format&fit=crop&q=80',
    year: 1954,
    tags: ['Фэнтези', 'Приключения', 'Эпопея'],
    score: '4.9',
    details: {
      tagline: 'Одно Кольцо, чтоб править всеми',
      facts: [
        { label: 'Автор', value: 'Дж. Р. Р. Толкин' },
        { label: 'Год издания', value: '1954' },
        { label: 'Жанры', value: 'Эпическое фэнтези, Приключения' },
        { label: 'Язык оригинала', value: 'Английский' },
        { label: 'Страниц', value: '528' },
        { label: 'Рейтинг', value: '★ 4.9' },
      ],
      overview:
        'Темный Властелин Саурон стремится подчинить все народы Средиземья. Спасти мир может лишь уничтожение Кольца Всевластия в огне Роковой Горы Мордора.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=lord-of-rings' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Братство_Кольца' },
      ],
    },
  },
  {
    id: 'dune-frank-herbert',
    title: 'Дюна',
    subtitle: 'Фрэнк Герберт',
    description:
      'Песчаная планета Арракис — единственный источник драгоценной пряности спайса во Вселенной. Юному Полу Атрейдесу предстоит стать мессией вольных фрименов.',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=80',
    year: 1965,
    tags: ['Фантастика', 'Приключения'],
    score: '4.8',
    details: {
      tagline: 'Тот, кто управляет пряностью, управляет Вселенной',
      facts: [
        { label: 'Автор', value: 'Фрэнк Герберт' },
        { label: 'Год издания', value: '1965' },
        { label: 'Жанры', value: 'Космическая фантастика, Политика' },
        { label: 'Язык оригинала', value: 'Английский' },
        { label: 'Страниц', value: '704' },
        { label: 'Рейтинг', value: '★ 4.8' },
      ],
      overview:
        'Дом Атрейдесов получает во владение пустынный Арракис. Предательство императора и коварных Харконненов ставит Пола на путь судьбоносной битвы.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=dune-herbert' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Дюна_(роман)' },
      ],
    },
  },
  {
    id: 'martin-eden',
    title: 'Мартин Иден',
    subtitle: 'Джек Лондон',
    description:
      'История простого матроса, который силой несгибаемой воли и непреклонного труда преодолевает пропасть между нищетой и мировой писательской славой.',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=80',
    year: 1909,
    tags: ['Классика', 'Драма', 'Биография'],
    score: '4.8',
    details: {
      tagline: 'Человек делает себя сам',
      facts: [
        { label: 'Автор', value: 'Джек Лондон' },
        { label: 'Год издания', value: '1909' },
        { label: 'Жанры', value: 'Классика, Драма, Роман воспитания' },
        { label: 'Язык оригинала', value: 'Английский' },
        { label: 'Страниц', value: '448' },
        { label: 'Рейтинг', value: '★ 4.8' },
      ],
      overview:
        'Влюбившись в девушку из высшего общества Руфь Морз, необразованный матрос Мартин Иден решает стать писателем. Но достигнув триумфа, он понимает пустоту высшего света.',
      links: [
        { label: 'Google Книги', href: 'https://books.google.ru/books?id=martin-eden' },
        { label: 'Википедия', href: 'https://ru.wikipedia.org/wiki/Мартин_Иден' },
      ],
    },
  },
]

export const searchFallbackBooks = (query: string): SearchCandidate[] => {
  const q = query.trim().toLowerCase()
  if (!q) return FALLBACK_BOOKS.slice(0, 8)
  return FALLBACK_BOOKS.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.subtitle.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)),
  )
}

export const getFallbackBookDetails = (id: string): CollectionDetails | null => {
  const found = FALLBACK_BOOKS.find((b) => b.id === id)
  return found ? found.details : null
}
