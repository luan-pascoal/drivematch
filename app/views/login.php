<?php

include __DIR__ . '/../../config/init.php';

//grabbing data
if($_SERVER["REQUEST_METHOD"] == "POST"){

    $uid = $_POST['uid'];
    $pwd = $_POST['pwd'];

    //intantiating class LoginController
    $login = new LoginController($uid, $pwd);

    //error handlers and signup user
    $login -> loginUser();

}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="/login_test/public/assets/css/pages/login.css">
</head>
<body>

<header>
    <ul class="menu member">
        <li><a href="/login_test/app/views/index.php">HOME</a></li>
        <li><a href="/login_test/app/views/cadastro.php">CADASTRAR </a></li>
    </ul>
</header>

<div class="auth-wrapper">
    <div class="index_login">
        <h4>LOGIN</h4>
        <br>
        <form action = "<?php htmlspecialchars($_SERVER["PHP_SELF"]) ?>" method="POST">
            <input type="text" name="uid" placeholder="Username">
            <input type="password" name="pwd" placeholder="Password">
            <br>
            <button type="submit" name="submit">LOGIN</button>
        </form>
        <br>
        <?php
        if(isset($_GET["newpwd"])){
            echo '<p class="newpwdsuccess">Your password has been reset!</p>';
        }
        ?>
        <a href="/login_test/app/views/recuperar-senha.php">Esqueceu sua senha?</a>
    </div>
</div>

</body>
</html>