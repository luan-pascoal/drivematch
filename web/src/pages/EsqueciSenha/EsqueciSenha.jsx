import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteHeaderGuestActions } from '../../components/layout/SiteHeader';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import validator from 'validator';
import axios from 'axios';
import './EsqueciSenha.css';

export function EsqueciSenha() {

    const { register, handleSubmit, formState: { errors } } = useForm();
    
    const [msgSucesso, setMsgSucesso] = useState(false);
    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const onSubmit = async (data) => {

        setIsLoading(true);

        const resposta = await axios.post('/api/esqueci-senha', {
            email: data.email
        }, {
            headers: {
                "Content-Type": "application/json"
            },
            validateStatus: () => true,
            withCredentials: true
        });

        if (resposta.status === 200 && resposta.data.sucesso === true) {
            setMsgSucesso(true);
            setIsLoading(false);
            return;
        }

        if (resposta.status === 422) {
            setMsgSucesso(false);
            setIsLoading(false);
            const errosBackend = resposta.data.Erro;
            setArrayErrosBackend(Object.entries(errosBackend));
        }

    }

    return (
        <AppLayout
            headerRight={<SiteHeaderGuestActions />}
            footerRight="Recuperação de Senha">

            <div className="esqueci-senha">

                {!msgSucesso ? (
                    <div className="esqueci-senha__card card">
                        <div className="esqueci-senha__header">
                            <h1 className="esqueci-senha__title">Encontre sua conta</h1>
                            <p className="esqueci-senha__subtitle subtitle">
                                Informe seu e-mail cadastrado para receber o link de redefinição de senha.
                            </p>
                        </div>

                        <form
                            className="esqueci-senha__form stack"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                        >
                            <div className="field">
                                <label className="label sr-only" htmlFor="email">E-mail</label>
                                <input
                                    id="email"
                                    className="input"
                                    type="text"
                                    placeholder="Seu e-mail"
                                    disabled={isLoading}
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

                            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />

                            <button
                                type="submit"
                                className="btn btn--primary esqueci-senha__submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Enviando...' : 'Continuar'}
                            </button>
                        </form>

                        <a href="/login" className="link-muted esqueci-senha__voltar">
                            Voltar para o login
                        </a>
                    </div>
                ) : (
                    <div className="esqueci-senha__sucesso-card card">
                        <div className="esqueci-senha__sucesso-msg">
                            <p>
                                Se o e-mail informado estiver cadastrado, você receberá um link
                                para redefinição em instantes.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn btn--primary esqueci-senha__login-btn"
                            onClick={() => navigate('/login')}
                        >
                            <svg
                                className="esqueci-senha__login-icon"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 12H5" />
                                <path d="M12 19l-7-7 7-7" />
                            </svg>
                            Voltar para tela de login
                        </button>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}