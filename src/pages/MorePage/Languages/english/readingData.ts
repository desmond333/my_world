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
  category: string
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
  {
    id: 'remote-work-async-revolution',
    title: 'The Async Revolution: Why Smart Teams Stopped Meeting',
    titleRu: 'Революция асинхронности: почему умные команды перестали совещаться',
    subtitle: 'How distributed companies replaced the calendar with written culture and deep-work hours.',
    subtitleRu: 'Как распределённые компании заменили календарь письменной культурой и часами глубокой работы.',
    category: 'tech',
    categoryLabel: 'Future of Work & Remote',
    categoryLabelRu: 'Будущее работы и удалёнка',
    level: 'Upper-Intermediate (B2+)',
    readMinutes: 4,
    takeawayRu:
      'Асинхронная работа выигрывает не скоростью ответа, а качеством обдуманных решений и защитой времени для глубокой концентрации.',
    keyVocabulary: [
      {
        term: 'asynchronous',
        transcription: '[eɪˈsɪŋ.krə.nəs]',
        translation: 'асинхронный (без требования мгновенного ответа)',
        contextNote: 'Формат коммуникации, при котором участники отвечают в удобное время, а не в реальном времени.',
      },
      {
        term: 'context switching',
        transcription: '[ˈkɒn.tekst ˈswɪtʃ.ɪŋ]',
        translation: 'переключение контекста (распыление внимания)',
        contextNote: 'Потеря продуктивности при частом переключении между задачами; часто вызывается внезапными созвонами.',
      },
      {
        term: 'deep work',
        transcription: '[diːp wɜːrk]',
        translation: 'глубокая работа (полное погружение)',
        contextNote: 'Термин Кэла Ньюпорта: сосредоточенная когнитивно сложная работа без отвлечений.',
      },
      {
        term: 'single source of truth',
        transcription: '[ˈsɪŋ.ɡl sɔːrs əv truːθ]',
        translation: 'единый источник достоверных данных',
        contextNote: 'Принцип, при котором вся актуальная информация живёт в одном документе, а не рассыпана по чатам.',
      },
      {
        term: 'default to writing',
        transcription: '[dɪˈfɔːlt tə ˈraɪt.ɪŋ]',
        translation: 'выбирать письменную форму по умолчанию',
        contextNote: 'Культурная установка: сначала изложить мысль текстом, а к встрече прибегать лишь при необходимости.',
      },
    ],
    paragraphs: [
      {
        id: 'p1',
        en: 'For decades the modern office treated calendar invitations as a proxy for collaboration. The more meetings a manager scheduled, the busier and apparently more productive the team looked. Remote-first companies were forced to dismantle that illusion almost overnight, and many discovered that constant real-time communication was quietly strangling their best engineers.',
        ru: 'Десятилетиями современный офис считал приглашения в календаре синонимом сотрудничества. Чем больше встреч назначал менеджер, тем занятее и, казалось, продуктивнее выглядела команда. Компании, работающие удалённо, были вынуждены почти мгновенно разрушить эту иллюзию — и многие осознали, что постоянное общение в реальном времени тихо душило их лучших инженеров.',
      },
      {
        id: 'p2',
        en: 'The hidden cost is context switching. Every impromptu call slices the day into fragments too small for demanding intellectual work. Studies of software teams consistently show that a developer needs a substantial uninterrupted block to reach flow, and that a single interruption can erase twenty minutes of momentum. Asynchronous culture simply protects those blocks.',
        ru: 'Скрытая цена — переключение контекста. Каждый незапланированный созвон нарезает день на куски, слишком мелкие для требующей напряжения умственной работы. Исследования команд программистов неизменно показывают: разработчику нужен долгий непрерывный блок времени, чтобы войти в поток, а одно прерывание способно стереть двадцать минут инерции. Асинхронная культура просто защищает такие блоки.',
      },
      {
        id: 'p3',
        en: 'Critics argue that writing everything down is painfully slow. In practice the opposite is true: a well-crafted written proposal scales to twenty readers, can be reviewed on different time zones, and leaves an auditable trail of reasoning. The meeting, by contrast, dissolves the moment it ends, forcing participants to reconstruct decisions from fragile memory.',
        ru: 'Критики возражают, что записывать всё это мучительно медленно. На практике верно обратное: хорошо составленное письменное предложение масштабируется на двадцать читателей, его можно изучить в разных часовых поясах, и оно оставляет проверяемый след рассуждений. Встреча же растворяется в момент завершения, заставляя участников восстанавливать решения по хрупкой памяти.',
      },
      {
        id: 'p4',
        en: 'Asynchronous work is not an excuse to disappear. The discipline demands crystal-clear ownership, a single source of truth for every project, and a ruthless default to writing. Teams that master it rarely look slower from the outside, yet internally they reclaim the one resource no competitor can buy back: undivided attention.',
        ru: 'Асинхронная работа — не повод исчезать. Эта дисциплина требует предельно чёткой ответственности, единого источника достоверных данных по каждому проекту и безжалостной установки по умолчанию писать. Овладевшие ею команды снаружи редко кажутся медленнее, зато внутри возвращают себе ресурс, который не купит ни один конкурент, — безраздельное внимание.',
      },
    ],
  },
  {
    id: 'inflation-consumer-psychology',
    title: 'The Psychology of Inflation: Why Prices Stick',
    titleRu: 'Психология инфляции: почему цены не хотят снижаться',
    subtitle: 'Economists call it downward rigidity; shoppers experience it as the quiet shrinking of everything.',
    subtitleRu: 'Экономисты называют это жёсткостью цен вниз; покупатели ощущают это как тихое уменьшение всего.',
    category: 'press',
    categoryLabel: 'Economics & Markets',
    categoryLabelRu: 'Экономика и рынки',
    level: 'Advanced (C1)',
    readMinutes: 4,
    takeawayRu:
      'Инфляция закрепляется не только деньгами, но и ожиданиями: как только рост цен становится привычным, бизнес и работники начинают закладывать его заранее.',
    keyVocabulary: [
      {
        term: 'downward rigidity',
        transcription: '[ˈdaʊn.wərd rɪˈdʒɪd.ə.ti]',
        translation: 'жёсткость цен в сторону понижения',
        contextNote: 'Склонность цен и зарплат сопротивляться снижению даже при падении спроса.',
      },
      {
        term: 'shrinkflation',
        transcription: '[ʃrɪŋkˈfleɪ.ʃən]',
        translation: 'шринкфляция (уменьшение упаковки при той же цене)',
        contextNote: 'Скрытая форма инфляции: производитель уменьшает объём товара, а не повышает ценник.',
      },
      {
        term: 'anchoring',
        transcription: '[ˈæŋ.kər.ɪŋ]',
        translation: 'эффект якоря (привязка к первому числу)',
        contextNote: 'Когнитивное искажение: первая услышанная цена становится точкой отсчёта для всех дальнейших оценок.',
      },
      {
        term: 'wage-price spiral',
        transcription: '[weɪdʒ praɪs ˈspaɪ.rəl]',
        translation: 'спираль «зарплаты — цены»',
        contextNote: 'Самоусиливающийся цикл: рост цен толкает требования повышения зарплат, что снова разгоняет цены.',
      },
      {
        term: 'entrenched expectations',
        transcription: '[ɪnˈtrentʃt ˌek.spekˈteɪ.ʃənz]',
        translation: 'укоренившиеся ожидания',
        contextNote: 'Убеждения потребителей о будущей инфляции, которые сами становятся двигателем роста цен.',
      },
    ],
    paragraphs: [
      {
        id: 'p1',
        en: 'Central banks can raise interest rates, but they cannot so easily rewire the human mind. When shoppers expect prices to keep climbing, they accelerate purchases; when unions expect the same, they demand larger raises. Both reactions quietly validate the very inflation everyone claims to dread, a feedback loop economists call entrenched expectations.',
        ru: 'Центральные банки могут повышать ставки, но не могут так просто перепрограммировать человеческое сознание. Когда покупатели ждут дальнейшего роста цен, они ускоряют покупки; когда профсоюзы ждут того же, они требуют более крупных повышений. Обе реакции тихо подтверждают ту самую инфляцию, которой все якобы боятся, — петлю обратной связи, которую экономисты называют укоренившимися ожиданиями.',
      },
      {
        id: 'p2',
        en: 'Firms exploit this psychology through a phenomenon now labelled shrinkflation. Rather than risk an attention-grabbing price hike, a manufacturer trims the contents of a package by ten percent while holding the sticker price steady. Consumers notice the missing grams with a vague sense of betrayal, yet the headline inflation statistics barely register the change.',
        ru: 'Компании эксплуатируют эту психологию через явление, которое теперь называют шринкфляцией. Вместо рискованного повышения цены, бросающегося в глаза, производитель урезает содержимое упаковки на десять процентов, сохраняя ценник неизменным. Покупатели замечают недостающие граммы со смутным чувством предательства, но официальная статистика инфляции едва улавливает это.',
      },
      {
        id: 'p3',
        en: 'Prices are also anchored by fairness. A restaurant that slashes wages or a landlord who cuts rent is seen as exploiting weakness, so businesses avoid visible cuts even when demand collapses. This downward rigidity means prices ratchet upward far more easily than they retreat, embedding each crisis into the permanent cost base of the economy.',
        ru: 'Цены удерживает и представление о справедливости. Ресторан, урезающий зарплаты, или арендодатель, снижающий плату, воспринимаются как пользующиеся слабостью, поэтому бизнес избегает заметных снижений даже при обвале спроса. Эта жёсткость вниз означает, что цены взлетают куда легче, чем отступают, впечатывая каждый кризис в постоянную базу издержек экономики.',
      },
      {
        id: 'p4',
        en: 'The practical lesson is uncomfortable: fighting inflation is not merely a matter of tightening money supply. It requires breaking the mental habits that make higher prices feel normal. Until expectations are realigned, every pause in the data will be read not as victory, but as the calm before the next round of increases.',
        ru: 'Практический вывод неудобен: борьба с инфляцией — не просто вопрос ужесточения денежной массы. Она требует сломать ментальные привычки, из-за которых высокие цены кажутся нормой. Пока ожидания не выровнены, любая пауза в данных будет восприниматься не как победа, а как затишье перед следующим витком роста.',
      },
    ],
  },
]
