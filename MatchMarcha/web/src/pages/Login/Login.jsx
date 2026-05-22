import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import validator from 'validator';
import axios from 'axios';


export function Login({ carregarUsuario}) {

    const { register, handleSubmit, formState: { errors } } = useForm();

    const navigate = useNavigate();
    
    const [msgSucesso, setMsgSucesso] = useState("");
    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
    const [mostrarSenha, setMostrarSenha] = useState(true);

    const onSubmit = async (data) => {

        const resposta = await axios.post('/api/login', data, {
            validateStatus: () => true

        });

        if (resposta.status === 200 && resposta.data.sucesso === true) {

            setArrayErrosBackend([]);

            setMsgSucesso(resposta.data.mensagem);

            await carregarUsuario();

            setTimeout(() => {
                setMsgSucesso("");
                navigate('/');
            }, 500);

        }

        if (resposta.status === 422) {

            const errosBackend = resposta.data.Erro;

            const array = Object.entries(errosBackend);

            setArrayErrosBackend(array);

            return;
        }

    }

    const updatePasswordButton = () => {

        if (mostrarSenha === true) {

            setMostrarSenha(false);

        } else {

            setMostrarSenha(true);

        }

    }

    return (
        <>
            <Link to="/cadastro-aluno">
                Registrar Como Aluno
            </Link>
            <br />
            <Link to="/cadastro-instrutor">
                Registrar Como Instrutor
            </Link>
            <br />
            <br />
            <label>Email
                <input
                    type="text"
                    placeholder='Seu Email'
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
            <label>Senha
                <input
                    type = {mostrarSenha ? 'password' : 'text'}
                    placeholder='Sua Senha'
                    {...register("senha", {
                        required: true,
                    })}
                />
                <button
                    onClick={updatePasswordButton}>
                    Show
                </button>
            </label>
            {errors?.senha?.type === 'required' && (
                <p className="error-message"> O campo senha é requerido.</p>
            )}
            <br />
            <br />
            <button
                type="submit"
                onClick={() => handleSubmit(onSubmit)()} >
                Entrar
            </button>
            {msgSucesso && (
                <div className="mensagem-sucesso">
                    {msgSucesso}
                </div>
            )}
            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />
        </>

    );
}