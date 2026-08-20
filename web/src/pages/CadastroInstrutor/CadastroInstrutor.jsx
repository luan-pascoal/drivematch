import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router";
import { MsgErrosBackEnd } from "../../components/MsgErrosBackEnd";
import { AppLayout } from "../../components/layout/AppLayout";
import { SiteNavLinks, SiteHeaderGuestActions } from '../../components/layout/SiteHeader';
import axios from "axios";
import validator from "validator";
import './CadastroInstrutor.css';

export function CadastroInstrutor({ carregarUsuario, cidades }) {

    const { register, setValue, handleSubmit, trigger, formState: { errors }, watch } = useForm();

    const watchSenha = watch('senha');
    const watchFoto = watch('foto');

    const navigate = useNavigate();

    const [previewFoto, setPreviewFoto] = useState(null);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [cidadeBusca, setCidadeBusca] = useState("");
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);

    const [etapaAtual, setEtapaAtual] = useState(1);
    const ETAPAS = [
        { id: 1, titulo: 'Dados', campos: ['nome', 'email'] },
        { id: 2, titulo: 'Senha', campos: ['senha', 'confirmacaoSenha'] },
        { id: 3, titulo: 'Perfil', campos: ['cidade_id', 'genero'] },
        { id: 4, titulo: 'Perfil', campos: ['cpf', 'cnh'] },
        { id: 5, titulo: 'Aula', campos: ['periodo', 'categoria', 'preco'] },
        { id: 6, titulo: 'Confirmar', campos: [] }
    ]
    const etapaAnterior = () => {
        setEtapaAtual((n) => Math.max(1, n - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const proximaEtapa = async () => {
        const campos = ETAPAS[etapaAtual - 1].campos;
        const valido = await trigger(campos);
        if (valido) {
            setEtapaAtual((n) => Math.min(ETAPAS.length, n + 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const onSubmit = async (data) => {

        const formData = new FormData();
        formData.append('nome', data.nome);
        formData.append('email', data.email);
        formData.append('senha', data.senha);
        formData.append('confirmacaoSenha', data.confirmacaoSenha);
        formData.append('cidade', data.cidade_id);
        formData.append('genero', data.genero);
        formData.append('cpf', data.cpf);
        formData.append('cnh', data.cnh);
        formData.append('periodo', data.periodo);
        formData.append('categoria', data.categoria);
        formData.append('preco', data.preco);
        formData.append('foto', data.foto[0]);
        formData.append('termosUso', data.termosUso ? '1' : '');

        const resposta = await axios.post('/api/instrutores', formData, {
            validateStatus: () => true,
            withCredentials: true
        });

        if (resposta.status === 200 && resposta.data.sucesso === true) {
            sessionStorage.setItem('msgSucesso', 'Conta criada com sucesso. Aproveite a plataforma!');
            sessionStorage.setItem('mostrarMsgVeiculo', 'true');
            setArrayErrosBackend([]);
            await carregarUsuario();
            navigate('/');
            return;
        }

        if (resposta.status === 422) {
            const errosBackend = resposta.data.Erro;
            setArrayErrosBackend(Object.entries(errosBackend));
        }

    };

    const formatarCpf = (event) => {
        let valorFormatado = event.target.value;
        valorFormatado = valorFormatado.replace(/\D/g, '');
        valorFormatado = valorFormatado.slice(0, 11);
        valorFormatado = valorFormatado.replace(/(\d{3})(\d)/, '$1.$2');
        valorFormatado = valorFormatado.replace(/(\d{3})(\d)/, '$1.$2');
        valorFormatado = valorFormatado.replace(/(\d{3})(\d)/, '$1-$2');
        setValue('cpf', valorFormatado);
    }

    const formatarCnh = (event) => {
        let valor = event.target.value;
        valor = valor.replace(/\D/g, '');
        valor = valor.slice(0, 11);
        setValue('cnh', valor);
    };

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

    const PADRAO_SENHA = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const normalizar = (texto) =>
        texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const cidadesFiltradas = (cidades ?? []).filter((cidade) =>
        normalizar(cidade.nome).includes(normalizar(cidadeBusca))
    ).slice(0, 10);

    return (
        <>
            <AppLayout
                headerRight={<SiteHeaderGuestActions />}
                footerRight="Cadastro de Instrutor"
            >
                <div className="cadastro-page">

                    <div className="cadastro-card">

                        <h1 className="cadastro-card__title">Criar conta</h1>
                        <p className="cadastro-card__subtitle">Cadastro de instrutor</p>

                        <p className="cadastro-card__login">
                            Já tem conta?
                            {' '}
                            <Link to="/login">Entrar</Link>
                        </p>

                        <ol className="cadastro-steps" aria-label="Progresso do cadastro">
                            {ETAPAS.map((etapa) => {
                                const concluida = etapa.id < etapaAtual;
                                const ativa = etapa.id === etapaAtual;

                                return (
                                    <li
                                        key={etapa.id}
                                        className={[
                                            'cadastro-steps__item',
                                            concluida ? 'cadastro-steps__item--done' : '',
                                            ativa ? 'cadastro-steps__item--active' : '',
                                        ].join(' ')}
                                        aria-current={ativa ? 'step' : undefined}
                                    >
                                        <span className="cadastro-steps__dot">{etapa.id}</span>
                                        <span className="cadastro-steps__label">{etapa.titulo}</span>
                                    </li>
                                );
                            })}
                        </ol>

                        <form className="cadastro-form" onSubmit={handleSubmit(onSubmit)} noValidate>

                            {/* ── Etapa 1: Dados ── */}
                            {etapaAtual === 1 && (
                                <div className="cadastro-panel">
                                    <h2 className="cadastro-panel__heading">Seus dados</h2>
                                    <p className="cadastro-panel__text">Seus próprios dados pessoais para identificação na plataforma.</p>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-nome">Nome completo</label>
                                        <input
                                            id="cadastro-nome"
                                            className="input input--square"
                                            type="text"
                                            placeholder="Seu nome"
                                            autoComplete="name"
                                            {...register('nome', {
                                                required: true,
                                                pattern: { value: /^[A-Za-zÀ-ÿ\s]+$/ },
                                            })}
                                        />
                                        {errors?.nome?.type === 'required' && (
                                            <p className="error-message">O campo nome é obrigatório.</p>
                                        )}
                                        {errors?.nome?.type === 'pattern' && (
                                            <p className="error-message">O nome deve conter apenas letras.</p>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-email">E-mail</label>
                                        <input
                                            id="cadastro-email"
                                            className="input input--square"
                                            type="email"
                                            placeholder="nome@email.com"
                                            autoComplete="email"
                                            {...register('email', {
                                                required: true,
                                                validate: (value) => validator.isEmail(value),
                                            })}
                                        />
                                        {errors?.email?.type === 'required' && (
                                            <p className="error-message">O campo e-mail é obrigatório.</p>
                                        )}
                                        {errors?.email?.type === 'validate' && (
                                            <p className="error-message">O e-mail é inválido.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Etapa 2: Senha ── */}
                            {etapaAtual === 2 && (
                                <div className="cadastro-panel">
                                    <h2 className="cadastro-panel__heading">Crie sua senha</h2>
                                    <p className="cadastro-panel__text">
                                        Use pelo menos 8 caracteres, com maiúscula, minúscula, número e símbolo.
                                    </p>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-senha">Senha</label>
                                        <div className="password-field">
                                            <input
                                                id="cadastro-senha"
                                                className="input input--square"
                                                type={mostrarSenha ? 'text' : 'password'}
                                                placeholder="Sua senha"
                                                autoComplete="new-password"
                                                {...register('senha', {
                                                    minLength: 8,
                                                    required: true,
                                                    pattern: { value: PADRAO_SENHA },
                                                })}
                                            />
                                            <button
                                                type="button"
                                                className="password-field__toggle"
                                                onClick={() => setMostrarSenha((v) => !v)}
                                                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
                                                </svg>
                                            </button>
                                        </div>
                                        {errors?.senha?.type === 'minLength' && (
                                            <p className="error-message">Mínimo 8 caracteres.</p>
                                        )}
                                        {errors?.senha?.type === 'required' && (
                                            <p className="error-message">O campo senha é obrigatório.</p>
                                        )}
                                        {errors?.senha?.type === 'pattern' && (
                                            <p className="error-message">
                                                A senha deve ter maiúscula, minúscula, número e caractere especial.
                                            </p>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-confirmacao">Confirmar senha</label>
                                        <div className="password-field">
                                            <input
                                                id="cadastro-confirmacao"
                                                className="input input--square"
                                                type={mostrarConfirmacao ? 'text' : 'password'}
                                                placeholder="Digite a senha novamente"
                                                autoComplete="new-password"
                                                {...register('confirmacaoSenha', {
                                                    minLength: 8,
                                                    required: true,
                                                    validate: (value) => value === watchSenha,
                                                    pattern: { value: PADRAO_SENHA },
                                                })}
                                            />
                                            <button
                                                type="button"
                                                className="password-field__toggle"
                                                onClick={() => setMostrarConfirmacao((v) => !v)}
                                                aria-label={mostrarConfirmacao ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
                                                </svg>
                                            </button>
                                        </div>
                                        {errors?.confirmacaoSenha?.type === 'minLength' && (
                                            <p className="error-message">Mínimo 8 caracteres.</p>
                                        )}
                                        {errors?.confirmacaoSenha?.type === 'required' && (
                                            <p className="error-message">Confirme sua senha.</p>
                                        )}
                                        {errors?.confirmacaoSenha?.type === 'validate' && (
                                            <p className="error-message">As senhas não combinam.</p>
                                        )}
                                        {errors?.confirmacaoSenha?.type === 'pattern' && (
                                            <p className="error-message">
                                                A senha deve ter maiúscula, minúscula, número e caractere especial.
                                            </p>
                                        )}
                                    </div>

                                    <p className="hint">
                                        Use o ícone de olho em cada campo para mostrar ou ocultar.
                                    </p>
                                </div>
                            )}

                            {/* ── Etapa 3: Perfil — gênero + cidade ── */}
                            {etapaAtual === 3 && (
                                <div className="cadastro-panel">
                                    <h2 className="cadastro-panel__heading">Sobre você</h2>
                                    <p className="cadastro-panel__text">Informações usadas no seu perfil na plataforma.</p>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-genero">Gênero</label>
                                        <select
                                            id="cadastro-genero"
                                            className="input input--square"
                                            defaultValue="0"
                                            {...register('genero', {
                                                validate: (value) => value !== '0',
                                            })}
                                        >
                                            <option value="0">Selecione o seu gênero</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Feminino">Feminino</option>
                                        </select>
                                        {errors?.genero?.type === 'validate' && (
                                            <p className="error-message">Gênero é obrigatório.</p>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-cidade">Cidade</label>
                                        <div className="cidade-autocomplete">
                                            <input
                                                id="cadastro-cidade"
                                                className="input input--square"
                                                type="text"
                                                placeholder="Digite a sua cidade"
                                                autoComplete="off"
                                                value={cidadeBusca}
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
                                            {mostrarSugestoes
                                                && cidadeBusca.length > 0
                                                && cidadesFiltradas.length > 0 && (
                                                    <ul className="cidade-autocomplete__list">
                                                        {cidadesFiltradas.map((cidade) => (
                                                            <li
                                                                key={cidade.id}
                                                                className="cidade-autocomplete__item"
                                                                onClick={() => {
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
                                        {errors?.cidade_id?.type === 'required' && (
                                            <p className="error-message">O campo cidade é obrigatório.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Etapa 4: Perfil — CPF + CNH ── */}
                            {etapaAtual === 4 && (
                                <div className="cadastro-panel">
                                    <h2 className="cadastro-panel__heading">Sobre você</h2>
                                    <p className="cadastro-panel__text">Informações usadas no seu perfil na plataforma.</p>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-cpf">CPF</label>
                                        <input
                                            id="cadastro-cpf"
                                            className="input input--square"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="000.000.000-00"
                                            autoComplete="off"
                                            {...register('cpf', {
                                                required: true,
                                                validate: (value) => value.replace(/\D/g, '').length === 11,
                                            })}
                                            onChange={formatarCpf}
                                        />
                                        {errors?.cpf?.type === 'required' && (
                                            <p className="error-message">O campo CPF é obrigatório.</p>
                                        )}
                                        {errors?.cpf?.type === 'validate' && (
                                            <p className="error-message">CPF deve conter 11 números.</p>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-cnh">CNH</label>
                                        <input
                                            id="cadastro-cnh"
                                            className="input input--square"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Digite o número de sua CNH"
                                            autoComplete="off"
                                            {...register('cnh', {
                                                required: true,
                                                validate: (value) => value.replace(/\D/g, '').length === 11,
                                            })}
                                            onChange={formatarCnh}
                                        />
                                        {errors?.cnh?.type === 'required' && (
                                            <p className="error-message">O campo CNH é obrigatório.</p>
                                        )}
                                        {errors?.cnh?.type === 'validate' && (
                                            <p className="error-message">CNH deve conter 11 números.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Etapa 5: Aula — período + categoria + preço ── */}
                            {etapaAtual === 5 && (
                                <div className="cadastro-panel">
                                    <h2 className="cadastro-panel__heading">Sobre você</h2>
                                    <p className="cadastro-panel__text">Defina os detalhes das suas aulas.</p>

                                    <div className="field">
                                        <label className="label">Período</label>
                                        <div className="check-group">
                                            <label className="check-group__item">
                                                <input
                                                    className="check-group__input"
                                                    type="checkbox"
                                                    value="manha"
                                                    {...register('periodo', {
                                                        validate: (value) => value.length > 0,
                                                    })}
                                                />
                                                Manhã
                                            </label>

                                            <label className="check-group__item">
                                                <input
                                                    className="check-group__input"
                                                    type="checkbox"
                                                    value="tarde"
                                                    {...register('periodo', {
                                                        validate: (value) => value.length > 0,
                                                    })}
                                                />
                                                Tarde
                                            </label>

                                            <label className="check-group__item">
                                                <input
                                                    className="check-group__input"
                                                    type="checkbox"
                                                    value="noite"
                                                    {...register('periodo', {
                                                        validate: (value) => value.length > 0,
                                                    })}
                                                />
                                                Noite
                                            </label>
                                        </div>
                                        {errors?.periodo?.type === 'validate' && (
                                            <p className="error-message">
                                                Selecione pelo menos um período.
                                            </p>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-categoria">Categoria</label>
                                        <select
                                            id="cadastro-categoria"
                                            className="input input--square"
                                            defaultValue="0"
                                            {...register('categoria', {
                                                validate: (value) => value !== '0',
                                            })}
                                        >
                                            <option value="0">Selecione a categoria de suas aulas</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="AB">AB</option>
                                        </select>
                                        {errors?.categoria?.type === 'validate' && (
                                            <p className="error-message">Categoria é obrigatória.</p>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="cadastro-preco">Preço de Aula (50 min)</label>
                                        <input
                                            id="cadastro-preco"
                                            className="input input--square"
                                            type="text"
                                            placeholder="Preço de Aula (50 min)"
                                            autoComplete="price"
                                            {...register('preco', {
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
                                            onChange={formatarPreco}
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
                                </div>
                            )}

                            {/* ── Etapa 6: Confirmar — foto + termos ── */}
                            {etapaAtual === 6 && (
                                <div className="cadastro-panel">
                                    <h2 className="cadastro-panel__heading">Confirmar</h2>
                                    <p className="cadastro-panel__text">Adicione uma foto e aceite os termos para finalizar.</p>

                                    <div className="cadastro-upload">
                                        <label className="cadastro-upload__area" htmlFor="cadastro-foto">
                                            {previewFoto ? (
                                                <img
                                                    className="cadastro-upload__preview"
                                                    src={previewFoto}
                                                    alt="Pré-visualização da foto"
                                                />
                                            ) : null}
                                            <p className="cadastro-upload__text">
                                                {previewFoto ? 'Trocar foto' : 'Escolher foto de perfil'}
                                            </p>
                                            <p className="cadastro-upload__hint">PNG, JPEG ou WebP · máximo 2 MB</p>
                                        </label>
                                        <input
                                            id="cadastro-foto"
                                            className="cadastro-upload__input"
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            {...register('foto', {
                                                required: true,
                                                validate: (files) => {
                                                    const file = files?.[0];
                                                    if (!file) return false;
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
                                        {errors?.foto?.type === 'required' && (
                                            <p className="error-message">A foto é obrigatória.</p>
                                        )}
                                        {errors?.foto?.type === 'validate' && (
                                            <p className="error-message">{errors.foto.message}</p>
                                        )}
                                    </div>

                                    <div className="cadastro-termos">
                                        <input
                                            id="cadastro-termos"
                                            className="cadastro-termos__checkbox"
                                            type="checkbox"
                                            {...register('termosUso', { required: true })}
                                        />
                                        <p className="cadastro-termos__text">
                                            <label htmlFor="cadastro-termos">
                                                Eu concordo com os{' '}
                                                <Link to="/termos" target="_blank">
                                                    termos de uso do MatchMarcha
                                                </Link>
                                            </label>
                                        </p>
                                    </div>
                                    {errors?.termosUso?.type === 'required' && (
                                        <p className="error-message">Você deve aceitar os termos de uso.</p>
                                    )}
                                </div>
                            )}

                            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />

                            <div className="cadastro-nav">
                                {etapaAtual > 1 && (
                                    <button
                                        type="button"
                                        className="btn btn--square btn--ghost cadastro-nav__btn"
                                        onClick={etapaAnterior}
                                    >
                                        Voltar
                                    </button>
                                )}

                                {etapaAtual < ETAPAS.length ? (
                                    <button
                                        type="button"
                                        className="btn btn--square btn--cadastrar cadastro-nav__btn cadastro-nav__btn--next"
                                        onClick={proximaEtapa}
                                    >
                                        Continuar
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn btn--square btn--cadastrar cadastro-nav__btn cadastro-nav__btn--next"
                                    >
                                        Criar conta
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
