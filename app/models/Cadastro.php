<?php

class Cadastro{

    protected function checarUsuario($username, $email){

        return DataBase::table('users') -> select () -> where("username = :username OR email = :email",
        ["username" => $username, "email" => $email]);

    }

    protected function setUsuario($username, $pwd, $email){

        $hashedPwd = password_hash($pwd, PASSWORD_DEFAULT);

        $arr = ["username" => $username, "password" => $hashedPwd, "email" => $email];

        return DataBase::table('users') -> insert ($arr);

    }

}

?>