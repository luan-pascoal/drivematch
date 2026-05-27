<?php

/*

class NovaSenha{

    protected function checarExpiracaoToken($pwdResetSelector, $dataAtual){

        return DataBase::table('pwdreset')-> select() ->where("pwdResetSelector = :pwdResetSelector AND pwdResetExpires >= :dataAtual", 
        ["pwdResetSelector" => $pwdResetSelector, "dataAtual" => $dataAtual]);

    }

    protected function getUsuario($email){

        return DataBase::table('users')-> select() ->where("email = :email", ["email" => $email]);     

    }

    protected function atualizarSenhaUsuario($password, $email){

        $novaSenha = password_hash($password, PASSWORD_DEFAULT);

        $arr['password'] = $novaSenha;

        return DataBase::table('users')-> update($arr) ->where("email = :email", ["email" => $email]);     

    }

    protected function removerToken($email){

        return DataBase::table('pwdreset')-> delete() ->where("pwdResetEmail = :pwdResetEmail", ["pwdResetEmail" => $email]);  

    }

}

*/

?>