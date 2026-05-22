import { useState } from 'react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MsgErrosBackEnd } from '../../../components/MsgErrosBackEnd';
import axios from 'axios';
import Cancelar from '../../../assets/images/icons/cancelar.png'
import './EditarFoto.css';

export function EditarFoto({ dadosUsuario, atualizarUsuario }) {

    const [msgSucesso, setMsgSucesso] = useState("");
    const [msgErro, setMsgErro] = useState("");
    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
    const navigate = useNavigate();
    const btUploadArquivo = useRef(null);

    const salvarFoto = async (event) => {

        const img = event.target.files[0];

        if (!img) return;

        const tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];
        const tamanhoValido = 2 * 1024 * 1024;

        if (!tiposPermitidos.includes(img.type)) {

            setMsgErro("Tipo de arquivo inválido. Use PNG, JPG ou WEBP.");
            setMsgSucesso("");
            return;

        }

        if (img.size > tamanhoValido) {

            setMsgErro("Arquivo deve ter no máximo 2MB.");
            setMsgSucesso("");
            return;

        }

        setMsgErro("");

        const formData = new FormData();
        formData.append("foto", img);

        const resposta = await axios.post("/api/usuarios/foto", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            validateStatus: () => true,
            withCredentials: true
        });

        if (resposta.status === 200) {

            setMsgSucesso(resposta.data.mensagem);
            setArrayErrosBackend([]);
            await atualizarUsuario();

            setTimeout(() => {

                setMsgSucesso("");

            }, 2000);

        }

        if (resposta.status === 422) {

            setMsgSucesso("");
            const errosBackend = resposta.data.Erro;
            const array = Object.entries(errosBackend);
            setArrayErrosBackend(array);

        }

    };


    const mostrarBttUpload = () => {

        // .current é a propriedade do objeto useRef (btUploadArquivo) que armazena a referência ao elemento HTML
        // começa com null, dps q o component renderiza, o react preenche .current com o input do type="file"
        // .click executa uma ação de clique
        btUploadArquivo.current.click();

    }

    const srcFoto = dadosUsuario?.foto
        ? `http://localhost/MatchMarcha/MatchMarcha-Backend/uploads/${dadosUsuario?.foto}`
        : "/placeholder.png";

    return (
        <>
            <div className="header-foto">
                <button
                    type="button"
                    className="botao-icon"
                    onClick={() => navigate("/editar-perfil")}
                >
                    <img src={Cancelar} alt="voltar" width="20" />
                </button>
                <span>Foto</span>
            </div>
            <br />
            <label>Foto Atual</label>
            <br />
            <br />
            <img
                src={srcFoto}
                width="120"
            />
            {msgSucesso &&
                <p className="mensagem-sucesso">
                    {msgSucesso}
                </p>
            }
            {msgErro &&
                <p className="error-message">
                    {msgErro}
                </p>
            }
            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />
            <br />
            <br />
            <input
                type="file"
                accept="image/*"
                ref={btUploadArquivo}
                onChange={salvarFoto}
                hidden
            />
            <button type="button" onClick={mostrarBttUpload}>
                Carregar Imagem
            </button>
            <br />
            <br />
        </>
    );
}