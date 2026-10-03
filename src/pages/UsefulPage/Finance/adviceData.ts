export type LocalizedText = { ru: string; en: string }

export type AdviceCategory = 'careful' | 'curious' | 'brave'

export type AdviceItem = {
  id: string
  emoji: string
  category: AdviceCategory
  title: LocalizedText
  bad: LocalizedText
  good: LocalizedText
  why: LocalizedText
  timkaStory: LocalizedText
}

export const ADVICE_ITEMS: AdviceItem[] = [
  {
    id: 'reserve',
    emoji: '🫙',
    category: 'careful',
    title: { ru: 'Подушка безопасности', en: 'Emergency cushion' },
    bad: {
      ru: '«Отложу, когда получу премию». Премия приходит и находит сто причин исчезнуть.',
      en: '"I will save when I get a bonus." The bonus arrives and finds a hundred reasons to vanish.',
    },
    good: {
      ru: 'В первый день месяца сразу откладывать небольшую фиксированную сумму — до всех трат.',
      en: 'On the first day of the month, move a small fixed amount aside — before any spending.',
    },
    why: {
      ru: 'Три месяца расходов на счету превращают внезапную поломку из катастрофы в мелкое неудобство.',
      en: 'Three months of expenses in the bank turn a sudden breakdown from a catastrophe into a minor inconvenience.',
    },
    timkaStory: {
      ru: 'Тимка прячет любимую игрушечную мышь под диван не от жадности, а чтобы в трудный день достать её и снова мурчать. Денежная заначка дарит такое же кошачье спокойствие.',
      en: 'Timka hides his favorite toy mouse under the couch not out of greed, but to find it on a rainy day and purr again. A money cushion gives the exact same feline peace of mind.',
    },
  },
  {
    id: 'credit',
    emoji: '💳',
    category: 'careful',
    title: { ru: 'Кредит на желание', en: 'A loan for a wish' },
    bad: {
      ru: 'Взять кредит на узкие кроссовки, которые через месяц примелькаются.',
      en: 'Take a loan for trendy sneakers that will feel ordinary in a month.',
    },
    good: {
      ru: 'Сначала накопить на необязательное: если покупка выдерживает паузу, она того стоит.',
      en: 'Save up for optional things first: if the purchase survives a pause, it is worth it.',
    },
    why: {
      ru: 'Кредит прибавляет прошлое к будущему: вещь теряет новизну, а платёж остаётся.',
      en: 'A loan adds your past to your future: the thing loses its shine, but the payment stays.',
    },
    timkaStory: {
      ru: 'Тимка однажды прыгнул за блестящим фантиком на высокий шкаф, не подумав, и просидел там полдня. Теперь он сначала прицеливается, а потом прыгает.',
      en: 'Timka once leapt for a shiny wrapper onto a high cabinet without thinking and was stuck for half a day. Now he aims, thinks twice, and only then jumps.',
    },
  },
  {
    id: 'subscriptions',
    emoji: '🔁',
    category: 'careful',
    title: { ru: 'Забытые подписки', en: 'Forgotten subscriptions' },
    bad: {
      ru: 'Оформлять всё, что предлагает акция, а потом не помнить, за что списывают деньги.',
      en: 'Sign up for everything on promotion, then not remember what the charges are for.',
    },
    good: {
      ru: 'Раз в месяц просматривать список подписок и безжалостно выключать неиспользуемые.',
      en: 'Once a month, review subscriptions and ruthlessly switch off the unused ones.',
    },
    why: {
      ru: 'Мелкие списания коварны: поодиночке незаметны, вместе съедают поездку.',
      en: 'Small charges are sneaky: invisible one by one, together they eat a whole trip.',
    },
    timkaStory: {
      ru: 'Хозяин заказал доставку трёх видов корма, кот выбрал один, а лишние банки копились в шкафу. Проверяй свои подписки так же строго, как кошачью миску!',
      en: 'The human ordered recurring delivery for three foods, the cat liked one, and extra cans piled up in the closet. Audit your recurring fees as strictly as a cat food bowl!',
    },
  },
  {
    id: 'raise',
    emoji: '📈',
    category: 'brave',
    title: { ru: 'Рост дохода', en: 'Growing income' },
    bad: {
      ru: 'Ждать повышения годами и надеяться, что заметят сами.',
      en: 'Wait years for a raise and hope someone notices on their own.',
    },
    good: {
      ru: 'Раз в полгода показывать результат и прямо говорить о пересмотре дохода.',
      en: 'Every six months, show your results and talk directly about revisiting your pay.',
    },
    why: {
      ru: 'Доход растёт у того, кто об этом просит, а не у того, кто терпеливее молчит.',
      en: 'Income grows for those who ask, not for those who stay patient and silent.',
    },
    timkaStory: {
      ru: 'Если тихо сидеть у миски и просто вздыхать — насыпят обычный сухой корм. Но если смело подойти, посмотреть в глаза и сказать уверенное «Мяу!» — дадут вкусный паштет.',
      en: 'If you sit silently by your bowl and sigh, you only get dry kibble. But if you walk up boldly, look into their eyes and say a firm "Meow!" — you get the premium treats.',
    },
  },
  {
    id: 'impulse',
    emoji: '⏳',
    category: 'careful',
    title: { ru: 'Импульсные покупки', en: 'Impulse buys' },
    bad: {
      ru: 'Купить сразу, пока корзина горячая и скидка «только сегодня».',
      en: 'Buy instantly while the cart is hot and the discount is "today only".',
    },
    good: {
      ru: 'Отложить в список желаний на 48 часов. Не вернулся — значит, не нужно.',
      en: 'Move it to a wishlist for 48 hours. If you do not come back, you did not need it.',
    },
    why: {
      ru: 'Желание гаснет быстрее, чем сгорает скидка. Пауза бесплатна, возврат — нет.',
      en: 'The urge fades faster than the discount expires. The pause is free; the return is not.',
    },
    timkaStory: {
      ru: 'Когда курьер приносит свежую коробку, Тимка не прыгает в неё сразу. Он ходит вокруг, принюхивается, и только если интерес не пропал — занимает свой трон.',
      en: 'When the courier drops off a fresh box, Timka does not jump right in. He stalks around, sniffs it, and only takes his throne if it still appeals after a pause.',
    },
  },
  {
    id: 'diversify',
    emoji: '🧺',
    category: 'brave',
    title: { ru: 'Не в одну корзину', en: 'Not one basket' },
    bad: {
      ru: 'Вложить все сбережения в одну «наверняка выгодную» идею по совету знакомого.',
      en: 'Put all savings into one "sure thing" suggested by an acquaintance.',
    },
    good: {
      ru: 'Распределять деньги между вкладами и разными сроками, часть держать в запасе.',
      en: 'Spread money across deposits and different terms, and keep part of it in reserve.',
    },
    why: {
      ru: 'Диверсификация не увеличивает доход сразу, но спасает от единственной ошибки.',
      en: 'Diversification does not boost returns at once, but it saves you from a single mistake.',
    },
    timkaStory: {
      ru: 'Тимка никогда не прячет все вкусняшки в одном месте: одну за шторой, вторую под креслом. Если пылесос найдёт одну — вторая останется в безопасности!',
      en: 'Timka never hides all his treats in one spot: one behind the curtain, another under the armchair. If the vacuum finds one, the other stays safe!',
    },
  },
  {
    id: 'record',
    emoji: '📓',
    category: 'curious',
    title: { ru: 'Учёт трат', en: 'Tracking spending' },
    bad: {
      ru: 'Считать в голове, что «примерно всё под контролем».',
      en: 'Estimate in your head that "everything is roughly under control".',
    },
    good: {
      ru: 'Записывать крупные операции и раз в месяц честно смотреть итог.',
      en: 'Record large transactions and honestly review the total once a month.',
    },
    why: {
      ru: 'Записанные траты спорить не умеют. Осознанность появляется там, где есть цифры.',
      en: 'Written expenses cannot argue. Awareness appears where the numbers are.',
    },
    timkaStory: {
      ru: 'Тимка чётко помнит, сколько раз за день ему выдали лакомство. Никакой человек не сможет обмануть внимательного кота, ведущего точный учёт!',
      en: 'Timka remembers precisely how many treats he received today. No human can fool a vigilant kitten who keeps accurate accounts!',
    },
  },
  {
    id: 'goals',
    emoji: '🎯',
    category: 'curious',
    title: { ru: 'Цель вместо желания', en: 'A goal, not a wish' },
    bad: {
      ru: 'Мечтать «когда-нибудь съездить отдохнуть» и каждый год откладывать это на потом.',
      en: 'Dream of "someday taking a holiday" and postpone it year after year.',
    },
    good: {
      ru: 'Назвать сумму и дату, разделить на месяцы и откладывать эту сумму автоматически.',
      en: 'Name the amount and the date, split it by months, and save that amount automatically.',
    },
    why: {
      ru: 'Желание с датой и цифрой превращается в план, а план уже сам тянет за собой.',
      en: 'A wish with a date and a number turns into a plan, and a plan pulls itself along.',
    },
    timkaStory: {
      ru: '«Хочу на спинку кресла» — это мечта. А «присяду, сделаю толчок задними лапами и запрыгну ровно в 14:00» — это чёткий охотничий план, который всегда срабатывает.',
      en: '"I want to be on the armchair back" is a wish. "Crouch, spring with hind legs and land at 2 PM sharp" is a hunting plan that always lands.',
    },
  },
  {
    id: 'budget-rule',
    emoji: '📊',
    category: 'curious',
    title: { ru: 'Правило 50/30/20', en: 'The 50/30/20 rule' },
    bad: {
      ru: 'Тратить «сколько останется» и удивляться, что к концу месяца денег нет.',
      en: 'Spend "whatever is left" and wonder why there is nothing left by the end of the month.',
    },
    good: {
      ru: 'Делить доход заранее: около половины — обязательное, треть — желания, пятая часть — сбережения.',
      en: 'Split income upfront: about half for needs, a third for wants, a fifth for savings.',
    },
    why: {
      ru: 'Простое правило не требует таблиц и споров, но превращает хаос в понятную структуру.',
      en: 'A simple rule needs no spreadsheets and turns chaos into a clear structure.',
    },
    timkaStory: {
      ru: 'Половина дня — на сон и еду (необходимое), треть — на тыгыдык с мячиком (радость), а остаток — на сидение у окна и накопление сил (кошачий резерв).',
      en: 'Half the day for sleep and food (needs), a third for chasing the toy mouse (fun), and the rest observing the window to build reserves.',
    },
  },
  {
    id: 'debt-order',
    emoji: '🏔️',
    category: 'curious',
    title: { ru: 'Лавина и снежный ком', en: 'Avalanche and snowball' },
    bad: {
      ru: 'Платить понемногу по всем долгам сразу и не видеть, как общий долг уменьшается.',
      en: 'Pay a little on every debt at once and never see the total shrink.',
    },
    good: {
      ru: 'Закрывать долги по порядку: сначала самый дорогой по ставке (лавина) или самый маленький (снежный ком).',
      en: 'Close debts in order: the highest-rate one first (avalanche) or the smallest one first (snowball).',
    },
    why: {
      ru: 'Лавина экономит деньги, снежный ком — силы и мотивацию. Оба работают лучше хаоса.',
      en: 'The avalanche saves money, the snowball saves motivation. Both beat paying blindly.',
    },
    timkaStory: {
      ru: 'Когда нужно распутать клубок шерсти, Тимка либо тянет за самый короткий свободный хвостик, либо распутывает главный узел. Главное — не дёргать всё сразу!',
      en: 'When untangling a yarn ball, Timka either pulls the shortest loose strand or works on the master knot. The rule is never to yank everything at once!',
    },
  },
  {
    id: 'lifestyle',
    emoji: '🎈',
    category: 'careful',
    title: { ru: 'Инфляция образа жизни', en: 'Lifestyle inflation' },
    bad: {
      ru: 'С каждым повышением зарплаты сразу поднимать уровень расходов.',
      en: 'Every time your salary grows, immediately raise your spending to match.',
    },
    good: {
      ru: 'При повышении делить прибавку: часть на радость, часть оставлять в сбережениях.',
      en: 'When your pay rises, split the raise: part for joy, part kept as savings.',
    },
    why: {
      ru: 'Доход может расти годами, а накопления — нет, если всё сразу уходит в новые траты.',
      en: 'Income can grow for years while savings do not, if every rise is spent at once.',
    },
    timkaStory: {
      ru: 'Даже когда Тимке подарили огромный трёхэтажный дворец с когтеточкой, его любимым уголком осталась простая картонная коробка. Дороже не значит счастливее.',
      en: 'Even after getting a three-story cat castle, Timka still happily rested in a simple cardboard box. More expensive does not mean happier.',
    },
  },
  {
    id: 'cash-inflation',
    emoji: '💨',
    category: 'careful',
    title: { ru: 'Деньги под матрасом', en: 'Money under the mattress' },
    bad: {
      ru: 'Держать все сбережения наличными «на всякий случай» много лет.',
      en: 'Keep all your savings in cash "just in case" for years.',
    },
    good: {
      ru: 'Оставлять запас на несколько месяцев, а остальное распределять по вкладам и активам.',
      en: 'Keep an emergency reserve of a few months and place the rest in deposits and assets.',
    },
    why: {
      ru: 'Инфляция незаметно обесценивает наличные: та же сумма покупает всё меньше.',
      en: 'Inflation quietly erodes cash: the same amount buys less and less.',
    },
    timkaStory: {
      ru: 'Забытый под ковром сухарик со временем черствеет и теряет вкус. Точно так же и бумажные купюры под матрасом незаметно теряют силу, если не работают на вкладе.',
      en: 'A piece of kibble left under the rug gets stale and loses its flavor. Cash under a mattress silently loses purchasing power if it is not working in a deposit.',
    },
  },
  {
    id: 'lend-friend',
    emoji: '🤝',
    category: 'careful',
    title: { ru: 'В долг другу', en: 'Lending to a friend' },
    bad: {
      ru: 'Одалживать сумму, которая важна для вас, и обижаться, когда её не вернут.',
      en: 'Lend an amount that matters to you and resent it when it is not returned.',
    },
    good: {
      ru: 'Одалживать только то, что готовы подарить, и обсуждать срок возврата заранее.',
      en: 'Lend only what you would be willing to gift, and agree the repayment date upfront.',
    },
    why: {
      ru: 'Деньги можно вернуть, а испорченные отношения — уже сложнее.',
      en: 'Money can be repaid; a damaged relationship is much harder to repair.',
    },
    timkaStory: {
      ru: 'Тимка делится кормом с соседским псом только тогда, когда сам сыт и готов подарить угощение от чистого сердца, не ожидая взамен его любимую косточку.',
      en: 'Timka only shares food with the neighbor puppy when he is full himself and ready to give freely, without demanding a prized bone back.',
    },
  },
  {
    id: 'learn',
    emoji: '📚',
    category: 'brave',
    title: { ru: 'Инвестиция в знания', en: 'Invest in knowledge' },
    bad: {
      ru: 'Искать «одну схему» быстрого обогащения и верить обещаниям огромной доходности.',
      en: 'Look for the "one scheme" of quick enrichment and trust promises of huge returns.',
    },
    good: {
      ru: 'Разбираться в базовых инструментах и начинать с малого, не вкладывая последнее.',
      en: 'Learn the basics of core instruments and start small, never investing your last money.',
    },
    why: {
      ru: 'Понимание рисков стоит дороже, чем любой тайный сигнал: оно остаётся с вами.',
      en: 'Understanding risk is worth more than any secret tip: it stays with you.',
    },
    timkaStory: {
      ru: 'Каждый день Тимка изучает новые звуки, повадки людей и высоту прыжков. Умение быстро учиться — главный кошачий капитал, который никто не отнимет.',
      en: 'Every day Timka observes human habits and tests new jump angles. The ability to learn quickly is true wealth that no one can ever take away.',
    },
  },
]
