/**
 * Badges coloridos para categorias e tipo de veículo do instrutor.
 */
const ESTILO_POR_TIPO = {
  a: 'badge-cat--a',
  b: 'badge-cat--b',
  ab: 'badge-cat--ab',
  manual: 'badge-cat--manual',
  automatico: 'badge-cat--automatico',
};

export function CategoryBadges({ tags, className = '' }) {
  if (!tags?.length) return null;

  return (
    <div className={`badge-cat-list ${className}`.trim()} role="list" aria-label="Categorias">
      {tags.map((tag) => (
        <span
          key={`${tag.tipo}-${tag.label}`}
          className={`badge-cat ${ESTILO_POR_TIPO[tag.tipo] || 'badge-cat--default'}`}
          role="listitem"
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
