import { useNavigate } from "react-router";
import { Popup } from "../../../components/popup/Popup";
import { SolicitarAula } from "../SolicitarAula/SolicitarAula.jsx";
import './AcoesInstrutor.css';

export function AcoesInstrutor({ usuario, instrutor, cidades, handleSolicitarAula, setPopupSolicitarAula, popupSolicitarAula }) {

    const navigate = useNavigate();

    const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2,
    }).format(instrutor.preco);

    const exigeLogin = (acao) => {
        if (!usuario?.logado) {
            navigate('/login', { state: { msg: 'Faça login para usar esta opção.' } });
            return;
        }
        acao();
    };

    const solicitarAula = () => {
        exigeLogin(() => {
            setPopupSolicitarAula(true);
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
    return (
        
        <aside className="instrutor-page__right" aria-label="Solicitar aula">
            <div className="instrutor-booking">
                <div className="instrutor-booking__price-row">
                    <p className="instrutor-booking__price">
                        <span className="instrutor-booking__amount">{valorFormatado}</span>
                        <span className="instrutor-booking__unit">/hora</span>
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn--square btn--cadastrar instrutor-booking__cta"
                    onClick={solicitarAula}
                >
                    Solicitar aula
                </button>

                <div className="instrutor-booking__actions">
                    <button
                        type="button"
                        className="instrutor-booking__action"
                        onClick={salvarFavorito}
                        aria-label="Salvar nos favoritos"
                    >
                        <span className="instrutor-booking__action-emoji" aria-hidden="true">⭐</span>
                        <span className="instrutor-booking__action-text">Favoritar</span>
                    </button>
                    <button
                        type="button"
                        className="instrutor-booking__action"
                        onClick={compartilharPerfil}
                        aria-label="Compartilhar perfil"
                    >
                        <span className="instrutor-booking__action-emoji" aria-hidden="true">🔗</span>
                        <span className="instrutor-booking__action-text">Compartilhar</span>
                    </button>
                </div>

                <SolicitarAula
                    aberto={popupSolicitarAula} 
                    onFechar={() => {setPopupSolicitarAula(false)}}
                    handleSolicitarAula={handleSolicitarAula}
                    cidades={cidades}
                    instrutor={instrutor}
                />

                {!usuario?.logado && usuario !== undefined && (
                    <p className="instrutor-booking__login-hint">
                        Entre na sua conta para agendar, enviar mensagem, favoritar ou compartilhar.
                    </p>
                )}
            </div>
        </aside>
    );
}