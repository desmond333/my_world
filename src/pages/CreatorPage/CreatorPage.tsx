import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, Send } from 'lucide-react'
import { creator } from '../../data'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import './CreatorPage.css'

export const CreatorPage = () => (
  <main className="page-shell">
    <AppTopbar />

    <section className="creator-head">
      <p className="eyebrow">
        <Heart size={15} /> автор
      </p>
      <h1>{creator.name}</h1>
      <p className="intro">Фронтенд-разработчик этого приложения. Животные, погода, подборки фильмов и всё остальное — его работа.</p>
    </section>

    <section className="creator-card">
      <p className="creator-text">
        Если приложение оказалось полезным и хочется сказать спасибо — это всегда приятно. Можно написать лично, а можно просто отправить
        благодарность на карту: автору будет приятно независимо от способа.
      </p>

      <div className="creator-actions">
        <a className="add-button creator-telegram" href={creator.telegram} target="_blank" rel="noopener noreferrer">
          <Send size={16} /> Написать в Telegram
        </a>
      </div>

      <p className="creator-note-line">Спасибо, что пользуешься.</p>
    </section>

    <Link className="creator-back" to="/">
      <ArrowLeft size={16} /> Вернуться к животному дня
    </Link>
  </main>
)
