<?php

class Session{

    public function start_session(){

        if(!isset($_SESSION)){
            session_start();
        }

    }

    public function flush(){
        $this -> start_session();
        session_destroy();
    }

    public function set($mykye, $myvalue = ''){

        $this -> start_session();

        if(is_string($mykye)){

            $_SESSION[$mykye] = $myvalue;

        }elseif(is_array($mykye)){

            foreach($mykye as $key => $value){
                $_SESSION[$key] = $value;
            }

        }
        
    }

    public function get($key){

        $this -> start_session();

        if (isset($_SESSION[$key])){
            return $_SESSION[$key];
        }
        

    }

    public function exists($key) {

        $this -> start_session();

        if(isset($_SESSION[$key])){

            return true;

        }

        return false;

    }   

    public function remove($key){

        $this -> start_session();

        if (isset($_SESSION[$key])){
            unset($_SESSION[$key]);
            return true;
        }

        return false;

    }
    public function regenerate(){

        session_regenerate_id();

    }

    public function is_logged_in(){

    $this->start_session();

    if(isset($_SESSION['USER']) && isset($_SESSION['USER']['LOGGED_IN']) && $_SESSION['USER']['LOGGED_IN'] == 1){
        return true;
    }

    return false;

}
    public function checkRememberMe(){

        //ja esta logado? se sim, ja esta autenticado, n precisa checar cookie
        if ($this -> is_logged_in()){
            return;
        }

        //tem cookie para checar?
        if(!isset($_COOKIE['rememberme'])){
            return;
        }

        //pega o cookie rememberme
        //se ele não existir, define como null
        $cookie = $_COOKIE['rememberme'] ?? null;

        //verifica se o cookie contém ":" que separa selector e validator
        //se não tiver, o cookie é inválido
        if (!strstr($cookie, ":")){

            return;

        }

        //passou da verificação acima, tem : , logo dividiremos a string para pegar os dois tokens
        $parts = explode(":", $cookie);

        //verifica se realmente temos os dois tokens
        if (count($parts) !== 2){
            return;
        }

        $selector = $parts[0];
        $validator = $parts[1]; 
        
        //selector deve ter 16 caracteres hex
        //(pois foi gerado com bin2hex(random_bytes(8)))
        if(strlen($selector) !== 16){
            return;
        }

        //busca o token no banco usando o selector
        //depois iremos comparar o validator do cookie com o hash salvo no banco
        $token = DataBase::table('remember_tokens')->select()->where("selector = :selector",["selector" => $selector]);

        if (empty($token)){
            return;
        }

        //deu certo, armazenamos o retorno do bd em token
        $token = $token[0];

        //verifica o expires rotativo (7 dias)
        //se ja estiver vencido, remove o token do bd
        if ($token -> expires < date("U")){
            $rememberModel = new RememberTokens();
            $rememberModel->removeToken($token->user_id);
            return;
        }

        //verifica o maxexpires (30 dias)
        //se ja estiver vencido, remove o token do bd
        if ($token -> maxexpires < date("U")){
            $rememberModel = new RememberTokens();
            $rememberModel->removeToken($token->user_id);
            return;
        }

        //verifica se o validator do cookie corresponde ao hash armazenado no banco
        if (!password_verify(hex2bin($validator), $token ->validator)){
            return;
        }

        //consulta o bd para pegar as informações do usuario
        $user = DataBase::table('users')->select()->where("id = :id",["id" => $token -> user_id]);

        if(empty($user)){
            return;
        }

        $user = $user[0];

        //seta a sessão, mantem o usuario logado
        $this->set('USER', ['id' => $user->id, 'username' => $user->username, 'email' => $user->email, 'LOGGED_IN' => 1]);

        //rotaciona token
        $rememberModel = new RememberTokens();
        $rememberModel -> removeToken($token -> user_id);
        $newSelector = bin2hex(random_bytes(8));
        $newValidator = random_bytes(32);
        $newExpires = date("U") + ((60*60*24)*7);
        $rememberModel -> insertToken($token -> user_id, $newSelector, $newValidator, $newExpires, $token -> maxexpires);
        setcookie("rememberme", $newSelector . ":" . bin2hex($newValidator), $newExpires, "/");

    }

}
?>