import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './SiteHeader.css';

/** Links da navbar ao lado do nome do site */
export function SiteNavLinks() {
  return (
    <>
      <Link className="app-nav__link" to="/#instrutores">
        Encontre instrutores
      </Link>
      <Link className="app-nav__link" to="/cadastro-instrutor">
        Seja um Instrutor
      </Link>
    </>
  );
}

/** Botões do canto superior direito para visitantes */
export function SiteHeaderGuestActions() {
  return (
    <>
      <Link className="btn btn--square btn--entrar" to="/login">
        Entrar
      </Link>
      <Link className="btn btn--square btn--cadastrar" to="/cadastro-aluno">
        Cadastrar
      </Link>
    </>
  );
}

/** Botões e Dropdown do canto superior direito para Usuários Logados (Alunos) */
export function SiteHeaderLoggedActions({ usuario, carregarUsuario }) {
  
  const navigate = useNavigate();
  
  // Estado para controlar se o dropdown está aberto ou não
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Referência para o menu, usada para fechar ao clicar fora dele
  const menuRef = useRef();

  // Função simples para abrir/fechar o menu
  const alternarMenu = () => {
    setMenuAberto(!menuAberto);
  };


  // Efeito para fechar o dropdown se o usuário clicar fora dele
  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);





  const fazerLogout = async () => {
    try {
      const resposta = await axios.delete('/api/logout');
      
      if (resposta.status === 200 && resposta.data.sucesso === true) {
        

        await carregarUsuario();
        // redireciona
        navigate('/');

        
      } else {
        console.error('Erro ao fazer logout:', resposta.data.mensagem);
      }
    } catch (erro) {
      console.error('Erro na requisição de logout:', erro);
    }
  };



  // Pega apenas o primeiro nome do usuário
  const primeiroNome = usuario?.nome?.split(' ')[0] || 'Usuário';



  return (
    <div className="user-menu" ref={menuRef}>
      {/* Botão que ativa o menu */}
      <button 
        className="user-menu__trigger" 
        onClick={alternarMenu}
        aria-expanded={menuAberto}
        aria-haspopup="true"
        aria-label="Abrir menu"
      >
        <img 
          className="user-menu__avatar" 
          src={ usuario?.foto
          ? `http://localhost/MatchMarcha/uploads/${usuario.foto}`
          : `https://ui-avatars.com/api/?name=${primeiroNome}&background=0A4BAA&color=FFFFFF`} 
          alt={`Foto de ${primeiroNome}`} 
        />
        
        <span className="user-menu__nome">{primeiroNome}</span>
        
        <span className={`user-menu__seta ${menuAberto ? 'aberta' : ''}`}>▼</span>
      </button>

      {/* O Dropdown em si */}
      {menuAberto && (
        <div className="user-menu__dropdown">
          
          <div className="dropdown__secao dropdown__secao--tipo">
            <span className="dropdown__badge">Aluno</span>
          </div>

          <nav className="dropdown__secao dropdown__secao--links" aria-label="Menu do aluno">
            <Link to="/mensagens" onClick={() => setMenuAberto(false)}>Mensagens</Link>
            <Link to="/minhas-aulas" onClick={() => setMenuAberto(false)}>Minhas Aulas</Link>
            <Link to="/editar-perfil" onClick={() => setMenuAberto(false)}>Editar Perfil</Link>
            <Link to="/ajuda" onClick={() => setMenuAberto(false)}>Ajuda</Link>
          </nav>

          <div className="dropdown__secao dropdown__secao--sair">
            <button className="btn-sair" onClick={fazerLogout}>
              Sair da conta
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}