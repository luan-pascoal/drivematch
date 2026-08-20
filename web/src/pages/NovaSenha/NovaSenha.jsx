import { useSearchParams, useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteHeaderGuestActions } from '../../components/layout/SiteHeader';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import axios from 'axios';
import './NovaSenha.css';

export function NovaSenha() {

    const [searchParams] = useSearchParams();
    const selector = searchParams.get("selector");
    const token = searchParams.get("token");

    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const [mostrarNova, setMostrarNova] = useState(false);
    const [msgSucesso, setMsgSucesso] = useState('');
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const watchNovaSenha = watch("novaSenha");

    const navigate = useNavigate();

    if (!selector || !token) {
        return (
            <AppLayout
                headerRight={<SiteHeaderGuestActions />}
                footerRight="Trocar senha">

                <div className="nova-senha">
                    <div className="nova-senha__card card">
                        <p className="nova-senha__link-invalido">
                            Link inválido ou incompleto. Solicite uma nova recuperação de senha.
                        </p>
                        <Link to="/esqueci-senha" className="btn btn--primary nova-senha__login-btn">
                            Recuperar senha novamente
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const onSubmit = async (data) => {

        setIsLoading(true);

        const resposta = await axios.post('/api/nova-senha', {
            selector: selector,
            token: token,
            senha: data.novaSenha,
            confirmacaoSenha: data.confirmacao
        }, {
            headers: {
                "Content-Type": "application/json"
            },
            validateStatus: () => true,
            withCredentials: true
        });

        if (resposta.status === 200 && resposta.data.sucesso === true) {
            setArrayErrosBackend([]);
            setMsgSucesso('Senha atualizada com sucesso');
            setIsLoading(false);
            return;
        }

        if (resposta.status === 422) {
            setMsgSucesso('');
            const errosBackend = resposta.data.Erro;
            setArrayErrosBackend(Object.entries(errosBackend));
            setIsLoading(false);
            return;
        }
    }

    return (
        <AppLayout
            headerRight={<SiteHeaderGuestActions />}
            footerRight="Trocar senha">

            <div className="nova-senha">

                {!msgSucesso ? (
                    <div className="nova-senha__card card">

                        <div className="card__header">

                            <h1 className="card__title">Criar nova senha</h1>
                            <p className="card__subtitle">
                                Crie uma nova senha para acessar sua conta.
                            </p>
                        </div>

                        <form className="card__body stack" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <div className="field">
                                <label className="label" htmlFor="nova-senha">Nova senha</label>
                                <div className="password-field">
                                    <input
                                        id="nova-senha"
                                        className="input input--square"
                                        type={mostrarNova ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Digite sua nova senha"
                                        disabled={isLoading}
                                        {...register("novaSenha", {
                                            required: true,
                                            minLength: 8,
                                            pattern: {
                                                value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                                            }
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="password-field__toggle"
                                        onClick={() => setMostrarNova((v) => !v)}
                                        aria-label={mostrarNova ? "Ocultar nova senha" : "Mostrar nova senha"}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
                                        </svg>
                                    </button>
                                </div>
                                {errors?.novaSenha?.type === "required" && (
                                    <p className="error-message">O campo nova senha é obrigatório.</p>
                                )}
                                {errors?.novaSenha?.type === "minLength" && (
                                    <p className="error-message">Mínimo 8 caracteres.</p>
                                )}
                                {errors?.novaSenha?.type === "pattern" && (
                                    <p className="error-message">
                                        A senha deve conter ao menos uma letra maiúscula, uma letra minúscula,
                                        um número e um caractere especial.
                                    </p>
                                )}
                            </div>

                            <div className="field">
                                <label className="label" htmlFor="confirmacao-senha">Confirmar nova senha</label>
                                <div className="password-field">
                                    <input
                                        id="confirmacao-senha"
                                        className="input input--square"
                                        type={mostrarConfirmacao ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Digite a nova senha novamente"
                                        disabled={isLoading}
                                        {...register("confirmacao", {
                                            required: true,
                                            minLength: 8,
                                            pattern: {
                                                value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                                            },
                                            validate: (value) => value === watchNovaSenha
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="password-field__toggle"
                                        onClick={() => setMostrarConfirmacao((v) => !v)}
                                        aria-label={mostrarConfirmacao ? "Ocultar confirmação" : "Mostrar confirmação"}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
                                        </svg>
                                    </button>
                                </div>
                                {errors?.confirmacao?.type === "required" && (
                                    <p className="error-message">O campo confirmação de senha é obrigatório.</p>
                                )}
                                {errors?.confirmacao?.type === "minLength" && (
                                    <p className="error-message">Mínimo 8 caracteres.</p>
                                )}
                                {errors?.confirmacao?.type === "pattern" && (
                                    <p className="error-message">
                                        A senha deve conter ao menos uma letra maiúscula, uma letra minúscula,
                                        um número e um caractere especial.
                                    </p>
                                )}
                                {errors?.confirmacao?.type === "validate" && (
                                    <p className="error-message">As senhas não combinam.</p>
                                )}
                            </div>

                            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />

                            <div className="card__footer nova-senha__actions">
                                <button type="submit" className="btn btn--square btn--primary" disabled={isLoading}>
                                    {isLoading ? 'Salvando...' : 'Salvar nova senha'}
                                </button>
                            </div>
                        </form>

                    </div>
                ) : (
                    <div className="nova-senha__sucesso-card card">
                        <div className="nova-senha__sucesso-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>

                        <p className="nova-senha__sucesso-msg">{msgSucesso}</p>

                        <button
                            type="button"
                            className="btn btn--primary nova-senha__login-btn"
                            onClick={() => navigate('/login', { state: { msgSucesso } })}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" />
                                <path d="M12 19l-7-7 7-7" />
                            </svg>
                            Ir para o login
                        </button>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}