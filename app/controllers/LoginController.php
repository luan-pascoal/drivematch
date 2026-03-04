<?php

class LoginController extends Login{

    private $uid;
    private $pwd;

    public function __construct($uid, $pwd){

        $this -> uid = $uid;
        $this -> pwd = $pwd;

    }

    public function loginUser(){

    if (!$this->emptyInput()){
        header("location: /login_test/app/views/login.php?error=emptyinput");
        exit();
    }

    $result = $this->getUser($this->uid);

    if($result === false){
        header("location: /login_test/app/views/login.php?error=stmtfailed");
        exit();
    }

    if(empty($result)){
        header("location: /login_test/app/views/login.php?error=usernotfound");
        exit();
    }

    $user = $result[0];

    if(!password_verify($this->pwd, $user->password)){
        header("location: /login_test/app/views/login.php?error=wrongusernameorpassword");
        exit();
    }

    $session = new Session();
    $session->regenerate();
    $session->set('USER', ['id' => $user->users_id, 'username' => $user->username, 'email' => $user->email, 'LOGGED_IN' => 1]);
    header("location: /login_test/app/views/index.php?error=none");
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
}
?>