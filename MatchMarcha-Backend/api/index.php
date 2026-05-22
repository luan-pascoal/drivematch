<?php

session_start();

require_once __DIR__ . '/../config/init.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

date_default_timezone_set("America/Sao_Paulo");


$rota = new Rotas();

/************************************************************
*                    Rotas Públicas                         *     
************************************************************/

// Cadastro de Usuário
$rota->adicionar('POST','/usuarios','UsuarioController::cadastrar', 'nenhuma');
// Login de Usuário 
$rota->adicionar('POST','/login','LoginController::fazerLogin', 'nenhuma');
// Logout de Usuário
$rota->adicionar('DELETE', '/logout', 'LogoutController::fazerLogout', 'nenhuma');
// Identificação de Usuário
$rota->adicionar('GET','/eu','EuController::autorizacao', 'nenhuma');
// Exibir Dados de um Usuario Específico
$rota->adicionar('GET','/usuarios/{id}','UsuarioController::listarUnico','nenhuma');


/************************************************************
*                    Rotas Privadas                         *     
************************************************************/

// Atualiza Dados do Usuario Logado
$rota->adicionar('PUT','/usuarios','UsuarioController::editarUsuario','logado');
// Atualiza Foto do Usuario Logado
$rota->adicionar('POST','/usuarios/foto','UsuarioController::editarFoto','logado');
// Atualiza Senha do Usuario Logado
$rota->adicionar('PUT','/usuarios/senha','UsuarioController::editarSenha','logado');
// Remove a Conta do Usuario Logado
$rota->adicionar('DELETE','/usuarios','UsuarioController::removerConta','logado');

// pega a url
$url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// remove o prefixo do projeto, que não faz parte da rota
$base = "/MatchMarcha/MatchMarcha-Backend/api";
$url = str_replace($base, '', $url);

// caso alguém acesse /api/index.php/usuarios, limpa o index.php do meio
$url = str_replace('/index.php', '', $url);

// remove barra final: /usuarios/ vira /usuarios
$url = rtrim($url, '/');

// se sobrou vazio (acessou só /api/), define como "/"
// evita string vazia que quebraria o array_search das rotas
if ($url === '') {

    $url = '/';

}

$rota->ir($url);


// $rota->listarRotas();
?>