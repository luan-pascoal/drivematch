<?php

class CadastroController extends Cadastro{

    private $uid;
    private $pwd;
    private $pwdRepeat;
    private $email;

    public function __construct($uid, $pwd, $pwdRepeat, $email){

        $this -> uid = $uid;
        $this -> pwd = $pwd;
        $this -> pwdRepeat = $pwdRepeat;
        $this -> email = $email;

    }

    public function signupUser(){
        if ($this -> emptyInput() == false){
            header("location: /login_test2/app/views/cadastro.php?error=emptyinput");
            exit();
        }

        if ($this -> invalidUid() == false){
            header("location: /login_test2/app/views/cadastro.php?error=username");            
            exit();            
        }

        if ($this -> invalidEmail() == false){
            header("location: /login_test2/app/views/cadastro.php?error=email");          
            exit();            
        }
        
        if ($this -> pwdMatch() == false){
            header("location: /login_test2/app/views/cadastro.php?error=passwordmatch");
            exit();            
        }

        $uidCheck = $this -> uidTakenCheck();
        if ($uidCheck === "stmtfailed"){
            header("location: /login_test2/app/views/cadastro.php?error=stmtfailed");
            exit();            
        }

        if ($uidCheck == false){
            header("location: /login_test2/app/views/cadastro.php?error=useroremailtaken");
            exit();            
        }

        $result = $this -> setUser($this -> uid, $this -> pwd, $this -> email);

        if($result === false){
            header("location: /login_test2/app/views/cadastro.php?error=stmtfailed");
            exit();
        }
        
        //going back to front page
        header("location: /login_test2/app/views/index.php?error=none");
        die;        
        

    }


    //verifica se alguma das variáveis está vazia (n foi preenchida)
    private function emptyInput(){

        $result; 

        if (empty($this -> uid) || empty($this -> pwd) || empty($this -> pwdRepeat) || empty($this -> email)){
            $result = false;
        }else {
            $result = true;
        }

        return $result;

    }

    //verifica se username digitado pelo usuario corresponde ao padrão desejado 
    //neste caso so pode ter: letras minusculas (a-z), letras maiusculas (A-Z), numeros (0-9) ou espaços vazios ()
    private function invalidUid(){

        $result;

        if (!preg_match("/^[a-zA-Z0-9 ]+$/", $this -> uid)){
            $result = false;
        }else{
            $result = true;
        }

        return $result;

    }

    //verifica se o email digitado pelo usuario é válido
    private function invalidEmail(){

        $result;

        if (!filter_var($this -> email, FILTER_VALIDATE_EMAIL)){
            $result = false;
        }else {
            $result = true;
        }

        return $result;

    }

    //verifica se as duas senhas digitadas pelo usuario são iguais
    private function pwdMatch(){

        $result;

        if ($this -> pwd !== $this -> pwdRepeat){
            $result = false;
        }else {
            $result = true;
        }

        return $result;

    }

    //checa se o email/username ja existem no bd
    private function uidTakenCheck(){

        $result = $this -> checkUser($this -> uid, $this -> email);

        //=== compara valor e tipo

        //se $result for false, temos um erro de statement
        //lembrando q checkUser() pode retornar:
        //false -> erro no statement
        // [] -> nenhum usuário encontrado
        // [obj]  -> usuário já existe

        if ($result === false){
            return "stmtfailed";
        }

        //se $result n está vazio, logo ja existe esse username ou email, logo, retornamos false
        if (!empty($result)){
            return false;
        }

        //username e email disponiveis
        return true;
    }


}

?>
