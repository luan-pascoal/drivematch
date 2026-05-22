import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Link } from 'react-router';
import { MsgErrosBackEnd } from '../../components/MsgErrosBackEnd';
import { AlertaSucesso } from '../../components/AlertaSucesso';
import axios from 'axios';
import validator from 'validator';
import './CadastroAluno.css';

export function CadastroAluno({ carregarUsuario }) {

    // register: Conecta o input ao formulário

    // Ao fazermos {...register("nome")}
    // Significa: Esse input pertence ao campo nome do formulário

    // Pq temos q fazer ...register?
    // A função register retorna um objeto com propriedades como: name, onChange, onBlur e ref
    // O spead operator pega todas propriedades e coloca no input automaticamente
    // Equivalente a: <input name="nome" onChange={function} onBlur={function} ref={function} />

    // handleSubmit: Pega os dados e chama a função onSubmit()
    // Para funcionar, n basta chamar a função onSubmit, temos que executá-la, para isso, adicionar: "()" ao final
    // Ficando: handleSubmit(onSubmit)()

    // formState: É um objeto o qual guarda informações do formulário

    // errors : é um objeto que contém os campos inválidos do formulário.

    // Quando vamos acessar o tipo de erro, devemos fazer: errors?.nome?.type
    // O "?", significa: tenta acessar algo SEM dar erro caso seja undefined ou null
    // Como no começo, errors é um objeto vazio (undefinied), sem ? geraria erro

    // watch: Permite "observar" o valor de um campo em tempo real.
    // Aqui usamos watch("senha") para capturar o valor digitado no campo senha
    // e comparar com o campo de confirmação de senha: validate: (value) => { return validator.isEmail(value); } 

    const [arrayErrosBackend, setArrayErrosBackend] = useState([]);
    const [mostrarSenha, setMostrarSenha] = useState(true);

    const navigate = useNavigate();

    const { register, setValue, handleSubmit, formState: { errors }, watch } = useForm();
    const watchSenha = watch("senha");

    const onSubmit = async (data) => {

        const formData = new FormData();

        formData.append("nome", data.nome);
        formData.append("email", data.email);
        formData.append("senha", data.senha);
        formData.append("confirmacaoSenha", data.confirmacaoSenha);
        formData.append("cpf", data.cpf);
        formData.append("genero", data.genero);
        formData.append("foto", data.foto[0]);
        formData.append("termosUso", data.termosUso ? "1" : "");

        const resposta = await axios.post('/api/usuarios', formData, {

            // Faz com que o axios entregue ao await: qualquer resposta que o servidor me der (seja 200, 400, 404 ou 500)
            validateStatus: () => true,
            withCredentials: true

        });

        if (resposta.status === 200 && resposta.data.sucesso === true) {

            setArrayErrosBackend([]);

            await carregarUsuario();

            navigate('/', { state: { msgSucesso: "Conta criada com sucesso. Aproveite a plataforma!" } });

        }

        if (resposta.status === 422) {

            const errosBackend = resposta.data.Erro;

            // Converte o objeto JSON em um array
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
            <label>Nome
                <input
                    type="text"
                    placeholder="Seu Nome"
                    {...register("nome", {
                        required: true,
                        pattern: {
                            // sintaxe: 
                            // ^ => inicio da string
                            // A-Z => letras maiúsculas
                            // a-z => letras minúsculas
                            // À-ÿ => letras acentuadas
                            // \s => espaços em branco
                            // + => "1 ou mais", precisa ter pelo menos um caractere válido
                            // $ => final da string
                            value: /^[A-Za-zÀ-ÿ\s]+$/
                        }
                    })}
                />
            </label>
            {errors?.nome?.type === 'required' && (
                <p className="error-message"> O campo nome é requerido.</p>
            )}
            {errors?.nome?.type === 'pattern' && (
                <p className="error-message"> O campo nome deve conter apenas letras.</p>
            )}
            <br />
            <br />
            <label>Email
                <input
                    type="email"
                    placeholder="Seu Email"
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
                    placeholder="Sua senha"
                    {...register("senha", {
                        minLength: 8,
                        required: true,
                        pattern: {
                            // sintaxe:
                            // (?=.*[A-Z]) => exige pelo menos uma letra maiúscula
                            // (?=.*[a-z]) => exige pelo menos uma letra minúscula
                            // (?=.*\d) => exige pelo menos um número
                            // (?=.*[@$!%*?&]) => exige pelo menos um caractere especial da lista
                            // [A-Za-z\d@$!%*?&] => permite apenas letras, números e símbolos definidos
                            // {8,} => permite qualquer quantidade de caracteres (min 8)
                            value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                        }
                    })}
                />
                <button
                    onClick={updatePasswordButton}>
                    Show
                </button>
            </label>
            {errors?.senha?.type === 'minLength' && (
                <p className="error-message"> Mínimo 8 caracteres.</p>
            )}
            {errors?.senha?.type === 'required' && (
                <p className="error-message"> O campo senha é requerido.</p>
            )}
            {errors?.senha?.type === 'pattern' && (
                <p className="error-message">  A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.</p>
            )}
            <br />
            <br />
            <label>Confirmação de Senha
                <input
                    type = {mostrarSenha ? 'password' : 'text'}
                    placeholder="Digite sua senha novamente"
                    {...register("confirmacaoSenha", {
                        minLength: 8,
                        required: true,
                        validate: (value) => {
                            return value === watchSenha;
                        },
                        pattern: {
                            value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                        }
                    })}
                />
                <button
                    onClick={updatePasswordButton}>
                    Show
                </button>
            </label>
            {errors?.confirmacaoSenha?.type === 'minLength' && (
                <p className="error-message"> Mínimo 8 caracteres.</p>
            )}
            {errors?.confirmacaoSenha?.type === 'required' && (
                <p className="error-message"> O campo confirmação de senha é requerido.</p>
            )}
            {errors?.confirmacaoSenha?.type === 'validate' && (
                <p className="error-message"> As senhas não combinam.</p>
            )}
            {errors?.confirmacaoSenha?.type === 'pattern' && (
                <p className="error-message"> A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.</p>
            )}
            <br />
            <br />
            <label>CPF
                <input
                    type="text"
                    placeholder="Seu CPF"
                    {...register("cpf", {
                        required: true,
                        validate: (value) => {
                            const cpfNumeros = value.replace(/\D/g, "");
                            return cpfNumeros.length === 11
                        }
                    })}
                    onChange={(event) => {

                        let valorFormatado = event.target.value;

                        // Remove tudo que não for número (remove pontos, traços, letras, etc.)
                        // \D = representa o padrão a ser procurado, neste caso (\D) = tudo q n for número
                        // D = Não dígito, d = dígito (0 a 9)
                        // /g = representa como procurar, /g = global search, remove todos matches, sem /g removeria só a primeira ocorrência
                        // As barras (/) = Delimitam o início e o fim da expressão regular (\D)
                        valorFormatado = valorFormatado.replace(/\D/g, '')

                        // Limita o tamanho máximo do CPF formatado (11 caracteres)
                        // Corta a string para no máximo 11 caracteres
                        valorFormatado = valorFormatado.slice(0, 11);

                        //Aplica o primeiro ponto após os 3 primeiros dígitos
                        // (\d{3}) => pega os 3 primeiros números (grupo 1)
                        // (\d) => pega o próximo número (grupo 2)
                        // '$1.$2' => Faz a substituição $1 = representa o primeiro grupo, $2 = representa o segundo grupo
                        valorFormatado = valorFormatado.replace(/(\d{3})(\d)/, '$1.$2')

                        // Aplica o segundo ponto após mais 3 dígitos (123.456.78900)
                        // Repete 
                        valorFormatado = valorFormatado.replace(/(\d{3})(\d)/, '$1.$2')

                        // Aplica o traço antes dos últimos 2 dígitos (123.456.789-00)
                        // (\d{3}) => pega 3 números (último bloco do CPF)
                        // (\d{1,2}) => pega 1 ou 2 últimos números
                        valorFormatado = valorFormatado.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

                        setValue("cpf", valorFormatado);
                    }}
                />
            </label>
            {errors?.cpf?.type === 'required' && (
                <p className="error-message"> O campo CPF é requerido.</p>
            )}
            {errors?.cpf?.type === 'validate' && (
                <p className="error-message"> CPF deve conter 11 números.</p>
            )}

            <br />
            <br />
            <label>Gênero</label>
            <select
                {...register("genero", {
                    validate: (value) => {
                        // para ser valido n pode ser = 0
                        return value != "0";
                    },
                })}
            >
                <option value="0">Selecione o seu gênero ... </option>
                <option value="Masculino">Masculino </option>
                <option value="Feminino">Feminino </option>
            </select>
            {errors?.genero?.type === 'validate' && (
                <p className="error-message"> Gênero é requerido.</p>
            )}
            <br />
            <br />
            <label className="botao-upload">Foto
                <input
                    type="file"
                    accept="image/*"
                    {...register("foto", {
                        required: true,
                        validate: (files) => {
                            const file = files[0];
                            if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
                                return "Tipo de arquivo inválido";
                            }
                            if (file.size > 2 * 1024 * 1024) {
                                return "Arquivo deve ter no máximo 2MB";
                            }
                            const tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];
                            const tamanhoValido = 2 * 1024 * 1024;
                            // para ser valido precisa ser um desses 3 tipos de arquivos e ter o tamanho valido
                            return tiposPermitidos.includes(files[0]?.type) && files[0]?.size <= tamanhoValido;
                        }
                    })}
                />
            </label>
            {errors?.foto?.type === 'required' && (
                <p className="error-message"> Foto é requerido.</p>
            )}
            {errors?.foto?.type === 'validate' && (
                <p className="error-message"> {errors.foto.message}</p>
            )}
            <br />
            <br />
            <div className="checkbox-termos">
                <input
                    type="checkbox"
                    name="termos-uso"
                    {...register("termosUso", { required: true })}
                />
                <label>Eu concordo com os termos de privacidade</label>
            </div>
            <Link to="/termos">
                Termos de Uso do MatchMarcha
            </Link>
            {errors?.termosUso?.type === 'required' && (
                <p className="error-message"> Você deve concordar com os termos de uso.</p>
            )}
            <br />
            <br />
            <button
                type="submit"
                onClick={() => handleSubmit(onSubmit)()}>
                Criar Conta
            </button>
            <MsgErrosBackEnd arrayErrosBackend={arrayErrosBackend} />
        </>

    );
}

