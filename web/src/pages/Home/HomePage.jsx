import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AlertaSucesso } from '../../components/AlertaSucesso';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteNavLinks, SiteHeaderGuestActions, SiteHeaderLoggedActions } from '../../components/layout/SiteHeader';
import { InstructorCard } from '../../components/instructors/InstructorCard';
import { instrutoresMock } from '../../data/instrutoresMock';
import './HomePage.css';

const OPCOES_LOCAL = [
  { valor: '', rotulo: 'Todos os locais' },
  { valor: 'sao paulo', rotulo: 'São Paulo' },
  { valor: 'campinas', rotulo: 'Campinas' },
  { valor: 'guarulhos', rotulo: 'Guarulhos' },
  { valor: 'santo andre', rotulo: 'Santo André' },
  { valor: 'osasco', rotulo: 'Osasco' },
  { valor: 'sao bernardo', rotulo: 'São Bernardo' },
];

const OPCOES_CATEGORIA = [
  { valor: '', rotulo: 'Todas as categorias' },
  { valor: 'a', rotulo: 'Categoria A (moto)' },
  { valor: 'b', rotulo: 'Categoria B (carro)' },
  { valor: 'ab', rotulo: 'Categoria AB' },
];

const OPCOES_PRECO = [
  { valor: '', rotulo: 'Qualquer preço' },
  { valor: '80', rotulo: 'Até R$ 80/hora' },
  { valor: '90', rotulo: 'Até R$ 90/hora' },
  { valor: '100', rotulo: 'Até R$ 100/hora' },
];

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function filtrarInstrutores(lista, { busca, local, categoria, precoMax }) {
  const termo = normalizarTexto(busca.trim());

  return lista.filter((item) => {
    const localNorm = normalizarTexto(item.local);
    const categoriasNorm = normalizarTexto(item.categorias);
    const nomeNorm = normalizarTexto(item.nome);

    if (termo) {
      const bateBusca =
        nomeNorm.includes(termo) ||
        localNorm.includes(termo) ||
        categoriasNorm.includes(termo);
      if (!bateBusca) return false;
    }

    if (local && !localNorm.includes(local)) return false;

    if (categoria === 'a' && !categoriasNorm.includes('cat. a')) return false;
    if (categoria === 'b' && !categoriasNorm.includes('cat. b')) return false;
    if (categoria === 'ab' && !categoriasNorm.includes('ab')) return false;

    if (precoMax && item.valorHora > Number(precoMax)) return false;

    return true;
  });
}

function BotoesLogado({ nome, onLogout }) {
  return (
  <>
      <span className="home-header-user__name" title={nome}>
        Olá, {nome}
      </span>
      <Link className="btn btn--square btn--entrar" to="/editar-perfil">
        Meu perfil
      </Link>
      <button type="button" className="btn btn--square btn--ghost" onClick={onLogout}>
        Sair
      </button>
    </>
  );
}

export function HomePage({ usuario, dadosUsuario, carregarUsuario }) {
  const [alertaSucesso, setAlertaSucesso] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroPreco, setFiltroPreco] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const logado = Boolean(usuario?.logado);
  const carregando = usuario === undefined;

  useEffect(() => {
    if (location.state?.msgSucesso) {
      setAlertaSucesso(location.state.msgSucesso);
    }
  }, [location.state?.msgSucesso]);

  const instrutoresFiltrados = useMemo(
    () =>
      filtrarInstrutores(instrutoresMock, {
        busca,
        local: filtroLocal,
        categoria: filtroCategoria,
        precoMax: filtroPreco,
      }),
    [busca, filtroLocal, filtroCategoria, filtroPreco]
  );

  const fazerLogout = async () => {
    await axios.delete('https://matchmarcha.infinityfree.me/api/logout');
    await carregarUsuario();
    navigate('/');
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroLocal('');
    setFiltroCategoria('');
    setFiltroPreco('');
  };

  const temFiltroAtivo = busca || filtroLocal || filtroCategoria || filtroPreco;

  return (
    <AppLayout
      headerRight={
        dadosUsuario ? <SiteHeaderLoggedActions usuario={dadosUsuario} /> : <SiteHeaderGuestActions />
      }
      footerRight="Encontre o instrutor ideal para sua CNH"
    >
      <div className="stack stack--lg">
        {alertaSucesso && (
          <AlertaSucesso mensagem={alertaSucesso} onClose={() => setAlertaSucesso('')} />
        )}

        <section className="home-hero" aria-labelledby="home-titulo">
          <h1 id="home-titulo" className="home-hero__title">
            Encontre instrutores perto de você
          </h1>
          <p className="home-hero__text">
            Compare valores, horários e categorias. Agende suas aulas de direção com
            profissionais autônomos em um só lugar.
          </p>
        </section>

        <section className="home-search" aria-label="Buscar instrutores">
          <div className="home-search__row">
            <div className="home-search__main">
              <div className="home-search__field">
                <label className="label" htmlFor="busca-instrutor">
                  Buscar instrutor
                </label>
                <input
                  id="busca-instrutor"
                  className="input"
                  type="search"
                  placeholder="Nome, bairro ou categoria..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn btn--square btn--ghost home-search__toggle"
                onClick={() => setFiltrosAbertos((aberto) => !aberto)}
                aria-expanded={filtrosAbertos}
                aria-controls="painel-filtros"
              >
                {filtrosAbertos ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>
            </div>

            {filtrosAbertos && (
              <div id="painel-filtros" className="home-search__filters">
                <div className="field">
                  <label className="label" htmlFor="filtro-local">
                    Local
                  </label>
                  <select
                    id="filtro-local"
                    className="input"
                    value={filtroLocal}
                    onChange={(e) => setFiltroLocal(e.target.value)}
                  >
                    {OPCOES_LOCAL.map((op) => (
                      <option key={op.valor || 'todos'} value={op.valor}>
                        {op.rotulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label" htmlFor="filtro-categoria">
                    Categoria
                  </label>
                  <select
                    id="filtro-categoria"
                    className="input"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    {OPCOES_CATEGORIA.map((op) => (
                      <option key={op.valor || 'todas'} value={op.valor}>
                        {op.rotulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label" htmlFor="filtro-preco">
                    Preço
                  </label>
                  <select
                    id="filtro-preco"
                    className="input"
                    value={filtroPreco}
                    onChange={(e) => setFiltroPreco(e.target.value)}
                  >
                    {OPCOES_PRECO.map((op) => (
                      <option key={op.valor || 'qualquer'} value={op.valor}>
                        {op.rotulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {temFiltroAtivo && (
              <div className="home-search__actions">
                <button type="button" className="btn btn--square btn--ghost" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="instrutores" aria-labelledby="lista-instrutores-titulo">
          <p className="instructors-grid__count">
            {instrutoresFiltrados.length}{' '}
            {instrutoresFiltrados.length === 1 ? 'instrutor encontrado' : 'instrutores encontrados'}
          </p>

          <h2 id="lista-instrutores-titulo" className="sr-only">
            Lista de instrutores
          </h2>

          <ul className="instructors-grid">
            {instrutoresFiltrados.length > 0 ? (
              instrutoresFiltrados.map((instrutor) => (
                <li key={instrutor.id}>
                  <InstructorCard instrutor={instrutor} />
                </li>
              ))
            ) : (
              <li className="instructors-grid__empty">
                Nenhum instrutor encontrado com esses filtros. Tente outra busca ou limpe os
                filtros.
              </li>
            )}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
