<?php

class LoginController extends Login{

    private $uid;
    private $pwd;
    private $remember;
    private $selector;
    private $validator;
    private $expires;
    private $maxexpires;

    public function __construct($uid, $pwd, $remember){

        $this -> uid = $uid;
        $this -> pwd = $pwd;
        $this -> remember = $remember;

    }
    
    public function loginUser(){

    if (!$this->emptyInput()){
        header("location: /login_test2/app/views/login.php?error=emptyinput");
        exit();
    }

    $result = $this->getUser($this->uid);

    if($result === false){
        header("location: /login_test2/app/views/login.php?error=stmtfailed");
        exit();
    }

    if(empty($result)){
        header("location: /login_test2/app/views/login.php?error=usernotfound");
        exit();
    }

    $user = $result[0];

    if(!password_verify($this->pwd, $user->password)){
        header("location: /login_test2/app/views/login.php?error=wrongusernameorpassword");
        exit();
    }

    //criando a session user
    $session = new Session();
    $session->regenerate();
    $session->set('USER', ['id' => $user->id, 'username' => $user->username, 'email' => $user->email, 'LOGGED_IN' => 1]);

    if ($this -> remember !== NULL){

        $this -> generateTokens();

        $rememberModel = new RememberTokens();

        // REMOVE tokens antigos antes de criar novo
        $rememberModel->removeToken($user->id);

        $insert = $rememberModel -> insertToken($user->id, $this -> selector, $this -> validator, $this-> expires, $this -> maxexpires);

        if ($insert === false){
            header("location: /login_test2/app/views/login.php?error=stmtfailed");                        
            exit();            
        }

        setcookie("rememberme", $this->selector . ":" . bin2hex($this->validator), $this -> expires, "/");
        
    }
    header("location: /login_test2/app/views/index.php?error=none");
    die;
}

    private function emptyInput(){

        $result; 

        if (empty($this -> uid) || empty($this -> pwd)){
            $result = false;
        }else {
            $result = true;
        }

        return $result;

    }

    private function generateTokens(){

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