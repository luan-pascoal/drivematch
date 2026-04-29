<?php

include __DIR__ . '/../../config/init.php';

//grabbing data
if($_SERVER["REQUEST_METHOD"] == "POST"){

    $username = $_POST['username'];
    $pwd = $_POST['pwd'];
    
    //se o post da checkbox remember  estiver vazio, logo $remember receberá null
    $remember = $_POST['remember'] ?? null;

    //intantiating class LoginController
    $login = new LoginController($username, $pwd, $remember);

    //error handlers and signup user
    $login -> loginUsuario();

}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="/login_test2/public/assets/css/pages/login.css">
</head>
<body>

<header>
    <ul class="menu member">
        <li><a href="/login_test2/app/views/index.php">HOME</a></li>
        <li><a href="/login_test2/app/views/cadastro.php">CADASTRAR </a></li>
    </ul>
</header>

<div class="auth-wrapper">
    <div class="index_login">
        <h4>LOGIN</h4>
        <br>
        <form action = "<?php htmlspecialchars($_SERVER["PHP_SELF"]) ?>" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <br>
            <input type="password" name="pwd" placeholder="Password" required>
            <br>
            <input type="checkbox" name="remember"> Remember me 
            <br>
            <a href="/login_test2/app/views/recuperar-senha.php">Esqueceu sua senha?</a> 
            <br> 
            <button type="submit" name="submit">LOGIN</button>
        </form>
        <br>
        <?php
        if(isset($_GET["newpwd"])){
            echo '<p class="newpwdsuccess">Your password has been reset!</p>';
        }
        ?>
    </div>
</div>

</body>
</html>