<?php

class RememberTokens{

    public function inserirToken($user_id, $selector, $validator, $expires, $maxexpires){

        $hashedValidator = password_hash($validator, PASSWORD_DEFAULT);

        $arr = ["user_id" => $user_id, "selector" => $selector, "validator" => $hashedValidator, 
        "expires" => $expires, "maxexpires" => $maxexpires];

        return DataBase::table('remember_tokens') -> insert ($arr);

    }   

    public function removerTokenAntigo($user_id){

        return DataBase::table('remember_tokens') -> delete() -> where("user_id = :user_id", ["user_id" => $user_id]);

    }


}

?>