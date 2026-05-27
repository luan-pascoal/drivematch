import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MsgErrosBackEnd } from '../../../components/MsgErrosBackEnd';
import { AppLayout } from '../../../components/layout/AppLayout';
import { SiteNavLinks } from '../../../components/layout/SiteHeader';
import axios from 'axios';
import './EditarSenha.css';

export function EditarSenha() {

    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
    const [mostrarAtual, setMostrarAtual] = useState(false);
    const [mostrarNova, setMostrarNova] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const watchNovaSenha = watch("novaSenha");

    const navigate = useNavigate();

    const onSubmit = async (data) => {

        const resposta = await axios.put('/api/usuarios/senha', {
            senhaAtual: data.senhaAtual,
            novaSenha: data.novaSenha,
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

            // Redireciona para a tela editar-perfil, passando a mensagem de sucesso via state
            // O AlertaSucesso será exibido na tela de editar perfil ao receber esse state
            navigate("/editar-perfil", { state: { msgSucesso: "Senha atualizada com sucesso!" } });

        }

        if (resposta.status === 422) {

            const errosBackend = resposta.data.Erro;
            const array = Object.entries(errosBackend);
            setArrayErrosBackend(array);

        }

    }

    return (
        <AppLayout headerNav={<SiteNavLinks />} footerRight="Trocar senha">
            <Link className="page-back" to="/editar-perfil">
                ← Voltar para editar perfil
            </Link>

            <div className="card editar-senha-card">
                <div className="card__header">
                    <h1 className="card__title">Trocar senha</h1>
                    <p className="card__subtitle">
                        Para sua segurança, informe a senha atual e confirme a nova senha.
                    </p>
                </div>

                <form className="card__body stack" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="field">
                        <label className="label" htmlFor="senha-atual">Senha atual</label>
                        <div className="password-field">
                            <input
                                id="senha-atual"
                                className="input input--square"
                                type={mostrarAtual ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="Digite sua senha atual"
                                {...register("senhaAtual", { required: true })}
                            />
                            <button
                                type="button"
                                className="password-field__toggle"
                                onClick={() => setMostrarAtual((v) => !v)}
                                aria-label={mostrarAtual ? "Ocultar senha atual" : "Mostrar senha atual"}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
                                </svg>
                            </button>
                        </div>
                        {errors?.senhaAtual?.type === "required" && (
                            <p className="error-message">O campo senha atual é obrigatório.</p>
                        )}
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="nova-senha">Nova senha</label>
                        <div className="password-field">
                            <input
                                id="nova-senha"
                                className="input input--square"
                                type={mostrarNova ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Digite sua nova senha"
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
                                {...register("confirmacao", {
                                    required: true,
                                    minLength: 8,
                                    pattern: {
                                        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                                    },
                                    validate: (value) => {
                                        return value === watchNovaSenha;
                                    }
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

                    <div className="editar-senha-actions">
                        <button type="submit" className="btn btn--square btn--primary">
                            Salvar alterações
                        </button>
                        <button
                            type="button"
                            className="btn btn--square btn--ghost"
                            onClick={() => navigate("/editar-perfil")}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );



}