import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { MsgErrosBackEnd } from '../../../components/MsgErrosBackEnd';
import axios from 'axios';
import Cancelar from '../../../assets/images/icons/cancelar.png';
import './EditarSenha.css';

export function EditarSenha() {

    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
    const [mostrarSenha, setMostrarSenha] = useState(true);

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

    const updatePasswordButton = () => {

        if (mostrarSenha === true) {

            setMostrarSenha(false);

        } else {

            setMostrarSenha(true);

        }

    }

    return (
        <>
            <div className="header-senha">
                <button
                    type="button"
                    className="botao-icon"
                    onClick={() => navigate("/editar-perfil")}
                >
                    <img src={Cancelar} alt="voltar" width="20" />
                </button>
                <span>Senha</span>
            </div>
            <label>Senha Atual
                <input
                    type = {mostrarSenha ? 'password' : 'text'}
                    placeholder="Digite sua senha atual"
                    {...register("senhaAtual", {
                        required: true
                    })}>
                </input>
                <button
                    onClick={updatePasswordButton}>
                    Show
                </button>
            </label>
            {errors?.novaSenha?.type === "required" && (
                <p className="error-message"> O campo senha atual é requerido.</p>
            )}
            <br />
            <br />
            <label>Nova Senha
                <input
                    type = {mostrarSenha ? 'password' : 'text'}
                    placeholder="Digite sua nova senha"
                    {...register("novaSenha", {
                        required: true,
                        minLength: 8,
                        pattern: {
                            value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                        }
                    })}>
                </input>
                <button
                    onClick={updatePasswordButton}>
                    Show
                </button>
                {errors?.novaSenha?.type === "required" && (
                    <p className="error-message"> O campo senha é requerido.</p>
                )}
                {errors?.novaSenha?.type === "minLength" && (
                    <p className="error-message"> Mínimo 8 caracteres.</p>
                )}
                {errors?.novaSenha?.type === "pattern" && (
                    <p className="error-message"> A senha deve conter ao menos uma letra maiúscula, uma letra minúscula,
                        um número e um caractere especial.
                    </p>
                )}
            </label>
            <br />
            <br />
            <label>Confirmação de Senha
                <input
                    type = {mostrarSenha ? 'password' : 'text'}
                    placeholder="Digite sua nova senha novamente"
                    {...register("confirmacao", {
                        required: true,
                        minLength: 8,
                        pattern: {
                            value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                        },
                        validate: (value) => {
                            return value === watchNovaSenha;
                        }
                    })}>
                </input>
                <button
                    onClick={updatePasswordButton}>
                    Show
                </button>
                {errors?.confirmacao?.type === "required" && (
                    <p className="error-message"> O campo confirmação de senha é requerido.</p>
                )}
                {errors?.confirmacao?.type === "minLength" && (
                    <p className="error-message"> Mínimo 8 caracteres.</p>
                )}
                {errors?.confirmacao?.type === "pattern" && (
                    <p className="error-message"> A senha deve conter ao menos uma letra maiúscula, uma letra minúscula,
                        um número e um caractere especial.
                    </p>
                )}
                {errors?.confirmacao?.type === "validate" && (
                    <p className="error-message"> As senhas não combinam.</p>
                )}
                <br />
                <br />
            </label>
            <button
                type="submit"
                onClick={() => handleSubmit(onSubmit)()}>
                Salvar Alterações
            </button>
            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />
        </>
    );



}