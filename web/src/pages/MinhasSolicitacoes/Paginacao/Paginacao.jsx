import "./Paginacao.css";

export function Paginacao({ pagina, totalPaginas, setPagina }) {

    if (totalPaginas <= 1) return null;

    const irParaPagina = (novaPagina) => {
        setPagina(novaPagina);
        document.getElementById('solic-lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <nav className="pagination" aria-label="Paginação de instrutores">
                {pagina > 1 && (
                    <button
                        type="button"
                        className="pagination__nav pagination__nav--prev"
                        onClick={() => irParaPagina(pagina - 1)}
                    >
                        Anterior
                    </button>
                )}

                <ul className="pagination__list">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                        <li key={num}>
                            <button
                                type="button"
                                className={`pagination__item ${num === pagina ? 'pagination__item--active' : ''}`}
                                onClick={() => irParaPagina(num)}
                                aria-current={num === pagina ? 'page' : undefined}
                            >
                                {num}
                            </button>
                        </li>
                    ))}
                </ul>

                {pagina < totalPaginas && (
                    <button
                        type="button"
                        className="pagination__nav pagination__nav--next"
                        onClick={() => irParaPagina(pagina + 1)}
                    >
                        Próximo
                    </button>
                )}
            </nav>
        </>
    );
}