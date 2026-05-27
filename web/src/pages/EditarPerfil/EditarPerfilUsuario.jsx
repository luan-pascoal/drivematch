import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import { AlertaSucesso } from '../../components/AlertaSucesso';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteHeaderLoggedActions, SiteNavLinks } from '../../components/layout/SiteHeader';
import axios from 'axios';
import validator from 'validator';
import './EditarPerfilUsuario.css';

function HeaderActions({ dadosUsuario }) {
    return (
        <>
            <span className="home-header-user__name" title={dadosUsuario?.nome}>
                Olá, {dadosUsuario?.nome || "usuário"}
            </span>
            <Link className="btn btn--square btn--entrar" to="/">
                Página inicial
            </Link>
        </>
    );
}

export function EditarPerfilUsuario({ usuario, dadosUsuario, msgErro, atualizarUsuario, carregarUsuario }) {

    // reset => função do React Hook Form que preenche o formulário com valores definidos
    // isDirty => boolean do React Hook Form que indica se o usuário alterou algum campo
    const { register, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm();

    // State que controla o texto do alerta de sucesso
    // Se tiver texto, o AlertaSucesso aparece; se for vazio, some
    const [alertaSucesso, setAlertaSucesso] = useState("");

    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);

    const [confirmarRemocao, setConfirmarRemocao] = useState(false);
    const [msgSucessoFoto, setMsgSucessoFoto] = useState("");
    const [msgErroFoto, setMsgErroFoto] = useState("");
    const [fotoSelecionada, setFotoSelecionada] = useState(null);
    const [nomeArquivoFoto, setNomeArquivoFoto] = useState("");
    const [carregandoFoto, setCarregandoFoto] = useState(false);

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

    useEffect(() => {
        const beforeUnload = (event) => {
            if (isDirty || fotoSelecionada) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', beforeUnload);

        return () => {
            window.removeEventListener('beforeunload', beforeUnload);
        };
    }, [isDirty, fotoSelecionada]);

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

    const validarFoto = (img) => {
        const tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];
        const tamanhoValido = 2 * 1024 * 1024;

        if (!tiposPermitidos.includes(img.type)) {
            return "Tipo de arquivo inválido. Use PNG, JPG ou WEBP.";
        }

        if (img.size > tamanhoValido) {
            return "Arquivo deve ter no máximo 2MB.";
        }

        return "";
    };

    const selecionarFoto = (event) => {
        const img = event.target.files[0];

        if (!img) return;

        const erroValidacao = validarFoto(img);

        if (erroValidacao) {
            setMsgErroFoto(erroValidacao);
            setMsgSucessoFoto("");
            setFotoSelecionada(null);
            setNomeArquivoFoto("");
            return;
        }

        setMsgErroFoto("");
        setMsgSucessoFoto("");
        setFotoSelecionada(img);
        setNomeArquivoFoto(img.name);
    };

    const salvarFoto = async (event) => {
        event.preventDefault();

        if (!fotoSelecionada) {
            setMsgErroFoto("Selecione uma nova foto para continuar.");
            setMsgSucessoFoto("");
            return;
        }

        setCarregandoFoto(true);
        setMsgErroFoto("");
        setMsgSucessoFoto("");

        const formData = new FormData();
        formData.append("foto", fotoSelecionada);

        const resposta = await axios.post("/api/usuarios/foto", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            validateStatus: () => true,
            withCredentials: true
        });

        if (resposta.status === 200) {
            setMsgSucessoFoto(resposta.data.mensagem);
            setArrayErrosBackend([]);
            setFotoSelecionada(null);
            setNomeArquivoFoto("");
            await atualizarUsuario();

            setTimeout(() => {
                setMsgSucessoFoto("");
            }, 2000);
        }

        if (resposta.status === 422) {
            const errosBackend = resposta.data.Erro;
            const array = Object.entries(errosBackend);
            setArrayErrosBackend(array);
        }

        setCarregandoFoto(false);
    };

    const confirmarSaida = (acao) => {
        if (!isDirty && !fotoSelecionada) {
            acao();
            return;
        }

        const confirmou = window.confirm(
            "Você fez alterações nesta tela. Deseja sair mesmo assim?"
        );

        if (confirmou) {
            acao();
        }
    };

    const irEditarSenha = () => {
        confirmarSaida(() => navigate("/editar-senha"));
    };

    const srcFoto = dadosUsuario?.foto
        ? `https://matchmarcha.infinityfree.me/uploads/${dadosUsuario.foto}`
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
        <AppLayout
            headerRight={<SiteHeaderLoggedActions usuario={dadosUsuario} /> || <SiteHeaderGuestActions />}
            footerRight="Edição de perfil"
        >
            {/* Se alertaSucesso tiver texto, renderiza o AlertaSucesso
            onClose zera o alertaSucesso, fazendo o componente sumir */}
            {alertaSucesso && (
                <AlertaSucesso mensagem={alertaSucesso} onClose={() => setAlertaSucesso("")} />
            )}
            <div className="editar-perfil-topo">
                <h1 className="title">Editar perfil</h1>
                <p className="subtitle">
                    Atualize foto e dados pessoais em formulários separados.
                </p>
            </div>
            {/* Erro em Exibir os Dados do Usuário */}
            {msgErro && (
                <div className="alert alert--danger">
                    {msgErro}
                </div>
            )}
            <div className="editar-perfil-grid">
                <form className="card" onSubmit={salvarFoto}>
                    <div className="card__header">
                        <h2 className="card__title">Atualizar Foto</h2>
                        <p className="card__subtitle">
                            Envie uma nova foto de perfil e clique em salvar.
                        </p>
                    </div>

                    <div className="card__body stack">
                        <div className="field">
                            <span className="label">Foto atual</span>
                            {srcFoto ? (
                                <img
                                    src={srcFoto}
                                    width="120"
                                    className="editar-perfil-foto"
                                    alt="Foto de perfil atual"
                                />
                            ) : (
                                <p className="hint">Nenhuma foto cadastrada no momento.</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="nova-foto" className="label">Nova foto</label>
                            <input
                                id="nova-foto"
                                className="input"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={selecionarFoto}
                            />
                            <p className="hint">
                                Formatos: PNG, JPG ou WEBP. Tamanho máximo: 2MB.
                            </p>
                            {nomeArquivoFoto && (
                                <p className="hint">Arquivo selecionado: {nomeArquivoFoto}</p>
                            )}
                        </div>

                        {msgSucessoFoto && (
                            <div className="alert alert--success">{msgSucessoFoto}</div>
                        )}

                        {msgErroFoto && (
                            <p className="error-message">{msgErroFoto}</p>
                        )}
                    </div>

                    <div className="card__footer">
                        <button
                            type="submit"
                            className="btn btn--square btn--primary"
                            disabled={carregandoFoto}
                        >
                            {carregandoFoto ? "Salvando..." : "Salvar nova foto"}
                        </button>
                    </div>
                </form>

                <form className="card" onSubmit={handleSubmit(salvar)}>
                    <div className="card__header">
                        <h2 className="card__title">Dados do Perfil</h2>
                        <p className="card__subtitle">
                            Atualize seus dados pessoais.
                        </p>
                    </div>

                    <div className="card__body stack">
                        <div className="field">
                            <label htmlFor="nome" className="label">Nome</label>
                            <input
                                id="nome"
                                className="input"
                                type="text"
                                placeholder="Seu nome"
                                onKeyDown={handleKeyDown}
                                {...register("nome", {
                                    required: true,
                                    pattern: {
                                        value: /^[A-Za-zÀ-ÿ\s]+$/
                                    }
                                })}
                            />
                            {errors?.nome?.type === 'required' && (
                                <p className="error-message">O campo nome é requerido.</p>
                            )}
                            {errors?.nome?.type === 'pattern' && (
                                <p className="error-message">O campo nome deve conter apenas letras.</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="email" className="label">E-mail</label>
                            <input
                                id="email"
                                className="input"
                                type="email"
                                placeholder="Seu e-mail"
                                onKeyDown={handleKeyDown}
                                {...register("email", {
                                    required: true,
                                    validate: (value) => {
                                        return validator.isEmail(value);
                                    }
                                })}
                            />
                            {errors?.email?.type === 'required' && (
                                <p className="error-message">O campo e-mail é requerido.</p>
                            )}
                            {errors?.email?.type === 'validate' && (
                                <p className="error-message">O e-mail informado é inválido.</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="cpf" className="label">CPF</label>
                            <input
                                id="cpf"
                                className="input"
                                type="text"
                                placeholder="Seu CPF"
                                {...register("cpf")}
                                readOnly
                            />
                            <p className="hint">O CPF não pode ser alterado.</p>
                        </div>

                        <div className="field">
                            <label htmlFor="genero" className="label">Gênero</label>
                            <select
                                id="genero"
                                className="input"
                                {...register("genero", {
                                    validate: (value) => {
                                        return value !== "0";
                                    },
                                })}
                            >
                                <option value="0">Selecione o seu gênero...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                            {errors?.genero?.type === 'validate' && (
                                <p className="error-message">Gênero é requerido.</p>
                            )}
                        </div>

                        <div className="field">
                            <span className="label">Senha</span>
                            <button
                                type="button"
                                className="btn btn--square btn--ghost"
                                onClick={irEditarSenha}
                            >
                                Ir para tela de troca de senha
                            </button>
                        </div>
                    </div>

                    <div className="card__footer editar-perfil-footer">
                        <button type="submit" className="btn btn--square btn--primary">
                            Salvar dados
                        </button>
                    </div>
                </form>
            </div>

            {!confirmarRemocao ? (
                <button
                    className="btn btn--square btn--danger"
                    type="button"
                    onClick={() => { setConfirmarRemocao(true) }}>
                    Remover Conta
                </button>
            ) : (
                <div className="alert alert--warning stack">
                    <p>Deseja excluir sua conta? Essa ação não pode ser desfeita.</p>
                    <div className="row">
                        <button type="button" className="btn btn--square btn--ghost" onClick={() => setConfirmarRemocao(false)}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn--square btn--danger"
                            onClick={() => {
                                const confirmou = window.confirm(
                                    "Confirma a remoção da sua conta? Essa ação é permanente."
                                );

                                if (confirmou) removerConta();
                            }}
                        >
                            Excluir Conta
                        </button>
                    </div>
                </div>
            )}
            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />
        </AppLayout>
    );
}