import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AlertaVeiculo.css';

export function AlertaVeiculo({ onClose }) {

    const navigate = useNavigate();

    useEffect(() => {
        const eventHandler = (event) => { 
            if (event.key === 'Escape') {
                onClose();
            }  
        };
        // Escuta qualquer tecla pressionada no documento inteiro
        // Sempre que uma tecla for pressionada, roda a função eventHandler
        document.addEventListener('keydown', eventHandler);
        // Quando o modal sai da tela, remove o listener para não vazar memória
        return () => document.removeEventListener('keydown', eventHandler);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}> 
        {/*
            O overlay é a camada escura que cobre a tela inteira. Quando o usuário clica nessa área (fora do card),
            o onClick dispara o onClose e fecha o modal.
        */}
            <div className="modal modal--aviso" onClick={(e) => e.stopPropagation()}>
        {/*
            Aq o card bloqueia o clique de "vazar". No navegador, quando você clica em um elemento filho, ele sobe pelo
            DOM pro elemento pai - isso se chama propagação.  Então se você clicasse dentro do card, o clique subiria 
            até o overlay e fecharia o modal sem querer.
            O e.stopPropagation() interrompe essa subida. O clique fica "preso" no card e não chega ao overlay.
        */}

                <div className="modal__corpo">
                    <h2 className="modal__titulo">
                        <svg
                            className="modal__icone"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M12 2L2 20h20L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 9v5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <circle cx="12" cy="17" r="1" fill="currentColor" />
                        </svg>
                        Complete seu perfil
                    </h2>

                    <p className="modal__texto">
                        Para que seu perfil seja exibido de forma completa, é necessário cadastrar
                        os veículos utilizados em suas aulas práticas.
                    </p>
                    <p className="modal__texto">
                        Enquanto isso não for realizado, seu perfil permanecerá visível, porém
                        sem as informações de veículos.
                    </p>

                    <p className="modal__pergunta">
                        Deseja cadastrar seus veículos agora?
                    </p>
                </div>

                <div className="modal__acoes">
                    <button
                        type="button"
                        className="btn btn--square btn--ghost modal__btn"
                        onClick={onClose}
                    >
                        Mais tarde
                    </button>
                    <button
                        type="button"
                        className="btn btn--square btn--cadastrar modal__btn"
                        onClick={() => {
                            onClose();
                            navigate('/veiculos');
                        }}
                    >
                        Cadastrar veículo
                    </button>
                </div>

            </div>
        </div>
    );
}
