import { Link } from 'react-router-dom'
import { creator } from '../../data'

export const CreatorNote = () => (
  <span className="creator-note">
    <Link to="/creator">сделал {creator.name}</Link>
  </span>
)
