import type { ReadingArticle } from '../english/readingData'

export const BASIC_READING_CATEGORIES = [
  { id: 'story', label: '📖 Простая история' },
  { id: 'dialogue', label: '💬 Диалог' },
  { id: 'everyday', label: '🏠 Каждый день' },
]

export const BASIC_READING_ARTICLES: ReadingArticle[] = [
  {
    id: 'my-day',
    title: 'My Day',
    titleRu: 'Мой день',
    subtitle: 'A very short text about a normal morning.',
    subtitleRu: 'Очень короткий текст об обычном утре.',
    category: 'everyday',
    categoryLabel: 'Everyday English',
    categoryLabelRu: 'Повседневный английский',
    level: 'Beginner (A1)',
    readMinutes: 2,
    takeawayRu:
      'В простом рассказе о дне используются глаголы в настоящем времени и слова-маркеры времени: in the morning, then, at night.',
    keyVocabulary: [
      { term: 'wake up', transcription: '[weɪk ʌp]', translation: 'просыпаться', contextNote: 'Фразовый глагол. I wake up at seven.' },
      {
        term: 'breakfast',
        transcription: '[ˈbrekfəst]',
        translation: 'завтрак',
        contextNote: 'Исчисляемое и неисчисляемое: have breakfast / a big breakfast.',
      },
      { term: 'work', transcription: '[wɜːrk]', translation: 'работа / работать', contextNote: 'Go to work — идти на работу.' },
      { term: 'sleep', transcription: '[sliːp]', translation: 'спать / сон', contextNote: 'Go to sleep — ложиться спать.' },
    ],
    paragraphs: [
      {
        id: 'p1',
        en: 'I wake up at seven in the morning. I open the window and drink a glass of water.',
        ru: 'Я просыпаюсь в семь утра. Я открываю окно и выпиваю стакан воды.',
      },
      {
        id: 'p2',
        en: 'Then I have breakfast. I eat bread and cheese, and I drink tea. After breakfast I go to work.',
        ru: 'Потом я завтракаю. Я ем хлеб с сыром и пью чай. После завтрака я иду на работу.',
      },
      {
        id: 'p3',
        en: 'In the evening I come home and cook dinner. At night I read a book and go to sleep at eleven.',
        ru: 'Вечером я прихожу домой и готовлю ужин. Ночью я читаю книгу и ложусь спать в одиннадцать.',
      },
    ],
  },
  {
    id: 'at-the-cafe',
    title: 'At the Café',
    titleRu: 'В кафе',
    subtitle: 'A short dialogue between a customer and a waiter.',
    subtitleRu: 'Короткий диалог между посетителем и официантом.',
    category: 'dialogue',
    categoryLabel: 'Dialogue',
    categoryLabelRu: 'Диалог',
    level: 'Beginner (A1)',
    readMinutes: 2,
    takeawayRu: 'Вежливые фразы I would like и Can I have… звучат естественнее, чем прямое «I want».',
    keyVocabulary: [
      { term: 'I would like', transcription: '[aɪ wʊd laɪk]', translation: 'я хотел бы', contextNote: 'Вежливая форма для заказа.' },
      { term: 'menu', transcription: '[ˈmenjuː]', translation: 'меню', contextNote: 'Can I see the menu?' },
      { term: 'bill', transcription: '[bɪl]', translation: 'счёт', contextNote: 'В США часто говорят check.' },
      {
        term: 'anything else',
        transcription: '[ˈeniθɪŋ els]',
        translation: 'что-нибудь ещё',
        contextNote: 'Стандартный вопрос официанта.',
      },
    ],
    paragraphs: [
      {
        id: 'p1',
        en: 'Waiter: Good afternoon! Can I help you? Customer: Yes, I would like a cup of coffee, please.',
        ru: 'Официант: Добрый день! Могу я помочь? Посетитель: Да, я хотел бы чашку кофе, пожалуйста.',
      },
      {
        id: 'p2',
        en: 'Waiter: Anything else? Customer: Yes, a piece of cake, please. How much is it?',
        ru: 'Официант: Что-нибудь ещё? Посетитель: Да, кусочек торта, пожалуйста. Сколько это стоит?',
      },
      {
        id: 'p3',
        en: 'Waiter: That is eight dollars. Customer: Here you are. Thank you! Waiter: Thank you, have a nice day!',
        ru: 'Официант: Восемь долларов. Посетитель: Вот, возьмите. Спасибо! Официант: Спасибо, хорошего дня!',
      },
    ],
  },
  {
    id: 'a-new-friend',
    title: 'A New Friend',
    titleRu: 'Новый друг',
    subtitle: 'Two students meet on the first day of class.',
    subtitleRu: 'Два студента знакомятся в первый день занятий.',
    category: 'story',
    categoryLabel: 'Simple Story',
    categoryLabelRu: 'Простая история',
    level: 'Beginner (A1–A2)',
    readMinutes: 2,
    takeawayRu: 'Для знакомства хватает трёх вопросов: имя, откуда ты, что любишь.',
    keyVocabulary: [
      {
        term: 'nice to meet you',
        transcription: '[naɪs tə miːt juː]',
        translation: 'приятно познакомиться',
        contextNote: 'Говорят при первом знакомстве.',
      },
      { term: 'from', transcription: '[frəm]', translation: 'из / откуда-то', contextNote: 'I am from Georgia.' },
      { term: 'study', transcription: '[ˈstʌdi]', translation: 'учиться / изучать', contextNote: 'I study English.' },
      { term: 'together', transcription: '[təˈɡeðər]', translation: 'вместе', contextNote: 'We study together.' },
    ],
    paragraphs: [
      {
        id: 'p1',
        en: 'On Monday, two students sit next to each other. "Hello, my name is Lika. What is your name?"',
        ru: 'В понедельник двое студентов сидят рядом. «Привет, меня зовут Лика. Как тебя зовут?»',
      },
      {
        id: 'p2',
        en: '"I am Tom. Nice to meet you, Lika." "Nice to meet you too. Where are you from?"',
        ru: '«Я Том. Приятно познакомиться, Лика». «Мне тоже приятно. Откуда ты?»',
      },
      {
        id: 'p3',
        en: '"I am from London. And you?" "I am from Tbilisi. Do you study English here?" "Yes, I do. Let us study together!"',
        ru: '«Я из Лондона. А ты?» «Я из Тбилиси. Ты здесь учишь английский?» «Да. Давай учиться вместе!»',
      },
    ],
  },
]
