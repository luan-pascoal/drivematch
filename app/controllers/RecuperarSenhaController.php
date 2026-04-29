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
    private function gerarTokens(){
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
    public function validarRequisicao(){

        //verifica se esse email existe no bd
        //emailChecado pode retornar false = erro de statement, obj vazio: n tem esse email no bd, obj n vazio: email valido pra prosseguir
        //se tratassemos o obj vazio, por ex if (empty($emailChecado)), iriamos declarar um get dizendo usernotfound
        //oq é mt perigosos para a segurança do site
        //ent so tratamos o obj n vazio (!empty($emailChecado)
        //se o obj estiver vazio nada acontece 
        $emailChecado = $this -> checarEmail($this -> email);

        if ($emailChecado === false){
            //default error = there was an error
            header("location: /login_test2/app/views/recuperar-senha.php?error=defaulterror");
            exit();                        
        }

        if (!empty($emailChecado)){

            //verifica se este usuario já tem algum token criado, se tiver, remove
            //PQ FAZER ISSO?
            //ex: se o usuario tentou redefinir a senha 20 min atras, porem n concluiu o processo, ainda vai haver um token, ent para 
            //evitar que 2 emails de confirmação sejam enviados, e 2 tokens criados
            //vamos deletar quaisquer entradas de tokens presentes no banco de dados
            //garantindo que não exista nenhum tokem deste usuario no banco de dados
            $resultado = $this -> checarTokensAntigos($this -> email);

            //como usamos rowCount(), seguindo o encadeamento: delete()->where()->run()
            //run(), em caso de delete(), retorna a função rowCount() ou false (erro de statement)
            //run() vai fazer por ex: delete FROM pwdReset WHERE pwdResetEmail = x;
            //se tiver alguem no bd com pwdResetEmail = x, ele retorna 1, se não retorna 0
            //se retornar 0 ou 1 de qualquer jeito vamos ter q criar o token
            if ($resultado === false){

                header("location: /login_test2/app/views/recuperar-senha.php?error=stmtfailed");
                exit();        

                }else{

                    //cria os tokens
                    $this -> gerarTokens();
                    //insere o token no bd
                    $inserirToken = $this -> setToken($this -> email, $this -> selector, $this -> token, $this -> expires);
                    if($inserirToken === false){
                        header("location: /login_test2/app/views/recuperar-senha.php?error=stmtfailed");                        
                        exit();
                    }
                    
            }
            }
    }

    //essa função é responsável por enviar o email de mudança de senha
    public function enviarEmail(){

        //a partir do ? são tudo parâmetros $get
        //a url ficara assim, por ex: http://localhost/logintest/create-new-password.php?selector=abc123&validator=4f8a9c
        $url = "http://localhost/login_test2/app/views/nova-senha.php?selector=" . $this->selector . "&validator=" . bin2hex($this->token);
        
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
            header("location: /login_test2/app/views/recuperar-senha.php?error=mailerror");   
            exit();
        }

        header("location: /login_test2/app/views/recuperar-senha.php?reset=success");
        exit();
}
}
    
?>


