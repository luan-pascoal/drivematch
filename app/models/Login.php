<?php

class Login{

    protected function getUsuario($username){

        return DataBase::table('users')->select()->where("username = :username OR email = :username",["username" => $username]);

    }

}

?>