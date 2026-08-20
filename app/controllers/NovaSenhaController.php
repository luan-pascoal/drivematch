<?php

class NovaSenhaController extends NovaSenha{

    private $selector;
    private $token;
    private $senha;
    private $confirmacaoSenha;

    
    /************************************************************
    *                        MÉTODOS                            *     
    *        Métodos responsáveis pelas requisições HTTP        *
    ************************************************************/

    public function redefinirSenha($data){

        $erros = [];

        $this->selector = $data["selector"] ?? null;
        $this->token = $data["token"] ?? null;
        $this->senha = $data["senha"] ?? null;
        $this->confirmacaoSenha = $data["confirmacaoSenha"] ?? null;

        $this->validarSenha($erros);
        $this->validarConfirmacaoSenha($erros);

        if(!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        // Pegamos a data atual, para comparar com a data inserida no bd, e checar se os tokens expiraram ou n
        $dataAtual = date("Y-m-d H:i:s");

        $resultado = $this->checarExpiracaoToken($this -> selector, $dataAtual);

        if($resultado === false){
            http_response_code(422);
            $erros["bd"] = "Erro interno ao redefinir senha do usuário. Tente novamente.";
            return;
        }

        if(empty($resultado)){
            http_response_code(422);
            $erros["bd"] = "Não foi possível redefinir sua senha. O link pode ter expirado ou já ter sido utilizado. 
            Solicite uma nova recuperação de senha.";
            return;
        }

        // Token do bd (em binario)
        $token = $resultado[0]->Rdf_token;

        // Convertemos o token vindo da url para binario
        // Fazemos isso pois iremos comparar com o valor de token q esta inserido no bd, e lá ele esta binario
        $tokenBin = hex2bin($this->token);

        // Comparando tokens
        $tokenCheck = password_verify($tokenBin, $token);

        if($tokenCheck === false){
            http_response_code(422);
            $erros["bd"] = "XXXXX";
            return;
        }

        $tokenId = $resultado[0]->Rdf_usuarioid;
        $usuario = $this->acharUsuario($tokenId);

        if($usuario === false){
            http_response_code(422);
            $erros["bd"] = "Erro interno ao redefinir senha do usuário. Tente novamente.";
            return;
        }

        // Não tem esse email, n pode falar abertamente isso na msg de erro
        // Manda msg padrão
        if(empty($usuario)){
            http_response_code(422);
            $erros["bd"] = "Não foi possível redefinir sua senha. O link pode ter expirado ou já ter sido utilizado. 
            Solicite uma nova recuperação de senha.";
            return;
        }

        $atualizarSenha = $this->atualizarSenhaUsuario($this->senha, $tokenId);

        // Erro de statement ou erro de update (msg padrão)
        if($atualizarSenha === false){
            http_response_code(422);
            $erros["bd"] = "Não foi possível redefinir sua senha. O link pode ter expirado ou já ter sido utilizado.
             Solicite uma nova recuperação de senha.";
            return;
        }

        $tokenRemovido = $this -> removerToken($tokenId);

        // Retorna falso se o id n existir, n pode falar, ent msg padrão
        if($tokenRemovido === false){
            http_response_code(422);
            $erros["bd"] = "Não foi possível redefinir sua senha. O link pode ter expirado ou já ter sido utilizado. 
            Solicite uma nova recuperação de senha.";
            return;
        }

        http_response_code(200);

        echo json_encode([
            "sucesso" => true
        ]);

    }


    /************************************************************
    *                        Validações                         *     
    *         Regras de validação dos dados do usuário          *
    ************************************************************/

    private function validarSenha($erros){

        if(empty($this->senha)){
            $erros["senha"] = "Senha precisa ser preenchida";
            return $erros;
        }

        if(strlen($this->senha) < 8){
            $erros["senha"] = "Senha precisa ter no minimo 8 caracteres";
            return $erros;
        }

        if(!preg_match("/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/", $this->senha)){
            $erros["senha"] = "A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial";
            return $erros;
        }

        return $erros;

    }

    private function validarConfirmacaoSenha($erros){

        if (empty($this->confirmacaoSenha)){
            $erros["confirmacaoSenha"] = "O campo confimacao de senha precisa ser preenchida";
            return $erros;
        }

        if (strlen($this->confirmacaoSenha) < 8){
            $erros["confirmacaoSenha"] = "O campo confimacao de senha precisa ter no minimo 8 caracteres";
            return $erros;
        }

        if(!preg_match("/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/",$this->confirmacaoSenha)){
            $erros["confirmacaoSenha"] = "A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial";
            return $erros;
        }

        if($this->senha !== $this->confirmacaoSenha){
            $erros["confirmacaoSenha"] = "As senhas não combinam";
            return $erros;
        }

        return $erros;

        }

    }

?>