<?php

class EsqueciSenhaController extends EsqueciSenha {

    private $email;
    private $selector;
    private $token;
    private $dataExpiracao;
    private $usuarioEncontrado = false; // Criado para mascarar o "erro" de quando n achamos o email no banco de dados

    /************************************************************
    *                        MÉTODOS                            *     
    *        Métodos responsáveis pelas requisições HTTP        *
    *                  e Métodos auxiliares                     *
    ************************************************************/

    public function recuperarSenha($data){

        $erros = [];
        $this -> email = $data['email'] ?? null;
        $erros = $this->validarRequisicao($erros);

        if(!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        if($this->usuarioEncontrado){

            $erros = $this->enviarEmail($erros);

            if(!empty($erros)){
                http_response_code(422);
                echo json_encode(["Erro" => $erros]);
                return;
            }

            http_response_code(200);
            echo json_encode([
                "sucesso" => true
            ]);
            
        }

    }

    // Essa função é responsavel por criar os tokens da requisição de mudança de senha 
    private function gerarTokens(){

        // Usaremos dois tokens ($selector e $token)
        // 1($selector): usado para encontrar o registro no banco
        // 2($token): usado para validar se o token é verdadeiro
        // Usamos dois tokens para evitar timing attacks
        // random_bytes() = gera numeros binarios aleatorios, bin2he() = converte esses numeros binarios para hexadecimal
        $this -> selector = bin2hex(random_bytes(8));

        // Queremos inserir $token no bd antes de converter para hexadecimal
        // Ent so iremos converter $token no link da $url
        $this -> token = random_bytes(32);

        // Data de expiração
        // date("U") contador de segundos, conta todos segundos desde 1970
        // Adicionamos 1800segs a essa função, logo o tempo de expiração será de 30 minutos contados a partir do momento da solicitação
        $this->dataExpiracao = date("Y-m-d H:i:s", date("U") + 1800);
    }
    
    /************************************************************
    *                        Validações                         *     
    *         Regras de validação dos dados do usuário          *
    ************************************************************/

    // Essa função é responsável por validar a requisição de mudança de senha e inserir esta requisição no bd 
    public function validarRequisicao($erros){

        // Verifica se esse email existe no bd
        // EmailChecado pode retornar false = erro de statement, obj vazio: n tem esse email no bd, obj n vazio: email valido pra prosseguir
        // Se tratassemos o obj vazio, por ex if (empty($emailChecado)), iriamos declarar um get dizendo usernotfound
        // Oq é mt perigosos para a segurança do site
        // Ent so tratamos o obj n vazio (!empty($emailChecado)
        // Se o obj estiver vazio nada acontece 
        $emailChecado = $this -> checarEmail($this -> email);

        if ($emailChecado === false){
            $erros["bd"] = "Erro interno ao recuperar senha do usuário. Tente novamente.";
            return;                 
        }

        if(empty($emailChecado)){
            $this->usuarioEncontrado = false;
            return $erros;
        }
        
        // Verifica se este usuario já tem algum token criado, se tiver, remove
        // PQ FAZER ISSO?
        // ex: se o usuario tentou redefinir a senha 20 min atras, porem n concluiu o processo, ainda vai haver um token, ent para 
        // evitar que 2 emails de confirmação sejam enviados, e 2 tokens criados
        // Vamos deletar quaisquer entradas de tokens presentes no banco de dados
        // Garantindo que não exista nenhum tokem deste usuario no banco de dado

        $this->usuarioEncontrado = true;

        $id = $emailChecado[0]->Usu_id;

        $resultado = $this -> checarTokensAntigos($id); 

        // Como usamos rowCount(), seguindo o encadeamento: delete()->where()->run()
        // run(), em caso de delete(), retorna a função rowCount() ou false (erro de statement)
        // run() vai fazer por ex: delete FROM pwdReset WHERE pwdResetEmail = x;
        // Se tiver alguem no bd com pwdResetEmail = x, ele retorna 1, se não retorna 0
        // Se retornar 0 ou 1 de qualquer jeito vamos ter q criar o token
        if ($resultado === false){

            $erros["bd"] = "Erro interno ao recuperar senha do usuário. Tente novamente.";
            return;

        }else{

            // Cria os tokens
            $this -> gerarTokens();
            // Insere o token no bd
            $inserirToken = $this -> setToken($id, $this -> selector, $this -> token, $this -> dataExpiracao);

            if($inserirToken === false){
                $erros["bd"] = "Erro interno ao recuperar senha do usuário. Tente novamente.";
                return; 
            }
          
        }
            
        return $erros;

    }

    // Essa função é responsável por enviar o email de mudança de senha
    public function enviarEmail($erros){

        // A partir do ? são tudo parâmetros $get
        // A url ficara assim, por ex: http://localhost/logintest/create-new-password.php?selector=abc123&token=4f8a9c
        $url = "http://localhost:5173/nova-senha?selector=" . $this->selector . "&token=" . bin2hex($this->token);
        
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

        // Evita erros com ascentos
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

        // AltBody é alternative body 
        // $mail->isHTML(true); Significa q o email é HTML
        // Mas nem todos clientes: aceitam HTML, permitem HTML, mostram HTML corretamente
        // Alguns clientes mostram apenas texto puro (AltBody)
        $mail->AltBody = 'Copy and paste this link into your browser: ' . $url;

        if(!$mail->send()){  
                              
            $erros["bd"] = "Erro interno ao recuperar senha do usuário. Tente novamente.";
            return; 

        }

        return $erros;

}
}


?>


