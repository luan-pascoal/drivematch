import { Link } from 'react-router-dom';
import { CategoryBadges } from './CategoryBadges';

/**
 * Card vertical de instrutor (vitrine / marketplace).
 */
export function InstructorCard({ instrutor }) {
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(instrutor.valorHora);

  return (
    <Link
      className="instructor-card instructor-card--link"
      to={`/instrutor/${instrutor.id}`}
      aria-label={`Ver perfil de ${instrutor.nome}`}
    >
      <div className="instructor-card__media">
        <img
          className="instructor-card__photo"
          src={instrutor.foto}
          alt=""
          loading="lazy"
          width={320}
          height={200}
        />
      </div>

      <div className="instructor-card__body">
        <div className="instructor-card__col instructor-card__col--info">
          <h3 className="instructor-card__name">{instrutor.nome}</h3>
          <p className="instructor-card__detail">
            <span className="instructor-card__label">Local</span>
            {instrutor.local}
          </p>
          <p className="instructor-card__detail">
            <span className="instructor-card__label">Horário</span>
            {instrutor.horario}
          </p>
          <div className="instructor-card__detail">
            <span className="instructor-card__label">Categorias</span>
            <CategoryBadges tags={instrutor.tags} />
          </div>
        </div>

        <div className="instructor-card__col instructor-card__col--price">
          <p className="instructor-card__price">
            <span className="instructor-card__price-value">{valorFormatado}</span>
            <span className="instructor-card__price-unit">/hora</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
