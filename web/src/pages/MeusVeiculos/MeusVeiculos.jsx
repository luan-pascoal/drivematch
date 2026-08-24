import './MeusVeiculos.css';
import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteHeaderLoggedActions } from '../../components/layout/SiteHeader';
import { Carrossel } from './Carrossel';
import { PopupAdicionar } from './PopupAdicionar';
import { PopupEditar } from './PopupEditar';
import { PopupExcluir } from './PopupExcluir';
import { AlertaSucesso } from '../../components/alertas/AlertaSucesso';

export function MeusVeiculos({ veiculos, recarregarVeiculos, erroVeiculos, dadosUsuario, carregarUsuario, usuario, cores }) {

    const [popupAdicionar, setPopupAdicionar] = useState(false);
    const [popupEditar, setPopupEditar] = useState(false);
    const [veiculoEditando, setVeiculoEditando] = useState(null);
    const [popupExcluir, setPopupExcluir] = useState(false);
    const [veiculoExcluindo, setVeiculoExcluindo] = useState(null);
    const [alertaSucesso, setAlertaSucesso] = useState(null);
    const [alertaId, setAlertaId] = useState(null);

    function handleAdicaoSucesso(mensagem){
        setPopupAdicionar(false);
        setAlertaSucesso(mensagem);
        setAlertaId(Date.now());
    }

    function handleEdicaoSucesso(mensagem) {
        setPopupEditar(false);
        setVeiculoEditando(null);
        setAlertaSucesso(mensagem);
        setAlertaId(Date.now());
    }

    function handleExclusaoSucesso(mensagem){
        setPopupExcluir(false);
        setVeiculoExcluindo(null);
        setAlertaSucesso(mensagem);
        setAlertaId(Date.now());
    }

    return (
        <AppLayout
            headerRight={<SiteHeaderLoggedActions dadosUsuario={dadosUsuario} carregarUsuario={carregarUsuario} tipoUsuario={usuario.usuario.tipo} />}
            footerRight="Meus veículos"
            fullWidth={
                <Carrossel
                    veiculos={veiculos}
                    onEditar={(veiculo) => { setVeiculoEditando(veiculo); setPopupEditar(true); }}
                    onExcluir={(veiculo) => { setVeiculoExcluindo(veiculo); setPopupExcluir(true); }}
                    onAdicionar={() => setPopupAdicionar(true)}
                    erroVeiculos={erroVeiculos}
                />
            }
        >
            {alertaSucesso && (
                <AlertaSucesso
                    key={alertaId}
                    mensagem={alertaSucesso}
                    onClose={() => setAlertaSucesso(null)}
                />
            )}
            <div className="veiculos-topo">
                <div>
                    <h1 className="title">Meus veículos</h1>
                    <p className="subtitle">Gerencie os veículos disponíveis para suas aulas.</p>
                </div>

                {/* Contador + botão adicionar — só aparecem quando há veículos */}
                {veiculos.length > 0 && (
                    <div className="veiculos-topo__acoes">
                        <span className="veiculos-topo__contador">
                            {veiculos.length} {veiculos.length === 1 ? 'veículo' : 'veículos'}
                        </span>
                        <button
                            className="btn btn--primary btn--square veiculos-topo__btn-adicionar"
                            onClick={() => setPopupAdicionar(true)}
                        >
                            + Adicionar veículo
                        </button>
                    </div>
                )}
            </div>

            <PopupAdicionar
                recarregarVeiculos={recarregarVeiculos}
                aberto={popupAdicionar}
                cores={cores}
                onFechar={() => setPopupAdicionar(false)}
                handleAdicaoSucesso={handleAdicaoSucesso}
                dadosUsuario={dadosUsuario}
            />

            <PopupEditar
                aberto={popupEditar}
                cores={cores}
                onFechar={() => { setPopupEditar(false); setVeiculoEditando(null); }}
                veiculo={veiculoEditando}
                recarregarVeiculos={recarregarVeiculos}
                handleEdicaoSucesso={handleEdicaoSucesso}
                dadosUsuario={dadosUsuario}
            />

            <PopupExcluir
                aberto={popupExcluir}
                onFechar={() => { setPopupExcluir(false); setVeiculoExcluindo(null); }}
                veiculo={veiculoExcluindo}
                recarregarVeiculos={recarregarVeiculos}
                handleExclusaoSucesso={handleExclusaoSucesso}
                dadosUsuario={dadosUsuario}
            />
        </AppLayout>
    );
}
