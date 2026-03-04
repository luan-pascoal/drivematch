<?php

class RecuperarSenhaController extends RecuperarSenha {

    private $email;
    private $selector;
    private $token;
    private $expires;

    public function __construct($email){

        $this -> email = $email;

    }

    //essa função é responsavel por criar os tokens da requisição de mudança de senha 
    private function generateTokens(){
        //usaremos dois tokens ($selector e $token)
        //1($selector): usado para encontrar o registro no banco
        //2($token): usado para validar se o token é verdadeiro
        //usamos dois tokens para evitar timing attacks
        //random_bytes() = gera numeros binarios aleatorios, bin2he() = converte esses numeros binarios para hexadecimal
        $this -> selector = bin2hex(random_bytes(8));

        //queremos inserir $token no bd antes de converter para hexadecimal
        //ent so iremos converter $token no link da $url
        $this -> token = random_bytes(32);

        //data de expiração
        //date("U") contador de segundos, conta todos segundos desde 1970
        //adicionamos 1800segs a essa função, logo o tempo de expiração será de 30 minutos contados a partir do momento da solicitação
        $this -> expires = date("U") + 1800;

    }


    //essa função é responsável por validar a requisição de mudança de senha e inserir esta requisição no bd 
    public function validateRequest(){

        //verifica se esse email existe no bd
        //checkEmail pode retornar false = erro de statement, obj vazio: n tem esse email no bd, obj n vazio: email valido pra prosseguir
        //se tratassemos o obj vazio, por ex if (empty($checkemail)), iriamos declarar um get dizendo usernotfound
        //oq é mt perigosos para a segurança do site
        //ent so tratamos o obj n vazio (!empty($checkEmail)
        //se o obj estiver vazio nada acontece 
        $checkEmail = $this -> emailExists($this -> email);

        if ($checkEmail === false){
            //default error = there was an error
            header("location: /login_test/app/views/recuperar-senha.php?error=defaulterror");
            exit();                        
        }

        if (!empty($checkEmail)){

            //verifica se este usuario já tem algum token criado, se tiver, remove
            //PQ FAZER ISSO?
            //ex: se o usuario tentou redefinir a senha 20 min atras, porem n concluiu o processo, ainda vai haver um token, ent para 
            //evitar que 2 emails de confirmação sejam enviados, e 2 tokens criados
            //vamos deletar quaisquer entradas de tokens presentes no banco de dados
            //garantindo que não exista nenhum tokem deste usuario no banco de dados
            $result = $this -> checkOldTokens($this -> email);

            //como usamos rowCount(), seguindo o encadeamento: delete()->where()->run()
            //run(), em caso de delete(), retorna a função rowCount() ou false (erro de statement)
            //run() vai fazer por ex: delete FROM pwdReset WHERE pwdResetEmail = x;
            //se tiver alguem no bd com pwdResetEmail = x, ele retorna 1, se não retorna 0
            //se retornar 0 ou 1 de qualquer jeito vamos ter q criar o token
            if ($result === false){
                header("location: /login_test/app/views/recuperar-senha.php?error=stmtfailed");
                exit();            
                }else{

                    //cria os tokens
                    $this -> generateTokens();
                    //insere o token no bd
                    $insertToken = $this -> setToken($this -> email, $this -> selector, $this -> token, $this -> expires);
                    if($insertToken === false){
                        header("location: /login_test/app/views/recuperar-senha.php?error=stmtfailed");                        
                        exit();
                    }
            }
            }
    }

    //essa função é responsável por enviar o email de mudança de senha
    public function sendEmail(){

        //a partir do ? são tudo parâmetros $get
        //a url ficara assim, por ex: http://localhost/logintest/create-new-password.php?selector=abc123&validator=4f8a9c
        $url = "http://localhost/login_test/app/views/nova-senha.php?selector=" . $this->selector . "&validator=" . bin2hex($this->token);
        
        require_once __DIR__ . "/../core/phpmailer/src/Exception.php";
        require_once __DIR__ . "/../core/phpmailer/src/PHPMailer.php";
        require_once __DIR__ . "/../core/phpmailer/src/SMTP.php";
        
        $mail = new PHPMailer\PHPMailer\PHPMailer();

        // CONFIG SMTP
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'logintestwng@gmail.com'; // seu email
        $mail->Password   = 'atnsixatmferxqbo';       // senha de app do Gmail
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        //evita erros com ascentos
        $mail->CharSet = 'UTF-8';

        // REMETENTE
        //faz com que o cabeçalho From do email fique: LoginTest Website <logintestwng@gmail.com>
        $mail->setFrom('logintestwng@gmail.com', 'LoginTest Website');

        // DESTINATÁRIO
        $mail->addAddress($this->email);

        // CONTEÚDO
        $mail->isHTML(true);
        $mail->Subject = 'Reset your password for the LoginTest website';
        $mail->Body = '<p>We received a password reset request.</p>
        <p>If you did not make this request, you can ignore this email.</p>
        <p>Here is your password reset link:</p>
        <p><a href="'.$url.'">'.$url.'</a></p>';

        //AltBody é alternative body 
        //$mail->isHTML(true); Significa q o email é HTML
        //mas nem todos clientes: aceitam HTML, permitem HTML, mostram HTML corretamente
        //alguns clientes mostram apenas texto puro (AltBody)
        $mail->AltBody = 'Copy and paste this link into your browser: ' . $url;

        if(!$mail->send()){
            header("location: /login_test/app/views/recuperar-senha.php?error=mailerror");   
            exit();
        }

        header("location: /login_test/app/views/recuperar-senha.php?reset=success");
        exit();
}
}

        

    
?>


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

    public function newPassword(){

        if ($this -> emptyInput() == false){
            header("location: /login_test/app/views/nova-senha.php?error=newpwdempty"); 
            exit();
        }


        if ($this -> pwdMatch() == false){
            header("location: /login_test/app/views/nova-senha.php?error=passwordmatch"); 
            exit();            
        }

        //pegamos a data atual, para comparar com a data inserida no bd, e checar se os tokens expiraram ou n
        $currentDate = date("U");

        $result = $this -> checkTokenExpiration($this -> selector, $currentDate);

        if ($result === false){
            header("location: /login_test/app/views/nova-senha.php?error=stmtfailed"); 
            exit();            
        }

        //n tem nenhum token com data de expiração ativa 
        //MSG: REENVIAR DADOS  = default error
        if (empty($result)){
            header("location: /login_test/app/views/nova-senha.php?error=defaulterror"); 
            exit();            
        }

        $token = $result[0];

        //convertemos o validator para binario
        //fazemos isso pois iremos comparar com o valor de token q esta inserido no bd, e lá ele esta binario
        $tokenBin = hex2bin($this -> validator);

        //comparando os tokens
        $tokenCheck = password_verify($tokenBin, $token -> pwdResetToken);

        //tokens n batem, reenviar dados = default error
        if ($tokenCheck === false){
            header("location: /login_test/app/views/nova-senha.php?error=defaulterror"); 
            exit();   
        }

        $tokenEmail = $token -> pwdResetEmail;
        $user = $this -> getUser($tokenEmail);
        if ($user === false){
            header("location: /login_test/app/views/nova-senha.php?error=stmtfailed"); 
            exit();            
        }

        if (empty($user)){
            //n tem esse email, n pode falar abertamente isso na msg de erro
            //logo, reenviar dados = default error
            header("location: /login_test/app/views/nova-senha.php?error=defaulterror"); 
            exit();            
        } 
            
        $password = $this -> updateUserPassword($this -> password, $tokenEmail);

        //ou deu erro de statement, ou deu erro no update
        if($password === false){
            header("location: /login_test/app/views/nova-senha.php?error=defaulterror"); 
            exit(); 
        }
       
        $deleteToken = $this -> deleteToken($tokenEmail);

        //retorna falso se o email n existir, n pode falar, ent default error
        if($deleteToken  === false){
            header("location: /login_test/app/views/nova-senha.php?error=defaulterror"); 
            exit(); 
        }
            
        header("location: /login_test/app/views/login.php?newpwd=passwordupdated"); 
        die;

    }


    private function emptyInput(){

        $result; 

        if (empty($this -> password) || empty($this -> passwordRepeat)){
            $result = false;
        }else {
            $result = true;
        }

        return $result;

    }

    private function pwdMatch(){

        $result;

        if ($this -> password !== $this -> passwordRepeat){
            $result = false;
        }else {
            $result = true;
        }

        return $result;

    }