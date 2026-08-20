/**
 * Badges coloridos para categorias e tipo de veículo do instrutor.
 */
const ESTILO_POR_TIPO = {
  A: 'badge-cat--a',
  B: 'badge-cat--b',
  AB: 'badge-cat--ab'
};

const ROTULO_POR_TIPO = {
  A: 'A',
  B: 'B',
  AB: 'AB'
};

export function CategoryBadges({ categoria, className = '' }) {
  if (!categoria) return null;

  return (
    <div className={`badge-cat-list ${className}`.trim()} role="list" aria-label="Categorias">
      <span
        className={`badge-cat ${ESTILO_POR_TIPO[categoria] || 'badge-cat--default'}`}
        role="listitem"
      >
        {categoria}
      </span>
    </div>
  );
}
