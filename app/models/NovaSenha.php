<?php

class NovaSenha{

    protected function checkTokenExpiration($pwdResetSelector, $currentDate){

        return DataBase::table('pwdreset')-> select() ->where("pwdResetSelector = :pwdResetSelector AND pwdResetExpires >= :currentDate", 
        ["pwdResetSelector" => $pwdResetSelector, "currentDate" => $currentDate]);

    }

    protected function getUser($email){

        return DataBase::table('users')-> select() ->where("email = :email", ["email" => $email]);     

    }

    protected function updateUserPassword($password, $email){

        $newPassword = password_hash($password, PASSWORD_DEFAULT);

        $arr['password'] = $newPassword;

        return DataBase::table('users')-> update($arr) ->where("email = :email", ["email" => $email]);     

    }

    protected function deleteToken($email){

        return DataBase::table('pwdreset')-> delete() ->where("pwdResetEmail = :pwdResetEmail", ["pwdResetEmail" => $email]);  

    }

}

?>