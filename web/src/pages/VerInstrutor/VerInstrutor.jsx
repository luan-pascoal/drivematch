import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteNavLinks, SiteHeaderGuestActions, SiteHeaderLoggedActions } from '../../components/layout/SiteHeader';
import { CategoryBadges } from '../../components/instructors/CategoryBadges';
import { buscarInstrutorPorId } from '../../data/instrutoresMock';
import './VerInstrutor.css';

export function VerInstrutor({ usuario, dadosUsuario }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const instrutor = buscarInstrutorPorId(id);

  const valorFormatado = instrutor
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(instrutor.valorHora)
    : '';

  const exigeLogin = (acao) => {
    if (!usuario?.logado) {
      navigate('/login', { state: { msg: 'Faça login para usar esta opção.' } });
      return;
    }
    acao();
  };

  const agendarAula = () => {
    exigeLogin(() => {
      // Fluxo de agendamento será implementado depois
      alert('Agendamento em breve. Você está logado e pode reservar uma aula.');
    });
  };

  const enviarMensagem = () => {
    exigeLogin(() => {
      alert('Mensagens em breve.');
    });
  };

  const salvarFavorito = () => {
    exigeLogin(() => {
      alert('Favoritos em breve.');
    });
  };

  const compartilharPerfil = () => {
    exigeLogin(async () => {
      const url = window.location.href;
      const titulo = `Perfil de ${instrutor.nome} — MatchMarcha`;

      if (navigator.share) {
        try {
          await navigator.share({ title: titulo, url });
          return;
        } catch {
          /* usuário cancelou ou falhou — tenta copiar */
        }
      }

      try {
        await navigator.clipboard.writeText(url);
        alert('Link do perfil copiado.');
      } catch {
        alert(url);
      }
    });
  };

  if (!instrutor) {
    return (
      <AppLayout headerRight={
        dadosUsuario ? <SiteHeaderLoggedActions usuario={dadosUsuario} /> : <SiteHeaderGuestActions />
      }>
        <div className="instrutor-not-found">
          <h1>Instrutor não encontrado</h1>
          <p className="muted">O perfil que você procura não existe ou foi removido.</p>
          <Link className="btn btn--square btn--primary" to="/">
            Voltar para a página inicial
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      headerRight={
        dadosUsuario ? <SiteHeaderLoggedActions usuario={dadosUsuario} /> : <SiteHeaderGuestActions />
      }
      footerRight={`Perfil de ${instrutor.nome}`}
    >
      <Link className="instrutor-page__back" to="/#instrutores">
        ← Voltar para instrutores
      </Link>

      <div className="instrutor-page__grid">
        <div className="instrutor-page__left">
          <header className="instrutor-profile__header">
            <img
              className="instrutor-profile__photo"
              src={instrutor.foto}
              alt={`Foto de ${instrutor.nome}`}
              width={120}
              height={120}
            />
            <div>
              <h1 className="instrutor-profile__name">{instrutor.nome}</h1>
              <p className="instrutor-profile__local">{instrutor.local}</p>
              <p className="instrutor-profile__local">{instrutor.horario}</p>
            </div>
          </header>

          <ul className="instrutor-stats">
            <li className="instrutor-stats__item">
              <p className="instrutor-stats__value">
                <span className="instrutor-stats__emoji" aria-hidden="true">⭐</span>
                <span>{instrutor.nota.toFixed(1).replace('.', ',')}</span>
              </p>
              <p className="instrutor-stats__label">
                {instrutor.totalAvaliacoes} avaliações
              </p>
            </li>
            <li className="instrutor-stats__item">
              <p className="instrutor-stats__value">
                <span className="instrutor-stats__emoji" aria-hidden="true">📅</span>
                <span>{instrutor.tempoCadastro}</span>
              </p>
              <p className="instrutor-stats__label">Tempo de cadastro</p>
            </li>
            <li className="instrutor-stats__item">
              <p className="instrutor-stats__value">
                <span className="instrutor-stats__emoji" aria-hidden="true">🚗</span>
                <span>{instrutor.aulasDadas}</span>
              </p>
              <p className="instrutor-stats__label">Aulas dadas</p>
            </li>
            <li className="instrutor-stats__item instrutor-stats__item--categories">
              <p className="instrutor-stats__value instrutor-stats__value--badges">
                <CategoryBadges tags={instrutor.tags} className="badge-cat-list--profile" />
              </p>
              <p className="instrutor-stats__label">Categorias</p>
            </li>
          </ul>

          <section className="instrutor-about" aria-labelledby="sobre-mim-titulo">
            <h2 id="sobre-mim-titulo" className="instrutor-about__title">
              Sobre mim
            </h2>
            <p className="instrutor-about__text">{instrutor.sobreMim}</p>
          </section>
        </div>

        <aside className="instrutor-page__right" aria-label="Agendar aula">
          <div className="instrutor-booking">
            <div className="instrutor-booking__price-row">
              <p className="instrutor-booking__price">
                <span className="instrutor-booking__amount">{valorFormatado}</span>
                <span className="instrutor-booking__unit">/hora</span>
              </p>
              {/* <p className="instrutor-booking__duration">Aula de 50 min</p> */}
            </div>

            <button
              type="button"
              className="btn btn--square btn--cadastrar instrutor-booking__cta"
              onClick={agendarAula}
            >
              Agendar aula
            </button>

            <div className="instrutor-booking__actions">
              <button
                type="button"
                className="instrutor-booking__action"
                onClick={enviarMensagem}
                aria-label="Enviar mensagem"
              >
                <span className="instrutor-booking__action-emoji" aria-hidden="true">
                  💬
                </span>
                <span className="instrutor-booking__action-text">Mensagem</span>
              </button>
              <button
                type="button"
                className="instrutor-booking__action"
                onClick={salvarFavorito}
                aria-label="Salvar nos favoritos"
              >
                <span className="instrutor-booking__action-emoji" aria-hidden="true">
                  ⭐
                </span>
                <span className="instrutor-booking__action-text">Favoritar</span>
              </button>
              <button
                type="button"
                className="instrutor-booking__action"
                onClick={compartilharPerfil}
                aria-label="Compartilhar perfil"
              >
                <span className="instrutor-booking__action-emoji" aria-hidden="true">
                  🔗
                </span>
                <span className="instrutor-booking__action-text">Compartilhar</span>
              </button>
            </div>

            {!usuario?.logado && usuario !== undefined && (
              <p className="instrutor-booking__login-hint">
                Entre na sua conta para agendar, enviar mensagem, favoritar ou compartilhar.
              </p>
            )}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
