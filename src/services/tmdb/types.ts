export type TmdbCountry = { iso_3166_1: string; name: string }

export type TmdbMovieDetails = {
  id: number
  title?: string
  original_title?: string
  tagline?: string
  overview?: string
  runtime?: number | null
  status?: string
  release_date?: string
  vote_average?: number
  vote_count?: number
  budget?: number
  revenue?: number
  original_language?: string
  poster_path?: string | null
  backdrop_path?: string | null
  genres?: { id: number; name: string }[]
  production_countries?: TmdbCountry[]
  origin_country?: string[]
  imdb_id?: string | null
  homepage?: string | null
}

export type MovieDetails = {
  id: string
  title: string
  originalTitle: string
  tagline: string
  overview: string
  runtimeMinutes: number | null
  releaseDate: string
  status: string
  score: string | null
  votes: number | null
  budget: number | null
  revenue: number | null
  genres: string[]
  countries: TmdbCountry[]
  originalLanguage: string
  imageUrl: string | null
  backdropUrl: string | null
  imdbId: string | null
  homepage: string | null
}
