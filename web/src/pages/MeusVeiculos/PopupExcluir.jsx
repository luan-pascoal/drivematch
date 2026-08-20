import { Popup } from '../../components/popup/Popup';
import { MsgErrosBackEnd } from "../../components/MsgErrosBackEnd";
import { useState } from 'react';
import axios from 'axios';
import './MeusVeiculos.css';

export function PopupExcluir({ aberto, onFechar, veiculo, recarregarVeiculos, handleExclusaoSucesso, dadosUsuario}) {

    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);

    if (!veiculo) return null;

    const handleExcluir = async (veiculo) => {

        const resposta = await axios.delete(`/api/veiculos/${veiculo.id}`, {
            validateStatus: () => true,
            withCredentials: true
        });

        if (resposta.status === 200 && resposta.data.sucesso === true) {
            setArrayErrosBackend([]);
            await recarregarVeiculos(dadosUsuario.idIns);
            handleExclusaoSucesso('Veículo excluído com sucesso!');
            return;
        }

        if(resposta.status === 422){
            const errosBackend = resposta.data.Erro;
            const array = Object.entries(errosBackend);
            setArrayErrosBackend(array);
            return;
        }
    }

    return (
        < Popup aberto={aberto} onFechar={onFechar} titulo="Excluir veículo" >
            <div className="popup-excluir">
                <div className="alert alert--danger">
                    Você está prestes a excluir <strong>{veiculo.marca} {veiculo.modelo} ({veiculo.ano})</strong>. Essa ação não pode ser desfeita.
                </div>
                <div className="popup__rodape" style={{ marginTop: 'var(--space-6)' }}>
                    <button className="btn btn--ghost btn--square" onClick={onFechar}>Cancelar</button>
                    <button className="btn btn--danger btn--square" onClick={() => handleExcluir(veiculo)}>Excluir veículo</button>
                </div>
                <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />
            </div>
        </Popup >

    );
}