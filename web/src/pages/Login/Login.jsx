import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import { AppLayout } from '../../components/layout/AppLayout';
import { SiteNavLinks, SiteHeaderGuestActions } from '../../components/layout/SiteHeader';
import validator from 'validator';
import axios from 'axios';
import './Login.css';

export function Login({ carregarUsuario }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const [msgSucesso, setMsgSucesso] = useState('');
  const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);



  const onSubmit = async (data) => {
    const resposta = await axios.post('https://matchmarcha.infinityfree.me/api/login', data, {
      validateStatus: () => true,
    });

    if (resposta.status === 200 && resposta.data.sucesso === true) {
      setArrayErrosBackend([]);
      setMsgSucesso(resposta.data.mensagem);
      await carregarUsuario();

      setTimeout(() => {
        setMsgSucesso('');
        navigate('/');
      }, 500);
      return;
    }

    if (resposta.status === 422) {
      const errosBackend = resposta.data.Erro;
      setArrayErrosBackend(Object.entries(errosBackend));
    }
  };

  return (
    <AppLayout
      headerNav={<SiteNavLinks />}
      headerRight={<SiteHeaderGuestActions />}
      centerMain
      footerRight="Acesse sua conta"
    >
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-card__title">Login</h1>

          <div className="login-card__register">
            <Link className="btn btn--square btn--entrar login-card__register-btn" to="/cadastro-aluno">
              Cadastrar como aluno
            </Link>
            <Link className="btn btn--square btn--secondary login-card__register-btn" to="/cadastro-instrutor">
              Cadastrar como instrutor
            </Link>
          </div>

          <hr className="divider login-card__divider" />

          <form
            className="login-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="field">
              <label className="label" htmlFor="login-email">
                E-mail
              </label>
              <input
                id="login-email"
                className="input input--square"
                type="email"
                autoComplete="email"
                placeholder="Seu e-mail"
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

            <div className="field">
              <label className="label" htmlFor="login-senha">
                Senha
              </label>
              <div className="password-field">
                <input
                  id="login-senha"
                  className="input input--square"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  {...register('senha', { required: true })}
                />
                <button
                  type="button"
                  className="password-field__toggle"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"/>
                  </svg>
                </button>
              </div>
              {errors?.senha?.type === 'required' && (
                <p className="error-message">O campo senha é obrigatório.</p>
              )}
            </div>

            <p className="login-form__forgot">
              <Link className="link-muted" to="/esqueci-senha">
                Esqueceu sua senha?
              </Link>
            </p>

            {msgSucesso && (
              <p className="login-form__success" role="status">
                {msgSucesso}
              </p>
            )}

            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />

            <button type="submit" className="btn btn--square btn--cadastrar login-form__submit">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
