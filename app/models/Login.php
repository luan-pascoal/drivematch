<?php

class Login{

    protected function getUser($uid){

        return DataBase::table('users')->select()->where("username = :uid OR email = :uid",["uid" => $uid]);

    }

}

?>