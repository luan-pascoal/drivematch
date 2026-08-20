import { Link } from 'react-router-dom';
import { CategoryBadges } from './CategoryBadges';
import FotoDefault from '../../assets/images/icons/user.png'
import './HomePage.css';

/**
 * Card vertical de instrutor (vitrine / marketplace).
 */
export function InstructorCard({ instrutor }) {
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(instrutor.preco);

  const srcFoto = instrutor?.foto
    ? `http://localhost/MatchMarcha/uploads/${instrutor.foto}`
    : FotoDefault;

  return (
    <Link
      className="instructor-card instructor-card--link"
      to={`/instrutor/${instrutor.instrutor_id}`}
      aria-label={`Ver perfil de ${instrutor.nome}`}
    >
      <div className="instructor-card__media">
        <img
          className="instructor-card__photo"
          src={srcFoto}
          alt=""
          loading="lazy"
          onError={(e) => {
            // Evita loop caso o próprio FOTO_PADRAO falhe
            if (e.currentTarget.src !== window.location.origin + FotoDefault) {
              e.currentTarget.src = FotoDefault;
            }
          }}
        />
      </div>

      <div className="instructor-card__body">
        <div className="instructor-card__col instructor-card__col--info">
          <h3 className="instructor-card__name">{instrutor.nome}</h3>
          <p className="instructor-card__detail">
            <span className="instructor-card__label">Cidade</span>
            {instrutor.cidade}
          </p>
          <p className="instructor-card__detail">
            <span className="instructor-card__label">Horário</span>
            {instrutor.periodos}
          </p>
          <div className="instructor-card__detail">
            <span className="instructor-card__label">Categorias</span>
            <CategoryBadges categoria={instrutor.categoria} />
          </div>
          <p className="instructor-card__price">
            <span className="instructor-card__price-value">{valorFormatado}</span>{' '}
            <span className="instructor-card__price-unit">/hora</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
