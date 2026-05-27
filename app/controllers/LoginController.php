<?php

class LoginController {

    private $email;
    private $senha;
    private $erros = [];

    public function fazerLogin($data){

        $this->email = $data['email'] ?? null;
        $this->senha = $data['senha'] ?? null;

        $this->validarEmail();
        $this->validarSenha();

        if (!empty($this->erros)){

            http_response_code(422);

            echo json_encode([
                "Erro" => $this->erros
            ]);

            return;
        }

        $usuario = new Usuario();

        $resultado = $usuario->acharUsuario($this->email);

        if ($resultado === false){

            $this->erros['bd'] = "Erro interno ao logar o usuário. Tente novamente.";
        }

        if (empty($resultado)){

            $this->erros['sistema'] = "Email ou senha incorreta";
        }

        if (!empty($this->erros)){

            http_response_code(422);

            echo json_encode([
                "Erro" => $this->erros
            ]);

            return;
        }

        $dadosUsuario = $resultado[0];

        if (!password_verify($this->senha, $dadosUsuario->Usu_senha)){

            $this->erros['sistema'] = "Email ou senha incorreta";
        }

        if (!empty($this->erros)){

            http_response_code(422);

            echo json_encode([
                "Erro" => $this->erros
            ]);

            return;
        }

        $session = new Session();

        $session->set('USER', [

            'id' => $dadosUsuario->Usu_id,
            'nome' => $dadosUsuario->Usu_nome,
            'email' => $dadosUsuario->Usu_email,
            'tipo' => "usuario",
            'LOGGED_IN' => 1

        ]);

        http_response_code(200);

        echo json_encode([

            "sucesso" => true,
            "mensagem" => "Usuário logado com sucesso"

        ]);

        return;
    }

    public function validarEmail(){

        if (is_null($this->email) || empty(trim($this->email))){

            $this->erros['email'] = "Email precisa ser preenchido";

            return;
        }

        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)){

            $this->erros['email'] = "Email inválido";
        }
    }

    public function validarSenha(){

        if (is_null($this->senha) || empty(trim($this->senha))){

            $this->erros['senha'] = "Senha precisa ser preenchida";
        }
    }
}

?>