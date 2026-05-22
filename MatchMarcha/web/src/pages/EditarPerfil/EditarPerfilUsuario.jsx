import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import { AlertaSucesso } from '../../components/AlertaSucesso';
import axios from 'axios';
import validator from 'validator';
import Voltar from '../../assets/images/icons/voltar.png'
import './EditarPerfilUsuario.css';

export function EditarPerfilUsuario({ dadosUsuario, msgErro, atualizarUsuario, carregarUsuario }) {

    // reset => função do React Hook Form que preenche o formulário com valores definidos
    // isDirty => boolean do React Hook Form que indica se o usuário alterou algum campo
    const { register, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm();

    // State que controla o texto do alerta de sucesso
    // Se tiver texto, o AlertaSucesso aparece; se for vazio, some
    const [alertaSucesso, setAlertaSucesso] = useState("");

    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);

    const [confirmarRemocao, setConfirmarRemocao] = useState(false);

    const navigate = useNavigate();

    // useLocation => retorna informações da rota atual, incluindo o state que pode vir de outra tela 
    // via navigate("/editar-perfil", { state: { msgSucesso: "..." } })
    const location = useLocation();

    // Roda quando o component aparece na tela
    useEffect(() => {

        // Se a location tiver um state.msgSucesso
        if (location.state?.msgSucesso) {

            // Preenche o state alertaSucesso com essa mensagem
            setAlertaSucesso(location.state.msgSucesso);

        }
    }, [])

    useEffect(() => {

        if (!dadosUsuario) return;

        reset({
            nome: dadosUsuario.nome,
            email: dadosUsuario.email,
            cpf: dadosUsuario.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
            genero: dadosUsuario.genero === "M" ? "Masculino" : "Feminino"
        });

    }, [dadosUsuario, reset]);

    // Incluímos "usuario" no dependency array porque o state começa como null e depois é preenchido com os dados vindos da API
    // Quando esse valor muda, o useEffect precisa rodar novamente para garantir que o formulário seja preenchido corretamente

    // Já o "reset" também é incluído porque ele vem do React Hook Form
    // Como regra geral, qualquer valor externo usado dentro do useEffect (state, props ou funções de hooks) 
    // deve ser declarado nas dependências, para evitar comportamento inconsistente e garantir previsibilidade

    const salvar = async (data) => {

        if (!isDirty) {

            navigate('/');
            return;

        }

        const resposta = await axios.put('/api/usuarios/', {
            nome: data.nome,
            email: data.email,
            genero: data.genero
        }, {
            headers: {
                "Content-Type": "application/json"
            },
            validateStatus: () => true,
            withCredentials: true
        });

        if (resposta.status === 200 && resposta.data.sucesso === true) {

            setArrayErrosBackend([]);

            await atualizarUsuario();
            await carregarUsuario();

            navigate("/", { state: { msgSucesso: "Perfil atualizado com sucesso!" } });

        }

        if (resposta.status === 422) {

            const errosBackend = resposta.data.Erro;
            const array = Object.entries(errosBackend);
            setArrayErrosBackend(array);

        }

    }

    const irEditarFoto = () => {

        navigate("/editar-foto");

    };

    const irEditarSenha = () => {

        navigate("/editar-senha");

    };

    const srcFoto = dadosUsuario?.foto
        ? `http://localhost/MatchMarcha/MatchMarcha-Backend/uploads/${dadosUsuario.foto}`
        : null;

    const removerConta = async () => {

        const resposta = await axios.delete('/api/usuarios', {
            validateStatus: () => true,
            withCredentials: true
        })

        if (resposta.status === 200 && resposta.data.sucesso === true) {

            setArrayErrosBackend([]);

            await carregarUsuario();

            navigate("/", { state: { msgSucesso: "Conta excluída com sucesso!" } });

        }

        if (resposta.status === 422) {

            const errosBackend = resposta.data.Erro;
            const array = Object.entries(errosBackend);
            setArrayErrosBackend(array);

        }
    }

    const handleKeyDown = (event)=>{

        if (event.key === 'Escape') setValue(event.target.name, '');
        
    }

    return (
        <>
            {/* Se alertaSucesso tiver texto, renderiza o AlertaSucesso
            onClose zera o alertaSucesso, fazendo o componente sumir */}
            {alertaSucesso && (
                <AlertaSucesso mensagem={alertaSucesso} onClose={() => setAlertaSucesso("")} />
            )}
            <div className="header-editar-perfil">
                <button
                    type="button"
                    className="botao-icon"
                    onClick={() => handleSubmit(salvar)()}>
                    <img src={Voltar} alt="voltar" width="20" />
                </button>
                <span>Editar Perfil</span>
            </div>
            {/* Erro em Exibir os Dados do Usuário */}
            {msgErro && (
                <div className="mensagem-erro-select">
                    {msgErro}
                </div>
            )}
            <label>Nome
                <input
                    type="text"
                    placeholder="Seu Nome"
                    onKeyDown={handleKeyDown}
                    {...register("nome", {
                        required: true,
                        pattern: {
                            value: /^[A-Za-zÀ-ÿ\s]+$/
                        }
                    })}
                />
            </label>
            {errors?.nome?.type === 'required' && (
                <p className="error-message"> O campo nome é requerido.</p>
            )}
            {errors?.nome?.type === 'pattern' && (
                <p className="error-message"> O campo nome deve conter apenas letras.</p>
            )}
            <br />
            <br />
            <label>Email
                <input
                    type="email"
                    placeholder="Seu Email"
                    onKeyDown={handleKeyDown}
                    {...register("email", {
                        required: true,
                        validate: (value) => {
                            return validator.isEmail(value);
                        }
                    })}
                />
            </label>
            {errors?.email?.type === 'required' && (
                <p className="error-message"> O campo email é requerido.</p>
            )}
            {errors?.email?.type === 'validate' && (
                <p className="error-message"> O email é inválido.</p>
            )}
            <br />
            <br />
            <div onClick={irEditarSenha}>
                <label
                >Senha
                    <input
                        type="password"
                        value="12345678"
                        readOnly
                    />
                    <button>
                        Editar Senha
                    </button>
                </label>
            </div>
            <br />
            <label>CPF
                <input
                    type="text"
                    placeholder="Seu CPF"
                    {...register("cpf")}
                    readOnly
                />
            </label>
            <br />
            <br />
            <label>Gênero</label>
            <select
                {...register("genero", {
                    validate: (value) => {
                        return value != "0";
                    },
                })}
            >
                <option value="0">Selecione o seu gênero ... </option>
                <option value="Masculino">Masculino </option>
                <option value="Feminino">Feminino </option>
            </select>
            {errors?.genero?.type === 'validate' && (
                <p className="error-message"> Gênero é requerido.</p>
            )}
            <br />
            <br />
            <div onClick={irEditarFoto} >
                <label>Foto</label>
                {dadosUsuario?.foto && (
                    <img
                        src={srcFoto}
                        width="100"
                    />
                )}
                <button type="button">
                    Editar foto
                </button>
            </div>
            <br />
            <br />
            {!confirmarRemocao ? (
                <button
                    onClick={() => { setConfirmarRemocao(true) }}>
                    Remover Conta
                </button>
            ) : (
                <>
                    <p>Deseja excluir sua conta? Essa ação não pode ser desfeita.</p>
                    <button onClick={() => setConfirmarRemocao(false)}>
                        Cancelar
                    </button>
                    <button onClick={removerConta}>
                        Excluir Conta
                    </button>

                </>
            )}
            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />
        </>
    );

}