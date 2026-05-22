<?php



class NovaSenhaController extends NovaSenha{

    private $selector;
    private $validator;
    private $password;
    private $passwordRepeat;

    public function __construct($selector, $validator, $pwd, $pwdRepeat){

        $this -> selector = $selector;
        $this -> validator = $validator;
        $this -> password = $pwd;
        $this -> passwordRepeat = $pwdRepeat;

    }

    public function novaSenha(){

        if ($this -> inputVazio() == false){
            header("location: /login_test2/app/views/nova-senha.php?error=newpwdempty"); 
            exit();
        }


        if ($this -> compararSenhas() == false){
            header("location: /login_test2/app/views/nova-senha.php?error=passwordmatch"); 
            exit();            
        }

        //pegamos a data atual, para comparar com a data inserida no bd, e checar se os tokens expiraram ou n
        $dataAtual = date("U");

        $resultado = $this -> checarExpiracaoToken($this -> selector, $dataAtual);

        if ($resultado === false){
            header("location: /login_test2/app/views/nova-senha.php?error=stmtfailed"); 
            exit();            
        }

        //n tem nenhum token com data de expiração ativa 
        //MSG: REENVIAR DADOS  = default error
        if (empty($resultado)){
            header("location: /login_test2/app/views/nova-senha.php?error=defaulterror"); 
            exit();            
        }

        $token = $resultado[0];

        //convertemos o validator para binario
        //fazemos isso pois iremos comparar com o valor de token q esta inserido no bd, e lá ele esta binario
        $tokenBin = hex2bin($this -> validator);

        //comparando os tokens
        $tokenCheck = password_verify($tokenBin, $token -> pwdResetToken);

        //tokens n batem, reenviar dados = default error
        if ($tokenCheck === false){
            header("location: /login_test2/app/views/nova-senha.php?error=defaulterror"); 
            exit();   
        }

        $tokenEmail = $token -> pwdResetEmail;
        $user = $this -> getUsuario($tokenEmail);
        if ($user === false){
            header("location: /login_test2/app/views/nova-senha.php?error=stmtfailed"); 
            exit();            
        }

        if (empty($user)){
            //n tem esse email, n pode falar abertamente isso na msg de erro
            //logo, reenviar dados = default error
            header("location: /login_test2/app/views/nova-senha.php?error=defaulterror"); 
            exit();            
        } 
            
        $password = $this -> atualizarSenhaUsuario($this -> password, $tokenEmail);

        //ou deu erro de statement, ou deu erro no update
        if($password === false){
            header("location: /login_test2/app/views/nova-senha.php?error=defaulterror"); 
            exit(); 
        }
       
        $tokenRemovido = $this -> removerToken($tokenEmail);

        //retorna falso se o email n existir, n pode falar, ent default error
        if($tokenRemovido  === false){
            header("location: /login_test2/app/views/nova-senha.php?error=defaulterror"); 
            exit(); 
        }
            
        header("location: /login_test2/app/views/login.php?newpwd=passwordupdated"); 
        die;

    }


    private function inputVazio(){

        $resultado; 

        if (empty($this -> password) || empty($this -> passwordRepeat)){
            $resultado = false;
        }else {
            $resultado = true;
        }

        return $resultado;

    }

    private function compararSenhas(){

        $resultado;

        if ($this -> password !== $this -> passwordRepeat){
            $resultado = false;
        }else {
            $resultado = true;
        }

        return $resultado;

    }


}


?>