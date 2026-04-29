<?php

class LoginController extends Login{

    private $username;
    private $pwd;
    private $remember;
    private $selector;
    private $validator;
    private $expires;
    private $maxexpires;

    public function __construct($username, $pwd, $remember){

        $this -> username = $username;
        $this -> pwd = $pwd;
        $this -> remember = $remember;

    }
    
    public function loginUsuario(){

    if (!$this->inputVazio()){
        header("location: /login_test2/app/views/login.php?error=inputVazio");
        exit();
    }

    $resultado = $this->getUsuario($this->username);

    if($resultado === false){
        header("location: /login_test2/app/views/login.php?error=stmtfailed");
        exit();
    }

    if(empty($resultado)){
        header("location: /login_test2/app/views/login.php?error=usernotfound");
        exit();
    }

    $user = $resultado[0];

    if(!password_verify($this->pwd, $user->password)){
        header("location: /login_test2/app/views/login.php?error=wrongusernameorpassword");
        exit();
    }

    //criando a session user
    $session = new Session();
    $session->regenerate();
    $session->set('USER', ['id' => $user->id, 'username' => $user->username, 'email' => $user->email, 'LOGGED_IN' => 1]);

    if ($this -> remember !== NULL){

        $this -> gerarTokens();

        $rememberModel = new RememberTokens();

        // REMOVE tokens antigos antes de criar novo
        $rememberModel->removerTokenAntigo($user->id);

        $insert = $rememberModel -> inserirToken($user->id, $this -> selector, $this -> validator, $this-> expires, $this -> maxexpires);

        if ($insert === false){
            header("location: /login_test2/app/views/login.php?error=stmtfailed");                        
            exit();            
        }

        setcookie("rememberme", $this->selector . ":" . bin2hex($this->validator), $this -> expires, "/");
        
    }
    header("location: /login_test2/app/views/index.php?error=none");
    die;
}

    private function inputVazio(){

        $resultado; 

        if (empty($this -> username) || empty($this -> pwd)){
            $resultado = false;
        }else {
            $resultado = true;
        }

        return $resultado;

    }

    private function gerarTokens(){

        $this -> selector = bin2hex(random_bytes(8));

        $this -> validator = random_bytes(32);

        //token rotativo
        //1min = 60 seg, 1 hr = 60 min, 1 dia = 24 hrs
        //*7 numero de dias, neste caso 1 semana
        $this -> expires = date("U") + ((60*60*24)*7); 
      

        //limite máximo remember (30 dias)
        $this -> maxexpires = date("U") + ((60*60*24)*30);

    }

}
?>