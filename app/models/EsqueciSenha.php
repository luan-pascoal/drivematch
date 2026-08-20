<?php

class EsqueciSenha{

    // Checa se o email existe
    protected function checarEmail($email){

        return DataBase::table('tb_usuario')->select()->where("Usu_email = :email",["email" => $email]);

    }

    // Verifica se tal usuario já tem um token criado, se tiver remove, explicação em EsqueciSenhaController
    protected function checarTokensAntigos($id){

        return DataBase::table('tb_RedefinirSenha')->delete()->where("Rdf_usuarioid = :id",["id" => $id]);

    }

    // Coloca o token no bd
    protected function setToken($id, $selector, $token, $dataExpiracao){

        $hashedToken = password_hash($token, PASSWORD_DEFAULT);

        $arr = ["Rdf_usuarioid" => $id, "Rdf_selector" => $selector, "Rdf_token" => $hashedToken, 
        "Rdf_dataexpiracao" => $dataExpiracao];

        return DataBase::table('tb_RedefinirSenha') -> insert ($arr);

    }

}

?>