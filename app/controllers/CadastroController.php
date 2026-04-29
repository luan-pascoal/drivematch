<?php

class CadastroController extends Cadastro{

    private $username;
    private $pwd;
    private $pwdRepeat;
    private $email;

    public function __construct($username, $pwd, $pwdRepeat, $email){

        $this -> username = $username;
        $this -> pwd = $pwd;
        $this -> pwdRepeat = $pwdRepeat;
        $this -> email = $email;

    }

    public function cadastrarUsuario(){

        if ($this -> inputVazio() == false){
            header("location: /login_test2/app/views/cadastro.php?error=inputVazio");
            exit();
        }

        if ($this -> usernameInvalido() == false){
            header("location: /login_test2/app/views/cadastro.php?error=username");            
            exit();            
        }

        if ($this -> emailInvalido() == false){
            header("location: /login_test2/app/views/cadastro.php?error=email");          
            exit();            
        }
        
        if ($this -> compararSenhas() == false){
            header("location: /login_test2/app/views/cadastro.php?error=passwordmatch");
            exit();            
        }

        $usernameCheck = $this -> checkarUsername();
        if ($usernameCheck === "stmtfailed"){
            header("location: /login_test2/app/views/cadastro.php?error=stmtfailed");
            exit();            
        }

        if ($usernameCheck == false){
            header("location: /login_test2/app/views/cadastro.php?error=useroremailtaken");
            exit();            
        }

        $resultado = $this -> setUsuario($this -> username, $this -> pwd, $this -> email);

        if($resultado === false){
            header("location: /login_test2/app/views/cadastro.php?error=stmtfailed");
            exit();
        }
        
        header("location: /login_test2/app/views/index.php?error=none");
        die;        
        
    }


    //verifica se alguma das variáveis está vazia (n foi preenchida)
    private function inputVazio(){

        $resultado; 

        if (empty($this -> username) || empty($this -> pwd) || empty($this -> pwdRepeat) || empty($this -> email)){
            $resultado = false;
        }else {
            $resultado = true;
        }

        return $resultado;

    }

    //verifica se username digitado pelo usuario corresponde ao padrão desejado 
    //neste caso so pode ter: letras minusculas (a-z), letras maiusculas (A-Z), numeros (0-9) ou espaços vazios ()
    private function usernameInvalido(){

        $resultado;

        if (!preg_match("/^[a-zA-Z0-9 ]+$/", $this -> username)){
            $resultado = false;
        }else{
            $resultado = true;
        }

        return $resultado;

    }

    //verifica se o email digitado pelo usuario é válido
    private function emailInvalido(){

        $resultado;

        if (!filter_var($this -> email, FILTER_VALIDATE_EMAIL)){
            $resultado = false;
        }else {
            $resultado = true;
        }

        return $resultado;

    }

    //verifica se as duas senhas digitadas pelo usuario são iguais
    private function compararSenhas(){

        $resultado;

        if ($this -> pwd !== $this -> pwdRepeat){
            $resultado = false;
        }else {
            $resultado = true;
        }

        return $resultado;

    }

    //checa se o email/username ja existem no bd
    private function checkarUsername(){

        $resultado = $this -> checarUsuario($this -> username, $this -> email);

        //=== compara valor e tipo

        //se $resultado for false, temos um erro de statement
        //lembrando q checarUsuario() pode retornar:
        //false -> erro no statement
        // [] -> nenhum usuário encontrado
        // [obj]  -> usuário já existe

        if ($resultado === false){
            return "stmtfailed";
        }

        //se $resultado n está vazio, logo ja existe esse username ou email, logo, retornamos false
        if (!empty($resultado)){
            return false;
        }

        //username e email disponiveis
        return true;
    }


}

?>
