import { CategoryBadges } from '../../Home/CategoryBadges';
import { VehicleCard } from '../VehicleCard/VehicleCard.jsx';
import FotoDefault from '../../../assets/images/icons/user.png';
import './InfosInstrutor.css';

export function InfosInstrutor({ instrutor, veiculos }) {

    const srcFoto = instrutor?.foto
        ? `http://localhost/MatchMarcha/uploads/${instrutor.foto}`
        : FotoDefault;

    function formatarPeriodos(periodos) {
        if (!periodos || periodos.length === 0) return 'Período não informado';

        const nomes = periodos.map(p => p.nome);

        if (nomes.length === 1) return nomes[0];
        if (nomes.length === 2) return `${nomes[0]} e ${nomes[1]}`;

        const ultimo = nomes[nomes.length - 1];
        const resto = nomes.slice(0, -1);
        return `${resto.join(', ')} e ${ultimo}`;
    }

    return (
        <div className="instrutor-page__left">
            <header className="instrutor-profile__header">
                <img
                    className="instrutor-profile__photo"
                    src={srcFoto}
                    alt={`Foto de ${instrutor.nome}`}
                    width={120}
                    height={120}
                />
                <div>
                    <h1 className="instrutor-profile__name">{instrutor.nome}</h1>
                    <p className="instrutor-profile__local">{instrutor.cidade.nome}</p>
                    <p className="instrutor-profile__local">{formatarPeriodos(instrutor.periodos)}</p>
                </div>
            </header>

            <ul className="instrutor-stats">
                {/* 
              TODO: valores fixos temporários — substituir quando o backend implementar nota, avaliações, tempo de cadastro e aulas dadas 
              UNICO VALOR VERDADEIRO AQ SÃO AS CATEGORIAS
            */}
                <li className="instrutor-stats__item">
                    <p className="instrutor-stats__value">
                        <span className="instrutor-stats__emoji" aria-hidden="true">⭐</span>
                        <span>4,8</span>
                    </p>
                    <p className="instrutor-stats__label">32 avaliações</p>
                </li>
                <li className="instrutor-stats__item">
                    <p className="instrutor-stats__value">
                        <span className="instrutor-stats__emoji" aria-hidden="true">📅</span>
                        <span>2 anos</span>
                    </p>
                    <p className="instrutor-stats__label">Tempo de cadastro</p>
                </li>
                <li className="instrutor-stats__item">
                    <p className="instrutor-stats__value">
                        <span className="instrutor-stats__emoji" aria-hidden="true">🚗</span>
                        <span>150</span>
                    </p>
                    <p className="instrutor-stats__label">Aulas dadas</p>
                </li>
                <li className="instrutor-stats__item instrutor-stats__item--categories">
                    <div className="instrutor-stats__value instrutor-stats__value--badges">
                        <CategoryBadges categoria={instrutor.tipo} className="badge-cat-list--profile" />
                    </div>
                    <p className="instrutor-stats__label">Categorias</p>
                </li>
            </ul>

            <section className="instrutor-about" aria-labelledby="sobre-mim-titulo">
                <h2 id="sobre-mim-titulo" className="instrutor-about__title">
                    Sobre mim
                </h2>
                {/* TODO: substituir por instrutor.sobreMim quando o backend implementar esse campo */}
                <p className="instrutor-about__text">
                    Instrutor dedicado a ajudar novos motoristas a ganharem confiança no trânsito,
                    com aulas pacientes e adaptadas ao ritmo de cada aluno.
                </p>
            </section>
            <section className="instrutor-vehicles" aria-labelledby="veiculos-titulo">
                <div className="instrutor-vehicles__header">
                    <h2 id="veiculos-titulo" className="instrutor-vehicles__title">
                        Veículos
                    </h2>
                    <span className="instrutor-vehicles__count">
                        {veiculos.length} {veiculos.length === 1 ? 'veículo' : 'veículos'}
                    </span>
                </div>

                {veiculos.length > 0 ? (
                    <ul className="instrutor-vehicles__list">
                        {veiculos.map((veiculo) => (
                            <VehicleCard key={veiculo.id} veiculo={veiculo} />
                        ))}
                    </ul>
                ) : (
                    <p className="instrutor-vehicles__empty muted">
                        Nenhum veículo cadastrado ainda.
                    </p>
                )}
            </section>
        </div>
    );
}