import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css'; // Importando o nosso CSS

export function ErrorPage({ tipo = '404' }) {
  const navigate = useNavigate();
  const [contador, setContador] = useState(15);

  // Define os textos e ícones baseados no tipo de página
  const ehDesenvolvimento = tipo === 'desenvolvimento';
  
  const titulo = ehDesenvolvimento ? '503' : '404';
  const subtitulo = ehDesenvolvimento 
    ? 'Esta funcionalidade não está disponível no momento ou está em desenvolvimento.' 
    : 'A página que você está procurando não foi encontrada, foi movida ou não existe mais.';
  
  // Usando emojis como placeholders visuais (você pode trocar por SVGs depois)
  const icone = ehDesenvolvimento ? '🚧' : '🔍';

  const cor_card = "error-page__card error-page__" + (ehDesenvolvimento ? "503" : "404")

  // Lógica do cronômetro de redirecionamento automático
  useEffect(() => {
    // Se o contador chegar a zero, redireciona para a Home
    if (contador === 0) {
      navigate('/');
      return;
    }

    // Diminui 1 segundo a cada 1000 milissegundos
    const timer = setInterval(() => {
      setContador((prev) => prev - 1);
    }, 1000);

    // Limpa o timer quando o componente é desmontado
    return () => clearInterval(timer);
  }, [contador, navigate]);

  return (
    <div className="error-page">
      <div className={cor_card}>
        <div className="error-page__icone" aria-hidden="true">
          {icone}
        </div>
        
        <h1 className="error-page__titulo">Erro {titulo}</h1>
        <p className="error-page__subtitulo">{subtitulo}</p>
        
        <div className="error-page__acoes">
          {/* navigate(-1) faz o navegador voltar exatamente para a página anterior */}
          <button className="btn btn--voltar" onClick={() => navigate(-1)}>
            Voltar
          </button>
          
          <button className="btn btn--home" onClick={() => navigate('/')}>
            Ir para o Início
          </button>
        </div>
        
        {/* aria-live ajuda leitores de tela a avisar pessoas com deficiência visual sobre o tempo */}
        <p className="error-page__timer" aria-live="polite">
          Redirecionando automaticamente em <strong>{contador}</strong> segundos...
        </p>
      </div>
    </div>
  );
}