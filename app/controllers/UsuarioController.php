<?php
    
class UsuarioController extends Usuario {

    protected $nome;
    protected $email;
    protected $senha;
    protected $confirmacaoSenha;
    protected $cpf;
    protected $genero;
    protected $foto;
    protected $termos;
    protected $status_online;
    protected $id;
    protected $senhaAtual;


    /************************************************************
    *                        MÉTODOS                            *     
    *        Métodos responsáveis pelas requisições HTTP        *
    ************************************************************/

    public function cadastrar($data){

        $erros = []; 

        $this->nome              = $data['nome'] ?? null;
        $this->email             = $data['email'] ?? null;
        $this->senha             = $data['senha'] ?? null;
        $this->confirmacaoSenha  = $data['confirmacaoSenha'] ?? null;
        $this->cpf               = $data['cpf'] ?? null;
        $this->genero            = $data['genero'] ?? null;
        $this->foto              = $data['foto'] ?? null;
        $this->termos            = $data['termosUso'] ?? null;
        $this->status_online     = "online";

        $erros = $this->validarNome($erros);
        $erros = $this->validarEmail($erros);
        $erros = $this->validarSenha($erros);
        $erros = $this->validarConfirmacaoSenha($erros);
        $erros = $this->validarCpf($erros);
        $erros = $this->validarGenero($erros);
        $erros = $this->validarFotoCadastro($erros);
        $erros = $this->validarTermos($erros);

        // Se tiver erro antes, já retorna
        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        // Só salva foto depois de validar tudo
        $this->foto = $this->salvarFoto($erros);

        // Se tiver erro ao salvar foto
        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        // Inserção no banco
        $resultado = $this->inserirUsuario(
            $this->nome,
            $this->email,
            $this->senha,
            $this->cpf,
            $this->genero,
            $this->foto,
            $this->status_online
        );

        if ($resultado === false) {
            $erros["bd"] = "Erro interno ao cadastrar o usuário. Tente novamente.";
        }

        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        // Cria sessão do usuário
        $session = new Session();
        $session->regenerate();
        $session->set('USER', [
            'id' => $resultado, 
            'nome' => $this->nome, 
            'email' => $this->email, 
            'tipo' => "usuario",
            'LOGGED_IN' => 1
        ]);


        // Msg de sucesso
        http_response_code(200);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Usuário cadastrado com sucesso"
        ]);

        return;
    }


    public function listarUnico($id){

        $erros = [];

        $this->id = $id;

        $resultado = $this->listarUsuario($this->id);

        if ($resultado === false || empty($resultado)){
            $erros['bd'] = "Erro interno ao exibir dados do usuário. Tente novamente.";
        }

        if (!empty($erros)){

            http_response_code(422);

            echo json_encode([
                "Erro" => $erros
            ]);

            return;
        }

        $dados = $resultado[0];

        http_response_code(200);

        echo json_encode([
            
            "usuario" => [
                "id" => $dados->Usu_id ?? null,
                "nome" => $dados->Usu_nome ?? null,
                "email" => $dados->Usu_email ?? null,
                "cpf" => $dados->Usu_cpf ?? null,
                "genero" => $dados->Usu_genero ?? null,
                "foto" => $dados->Usu_foto ?? null
            ]
        ]);

        return;
    }

    public function editarUsuario($data){

        $erros = [];

        $this->id = $_SESSION['USER']['id'];

        $this->nome = $data["nome"] ?? null;
        $this->email = $data["email"] ?? null;
        $this->genero = $data["genero"] ?? null;

        $erros = $this->validarNome($erros);
        $erros = $this->validarEmailUpdate($erros);
        $erros = $this->validarGenero($erros);

        if (!empty($erros)) {

            http_response_code(422);

            echo json_encode([
                "Erro" => $erros
            ]);

            return;

        }

        $resultado = $this->atualizarUsuario(
            $this->id,
            $this->nome,
            $this->email,
            $this->genero
        );

        if ($resultado === false) {

            http_response_code(422);

            echo json_encode([
                "Erro" => [
                    "bd" => "Erro ao atualizar usuário."
                ]
            ]);

            return;

        }

        $_SESSION['USER']['nome'] = $this->nome;
        $_SESSION['USER']['email'] = $this->email;
        
        // Envia sucesso
        http_response_code(200);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Perfil atualizado com sucesso!"
        ]);

        return;

    }

    public function editarFoto($data){

        $erros = [];

        $this->id = $_SESSION['USER']['id'];

        $this->foto = $data['foto'] ?? null;

        if (!empty($this->foto) && isset($this->foto['tmp_name']) && $this->foto['tmp_name'] !== '') {
            $erros = $this->validarFotoUpdate($erros);
        }

        if (!empty($this->foto) && isset($this->foto['tmp_name']) && $this->foto['tmp_name'] !== '') {

            // Salvamos
            $this->foto = $this->salvarFoto($erros);

            // Se ocorreu algum erro ao salvar a foto
            if (!empty($erros)) {

                http_response_code(422);

                echo json_encode([
                    "Erro" => $erros
                ]);

                return;

            }

        } else {

            // Nenhuma foto foi enviada
            // Mantemos a atual
            $usuario = $this->listarUsuario($this->id);
            $this->foto = $usuario[0]->Usu_foto ?? null;

        }

        $resultado = $this->atualizarFoto(
            $this->id,
            $this->foto
        );

        if ($resultado === false) {

            http_response_code(422);

            echo json_encode([
                "Erro" => [
                    "bd" => "Erro ao atualizar usuário."
                ]
            ]);

            return;

        }

        // Envia sucesso
        http_response_code(200);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Foto atualizada com sucesso!",
            "foto" => $this->foto
        ]);

        return;

    }

    public function editarSenha($data){

        // Usaremos $this->senha para validar a nova senha digitada pelo usuario
        // Usaremos $this->confirmacaoSenha para validar a confirmacao da nova senha digitada pelo usuario

        $erros = [];

        $this->id = $_SESSION['USER']['id'];

        $this->senhaAtual = $data["senhaAtual"] ?? null;
        $this->senha = $data["novaSenha"] ?? null;
        $this->confirmacaoSenha = $data["confirmacaoSenha"] ?? null;

        $erros = $this->validarSenha($erros);
        $erros = $this->validarConfirmacaoSenha($erros);

        if (!empty($erros)) {

            http_response_code(422);

            echo json_encode([
                "Erro" => $erros
            ]);

            return;

        }

        $erros = $this->validarSenhaUpdate($erros);

        if (!empty($erros)) {

            http_response_code(422);

            echo json_encode([
                "Erro" => $erros
            ]);

            return;

        }

        $resultado = $this->atualizarSenha(
            $this->id,
            $this->senha
        );

        if ($resultado === false) {

            http_response_code(422);

            echo json_encode([
                "Erro" => [
                    "bd" => "Erro ao atualizar usuário."
                ]
            ]);
            
            return;

        }

        http_response_code(200);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Senha atualizada com sucesso!"
        ]);

        return;

    }

    public function removerConta(){

        $erros = [];

        $this->id = $_SESSION['USER']['id'];

        $resultado = $this->removerUsuario(
            $this->id
        );

        
        if ($resultado === false) {

            http_response_code(422);

            echo json_encode([
                "Erro" => [
                    "bd" => "Erro ao remover usuário."
                ]
            ]);
            
            return;

        }
        
        $session = new Session();
        $session->destroy();
        
        http_response_code(200);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Conta removida com sucesso!"
        ]);

        return;


    }

    /************************************************************
    *                        Validações                         *     
    *         Regras de validação dos dados do usuário          *
    ************************************************************/


    public function validarNome($erros){

        if (empty($this->nome)){
            $erros["nome"] = "Nome precisa ser preenchido";
            return $erros;
        }

        if (!preg_match("/^[A-Za-zÀ-ÿ\s]+$/", $this->nome)){
            $erros["nome"] = "Nome deve conter apenas letras";
            return $erros;
        }

        // Array de particulas, devem estar em letra minuscula
        $particulas = ['de', 'da', 'do', 'dos', 'das'];

        // Vamos converter o nome todo para CASE_TITLE, isso é: primeira letra de cada palavra maiúscula
        // Problema: se o nome tiver uma particula, essa particula vai ficar com a primeira letra maiuscula
        $nome = mb_convert_case($this->nome, MB_CASE_TITLE, "UTF-8");

        // Vamos separar as palavras do nome em um array $palavras
        $palavras = explode(" ", $nome);

        // Vamos percorrer o array das palavras do nome
        foreach($palavras as $i => $palavra){

            // A cada passada do foreach convertemos a palavra pra letra minuscula e comparamos com o array de particulas
            // Se tiver uma correspondência, essa palavra é uma partícula
            if (in_array(mb_convert_case($palavra, MB_CASE_LOWER, "UTF-8"), $particulas)){

                // Ent convertemos essa palavra pra letra minuscula
                $palavras[$i] = mb_convert_case($palavra, MB_CASE_LOWER, "UTF-8");

            }
        }

        // Por fim juntamos as palavras presentes no array $palavras na variável $nome, entre as palavras colocamos um espaço em branco
        $this->nome = implode(' ', $palavras);

        return $erros;
    }


    public function validarEmail($erros){

        if (empty($this->email)){
            $erros["email"] = "Email precisa ser preenchido";
            return $erros;
        }

        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)){
            $erros["email"] = "Email inválido";
            return $erros;
        }

        $resultado = $this->checarEmail($this->email);

        if ($resultado === false){
            $erros["email"] = "Erro interno ao verificar o e-mail. Tente novamente.";
            return $erros;
        }

        if (!empty($resultado)){
            $erros["email"] = "Email já cadastrado";
            return $erros;
        }

        return $erros;

    }

    public function validarEmailUpdate($erros){

        if (empty($this->email)){
            $erros["email"] = "Email precisa ser preenchido";
            return $erros;
        }

        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)){
            $erros["email"] = "Email inválido";
            return $erros;
        }

        $resultado = $this->checarEmail($this->email);

        if ($resultado === false){
            $erros["email"] = "Erro interno ao verificar o e-mail. Tente novamente.";
            return $erros;
        }

        // Se existir esse email no banco, só é erro se NÃI for o do próprio usuário
        if (!empty($resultado)) {

            // Pega o id do usuario q possui esse email
            $idUsuario = $resultado[0]->Usu_id ?? null;

            // Se o id que veio do bd, for diferente do id de quem esta fazendo as alterações
            if ($idUsuario != $this->id) {
                $erros["email"] = "Email já cadastrado";
                return $erros;
            }
        }

        return $erros;
    }


    public function validarSenha($erros){

        if (empty($this->senha)){
            $erros["senha"] = "Senha precisa ser preenchida";
            return $erros;
        }

        if (strlen($this->senha) < 8){
            $erros["senha"] = "Senha precisa ter no minimo 8 caracteres";
            return $erros;
        }

        if(!preg_match("/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/", $this->senha)){
            $erros["senha"] = "A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial";
            return $erros;
        }

        return $erros;

    }


    public function validarConfirmacaoSenha($erros){

        if (empty($this->confirmacaoSenha)){
            $erros["confirmacaoSenha"] = "O campo confimacao de senha precisa ser preenchida";
            return $erros;
        }

        if (strlen($this->confirmacaoSenha) < 8){
            $erros["confirmacaoSenha"] = "O campo confimacao de senha precisa ter no minimo 8 caracteres";
            return $erros;
        }

        if(!preg_match("/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/",$this->confirmacaoSenha)){
            $erros["confirmacaoSenha"] = "A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial";
            return $erros;
        }

        if($this->senha !== $this->confirmacaoSenha){
            $erros["confirmacaoSenha"] = "As senhas não combinam";
            return $erros;
        }

        return $erros;

    }

    public function validarSenhaUpdate($erros){

        if(empty($this->senhaAtual)){
            $erros["senhaAtual"] = "O campo senha atual precisa ser preenchida";
            return $erros;
        }

        $usuario = $this->listarUsuario($this->id);

        if ($usuario === false || empty($usuario)){
            $erros['bd'] = "Erro interno ao redefinir senha do usuário. Tente novamente.";
            return $erros;
        }

        $senhaBd = $usuario[0]->Usu_senha;

        if ((!password_verify($this->senhaAtual, $senhaBd))){
            $erros['senhaAtual'] = "Senha atual incorreta.";
            return $erros;
        }

        if(password_verify($this->senha, $senhaBd)){
            $erros['senhaAtual'] = "A nova senha não pode ser igual à senha atual";
            return $erros;
        }

        return $erros;
    }


    public function validarCpf($erros){

        if(empty($this->cpf)){
            $erros["cpf"] = "O CPF precisa ser preenchido";
            return $erros;
        }

        $cpf = preg_replace('/\D/', '', $this->cpf);

        if (strlen($cpf) !== 11){
            $erros["cpf"] = "CPF inválido";
            return $erros;
        }

        // Verifica se o cpf digitado foi: 11111111111, 22222222222, etc
        // (\d) : pega um número (0–9) e guarda em um grupo
        // \1 => significa: "repete exatamente o que foi capturado no grupo 1"
        // {10} => 10x seguidas
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            $erros["cpf"] = "CPF inválido";
            return $erros;
        }

        $cpfValidacao = substr($cpf,0,9);

        // cpfValidacao começa com 9 digitos, e apos rodar a função calcularDigitoVerificador, cpfValidacao vai ficar com 10 digitos
        $cpfValidacao .= self::calcularDigitoVerificador($cpfValidacao);

        // Aqui cpfValidacao ja esta com 10 digitos, vai rodar a função calcularDigitoVerificador novamente (vai achar o utlimo digito), 
        // cpfValidacao termina com 11 digitos
        $cpfValidacao .= self::calcularDigitoVerificador($cpfValidacao);

        if ($cpfValidacao !== $cpf){
            $erros["cpf"] = " CPF inválido";
            return $erros;
        }

        $this->cpf = $cpf;

        $resultado = $this->checarCpf($this->cpf);

        if ($resultado === false){
            $erros["cpf"] = "Erro interno ao verificar o CPF. Tente novamente.";
            return $erros;
        }

        if (!empty($resultado)){
            $erros["cpf"] = "CPF já cadastrado";
            return $erros;
        }

        return $erros;

    }

    public static function calcularDigitoVerificador($cpf){

    // ex: cpf: 123456789
    // 1x10 2x9 3x8 4x7 5x6 6x5 7x4 8x3 9x2
    // temos que somar os resultados dessas contas
    // dividir essa soma por 11, e pegar o resto
    // se esse resto for 0 ou 1, retornar 0
    // se o resto for outro, retornar 11 - resto

        $tamanho = strlen($cpf);
        $multiplicador = $tamanho + 1;
        $soma = 0;

        for($i = 0; $i < $tamanho; $i++){
            $soma += $cpf[$i] * $multiplicador;
            $multiplicador--;
        }

        $resto = $soma % 11;

        return $resto > 1 ? 11 - $resto : 0;
    
    }


    public function validarGenero($erros){

        if(empty($this->genero)){
            $erros["genero"] = "O gênero precisa ser preenchido";
            return $erros;
        }

        if($this->genero !== "Masculino" && $this->genero !== "Feminino"){
            $erros["genero"] = "Genêro inválido";
            return $erros;
        }

        return $erros;

    }


    public function validarFotoCadastro($erros){

        $tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];

        if(!isset($this->foto['tmp_name']) || empty($this->foto['tmp_name'])){
            $erros["foto"] = "O campo foto precisa ser preenchido";
            return $erros;
        }

        if(!in_array($this->foto["type"], $tiposPermitidos)){
            $erros["foto"] = "Tipo de arquivo não permitido";
            return $erros;
        }

        if($this->foto["size"] > 2 * 1024 *1024){
            $erros["foto"] = "Arquivo muito grande (máx 2 MB)";
            return $erros;
        }

        return $erros;

    }

    public function validarFotoUpdate($erros){

        // Se não veio arquivo, não valida nada, pois pode vir ou n vir arquivo no editar perfil
        if (!isset($this->foto['tmp_name']) || empty($this->foto['tmp_name'])) {
            return $erros;
        }

        $tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];

        if (!in_array($this->foto["type"], $tiposPermitidos)) {
            $erros["foto"] = "Tipo de arquivo não permitido";
            return $erros;
        }

        if ($this->foto["size"] > 2 * 1024 * 1024) {
            $erros["foto"] = "Arquivo muito grande (máx 2 MB)";
            return $erros;
        }

        return $erros;
    }


    public function salvarFoto($erros){

        $nomeArquivo = uniqid() . '_' . basename($this->foto["name"]);

        $caminho = __DIR__ . '/../../uploads/' . $nomeArquivo;

        if (!move_uploaded_file($this->foto['tmp_name'], $caminho)){
            $erros["foto"] = "Erro ao salvar a foto";
            return null;
        }

        return $nomeArquivo;
    }


    public function validarTermos($erros){

        if ($this->termos !== "1" && $this->termos !== "on" && $this->termos !== true) {
            $erros["termosUso"] = "Você deve aceitar os termos";
            return $erros;
        }

        return $erros;

    }

}

