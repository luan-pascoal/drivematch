import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import { AlertaSucesso } from '../../components/alertas/AlertaSucesso';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteHeaderLoggedActions, SiteNavLinks } from '../../components/layout/SiteHeader';
import axios from 'axios';
import validator from 'validator';
import './EditarPerfilInstrutor.css';

export function EditarPerfilInstrutor({ dadosUsuario, usuario, msgErro, atualizarUsuario, carregarUsuario, cidades }) {

    const { register, handleSubmit, reset, setValue, getValues, watch, formState: { errors, isDirty, dirtyFields } } = useForm();
    const watchFoto = watch('foto');
    const cidadeAtual = watch('cidade_id');

    const [alertaSucesso, setAlertaSucesso] = useState("");
    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
    const [confirmarRemocao, setConfirmarRemocao] = useState(false);
    const [msgSucessoFoto, setMsgSucessoFoto] = useState("");
    const [msgErroFoto, setMsgErroFoto] = useState("");
    const [fotoSelecionada, setFotoSelecionada] = useState(null);
    const [carregandoFoto, setCarregandoFoto] = useState(false);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [msgSucessoPerfil, setMsgSucessoPerfil] = useState('');
    const [msgSucessoAula, setMsgSucessoAula] = useState('');
    const [cidadeBusca, setCidadeBusca] = useState("");
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
    const [cidadeAlterada, setCidadeAlterada] = useState(false);
    const inputFotoRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {

        if (location.state?.msgSucesso) {
            setAlertaSucesso(location.state.msgSucesso);
        }

    }, []);

    useEffect(() => {

        // Proteção para não rodar antes dos dados do usuário carregarem.
        if (dadosUsuario?.cidade?.id !== undefined) {
            // Muda cidadeAlterada pra true se o valor de cidadeAtual (watch do campo cidade_id) for diferente do cidade_id que vem
            // do bd com os dados atuais do usuario
            setCidadeAlterada(cidadeAtual !== dadosUsuario.cidade.id);
        }

    }, [cidadeAtual, dadosUsuario]);

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
        const beforeUnload = (event) => {

            if (isDirty || fotoSelecionada || cidadeAlterada) {
                event.preventDefault();
                event.returnValue = '';
            }

        };
        window.addEventListener('beforeunload', beforeUnload);
        return () => {
            window.removeEventListener('beforeunload', beforeUnload);
        };
    }, [isDirty, fotoSelecionada, cidadeAlterada]);

    const PERIODOS =
        [
            { id: 1, nome: 'Manhã' },
            { id: 2, nome: 'Tarde' },
            { id: 3, nome: 'Noite' },
        ];

    useEffect(() => {

        if (!dadosUsuario) return;

        const periodosSelecionados = {}; // Obj chave valor vazio
        // Percorre os periodos do backend
        dadosUsuario.periodos.forEach(p => {
            // periodosSelecionados[p.id] = true => Faz a mesma coisa que:
            // Ex: const periodosSelecionados = { 2: true };
            periodosSelecionados[p.id] = true;
        });

        setCidadeBusca(`${dadosUsuario.cidade.nome}`);
        setValue('cidade_id', dadosUsuario.cidade.id);

        reset({
            nome: dadosUsuario.nome,
            email: dadosUsuario.email,
            descricao : dadosUsuario.descricao ?? '',
            cpf: dadosUsuario.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
            genero: dadosUsuario.genero === "M" ? "Masculino" : "Feminino",
            cnh: dadosUsuario.cnh,
            cidade_id: dadosUsuario.cidade.id,
            categoria: dadosUsuario.tipo,
            preco: formatarPrecoInicial(dadosUsuario.preco),
            periodos: periodosSelecionados // reset recebe o objeto periodosSelecionados e sabe quais periodos marcar como true
        });
    }, [dadosUsuario, reset]);

    const salvar = async (data) => {

        // isDirty seria true se QUALQUER campo da página mudasse, incluindo campos de aula.
        // Logo, temos q usar dirtyFields => rastreia campo a campo, então conseguimos saber exatamente
        // quais campos do perfil foram alterados.
        const perfilUsuarioAlterado  = dirtyFields.nome || dirtyFields.email || dirtyFields.genero;

        const perfilInstrutorAlterado = cidadeAlterada || dirtyFields.descricao;

        if (!perfilUsuarioAlterado  && !perfilInstrutorAlterado) {
            setMsgSucessoPerfil('Perfil atualizado com sucesso!');
            setTimeout(() => {
                setMsgSucessoPerfil('');
            }, 5000);
            return;
        }

        let erros = [];

        if (perfilUsuarioAlterado ) {

            const respostaPerfil = await axios.put('/api/usuarios/', {
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

            if (respostaPerfil.status === 422) {
                erros = [...erros, ...Object.entries(respostaPerfil.data.Erro)];
            }

            if (respostaPerfil.status !== 200 && respostaPerfil.status !== 422) {
                setArrayErrosBackend([['geral', 'Erro ao salvar cidade. Tente novamente.']]);
                return;
            }

        }

        if (perfilInstrutorAlterado) {

            const respostaInstrutor = await axios.put('/api/instrutores/perfil', {
                cidade_id: data.cidade_id,
                descricao: data.descricao
            }, {
                validateStatus: () => true,
                withCredentials: true
            });

            if (respostaInstrutor.status === 422) {
                // ... (spead operator): Está juntando dois arrays em um só. Se erros já tiver itens da primeira requisição e a segunda 
                // também tiver erros, os dois ficam no mesmo array ao invés de um sobrescrever o outro.
                erros = [...erros, ...Object.entries(respostaInstrutor.data.Erro)];
            }

            if (respostaInstrutor.status !== 200 && respostaInstrutor.status !== 422) {
                setArrayErrosBackend([['geral', 'Erro ao salvar cidade. Tente novamente.']]);
                return;
            }

        }

        if (erros.length > 0) {
            setArrayErrosBackend(erros);
            return;
        }

        setArrayErrosBackend([]);
        await carregarUsuario();
        setMsgSucessoPerfil('Perfil atualizado com sucesso!')
        // navigate("/", { state: { msgSucesso: "Perfil atualizado com sucesso!" } });
        setTimeout(() => {
            setMsgSucessoPerfil('')
        }, 5000);

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

    const salvarAula = async (data) => {

        const aulaAlterada = dirtyFields.categoria || dirtyFields.preco || dirtyFields.periodos;

        if (!aulaAlterada) {
            setMsgSucessoAula('Todos os dados estão salvos!')
            setTimeout(() => {
                setMsgSucessoAula('')
            }, 5000);
            return;
        }

        const resposta = await axios.put('/api/instrutores', {
            categoria: data.categoria,
            preco: data.preco,
            periodo: data.periodos
        }, {
            headers: {
                "Content-Type": "application/json"
            },
            validateStatus: () => true,
            withCredentials: true
        })

        if (resposta.status === 200 && resposta.data.sucesso === true) {
            setArrayErrosBackend([]);
            await atualizarUsuario();
            await carregarUsuario();
            setMsgSucessoAula('Perfil atualizado com sucesso!')
            // navigate("/", { state: { msgSucesso: "Perfil atualizado com sucesso!" } });
            setTimeout(() => {
                setMsgSucessoAula('');
            }, 5000);
        }

        if (resposta.status === 422) {
            const errosBackend = resposta.data.Erro;
            const array = Object.entries(errosBackend);
            setArrayErrosBackend(array);
        }

    }

    const confirmarSaida = (acao) => {

        if (!isDirty && !fotoSelecionada && !cidadeAlterada) {
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
        const resposta = await axios.delete('/api/instrutores', {
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

    const handleKeyDown = (event) => {

        if (event.key === 'Escape') setValue(event.target.name, '');

    }

    const formatarPreco = (event) => {
        const bruto = event.target.value
            .replace(/\./g, '')
            .replace(',', '')
            .replace(/\D/g, '');

        if (!bruto) {
            setValue('preco', '', { shouldValidate: false });
            event.target.value = '';
            return;
        }

        const numero = Number(bruto) / 100;
        const exibido = numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        event.target.value = exibido;
        setValue('preco', exibido, { shouldValidate: false });
    }

    const formatarPrecoInicial = (valor) => {

        if (!valor) return;

        const numero = Number(valor);
        return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const normalizar = (texto) =>
        texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const cidadesFiltradas = (cidades ?? []).filter((cidade) =>
        normalizar(cidade.nome).includes(normalizar(cidadeBusca))
    ).slice(0, 10);

        return (
        <>
            <AppLayout
                headerRight={<SiteHeaderLoggedActions usuario={dadosUsuario} carregarUsuario={carregarUsuario} tipoUsuario={usuario.usuario.tipo} /> || <SiteHeaderGuestActions />}
                footerRight="Edição de perfil"
            >
              <div className="stack stack--lg">
                {/* Se alertaSucesso tiver texto, renderiza o AlertaSucesso
                    onClose zera o alertaSucesso, fazendo o componente sumir */}
                {alertaSucesso && (
                    <AlertaSucesso mensagem={alertaSucesso} onClose={() => setAlertaSucesso("")} />
                )}

                {/* Cabeçalho da página */}
                <div className="editar-instrutor-page__header">
                    <h1 className="editar-instrutor-page__title">Editar perfil</h1>
                    <p className="editar-instrutor-page__subtitle">
                        Atualize seus dados pessoais e as informações correspondentes às suas aulas.
                    </p>
                </div>

                {/* Erro em Exibir os Dados do Usuário */}
                {msgErro && (
                    <div className="alert alert--danger">
                        {msgErro}
                    </div>
                )}

                {/* Grid principal: coluna esquerda (foto + aula) | coluna direita (perfil) */}
                <div className="editar-instrutor-grid">

                    <div className="editar-instrutor-coluna-esquerda">

                        {/* ── Card: Atualizar Foto ── */}
                        <form className="card editar-instrutor-card--foto" onSubmit={handleSubmit(salvarFoto)}>
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
                                                className="editar-instrutor-foto"
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
                                                className="editar-instrutor-foto"
                                                width="120"
                                                src={previewFoto}
                                                alt="Pré-visualização da nova foto"
                                            />
                                        ) : null}
                                    </div>
                                </div>

                                <div className="field">
                                    <label htmlFor="nova-foto" className="label foto-upload__area">
                                        <p className="foto-upload__text">Escolher foto de perfil</p>
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
                                    <div className="alert alert--success" role="status">{msgSucessoFoto}</div>
                                )}

                                {msgErroFoto && (
                                    <p className="error-message" role="alert">{msgErroFoto}</p>
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

                        {/* ── Card: Atualizar Aula ── */}
                        <form className="editar-instrutor-card editar-instrutor-card--aula" onSubmit={handleSubmit(salvarAula)}>
                            <div className="editar-instrutor-card__header">
                                <h2 className="editar-instrutor-card__title">Atualizar Aula</h2>
                                <p className="editar-instrutor-card__description">
                                    Atualize as informações da sua aula exibidas em seu perfil.
                                </p>
                            </div>

                            <div className="editar-instrutor-card__body">

                                <div className="field">
                                    <label htmlFor="categoria" className="label">Categoria</label>
                                    <select
                                        id="categoria"
                                        className="input input--square"
                                        {...register("categoria", {
                                            validate: (value) => {
                                                return value !== "0";
                                            },
                                        })}
                                    >
                                        <option value="0">Selecione a categoria de suas aulas...</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                    </select>
                                    {errors?.categoria?.type === 'validate' && (
                                        <p className="error-message">Categoria é obrigatória.</p>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="preco" className="label">Preço (50min)</label>
                                    <input
                                        id="preco"
                                        className="input input--square"
                                        type="text"
                                        placeholder="Preço (50min)"
                                        onKeyDown={handleKeyDown}
                                        autoComplete="price"
                                        {...register("preco", {
                                            onChange: formatarPreco,
                                            required: true,
                                            validate: {
                                                apenasNumero: (value) => {
                                                    const normalizado = value.replace(/\./g, '').replace(',', '.');
                                                    return !isNaN(parseFloat(normalizado));
                                                },
                                                maiorQueZero: (value) => {
                                                    const normalizado = value.replace(/\./g, '').replace(',', '.');
                                                    return parseFloat(normalizado) > 0;
                                                }
                                            }
                                        })}
                                    />
                                    {errors?.preco?.type === 'required' && (
                                        <p className="error-message">Preço é obrigatório.</p>
                                    )}
                                    {errors?.preco?.type === 'apenasNumero' && (
                                        <p className="error-message">Digite apenas números.</p>
                                    )}
                                    {errors?.preco?.type === 'maiorQueZero' && (
                                        <p className="error-message">Digite um número maior que zero.</p>
                                    )}
                                </div>

                                <div className="field">
                                    <label className="label" id="periodo-label">Período</label>
                                    <div
                                        className="periodo-group"
                                        role="group"
                                        aria-labelledby="periodo-label"
                                    >
                                        {PERIODOS.map(periodo => (
                                            <label key={periodo.id} className="periodo-option">
                                                <input
                                                    type="checkbox"
                                                    className="periodo-option__checkbox"
                                                    {...register(`periodos.${periodo.id}`, {
                                                        validate: () => {
                                                            // getValues : Retorna o valor atual de um campo
                                                            // Nesse caso (checkbox) vai retornar um array, ex: {1: true, 2: false, 3: true } 
                                                            const periodos = getValues('periodos');
                                                            // Object.values pega so os valores (true ou false)
                                                            // .some(v => v === true) Retorna true se PELO MENOS UM valor for true
                                                            return Object.values(periodos).some(v => v === true) || 'Selecione ao menos um período.';
                                                        }
                                                    })}
                                                />
                                                {periodo.nome}
                                            </label>
                                        ))}
                                    </div>
                                    {errors?.periodos?.[PERIODOS[0].id]?.type === 'validate' && (
                                        <p className="error-message">Selecione ao menos um período.</p>
                                    )}
                                </div>
                                {msgSucessoAula && (
                                    <p className="editar-instrutor__success" role="status">
                                        {msgSucessoAula}
                                    </p>
                                )}
                            </div>

                            <div className="editar-instrutor-card__footer">
                                <button type="submit" className="btn btn--square btn--primary">
                                    Salvar dados
                                </button>
                            </div>
                        </form>

                    </div>

                    {/* ── Card: Dados do Perfil ── */}
                    <form className="editar-instrutor-card editar-instrutor-card--perfil" onSubmit={handleSubmit(salvar)}>
                        <div className="editar-instrutor-card__header">
                            <h2 className="editar-instrutor-card__title">Dados do Perfil</h2>
                            <p className="editar-instrutor-card__description">
                                Atualize seus dados pessoais.
                            </p>
                        </div>

                        <div className="editar-instrutor-card__body">

                            <div className="field">
                                <label htmlFor="nome" className="label">Nome</label>
                                <input
                                    id="nome"
                                    className="input input--square"
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
                                    className="input input--square"
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
                                <label htmlFor="descricao" className="label">Descrição </label>
                                <textarea
                                    id="descricao"
                                    className="input input--square textarea"
                                    placeholder='Fale um pouco sobre você e sua experiência como instrutor'
                                    rows={5}
                                    maxLength={500}
                                    {...register("descricao", {
                                        maxLength: 500,
                                        pattern: { value: /^[A-Za-zÀ-ÿ0-9\s.,!?()-]+$/ },
                                    })}
                                />
                                {errors?.descricao?.type === 'maxLength' && (
                                    <p className="error-message">A descrição deve ter no máximo 500 caracteres.</p>
                                )}
                                {errors?.descricao?.type === 'pattern' && (
                                    <p className="error-message">A descrição contém caracteres não permitidos.</p>
                                )}
                            </div>

                            <div className="field field--readonly">
                                <label htmlFor="cpf" className="label">CPF</label>
                                <input
                                    id="cpf"
                                    className="input input--square"
                                    type="text"
                                    placeholder="Seu CPF"
                                    {...register("cpf")}
                                    readOnly
                                />
                                <p className="field__hint--muted">O CPF não pode ser alterado.</p>
                            </div>

                            <div className="field field--readonly">
                                <label htmlFor="cnh" className="label">CNH</label>
                                <input
                                    id="cnh"
                                    className="input input--square"
                                    type="text"
                                    placeholder="Sua CNH"
                                    {...register("cnh")}
                                    readOnly
                                />
                                <p className="field__hint--muted">A CNH não pode ser alterada.</p>
                            </div>

                            <div className="field">
                                <label htmlFor="cidade" className="label">Cidade</label>
                                <div className="cidade-autocomplete">
                                    <input
                                        id="cidade"
                                        className="input input--square"
                                        type="text"
                                        placeholder="Digite a sua cidade"
                                        autoComplete="off"
                                        value={cidadeBusca}
                                        aria-autocomplete="list"
                                        aria-controls="cidade-sugestoes"
                                        aria-expanded={mostrarSugestoes && cidadesFiltradas.length > 0}
                                        onChange={(event) => {
                                            setCidadeBusca(event.target.value);
                                            setMostrarSugestoes(true);
                                            setValue("cidade_id", "");
                                        }}
                                    />
                                    <input
                                        type="hidden"
                                        {...register("cidade_id", { required: true })}
                                    />
                                    {mostrarSugestoes && cidadeBusca.length > 0 && cidadesFiltradas.length > 0 && (
                                        <ul
                                            id="cidade-sugestoes"
                                            className="cidade-autocomplete__suggestions"
                                            role="listbox"
                                            aria-label="Sugestões de cidade"
                                        >
                                            {cidadesFiltradas.map((cidade) => (
                                                <li
                                                    key={cidade.id}
                                                    className="cidade-autocomplete__item"
                                                    role="option"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            setCidadeBusca(`${cidade.nome} - ${cidade.uf}`);
                                                            setValue("cidade_id", cidade.id);
                                                            setMostrarSugestoes(false);
                                                        }
                                                    }}
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        setCidadeBusca(`${cidade.nome} - ${cidade.uf}`);
                                                        setValue("cidade_id", cidade.id);
                                                        setMostrarSugestoes(false);
                                                    }}
                                                >
                                                    {cidade.nome} - {cidade.uf}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="field">
                                <label htmlFor="genero" className="label">Gênero</label>
                                <select
                                    id="genero"
                                    className="input input--square"
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

                            <div className="senha-field">
                                <span className="senha-field__label">Senha</span>
                                <button
                                    type="button"
                                    className="senha-field__btn"
                                    onClick={irEditarSenha}
                                >
                                    Ir para tela de troca de senha
                                </button>
                            </div>

                            {msgSucessoPerfil && (
                                <p className="editar-instrutor__success" role="status">
                                    {msgSucessoPerfil}
                                </p>
                            )}

                        </div>

                        <div className="editar-instrutor-card__footer">
                            <button type="submit" className="btn btn--square btn--primary">
                                Salvar dados
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Zona de Perigo: Remover Conta ── */}
                {!confirmarRemocao ? (
                    <div className="zona-perigo">
                        <p className="zona-perigo__aviso">
                            Atenção: ao remover sua conta todos os seus dados serão excluídos permanentemente.
                        </p>
                        <div className="zona-perigo__acoes">
                            <button
                                className="btn btn--square btn--danger"
                                type="button"
                                onClick={() => { setConfirmarRemocao(true) }}>
                                Remover Conta
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="zona-perigo">
                        <p className="zona-perigo__aviso">Deseja excluir sua conta? Essa ação não pode ser desfeita.</p>
                        <div className="zona-perigo__acoes">
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
              </div>
            </AppLayout>
        </>
    );

}

