import type { HelpSection } from './types'

export const helpEn: HelpSection[] = [
  {
    id: 'start',
    icon: 'rocket',
    title: 'Getting started',
    intro:
      'TAU is a personal organizer that brings plans, money, workouts, mood and shared time with friends into one place. Most sections work offline too.',
    subsections: [
      {
        id: 'start-what',
        title: 'What TAU is',
        blocks: [
          {
            type: 'text',
            value:
              'The application unites all essentials into a single system: the Day home screen, the Useful hub for life tracking, block-based Notes, a customization shop, favorites, settings, and cloud sync.',
          },
          {
            type: 'list',
            items: [
              'Day (/today) — the entry point: animal of the day with detailed traits, date, weather, wish, special day, and workout mark.',
              'Useful (/useful) — unified center: workouts, finance, productivity, dream & mood journal, reminders, media, soundscapes, languages, leisure, and lottery.',
              'Notes (/useful/productivity/notes) — full-featured Notion-style block editor with nested pages and snippets.',
              'Favorites (/favorites) — saved cards of animals of the day with quick links.',
              'Shop (/shop) — internal currency earned through positive actions, cat skins, visual themes, and premium perks.',
              'Settings (/settings) — themes, corner style, language, city, section visibility, and backups.',
            ],
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Where to begin',
            value:
              'If you are new, open Day and check the current interface view mode. Then explore Useful to set up the modules you use every day.',
          },
        ],
      },
      {
        id: 'start-first',
        title: 'First steps',
        blocks: [
          {
            type: 'steps',
            items: [
              'Open Day and check whether the current view suits you.',
              'Go to Settings and pick a theme, language and city — the city drives weather and time zone.',
              'Fill in your birthday in Remind so the app keeps track of it.',
              'Create your first list in Productivity: tasks, goals or dreams.',
              'Register an account if you want cloud sync between devices.',
            ],
          },
        ],
      },
      {
        id: 'start-data',
        title: 'Where your data lives',
        blocks: [
          {
            type: 'text',
            value:
              'By default data stays on this device: small settings in localStorage, large text (notes, dreams) in IndexedDB. This is fast and works offline.',
          },
          {
            type: 'list',
            items: [
              'Without an account nothing leaves the device and nothing syncs.',
              'After signing in, data is copied to the cloud and pulled onto other devices.',
              'You can download a backup in Settings → Storage, cache and backup — a plain JSON file.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'modes',
    icon: 'layout',
    title: 'Simple and normal view',
    intro: 'The app has two density modes. They are set per page and never change your data — only how much of the interface is shown.',
    subsections: [
      {
        id: 'modes-what',
        title: 'Difference between modes',
        blocks: [
          {
            type: 'list',
            items: [
              'Simple view — a clean, minimal interface focused on the essentials. Enabled everywhere by default.',
              'Advanced view — all panels, kanban boards, filters, charts and detailed settings.',
              'Each page keeps its own setting, so Day can be simple while Finance is normal.',
              'The virtual cat has a separate toggle: in simple mode it is calmer and takes less space.',
            ],
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Where to switch',
            value:
              'The toggle sits in the top bar on Day and on the Workouts, Productivity, Finance and Media pages. The global "everywhere" switch lives in Settings.',
          },
        ],
      },
      {
        id: 'modes-hidden',
        title: 'What simple view hides',
        blocks: [
          {
            type: 'text',
            value:
              'Switching views never removes data — some parts of the interface are simply not shown. Below is what only appears in normal view.',
          },
          {
            type: 'list',
            items: [
              'Day: the animal breed card, the week weather forecast, the workout mark and the special-day card.',
              'Workouts: detailed statistics per sport and period.',
              'Finance: detailed sections for operations, deposits and loans with all calculations.',
              'Productivity: kanban board, filters, tips and task blocks from friends.',
              'Media: tags and periods in catalogue cards.',
              'Notes: summaries, subpages and tree badges.',
              'Lottery: detailed army descriptions.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'today',
    icon: 'sun',
    title: 'Day home screen',
    intro: "Today's overview: weather, time, mood of the day and a workout reminder.",
    subsections: [
      {
        id: 'today-blocks',
        title: 'Blocks and how to configure them',
        blocks: [
          {
            type: 'text',
            value:
              'The page is assembled from independent blocks. You can disable any of them in Settings → Blocks on the home page and keep only what you need.',
          },
          {
            type: 'list',
            items: [
              'Animal of the day — photo, breed, species description and a fun fact. The breed card includes an interactive accordion with details and habitat, shown in normal view.',
              'Date and time — day number, month, season and clock.',
              'Weather — current conditions, plus today, tomorrow and the week forecast in normal view.',
              'Wish of the day — a thought to start the day well.',
              'Special day — a holiday or themed date. Visible in normal view.',
              'Workout — a quick mark and calendar. Visible in normal view.',
            ],
          },
        ],
      },
      {
        id: 'today-weather',
        title: 'Weather and city',
        blocks: [
          {
            type: 'text',
            value: 'Weather is loaded for the city chosen in settings and refreshes automatically.',
          },
          {
            type: 'steps',
            items: [
              'Open Settings.',
              'In General settings find City.',
              'Pick your city — weather and the time zone used for dates and schedules change at once.',
            ],
          },
        ],
      },
      {
        id: 'today-panel',
        title: 'Home screen settings panel',
        blocks: [
          {
            type: 'text',
            value: 'Day has its own compact settings panel. Use it to choose which page opens when the app starts.',
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Start page',
            value:
              'Options include Day, Useful, More, shop, favorites, settings and other sections. This way you land exactly where you need.',
          },
        ],
      },
    ],
  },
  {
    id: 'useful',
    icon: 'briefcase',
    title: 'Useful section',
    intro: 'Track workouts, money, plans, mood, important dates and media.',
    subsections: [
      {
        id: 'useful-training',
        title: 'Workouts',
        blocks: [
          {
            type: 'text',
            value: 'A calendar of marks and a list of sports. You can keep several sports and mark each one.',
          },
          {
            type: 'list',
            items: [
              'Add your own sports with a colour so the calendar reads better.',
              'Advanced view adds statistics: workouts per period and per sport.',
              "You can mark today's workout right on the home screen.",
            ],
          },
        ],
      },
      {
        id: 'useful-finance',
        title: 'Finance',
        blocks: [
          {
            type: 'text',
            value:
              'Money tracking is split into five tabs: operations, deposits, loans, subscriptions and advice. Currencies are rubles, dollars and lari.',
          },
          {
            type: 'text',
            value:
              'Above the tabs there is always an "Overall total" block: savings, monthly income (salary and passive deposit income), monthly expenses (loans and subscriptions) and the net result. If expenses exceed income, the app estimates how many months your savings will last and, in normal view, shows a 6-month balance forecast.',
          },
          {
            type: 'text',
            value: 'Operations: income and expenses by month, current balance and a 12-month trend.',
          },
          {
            type: 'text',
            value:
              'Deposits: bank deposits and savings accounts. It calculates capitalization, passive income per day, week, month and year, the payout total and the weighted average rate.',
          },
          {
            type: 'text',
            value:
              'Loans: credits, mortgages, car loans and instalment plans. Shows remaining debt, monthly payment, days until the next charge and lets you close a payment quickly.',
          },
          {
            type: 'text',
            value: 'Subscriptions: digital services, billing periods and total monthly and yearly cost.',
          },
          {
            type: 'text',
            value:
              'Advice is a premium section: money lessons in a "bad idea — good idea" format from a kitten who just started exploring the world. Part of the lessons is free, the rest is shown as a blurred preview and can be unlocked in the shop. You can switch the character’s mood.',
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Exchange rates',
            value:
              'Rates can be set manually or taken from a source. They are used to convert balances and value deposits in other currencies.',
          },
        ],
      },
      {
        id: 'useful-productivity',
        title: 'Productivity: tasks, goals, dreams',
        blocks: [
          {
            type: 'text',
            value:
              'Three kinds of entries with different logic. A task is something to do. A goal is a result. A dream is a wish that is not a result yet.',
          },
          {
            type: 'list',
            items: [
              'Tasks support repetition: daily, on chosen weekdays or by due date.',
              'Tasks have priority, deadline and a target completion date.',
              'A streak of completed days and a history of marks are tracked.',
              'Advanced view adds a kanban board and filters by kind and status.',
            ],
          },
          {
            type: 'note',
            tone: 'success',
            title: 'This earns coins',
            value:
              'Completing a task gives 10 coins, a goal 100 and a dream 1000. Coins are spent in the shop, while monthly points go to a separate score.',
          },
        ],
      },
      {
        id: 'useful-mind',
        title: 'Journal: dreams and mood',
        blocks: [
          {
            type: 'text',
            value: 'The journal keeps two formats: dreams as free text and a daily mood rating from 1 to 5 with a comment.',
          },
          {
            type: 'list',
            items: [
              'Dreams save automatically as you type — there is no save button to press.',
              'Dreams include ready-made prompts: hooks, links and plot breakdown.',
              'In dreams you can write a letter to a friend: enter a name and get a reply plus 100 coins on your next visit.',
              'Mood is recorded once a day and drawn as a weekly chart.',
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            title: 'Important',
            value:
              'The letter-to-a-friend mechanic in the dream journal is local and playful. It does not send letters to real people. Real friends connect separately through the Together section and the friends list.',
          },
        ],
      },
      {
        id: 'useful-remind',
        title: 'Remind: birthdays',
        blocks: [
          {
            type: 'text',
            value: 'Keeps your own birthday and a list of important dates for other people with a day countdown.',
          },
          {
            type: 'list',
            items: [
              'Set your date so the app can use it in calculations and congratulate you.',
              'Add dates of friends and relatives so important days do not slip by.',
            ],
          },
        ],
      },
      {
        id: 'useful-media',
        title: 'Media: movies, books, games',
        blocks: [
          {
            type: 'text',
            value: 'Three catalogues with shared logic: every item has a wishlist and a watched, read or played list.',
          },
          {
            type: 'list',
            items: [
              'Rate items, add tags and write a review with a liked or not liked mark.',
              'Advanced view adds filters by tags and periods plus a kanban board.',
              'Covers are loaded automatically by title.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'misc',
    icon: 'shapes',
    title: 'Learning, Leisure & Social',
    intro: 'Language trainers, ambient soundscapes, entertainment, lottery, and shared scheduling with friends inside the Useful center.',
    subsections: [
      {
        id: 'misc-together',
        title: 'Together: availability windows',
        blocks: [
          {
            type: 'text',
            value:
              'Together is not a task list but time planning. You mark the intervals when you are free, and in the Friends windows tab you see when others are free.',
          },
          { type: 'text', value: 'There are two kinds of windows:' },
          {
            type: 'list',
            items: [
              'Weekly window — repeats every week on the chosen day. Pick a day and interval, for example "Saturday, 18:00–22:00".',
              'One-off window — only on a specific date. Good for plans that do not repeat.',
              'Both kinds accept a short note: "at home", "at a cafe", "out walking".',
            ],
          },
          {
            type: 'steps',
            items: [
              'Press Add window in the Weekly windows block.',
              'Choose the weekday, start and end time.',
              'Optionally add a note and save.',
              'For a plan on a specific day press Add window for a date in the second block.',
              'To edit a window press the pencil, to delete press the bin.',
              'Open the Friends windows tab to see the windows of all your friends — one card per person.',
            ],
          },
          {
            type: 'note',
            tone: 'info',
            title: 'What this does not do',
            value:
              'The app does not look for common overlaps and does not propose a specific meeting — it shows windows exactly as you and your friends set them.',
          },
        ],
      },
      {
        id: 'misc-languages',
        title: 'Language trainers',
        blocks: [
          {
            type: 'text',
            value:
              'Three tabs: Basic English for beginners, Advanced English (vocabulary and reading articles) and Georgian (everyday phrases). Every tab has four training modes: dictionary, flashcards, listening and sprint, and the English tabs also include reading texts with translation.',
          },
          {
            type: 'list',
            items: [
              'Basic English — greetings, numbers, pronouns, simple verbs and ready-made phrases that make sense from zero.',
              'Advanced English — idioms, business vocabulary, YouTube and newspaper phrasing.',
              'Reading — texts with parallel translation, per-paragraph audio and key vocabulary breakdown.',
              'Flashcards — translate forward or backward, or mix both directions.',
              'Quiz — one correct option and three distractors; pick the translation.',
              'Listening — a word is spoken and the options appear on screen.',
              'Sprint — 45 seconds to answer as much as possible; longer streaks raise the score multiplier.',
              'There are category filters, "only unlearned" and "only mistakes" modes, plus card shuffling.',
              'Progress, best streak and the sprint record are saved separately for each language.',
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            title: 'About pronunciation',
            value:
              'Pronunciation uses the speech synthesiser built into your browser. If you hear no Georgian audio, the system has no voice for that language — install the language pack in your device settings.',
          },
        ],
      },
      {
        id: 'misc-sounds',
        title: 'Ambient soundscapes for focus',
        blocks: [
          {
            type: 'text',
            value:
              'The "Sounds" section (/useful/sounds) provides relaxing atmospheric audio tracks for deep focus, study, meditation, and rest.',
          },
          {
            type: 'list',
            items: [
              'Variety of ambient scenes: rain against the window, crackling fireplace, cozy city cafe, summer thunderstorm, forest breeze, and deep space rumble.',
              'Smooth looping audio playback with individual volume adjustment.',
              'Soundscapes play smoothly in the background while you plan, read, or write notes.',
            ],
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Background playback',
            value: 'Audio continues playing seamlessly as you navigate across different pages of the application.',
          },
        ],
      },
      {
        id: 'misc-fun',
        title: 'Fun',
        blocks: [
          {
            type: 'text',
            value: 'An entertainment section with sound effects, quotes and characters. It unlocks after a shop purchase.',
          },
          {
            type: 'list',
            items: [
              'Sound panel: seven effects from a horn to a victory tune.',
              'Outfits and characters can be switched right on the page.',
              'The draw spins a wheel and picks a random character with a caption — cosmetic only, no coin prize.',
              'The red nose button raises the clown level and returns a verdict from a set of five.',
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            title: 'Inside this section',
            value: 'The clown level and outfits are not kept between page reloads.',
          },
        ],
      },
      {
        id: 'misc-lottery',
        title: 'Lottery',
        blocks: [
          {
            type: 'text',
            value:
              'This is not a number draw but a step-by-step battle simulator. You build up troops, decide how to distribute them and start a battle.',
          },
          {
            type: 'list',
            items: [
              'Four unit types: swordsmen, archers, knights and siege mages — each with its own strength.',
              'Six ready army presets: duel, ambush, siege, kings, random and reset.',
              'The outcome follows the strength ratio: the stronger your army, the higher your chance.',
              'Every battle grants 35–64 coins regardless of victory or defeat.',
            ],
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Coins are guaranteed',
            value: 'You cannot lose and get nothing here — a reward is granted in both outcomes.',
          },
        ],
      },
    ],
  },
  {
    id: 'social',
    icon: 'users',
    title: 'Friends and shared work',
    intro: 'These features require you to sign in.',
    subsections: [
      {
        id: 'social-friends',
        title: 'Friends list',
        blocks: [
          {
            type: 'steps',
            items: [
              'Sign in on the /auth page or from Settings.',
              'Open friends management — from settings or the button in the top bar.',
              'Search for the email of another user and send a request.',
              'Wait until they accept — after that you appear in each other’s lists.',
            ],
          },
          {
            type: 'list',
            items: [
              'Incoming and outgoing requests are shown in separate tabs.',
              'A friend can be removed at any time.',
              'The friend count is shown in settings.',
            ],
          },
        ],
      },
      {
        id: 'social-tasks',
        title: 'Tasks from friends',
        blocks: [
          {
            type: 'text',
            value: 'You can assign a friend a task with a title, date and priority, then follow its status: done or not done.',
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Permission for tasks',
            value:
              'If someone does not want tasks from friends, they can turn this off in Settings → Interaction with friends. Such tasks will not arrive.',
          },
        ],
      },
      {
        id: 'social-availability',
        title: 'Shared time windows',
        blocks: [
          {
            type: 'text',
            value:
              'Availability windows from the Together section are visible only to people on your friends list. This is separate from tasks: you set when you are free, not what needs doing.',
          },
          {
            type: 'list',
            items: [
              'Your windows are visible to you and to those who added you as a friend.',
              'Removing a friend automatically removes their windows from your list.',
              'Windows appear only after a friend request has been accepted.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'notes',
    icon: 'file',
    title: 'Notes and dream journal',
    intro: 'A block editor with a tree of nested pages. A detailed editor guide is available inside the section itself.',
    subsections: [
      {
        id: 'notes-tree',
        title: 'Notes tree',
        blocks: [
          {
            type: 'text',
            value:
              'Notes form a tree: you can create nested notes inside any note, without a depth limit. The tree of pages is shown on the left.',
          },
          {
            type: 'list',
            items: [
              'Drag a note to change its parent.',
              'A note cannot be moved under its own descendant — the app prevents breaking the structure.',
              'Every note and dream has its own icon.',
            ],
          },
        ],
      },
      {
        id: 'notes-editor',
        title: 'Editor and blocks',
        blocks: [
          {
            type: 'text',
            value:
              'Text is written in blocks. The slash "/" menu offers: plain paragraph, three heading levels, to-do, bulleted and numbered lists, a toggle, callout, quote, code, divider, plus images, audio and PDF.',
          },
          {
            type: 'keys',
            items: [
              { keys: 'Enter', desc: 'New block' },
              { keys: 'Shift + Enter', desc: 'Line break inside a block' },
              { keys: 'Backspace', desc: 'At block start — reset the type or delete an empty block' },
              { keys: '↑ / ↓', desc: 'Move between blocks and navigate the command menu' },
              { keys: 'Escape', desc: 'Close the command menu' },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Autosave',
            value: 'Text saves itself about half a second after your last change. There is no save button to press.',
          },
        ],
      },
      {
        id: 'notes-media',
        title: 'Images, audio and PDF',
        blocks: [
          {
            type: 'list',
            items: [
              'Drop a file into the editor or paste from the clipboard with Ctrl + V — the type is detected automatically.',
              'Large photos are resized automatically so notes do not grow too much.',
              'Files are embedded in the note itself, not kept in a separate library.',
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            title: 'Note size',
            value:
              'Because files are embedded directly in the text, very large images and audio increase the note size and may slow down opening it.',
          },
        ],
      },
    ],
  },
  {
    id: 'animals',
    icon: 'paw',
    title: 'Animals and favorites',
    intro: 'The app picks an animal each day, and you can save the ones you like.',
    subsections: [
      {
        id: 'animals-daily',
        title: 'Animal of the day',
        blocks: [
          {
            type: 'text',
            value:
              'The pick is deterministic: the same animal is shown all day and changes the next day. Open any pet from the list to see another.',
          },
          {
            type: 'list',
            items: [
              'Descriptions and photos are loaded from Wikipedia; if a request fails, a built-in fallback set is used.',
              'The Animal of the day block can be hidden in home screen settings.',
              'The domestic / wild filter changes the selection pool.',
            ],
          },
        ],
      },
      {
        id: 'animals-favorites',
        title: 'Favorites',
        blocks: [
          {
            type: 'list',
            items: [
              'Add a pet to favorites and it appears in the Favorites section with a counter badge in the top bar.',
              'Entries can be deleted one by one.',
              'You can copy a text report from favorites to the clipboard.',
              'A separate pet page is available at /animal/:id.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'shop',
    icon: 'store',
    title: 'Shop and coins',
    intro: 'Internal currency earned for useful actions. Real payments are not connected.',
    subsections: [
      {
        id: 'shop-earn',
        title: 'How to earn coins',
        blocks: [
          {
            type: 'list',
            items: [
              'Complete a task — 10 coins.',
              'Close a goal — 100 coins.',
              'Mark a dream — 1000 coins.',
              'Fight a battle in the lottery — 35 to 64 coins, whatever the outcome.',
              'Reply to a friend letter from the dream journal — 100 coins.',
            ],
          },
          {
            type: 'note',
            tone: 'info',
            title: 'At the start',
            value: 'A new user receives 1000 coins — enough for a first purchase.',
          },
        ],
      },
      {
        id: 'shop-buy',
        title: 'What you can buy',
        blocks: [
          {
            type: 'list',
            items: [
              'Cat skin Wizard and Cyber — 200 coins each.',
              'Cyberpunk and Midnight Gold themes — 150 coins each.',
              'Ambient generator block (rain, fireplace, hum) — 200 coins.',
              'Access to the Fun section — 250 coins.',
              'Access to the lottery — 250 coins.',
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            title: 'Purchases are final',
            value: 'Coins cannot be refunded for something already bought. Make sure you are opening what you need before spending.',
          },
        ],
      },
      {
        id: 'shop-money',
        title: 'About payment',
        blocks: [
          {
            type: 'text',
            value:
              'The shop has coin packs for money, but no payment provider is connected: the purchase is simulated and simply grants coins. This is an interface demo, not a real purchase.',
          },
          {
            type: 'note',
            tone: 'warn',
            title: 'No real payments',
            value: 'No money is charged and you never need to link a card.',
          },
        ],
      },
    ],
  },
  {
    id: 'account',
    icon: 'cloud',
    title: 'Account, sync and offline',
    intro: 'Without an account the app works fully, but data stays on this device only.',
    subsections: [
      {
        id: 'account-register',
        title: 'Registration and sign in',
        blocks: [
          {
            type: 'steps',
            items: [
              'Open /auth from settings.',
              'Register to create an account and upload the current data from this device to the cloud.',
              'Or sign in with an existing account — data from the cloud is downloaded to this device.',
              'On other devices sign in with the same account — data will be pulled.',
            ],
          },
        ],
      },
      {
        id: 'account-sync',
        title: 'How sync works',
        blocks: [
          {
            type: 'text',
            value:
              'Changes go to the cloud automatically, but not instantly: about two seconds of waiting after an edit so data is not sent on every keystroke.',
          },
          {
            type: 'list',
            items: [
              'Settings, workouts, finance, tasks, goals, dreams, notes, dream journal, birthdays, media, shop and availability windows all sync.',
              'Sync only runs while you are signed in.',
              'The "Sync now" button on the /auth page sends data manually.',
              'On first sign in cloud data is pulled to the device; on registration the device pushes its data to the cloud.',
            ],
          },
          {
            type: 'note',
            tone: 'info',
            title: 'Several devices',
            value: 'If one device uses simple view and another normal view, after sync the most recently saved mode applies.',
          },
        ],
      },
      {
        id: 'account-offline',
        title: 'Working offline',
        blocks: [
          {
            type: 'list',
            items: [
              'The app can be installed to your phone home screen and launches like a normal app.',
              'Most sections — notes, tasks, finance, workouts, dream diary, shop, settings — work without a network, because the data lives on the device.',
              'A connection is required for weather and holidays, the friends list and Together, as well as for signing in and cloud sync.',
              'Changes made offline go to the cloud automatically once the connection is back.',
              'In your browser choose "Add to home screen" to install it.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'settings',
    icon: 'gear',
    title: 'Settings and data',
    intro: 'Everything you can configure, and how not to lose data.',
    subsections: [
      {
        id: 'settings-themes',
        title: 'Themes block',
        blocks: [
          {
            type: 'text',
            value: 'A dedicated "Themes" block controls the look. Pick a palette, and for each palette choose a light or dark variant.',
          },
          {
            type: 'list',
            items: [
              'Auto — the palette follows the season and your chosen city.',
              'Spring, Summer, Autumn, Winter — fixed seasonal palettes.',
              'Each theme card has two variant buttons: light and dark. Pressing one selects both the palette and the mode.',
              'The "Mode" switch at the top sets the system, light or dark variant for the current palette.',
              'The "Cyberpunk" and "Midnight Gold" VIP skins from the shop override any palette — pick a seasonal theme in the Themes block to return to it.',
            ],
          },
        ],
      },
      {
        id: 'settings-main',
        title: 'Main settings',
        blocks: [
          {
            type: 'list',
            items: [
              'Themes: a palette (Auto, Spring, Summer, Autumn, Winter, Nord, Solarized) and, for each, a light or dark variant. The global mode is system, light or dark.',
              'Corner Style: choose the interface corner curvature style (Sharp, Smooth, Pill).',
              'Language: Russian or English. Switches instantly.',
              'City: affects weather, time zone and date calculations.',
              'Page views: simple or normal for each page separately, plus a global switch.',
              'Virtual cat: a separate toggle for its view.',
              'Section visibility: hide sections you do not need from Useful navigation, then restore them via settings.',
              'Home page blocks: disable the Day blocks you do not need.',
            ],
          },
        ],
      },
      {
        id: 'settings-data',
        title: 'Storage, backup and reset',
        blocks: [
          {
            type: 'text',
            value: 'Settings show how much data is used and offer four actions.',
          },
          {
            type: 'list',
            items: [
              'Download backup — saves all data to a JSON file.',
              'Restore from file — loads data from a previously downloaded backup.',
              'Clear cache — removes temporary app files; your data is not affected.',
              'Reset all data — permanently removes content from the device. Confirmation is required.',
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            title: 'Reset cannot be undone',
            value:
              'After a reset, data can only be restored from a backup. If no account is connected, sync will not help — download a backup first.',
          },
        ],
      },
    ],
  },
  {
    id: 'faq',
    icon: 'help',
    title: 'Frequently asked',
    intro: 'Short answers to what people ask most often.',
    subsections: [
      {
        id: 'faq-q1',
        title: 'My data disappeared',
        blocks: [
          {
            type: 'list',
            items: [
              'Check whether private browsing is on — storage may be cleared when you close the window.',
              'If a data reset was performed, restore a backup.',
              'When switching browser or device, sign in to pull data from the cloud.',
              'Do not use incognito mode for regular work with the app.',
            ],
          },
        ],
      },
      {
        id: 'faq-q2',
        title: 'Tasks from friends do not arrive',
        blocks: [
          {
            type: 'list',
            items: [
              'Check that the friend request was accepted, not just sent.',
              'Check the "Allow friends to assign me tasks" setting — if it is off, tasks will not arrive.',
              'Make sure the task was assigned to your email in the friends list.',
            ],
          },
        ],
      },
      {
        id: 'faq-q3',
        title: 'No Georgian pronunciation',
        blocks: [
          {
            type: 'text',
            value: 'Pronunciation uses voices installed in your system. If there is no voice for Georgian, nothing will be spoken.',
          },
          {
            type: 'list',
            items: [
              'Check your device settings for language and text-to-speech.',
              'English usually works out of the box since voices for it are widely available.',
              'The remaining trainers work without sound too.',
            ],
          },
        ],
      },
      {
        id: 'faq-q4',
        title: 'The view changed after signing in',
        blocks: [
          {
            type: 'text',
            value:
              'Density mode is part of synced settings. If another device had normal view saved, it will apply here after cloud data loads.',
          },
          {
            type: 'list',
            items: [
              'Switch the view to what you need on this device.',
              'To set the mode everywhere at once, use the global switch in settings.',
            ],
          },
        ],
      },
      {
        id: 'faq-q5',
        title: 'A window does not save',
        blocks: [
          {
            type: 'list',
            items: [
              'The end time must be later than the start time — otherwise saving is blocked.',
              'A one-off window requires a date.',
              'If a window is missing, check that you are signed in: Together only works for signed-in users, and windows are stored in the cloud rather than on the device.',
            ],
          },
        ],
      },
      {
        id: 'faq-q6',
        title: 'How to start over',
        blocks: [
          {
            type: 'list',
            items: [
              'Settings has a "Reset all data" option — it clears the browser local storage.',
              'Data already sent to the cloud is kept: it is downloaded again after you sign in.',
              'For a completely clean start, export a backup in settings first, then reset.',
            ],
          },
        ],
      },
    ],
  },
]
