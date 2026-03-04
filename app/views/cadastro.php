<?php

include __DIR__ . '/../../config/init.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $uid = $_POST['uid'];
    $pwd = $_POST['pwd'];
    $pwdRepeat = $_POST['pwdRepeat'];
    $email = $_POST['email'];

    $signup = new CadastroController($uid, $pwd, $pwdRepeat, $email);
    $signup->signupUser();
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>
    <link rel="stylesheet" href="/login_test/public/assets/css/pages/cadastro.css">
</head>
<body>
<header>
    <ul class="menu member">
        <li><a href="/login_test/app/views/index.php">HOME</a></li>
        <li><a href="/login_test/app/views/login.php">LOGIN</a></li>
    </ul>
</header>

<div class="auth-wrapper">
    <div class="index_singup">
        <h4>SIGN UP</h4>
        <p>Don't have an account yet? Sign up here!</p>
        <form action = "<?php htmlspecialchars($_SERVER["PHP_SELF"]) ?>" method="POST">
            <input type="text" name="uid" placeholder="Username">
            <input type="password" name="pwd" placeholder="Password">
            <input type="password" name="pwdRepeat" placeholder="Repeat Password">
            <input type="text" name="email" placeholder="Email">
            <br>
            <button type="submit" name="submit">SIGN UP</button>
        </form>
    </div>
</div>

</body>
</html>