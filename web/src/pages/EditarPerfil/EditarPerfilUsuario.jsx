import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import { AlertaSucesso } from '../../components/AlertaSucesso';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteHeaderLoggedActions, SiteNavLinks } from '../../components/layout/SiteHeader';
import axios from 'axios';
import validator from 'validator';
import './EditarPerfilUsuario.css';


export function EditarPerfilUsuario({ usuario, dadosUsuario, msgErro, atualizarUsuario, carregarUsuario }) {

    // reset => função do React Hook Form que preenche o formulário com valores definidos
    // isDirty => boolean do React Hook Form que indica se o usuário alterou algum campo
    const { register, handleSubmit, reset, unregister, setValue, watch, formState: { errors, isDirty } } = useForm();

    // State que controla o texto do alerta de sucesso
    const [alertaSucesso, setAlertaSucesso] = useState("");

    //array com erros que vierem do back
    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);

    const [confirmarRemocao, setConfirmarRemocao] = useState(false);
    const [msgSucessoFoto, setMsgSucessoFoto] = useState("");
    const [msgErroFoto, setMsgErroFoto] = useState("");
    const [fotoSelecionada, setFotoSelecionada] = useState(null);
    const [carregandoFoto, setCarregandoFoto] = useState(false);

    const [previewFoto, setPreviewFoto] = useState(null);

    const [msgSucesso, setMsgSucesso] = useState('');

    const inputFotoRef = useRef(null);
    

    const navigate = useNavigate();

    const location = useLocation();

    
    useEffect(() => {

        // Se a location tiver um state.msgSucesso
        if (location.state?.msgSucesso) {

            // Preenche o state alertaSucesso com essa mensagem
            setAlertaSucesso(location.state.msgSucesso);

        }
    }, [])

    const watchFoto = watch('foto');

    useEffect(() => {

        const arquivo = watchFoto?.[0];
    
        if (!arquivo) {
          setPreviewFoto(null);
          return;
        }
    
        const url = URL.createObjectURL(arquivo);
    
        setPreviewFoto(url);
    
        return () => URL.revokeObjectURL(url);
    
    }, [watchFoto]);




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

   

    const salvar = async (data) => {

        if (!isDirty) {

            setMsgSucesso('Todos os dados estão salvos!')
            setTimeout(() => {
                setMsgSucesso('');
              }, 5000);
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

            setMsgSucesso('Perfil atualizado com sucesso!')
            // navigate("/", { state: { msgSucesso: "Perfil atualizado com sucesso!" } });

            setTimeout(() => {
                setMsgSucesso('');
              }, 5000);
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
            return;
        }

        setMsgErroFoto("");
        setMsgSucessoFoto("");
        setFotoSelecionada(img);

        
    };

    const salvarFoto = async (data) => {
        // event.preventDefault();

        if (!data.foto || !data.foto[0]) {
            setMsgErroFoto("Selecione uma nova foto para continuar.");
            setMsgSucessoFoto("");
            return;
        }

        setCarregandoFoto(true);
        setMsgErroFoto("");
        setMsgSucessoFoto("");

        

        const formData = new FormData();
        formData.append("foto", data.foto[0]);
        

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
            setPreviewFoto(null);

            setValue('foto', null);

            if (inputFotoRef.current) {
                inputFotoRef.current.value = "";
            }
            
            await atualizarUsuario();
            await carregarUsuario();

            setTimeout(() => {
                setMsgSucessoFoto("");
            }, 5000);
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
        ? `http://localhost/MatchMarcha/uploads/${dadosUsuario.foto}`
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
            headerRight={<SiteHeaderLoggedActions usuario={dadosUsuario} carregarUsuario={carregarUsuario} /> || <SiteHeaderGuestActions />}
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
                    Atualize seus dados pessoais.
                </p>
            </div>
            {/* Erro em Exibir os Dados do Usuário */}
            {msgErro && (
                <div className="alert alert--danger">
                    {msgErro}
                </div>
            )}
            <div className="editar-perfil-grid">
                <form className="card" onSubmit={handleSubmit(salvarFoto)}>
                    <div className="card__header">
                        <h2 className="card__title">Atualizar Foto</h2>
                        <p className="card__subtitle">
                            Envie uma nova foto de perfil e clique em salvar.
                        </p>
                    </div>

                    <div className="card__body stack">
                        <div className="foto__body">

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
                                <span className="label">Nova foto</span>
                                
                                {previewFoto ? (
                                <img
                                    className="editar-perfil-foto"
                                    width="120"
                                    src={previewFoto}
                                    alt="Pré-visualização da nova foto"
                                />
                                ) : null}
                            </div>
                        </div>
                        

                        <div className="field">
                           
                            <label htmlFor="nova-foto" className="label foto-upload__area">
                            
                            
                                
                                <p className="foto-upload__text">Escolher foto de perfil
                                </p>
                                <p className="foto-upload__hint">PNG, JPEG ou WebP · máximo 2 MB</p>
                                </label>
                            <input
                                id="nova-foto"
                                className="foto-upload__input"
                                ref={inputFotoRef}
                                type="file"
                                onChange={selecionarFoto}
                                accept="image/png,image/jpeg,image/webp"
                                {...register('foto', {
                                // required: true,
                                validate: (files) => {
                                    
                                    const file = files?.[0];
                                    
                                    
                                    if (!file) return true;
                                    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                                    return 'Tipo de arquivo inválido';
                                    }
                                    if (file.size > 2 * 1024 * 1024) {
                                    return 'Arquivo deve ter no máximo 2MB';
                                    }
                                    return true;
                                },
                                })}
                            />
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
                                className="btn btn--square btn--entrar"
                                onClick={irEditarSenha}
                            >
                                Ir para tela de troca de senha
                            </button>
                        </div>
                        
                        {msgSucesso && (
                        <p className="login-form__success" role="status">
                            {msgSucesso}
                        </p>
                        )}

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
                                    "Tem certeza que quer excluir sua conta? Essa ação é permanente."
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