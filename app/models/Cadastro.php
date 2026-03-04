<?php

class Cadastro{

    protected function checkUser($uid, $email){

        return DataBase::table('users') -> select () -> where("username = :username OR email = :email",
        ["username" => $uid, "email" => $email]);

    }

    protected function setUser($uid, $pwd, $email){

        $hashedPwd = password_hash($pwd, PASSWORD_DEFAULT);

        $arr = ["username" => $uid, "password" => $hashedPwd, "email" => $email];

        return DataBase::table('users') -> insert ($arr);

    }

}

?>