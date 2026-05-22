<?php

include __DIR__ . '/../../config/init.php';



?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Test</title>
    <link rel="stylesheet" href="/login_test2/public/assets/css/pages/index.css">
</head>
<body>
    <header>
        <ul class="menu member">
            <?php
            if ($session->is_logged_in()){
            ?>
                <li>
                    
                        <?php 
                        $data = $session->get('USER'); 
                        echo $data['username'];
                        ?>
                    
                </li>
                <li>
                    <a href="/login_test2/app/views/logout.php" class="header-login-a">
                        SAIR
                    </a>
                </li>
            <?php
            } else {
            ?>   
                <li><a href="/login_test2/app/views/cadastro.php">CADASTRAR</a></li>
                <li><a href="/login_test2/app/views/login.php" class="header-login-a">ENTRAR</a></li>
            <?php
            }
            ?>
        </ul> 
    </header>

    <div class="auth-wrapper">
        <h2>Welcome</h2>
    </div>
</body>
</html>