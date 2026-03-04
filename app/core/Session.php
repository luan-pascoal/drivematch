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
}
?>