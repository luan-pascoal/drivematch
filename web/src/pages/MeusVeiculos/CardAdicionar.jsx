import Adicionar from '../../assets/images/icons/adicionar.png';

export function CardAdicionar({ onClick }) {

    return (
        <article
            className="veiculo-card veiculo-card--adicionar veiculo-card--adicionar-solo"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onClick()}
            aria-label="Adicionar novo veículo"
        >
            <img className="veiculo-card__add-icon" src={Adicionar} alt="Adicionar veículo" />
            <p className="veiculo-card__add-texto">
                Nenhum veículo cadastrado.<br />Clique para adicionar.
            </p>
        </article>
    );

}
