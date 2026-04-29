<?php

class RecuperarSenha{

    //checa se o email existe
    protected function checarEmail($email){

        return DataBase::table('users')->select()->where("email = :email",["email" => $email]);

    }

    //verifica se tal usuario já tem um token criado, se tiver remove, explicação em ResetRequestController
    protected function checarTokensAntigos($email){

        return DataBase::table('pwdReset')->delete()->where("pwdResetEmail = :pwdResetEmail",["pwdResetEmail" => $email]);

    }

    //coloca o token no bd
    protected function setToken($pwdResetEmail, $pwdResetSelector, $pwdResetToken, $pwdResetExpires ){

        $hashedToken = password_hash($pwdResetToken, PASSWORD_DEFAULT);

        $arr = ["pwdResetEmail" => $pwdResetEmail, "pwdResetSelector" => $pwdResetSelector, "pwdResetToken" => $hashedToken, 
        "pwdResetExpires" => $pwdResetExpires];

        return DataBase::table('pwdReset') -> insert ($arr);

    }

}

?>