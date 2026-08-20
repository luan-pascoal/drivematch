import { useEffect } from 'react';
import './Popup.css';
import Fechar from '../../assets/images/icons/fechar.png';

export function Popup({ aberto, onFechar, titulo, children }) {

    useEffect(() => {

        // Se o popup estiver fechado, não faz nada. Evita registrar listener à toa
        if (!aberto) return;

        // Função que escuta as teclas, nesse caso so a tecla escape
        const handler = (event) => { 
            // Se clicar em Escape, roda onFechar()
            if (event.key === 'Escape') onFechar(); 
        };

        // Registra o event listener no window (escuta qualquer tecla pressionada na página)
        window.addEventListener('keydown', handler);

        // Remove o listener quando o componente desmonta ou quando o efeito roda de novo
        return () => window.removeEventListener('keydown', handler);

    }, [aberto, onFechar]); // Roda sempre que aberto ou onFechar mudar

    if (!aberto) return null; // Se fechado, o componente não renderiza nada 

    return (

        // div className="popup-overlay" => Fundo escuro => fecha ao clicar nele 
        // div className="popup" => A caixa branca central => Não fecha ao clicar nele
        // Oq controla essa feature => event.target === event.currentTarget && onFechar()
        // event.target => onde o clique nasceu
        // event.currentTarget — onde o listener tá escutando (className="popup-overlay")
        // Se os dois forem iguais, quer dizer que ele clicou no fundo escuro e roda onFechar()
        <div className="popup-overlay" onClick={event => event.target === event.currentTarget && onFechar()} role="dialog" aria-modal="true">
            <div className="popup">
                <div className="popup__header">
                    <h2 className="popup__titulo">{titulo}</h2>
                    {/* Esse botao chama onFechar diretamente*/}
                    <button className="popup__fechar" onClick={onFechar} aria-label="Fechar popup"> 
                        <img className="popup__fechar-icone" src={Fechar} alt="Fechar" />
                    </button>
                </div>
                <div className="popup__corpo">
                    {children}
                </div>
            </div>
        </div>
        
    );
}