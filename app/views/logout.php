<?php

include __DIR__ . '/../../config/init.php';

$session = new Session();

if($session -> exists('USER')){

    //pegando os dados do usuario salvos na sessão, para excluir o tokens rememberme
    $user = $session -> get('USER');

    //remove sessão USER
    $session -> remove('USER');

    //fecha a sessão
    $session -> flush();

    //remove cookie
    setcookie("rememberme", "", date("U") - (1000));

    if($user){
        $rememberModel = new RememberTokens();
        $remove = $rememberModel -> removeToken($user['id']);
    }


}

    //redireciona para index.php
    header("location:/login_test2/app/views/index.php?error=none");
    die;

?>