export type ReadingVocabularyItem = {
  term: string
  transcription: string
  translation: string
  contextNote: string
}

export type ReadingParagraph = {
  id: string
  en: string
  ru: string
}

export type ReadingArticle = {
  id: string
  title: string
  titleRu: string
  subtitle: string
  subtitleRu: string
  category: 'youtube' | 'press' | 'tech'
  categoryLabel: string
  categoryLabelRu: string
  level: string
  readMinutes: number
  paragraphs: ReadingParagraph[]
  keyVocabulary: ReadingVocabularyItem[]
  takeawayRu: string
}

export const READING_ARTICLES: ReadingArticle[] = [
  {
    id: 'dopamine-attention-economy',
    title: 'The Dopamine Loop: Why We Can’t Stop Scrolling',
    titleRu: 'Дофаминовая петля: почему мы не можем перестать скроллить',
    subtitle: 'How modern recommendation algorithms exploit intermittent rewards and rewire human attention.',
    subtitleRu: 'Как современные алгоритмы рекомендаций используют случайные вознаграждения и перестраивают фокус внимания.',
    category: 'youtube',
    categoryLabel: 'YouTube Essay & Science',
    categoryLabelRu: 'YouTube-эссе и наука',
    level: 'Upper-Intermediate (B2+)',
    readMinutes: 4,
    takeawayRu: 'Алгоритмы эксплуатируют биологическую тягу к неизвестности. Осознание триггеров возвращает контроль над вниманием.',
    keyVocabulary: [
      {
        term: 'intermittent reward',
        transcription: '[ˌɪntərˈmɪtənt rɪˈwɔːrd]',
        translation: 'нерегулярное (случайное) вознаграждение',
        contextNote: 'Главный механизм удержания в соцсетях и казино: мозг не знает, когда выпадет приз, поэтому продолжает действие.',
      },
      {
        term: 'cognitive overload',
        transcription: '[ˈkɑːɡnətɪv ˈoʊvərˌloʊd]',
        translation: 'когнитивная перегрузка',
        contextNote: 'Состояние, когда мозг получает больше входящих стимулов, чем способен качественно переработать.',
      },
      {
        term: 'at the end of the day',
        transcription: '[æt ði ɛnd əv ðə deɪ]',
        translation: 'в конечном счёте / в сухом остатке',
        contextNote: 'Популярнейшая связка в подкастах и интервью для подведения ключевого итога рассуждения.',
      },
      {
        term: 'downward spiral',
        transcription: '[ˈdaʊnwərd ˈspaɪrəl]',
        translation: 'нисходящая спираль (цепная реакция ухудшения)',
        contextNote: 'Процесс, когда одно негативное действие (усталость) ведет к другому (бессмысленный скроллинг до ночи).',
      },
      {
        term: 'deep work',
        transcription: '[diːp wɜːrk]',
        translation: 'глубокая сфокусированная работа без отвлечений',
        contextNote: 'Термин Кэла Ньюпорта, ключевой навык современного интеллектуального труда.',
      },
    ],
    paragraphs: [
      {
        id: 'p1',
        en: 'Have you ever picked up your phone intending to quickly check the weather, only to find yourself forty minutes later watching strangers assemble miniature mechanical keyboards? If this sounds painfully familiar, you are not suffering from a lack of willpower. Rather, you are navigating an information ecosystem specifically engineered to hijack your neurochemistry.',
        ru: 'Вы когда-нибудь брали в руки телефон, намереваясь просто глянуть погоду, и обнаруживали себя сорок минут спустя смотрящим, как незнакомцы собирают миниатюрные механические клавиатуры? Если это звучит до боли знакомо, дело вовсе не в отсутствии силы воли. Вы столкнулись с информационной экосистемой, спроектированной для перехвата вашей нейрохимии.',
      },
      {
        id: 'p2',
        en: 'At the heart of modern feed architecture lies a psychological mechanism known as the variable intermittent reward schedule. Originally uncovered by B.F. Skinner in experiments with pigeons, this principle reveals a striking biological vulnerability: creatures become far more hooked when rewards are unpredictable. Every swipe down to refresh is functionally identical to pulling the lever on a Las Vegas slot machine.',
        ru: 'В основе архитектуры современных лент лежит психологический механизм, известный как режим нерегулярного случайного вознаграждения. Открытый Б.Ф. Скиннером в опытах с голубями, этот принцип обнажает уязвимость биологии: живые существа подсаживаются гораздо сильнее, когда награда непредсказуема. Каждый свайп для обновления ленты функционально идентичен рычагу игрового автомата в Вегасе.',
      },
      {
        id: 'p3',
        en: 'The collateral damage of this constant stimulation is severe cognitive overload. When our brains are continually forced to context-switch between fifteen-second video clips, our capacity for sustained reflection atrophies. We trick ourselves into believing we are multi-tasking, but neuroscience tells us otherwise: we are merely paying a heavy switching cost that drains our glucose reserves.',
        ru: 'Сопутствующий ущерб от этой постоянной стимуляции — тяжелая когнитивная перегрузка. Когда наш мозг вынужден непрерывно переключать контекст между 15-секундными роликами, способность к длительной концентрации атрофируется. Мы внушаем себе, что многозадачны, но нейробиология утверждает обратное: мы лишь платим высокую цену за переключения, истощая запасы энергии.',
      },
      {
        id: 'p4',
        en: 'At the end of the day, reclaiming our attention does not require abandoning technology altogether. It starts with setting deliberate digital friction: removing algorithmic feeds from our home screens, scheduling dedicated blocks for deep work, and recognizing that boredom is not a flaw to be cured, but the necessary fertile ground for original thought.',
        ru: 'В конечном счёте, возвращение контроля над вниманием не требует полного отказа от технологий. Всё начинается с создания осознанного барьера: убрать алгоритмические ленты с главного экрана, выделить жесткие блоки для глубокой сфокусированной работы и осознать, что скука — это не дефект, который нужно глушить, а питательная почва для оригинальных идей.',
      },
    ],
  },
  {
    id: 'silicon-race-ai-infrastructure',
    title: 'The Trillion-Dollar Silicon Race: Behind the AI Infrastructure Boom',
    titleRu: 'Гонка чипов на триллион долларов: что скрывается за бумом ИИ-инфраструктуры',
    subtitle: 'Inside the massive CapEx battle between tech hyperscalers and the realities of the global electrical grid.',
    subtitleRu: 'Разбор гигантской битвы капитальных затрат между техгигантами и ограничений мировой энергосети.',
    category: 'press',
    categoryLabel: 'WSJ & Bloomberg Style',
    categoryLabelRu: 'Пресса: стиль WSJ и Bloomberg',
    level: 'Advanced (C1)',
    readMinutes: 5,
    takeawayRu:
      'Инфраструктурная гонка ИИ упирается не только в поставку чипов, но и в физические мощности энергосетей и окупаемость инвестиций.',
    keyVocabulary: [
      {
        term: 'capital expenditure (CapEx)',
        transcription: '[ˈkæpɪtl ɪkˈspɛndɪtʃər]',
        translation: 'капитальные расходы компании',
        contextNote: 'Инвестиции в физические активы (серверные фермы, кремниевые чипы, дата-центры).',
      },
      {
        term: 'bear the brunt',
        transcription: '[bɛr ðə brʌnt]',
        translation: 'принять на себя главный удар',
        contextNote: 'Устойчивое выражение в экономической прессе, когда кто-то испытывает наибольшую тяжесть кризиса.',
      },
      {
        term: 'unprecedented bottleneck',
        transcription: '[ʌnˈprɛsɪdɛntɪd ˈbɑːtlˌnɛk]',
        translation: 'беспрецедентное узкое место (затор)',
        contextNote: 'Фактор, который сдерживает рост всей системы (дефицит мощностей, чипов или охлаждения).',
      },
      {
        term: 'bottom line',
        transcription: '[ˈbɑːtəm laɪn]',
        translation: 'итоговая чистая прибыль / ключевой финансовый результат',
        contextNote: 'Последняя строка в финансовом отчёте; в широком смысле — главное условие рентабельности.',
      },
      {
        term: 'pivotal role',
        transcription: '[ˈpɪvətl roʊl]',
        translation: 'ключевая / решающая роль',
        contextNote: 'Используется для выделения центрального фактора успеха или провала стратегии.',
      },
    ],
    paragraphs: [
      {
        id: 'p1',
        en: 'From Redmond to Mountain View, Silicon Valley is pouring capital into semiconductor hardware at an unprecedented pace. The world’s leading hyperscalers have collectively committed over one hundred billion dollars in annual capital expenditures, betting their corporate futures on generative foundation models and high-throughput data centers.',
        ru: 'От Редмонда до Маунтин-Вью Кремниевая долина вливает капиталы в полупроводниковое железо с беспрецедентной скоростью. Ведущие мировые гиперскейлеры совокупно направили более ста миллиардов долларов в годовые капитальные затраты, ставя корпоративное будущее на генеративные базовые модели и дата-центры высокой пропускной способности.',
      },
      {
        id: 'p2',
        en: 'Yet beneath the headline-grabbing market capitalizations, the infrastructure race is colliding with an unexpected physical barrier: the power grid. Training the next frontier of multimodal networks requires gigawatts of reliable electrical capacity. Regional power utilities are already struggling to keep up with transformer delivery lead times, meaning that electricity, rather than chip availability, may soon become the decisive bottleneck.',
        ru: 'Однако под громкими заголовками о рыночной капитализации гонка инфраструктуры сталкивается с неожиданным физическим барьером: электросетью. Обучение следующего поколения мультимодальных сетей требует гигаваттов стабильной энергии. Региональные энергетические компании уже не справляются со сроками поставок трансформаторов, что означает: именно электричество, а не доступность чипов, вскоре станет решающим ограничением.',
      },
      {
        id: 'p3',
        en: 'Wall Street analysts are increasingly asking when these astronomical investments will directly improve corporate bottom lines. While chip designers and cloud providers are logging record quarterly revenues, software application developers bear the brunt of thin operating margins, as enterprise customers demand undeniable return on investment before greenlighting multi-million-dollar AI contracts.',
        ru: 'Аналитики с Уолл-стрит всё чаще задаются вопросом, когда эти астрономические вложения напрямую улучшат чистую прибыль компаний. В то время как разработчики микросхем и облачные провайдеры фиксируют рекордные квартальные доходы, создатели прикладного ПО несут на себе удар низкой маржинальности, поскольку корпоративные клиенты требуют доказанной окупаемости перед подписанием многомиллионных контрактов.',
      },
      {
        id: 'p4',
        en: 'History reminds us that during railway and telecommunications booms, the entities that constructed the foundational physical conduits rarely captured all the terminal value. Whether the current computing gold rush leads to durable economic productivity or a sharp reckoning remains the defining corporate narrative of the decade.',
        ru: 'История напоминает: во времена железнодорожных и телекоммуникационных бумов компании, строившие базовую физическую инфраструктуру, редко забирали себе всю конечную ценность. Приведет ли текущая вычислительная золотая лихорадка к устойчивому росту производительности или к жесткому отрезвлению — главный экономический вопрос десятилетия.',
      },
    ],
  },
  {
    id: 'startup-pivot-playbook',
    title: 'The Pivot Playbook: Navigating the Trough of Sorrow',
    titleRu: 'Книга разворотов: как стартапы проходят через долину отчаяния',
    subtitle: 'Why most ventures fail before product-market fit, and how great founders separate noise from true traction.',
    subtitleRu: 'Почему большинство проектов гибнет до соответствия рынку и как сильные фаундеры отличают шум от реальной тяги.',
    category: 'tech',
    categoryLabel: 'Silicon Valley & Founders',
    categoryLabelRu: 'Кремниевая долина и стартапы',
    level: 'Advanced (B2–C1)',
    readMinutes: 4,
    takeawayRu: 'Слежка за тщеславными метриками губительна. Единственный ориентир — когортное удержание реальных пользователей.',
    keyVocabulary: [
      {
        term: 'product-market fit (PMF)',
        transcription: '[ˈprɑːdʌkt ˈmɑːrkɪt fɪt]',
        translation: 'соответствие продукта рынку',
        contextNote: 'Священный грааль стартапов: когда продукт настолько нужен целевой аудитории, что спрос опережает предложение.',
      },
      {
        term: 'runway',
        transcription: '[ˈrʌnweɪ]',
        translation: 'взлетно-посадочная полоса (запас времени до банкротства)',
        contextNote: 'Количество месяцев, которое стартап может прожить на имеющиеся деньги при текущей скорости их сжигания.',
      },
      {
        term: 'double down',
        transcription: '[ˈdʌbl daʊn]',
        translation: 'удвоить усилия / сделать крупную ставку на то, что работает',
        contextNote: 'Термин из блэкджека, ставший стандартом в речи американских предпринимателей и инвесторов.',
      },
      {
        term: 'trough of sorrow',
        transcription: '[trɔːf əv ˈsɑːroʊ]',
        translation: 'яма (долина) отчаяния',
        contextNote: 'Период после первоначального хайпа при запуске, когда метрики падают и команде нужно упорно пересобирать продукт.',
      },
      {
        term: 'vanity metric',
        transcription: '[ˈvænəti ˈmɛtrɪk]',
        translation: 'метрика тщеславия (обманчивый показатель)',
        contextNote:
          'Показатели вроде общего числа регистраций или просмотров страниц, которые красиво выглядят в презентации, но не отражают реальный бизнес.',
      },
    ],
    paragraphs: [
      {
        id: 'p1',
        en: 'Every aspiring entrepreneur knows the romanticized myth of Silicon Valley: two friends scribble code in a rented garage, launch a landing page on Hacker News, and experience instant viral growth. In reality, nearly every household brand — from Slack to YouTube to Instagram — originated from a desperate strategic pivot when their initial hypothesis completely disintegrated.',
        ru: 'Каждый начинающий предприниматель знает романтизированный миф Кремниевой долины: двое друзей пишут код в гараже, выкладывают сайт на Hacker News и мгновенно становятся вирусными. В реальности же практически каждый культовый бренд — от Slack до YouTube и Instagram — родился из отчаянного разворота стратегии, когда их первоначальная гипотеза с треском провалилась.',
      },
      {
        id: 'p2',
        en: 'Paul Graham famously coined the term "the trough of sorrow" to describe the painful phase after the initial launch spike fades. Press interest evaporates, user acquisition slows to a crawl, and the bank balance steadily shrinks. At this crossroads, amateur founders fall into the trap of obsessing over vanity metrics, celebrating sign-up counts while quietly ignoring catastrophic churn rates.',
        ru: 'Пол Грэм ввел знаменитый термин «долина отчаяния», описывая болезненную фазу после угасания первоначального ажиотажа. Внимание прессы испаряется, приток пользователей замедляется до нуля, а банковский счет неумолимо тает. На этом перепутье неопытные фаундеры попадают в ловушку метрик тщеславия — радуются общему числу регистраций, игнорируя катастрофический отток пользователей.',
      },
      {
        id: 'p3',
        en: 'The founders who survive understand that honest customer discovery is the only antidote to failure. When Stewart Butterfield realized that his multiplayer game Glitch was commercially unviable, he didn’t double down on marketing gimmicks. Instead, he observed how obsessively his internal engineering team relied on their homegrown IRC communication tool. That humble utility was salvaged, polished, and rebranded as Slack.',
        ru: 'Выживающие фаундеры понимают: честное исследование клиентов — единственное противоядие против гибели. Когда Стюарт Баттерфилд понял, что его многопользовательская игра Glitch коммерчески нежизнеспособна, он не стал удваивать ставки на маркетинг. Вместо этого он заметил, насколько фанатично инженеры внутри команды использовали самодельный чат для переписки. Эту скромную утилиту сохранили, отполировали и превратили в Slack.',
      },
      {
        id: 'p4',
        en: 'Finding product-market fit is rarely an instantaneous lightning bolt of inspiration. It is an iterative endurance sport of killing your darlings, preserving your remaining cash runway, and relentlessly listening to the small minority of power users who genuinely cannot live without your solution.',
        ru: 'Обретение соответствия продукта рынку редко похоже на мгновенную вспышку озарения. Это итеративный марафон на выносливость: умение безжалостно отказываться от любимых неработающих идей, беречь финансовый запас времени и чутко прислушиваться к тем немногим постоянным пользователям, которые искренне не могут обойтись без вашего решения.',
      },
    ],
  },
]
