import type { CollectionDetails, SearchCandidate } from '../../data'

export type FallbackGame = SearchCandidate & {
  details: CollectionDetails
}

export const FALLBACK_GAMES: FallbackGame[] = [
  {
    id: 'witcher-3-wild-hunt',
    title: 'The Witcher 3: Wild Hunt',
    subtitle: 'CD PROJEKT RED · Action RPG',
    description:
      'Become a monster slayer for hire and embark on an epic journey to track down the child of prophecy, Ciri, in a vast fantasy world.',
    imageUrl: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    year: 2015,
    tags: ['Action', 'RPG', 'Open World', 'Fantasy'],
    score: '9.3',
    details: {
      tagline: 'The world doesn’t need a hero. It needs a professional.',
      facts: [
        { label: 'Developer', value: 'CD PROJEKT RED' },
        { label: 'Publisher', value: 'CD PROJEKT RED' },
        { label: 'Release Date', value: '18.05.2015' },
        { label: 'Genres', value: 'Action, RPG, Open World' },
        { label: 'Platforms', value: 'PC, PlayStation 4/5, Xbox One/Series, Nintendo Switch' },
        { label: 'Metacritic', value: '93 / 100' },
        { label: 'Average Playtime', value: '50+ hours' },
      ],
      overview:
        'Geralt of Rivia, a mutated monster hunter known as a Witcher, searches for his adopted daughter Ciri while being pursued by the otherworldly Wild Hunt across the war-torn Northern Kingdoms.',
      links: [
        { label: 'Official Website', href: 'https://thewitcher.com' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/292030/' },
      ],
    },
  },
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    subtitle: 'CD PROJEKT RED · Sci-Fi RPG',
    description: 'An open-world, action-adventure RPG set in Night City, a megalopolis obsessed with power, glamour and body modification.',
    imageUrl: 'https://media.rawg.io/media/games/26d/26d4437779bee00023d5100f1fb9503e.jpg',
    year: 2020,
    tags: ['RPG', 'Sci-Fi', 'Open World', 'Cyberpunk'],
    score: '8.6',
    details: {
      tagline: 'Welcome to the City of Dreams',
      facts: [
        { label: 'Developer', value: 'CD PROJEKT RED' },
        { label: 'Publisher', value: 'CD PROJEKT RED' },
        { label: 'Release Date', value: '10.12.2020' },
        { label: 'Genres', value: 'Action RPG, First-Person Shooter' },
        { label: 'Platforms', value: 'PC, PlayStation 5, Xbox Series X/S' },
        { label: 'Metacritic', value: '86 / 100' },
        { label: 'Average Playtime', value: '40+ hours' },
      ],
      overview:
        'Take on the role of V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality, while co-existing with the digital ghost of rocker Johnny Silverhand.',
      links: [
        { label: 'Official Website', href: 'https://www.cyberpunk.net' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/1091500/' },
      ],
    },
  },
  {
    id: 'elden-ring',
    title: 'Elden Ring',
    subtitle: 'FromSoftware · Souls-like Action RPG',
    description:
      'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    imageUrl: 'https://media.rawg.io/media/games/b29/b2960c74c53d9438129e1f85770bee1a.jpg',
    year: 2022,
    tags: ['Souls-like', 'RPG', 'Action', 'Dark Fantasy'],
    score: '9.5',
    details: {
      tagline: 'Brandish the power of the Elden Ring',
      facts: [
        { label: 'Developer', value: 'FromSoftware Inc.' },
        { label: 'Publisher', value: 'Bandai Namco Entertainment' },
        { label: 'Release Date', value: '25.02.2022' },
        { label: 'Genres', value: 'Action RPG, Souls-like, Open World' },
        { label: 'Platforms', value: 'PC, PlayStation 4/5, Xbox One/Series' },
        { label: 'Metacritic', value: '96 / 100' },
        { label: 'Average Playtime', value: '60+ hours' },
      ],
      overview:
        'A collaboration between Hidetaka Miyazaki and George R. R. Martin. Journey across a grand open world of colossal dungeons, menacing demigods, and deep dark fantasy lore.',
      links: [
        { label: 'Official Website', href: 'https://eldenring.bn-ent.net' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/1245620/' },
      ],
    },
  },
  {
    id: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    subtitle: 'Larian Studios · CRPG D&D',
    description:
      'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.',
    imageUrl: 'https://media.rawg.io/media/games/699/699222d81a470129a67e411b439603f9.jpg',
    year: 2023,
    tags: ['CRPG', 'Turn-Based', 'Fantasy', 'Co-op'],
    score: '9.6',
    details: {
      tagline: 'Gather your party and venture forth',
      facts: [
        { label: 'Developer', value: 'Larian Studios' },
        { label: 'Publisher', value: 'Larian Studios' },
        { label: 'Release Date', value: '03.08.2023' },
        { label: 'Genres', value: 'CRPG, Tactical RPG, Fantasy' },
        { label: 'Platforms', value: 'PC, Mac, PlayStation 5, Xbox Series X/S' },
        { label: 'Metacritic', value: '96 / 100' },
        { label: 'Average Playtime', value: '80+ hours' },
      ],
      overview:
        'Abducted by mind flayers who infected you with a parasite, you must navigate a reactive Dungeons & Dragons 5th Edition world with unparalleled player freedom, branching storylines, and rich companions.',
      links: [
        { label: 'Official Website', href: 'https://baldursgate3.game' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/1086940/' },
      ],
    },
  },
  {
    id: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    subtitle: 'Rockstar Games · Western Open World',
    description: 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run, facing the decline of the Wild West.',
    imageUrl: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
    year: 2018,
    tags: ['Open World', 'Action', 'Western', 'Adventure'],
    score: '9.7',
    details: {
      tagline: 'Outlaws for life',
      facts: [
        { label: 'Developer', value: 'Rockstar Games' },
        { label: 'Publisher', value: 'Rockstar Games' },
        { label: 'Release Date', value: '26.10.2018' },
        { label: 'Genres', value: 'Action-Adventure, Open World, Western' },
        { label: 'Platforms', value: 'PC, PlayStation 4, Xbox One' },
        { label: 'Metacritic', value: '97 / 100' },
        { label: 'Average Playtime', value: '60+ hours' },
      ],
      overview:
        'With federal agents and the best bounty hunters in the nation massing on their heels, Arthur Morgan must make a choice between his own ideals and loyalty to the gang that raised him.',
      links: [
        { label: 'Official Website', href: 'https://www.rockstargames.com/reddeadredemption2' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/1174180/' },
      ],
    },
  },
  {
    id: 'grand-theft-auto-v',
    title: 'Grand Theft Auto V',
    subtitle: 'Rockstar Games · Crime Open World',
    description:
      'A young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with the criminal underworld.',
    imageUrl: 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07025025773bf92fb.jpg',
    year: 2013,
    tags: ['Action', 'Open World', 'Crime', 'Multiplayer'],
    score: '9.5',
    details: {
      tagline: 'Trouble taps on your window',
      facts: [
        { label: 'Developer', value: 'Rockstar North' },
        { label: 'Publisher', value: 'Rockstar Games' },
        { label: 'Release Date', value: '17.09.2013' },
        { label: 'Genres', value: 'Action, Open World, Crime' },
        { label: 'Platforms', value: 'PC, PlayStation 3/4/5, Xbox 360/One/Series' },
        { label: 'Metacritic', value: '96 / 100' },
        { label: 'Average Playtime', value: '35+ hours' },
      ],
      overview:
        'Explore the sprawling sun-soaked metropolis of Los Santos and Blaine County through the eyes of Franklin, Michael, and Trevor across a series of dangerous heists.',
      links: [
        { label: 'Official Website', href: 'https://www.rockstargames.com/gta-v' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/271590/' },
      ],
    },
  },
  {
    id: 'half-life-2',
    title: 'Half-Life 2',
    subtitle: 'Valve · Sci-Fi FPS',
    description:
      'By taking the excitement and emotion of the original and adding startling new realism and responsiveness, Half-Life 2 opens the door to a world where player presence alters everything.',
    imageUrl: 'https://media.rawg.io/media/games/b8c/b8c243eaa0ecac79032a3b0233fdd161.jpg',
    year: 2004,
    tags: ['FPS', 'Sci-Fi', 'Classic', 'Action'],
    score: '9.6',
    details: {
      tagline: 'The right man in the wrong place can make all the difference in the world',
      facts: [
        { label: 'Developer', value: 'Valve' },
        { label: 'Publisher', value: 'Valve' },
        { label: 'Release Date', value: '16.11.2004' },
        { label: 'Genres', value: 'First-Person Shooter, Sci-Fi' },
        { label: 'Platforms', value: 'PC, Mac, Linux' },
        { label: 'Metacritic', value: '96 / 100' },
        { label: 'Average Playtime', value: '15 hours' },
      ],
      overview:
        'Dr. Gordon Freeman is awakened from stasis by the enigmatic G-Man to discover that the alien Combine empire has conquered Earth. Armed with his trusty crowbar and the gravity gun, he leads the human resistance.',
      links: [{ label: 'Steam', href: 'https://store.steampowered.com/app/220/' }],
    },
  },
  {
    id: 'portal-2',
    title: 'Portal 2',
    subtitle: 'Valve · Puzzle Adventure',
    description: 'The Perpetual Testing Initiative has been expanded to allow you to design co-op puzzles for you and your friends.',
    imageUrl: 'https://media.rawg.io/media/games/328/3283614cb7d75d67257fc840c49cbfba.jpg',
    year: 2011,
    tags: ['Puzzle', 'Co-op', 'Comedy', 'Sci-Fi'],
    score: '9.5',
    details: {
      tagline: 'Now you’re thinking with portals',
      facts: [
        { label: 'Developer', value: 'Valve' },
        { label: 'Publisher', value: 'Valve' },
        { label: 'Release Date', value: '19.04.2011' },
        { label: 'Genres', value: 'Puzzle, First-Person, Comedy' },
        { label: 'Platforms', value: 'PC, Mac, Linux, PlayStation 3, Xbox 360, Switch' },
        { label: 'Metacritic', value: '95 / 100' },
        { label: 'Average Playtime', value: '10 hours' },
      ],
      overview:
        'Chell awakens once again in the overgrown Aperture Science Enrichment Center, navigating mind-bending portal puzzles guided by Wheatley and challenged by the vengeful GLaDOS.',
      links: [{ label: 'Steam', href: 'https://store.steampowered.com/app/620/' }],
    },
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    subtitle: 'Team Cherry · Metroidvania',
    description: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.',
    imageUrl: 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg',
    year: 2017,
    tags: ['Metroidvania', 'Souls-like', '2D', 'Atmospheric'],
    score: '9.2',
    details: {
      tagline: 'Descend into the dark world of Hallownest',
      facts: [
        { label: 'Developer', value: 'Team Cherry' },
        { label: 'Publisher', value: 'Team Cherry' },
        { label: 'Release Date', value: '24.02.2017' },
        { label: 'Genres', value: 'Metroidvania, Action-Adventure, 2D Platformer' },
        { label: 'Platforms', value: 'PC, Mac, Linux, Nintendo Switch, PS4, Xbox One' },
        { label: 'Metacritic', value: '90 / 100' },
        { label: 'Average Playtime', value: '30+ hours' },
      ],
      overview:
        'Beneath the fading town of Dirtmouth sleeps an ancient, ruined kingdom. Explore cavernous depths, battle tainted creatures and befriend bizarre bugs, all in a hand-drawn 2D style.',
      links: [
        { label: 'Official Website', href: 'https://www.hollowknight.com' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/367520/' },
      ],
    },
  },
  {
    id: 'hades',
    title: 'Hades',
    subtitle: 'Supergiant Games · Roguelike Action',
    description:
      'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from Supergiant Games.',
    imageUrl: 'https://media.rawg.io/media/games/1f4/1f4dd0154e035f5088f16676edba7e15.jpg',
    year: 2020,
    tags: ['Roguelike', 'Action', 'Indie', 'Mythology'],
    score: '9.3',
    details: {
      tagline: 'There is no escape',
      facts: [
        { label: 'Developer', value: 'Supergiant Games' },
        { label: 'Publisher', value: 'Supergiant Games' },
        { label: 'Release Date', value: '17.09.2020' },
        { label: 'Genres', value: 'Action Roguelike, Hack and Slash' },
        { label: 'Platforms', value: 'PC, Mac, Switch, PS4, PS5, Xbox One, Series X/S' },
        { label: 'Metacritic', value: '93 / 100' },
        { label: 'Average Playtime', value: '40+ hours' },
      ],
      overview:
        'As the immortal Prince of the Underworld, Zagreus wields the powers and mythic weapons of Olympus to free himself from the clutches of his father Hades in fast-paced rogue-like combat.',
      links: [
        { label: 'Official Website', href: 'https://www.supergiantgames.com/games/hades' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/1145360/' },
      ],
    },
  },
  {
    id: 'the-elder-scrolls-v-skyrim',
    title: 'The Elder Scrolls V: Skyrim',
    subtitle: 'Bethesda Game Studios · Open World Fantasy',
    description:
      'The next chapter in the highly anticipated Elder Scrolls saga arrives from the makers of the 2006 and 2008 Games of the Year, Bethesda Game Studios.',
    imageUrl: 'https://media.rawg.io/media/games/7cf/7cfc9220b401b7a300e409e539c9abb5.jpg',
    year: 2011,
    tags: ['RPG', 'Open World', 'Fantasy', 'Action'],
    score: '9.4',
    details: {
      tagline: 'Fus Ro Dah!',
      facts: [
        { label: 'Developer', value: 'Bethesda Game Studios' },
        { label: 'Publisher', value: 'Bethesda Softworks' },
        { label: 'Release Date', value: '11.11.2011' },
        { label: 'Genres', value: 'Action RPG, Open World, Fantasy' },
        { label: 'Platforms', value: 'PC, PlayStation 3/4/5, Xbox 360/One/Series, Switch' },
        { label: 'Metacritic', value: '94 / 100' },
        { label: 'Average Playtime', value: '100+ hours' },
      ],
      overview:
        'The Empire of Tamriel is on the edge. High King of Skyrim was murdered, and the dragons have returned. You are the Dovahkiin, Dragonborn, the only one who can stand among them.',
      links: [{ label: 'Steam', href: 'https://store.steampowered.com/app/489830/' }],
    },
  },
  {
    id: 'god-of-war-2018',
    title: 'God of War',
    subtitle: 'Santa Monica Studio · Norse Action Adventure',
    description:
      'His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters.',
    imageUrl: 'https://media.rawg.io/media/games/4be/4be6a6ad03647293dc2f6d5da4019f79.jpg',
    year: 2018,
    tags: ['Action', 'Adventure', 'Mythology', 'Story Rich'],
    score: '9.4',
    details: {
      tagline: 'A new beginning for Kratos and Atreus',
      facts: [
        { label: 'Developer', value: 'Santa Monica Studio' },
        { label: 'Publisher', value: 'PlayStation PC LLC' },
        { label: 'Release Date', value: '20.04.2018' },
        { label: 'Genres', value: 'Action, Adventure, Hack and Slash' },
        { label: 'Platforms', value: 'PC, PlayStation 4, PlayStation 5' },
        { label: 'Metacritic', value: '94 / 100' },
        { label: 'Average Playtime', value: '30 hours' },
      ],
      overview:
        'Living as a man outside the shadow of the gods, Kratos must adapt to unfamiliar lands, unexpected threats, and a second chance at being a father to his son Atreus.',
      links: [
        { label: 'Official Website', href: 'https://www.playstation.com/en-us/games/god-of-war/' },
        { label: 'Steam', href: 'https://store.steampowered.com/app/1593500/' },
      ],
    },
  },
]

export const searchFallbackGames = (query: string): SearchCandidate[] => {
  const q = query.trim().toLowerCase()
  if (!q) return FALLBACK_GAMES.slice(0, 8)
  return FALLBACK_GAMES.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.subtitle.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q)),
  )
}

export const getFallbackGameDetails = (id: string): CollectionDetails | null => {
  const found = FALLBACK_GAMES.find((g) => g.id === id)
  return found ? found.details : null
}
