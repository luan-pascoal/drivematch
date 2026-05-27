import { Link } from 'react-router-dom';
import { SiteNavLinks, SiteHeaderGuestActions } from './SiteHeader';

export function AppLayout({
  children,
  title = 'MatchMarcha',
  subtitle = 'Gestão de aulas de direção',
  headerNav = <SiteNavLinks />,
  headerRight,
  centerMain = false,
  footerLeft = '© MatchMarcha',
  footerRight = 'Projeto Acadêmico',
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>

      <header className="app-header" role="banner">
        <div className="container app-header__inner">
          <div className="app-header__start">
            <Link className="brand" to="/" aria-label="Ir para a página inicial">
              <span className="brand__mark" aria-hidden="true" />
              <span className="brand__text">
                <span className="brand__title">{title}</span>
                <span className="brand__subtitle">{subtitle}</span>
              </span>
            </Link>

            {headerNav && (
              <nav className="app-nav" aria-label="Navegação principal">
                {headerNav}
              </nav>
            )}
          </div>

          <div className="app-header__actions" aria-label="Ações do cabeçalho">
            {headerRight}
          </div>
        </div>
      </header>

      <main
        id="main"
        className={centerMain ? 'app-main app-main--center' : 'app-main'}
        role="main"
      >
        <div className="container">{children}</div>
      </main>

      <footer className="app-footer" role="contentinfo">
        <div className="container app-footer__inner">
          <small>{footerLeft}</small>
          <small className="muted">{footerRight}</small>
        </div>
      </footer>
    </div>
  );
}

