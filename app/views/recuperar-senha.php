<?php

include __DIR__ . '/../../config/init.php';

if($_SERVER["REQUEST_METHOD"] == "POST"){

    //grabbing data
    $userEmail = $_POST["email"];

    //intantiating class RecuperarSenhaController
    $resetRequest = new RecuperarSenhaController($userEmail);

    //error handlers and validateRequest
    $resetRequest -> validateRequest();

    //sendEmail
    $resetRequest -> sendEmail();

}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
    <link rel="stylesheet" href="/login_test2/public/assets/css/pages/recuperar-senha.css">
</head>
<body>
<div class="container">
    <div class="card">
        <h1>Reset Your Password</h1>
        <p>An e-mail will be sent to you with instructions on how to reset your password.</p>
        <form action = "<?php htmlspecialchars($_SERVER["PHP_SELF"]) ?>" method="POST">
            <input type="text" name="email" placeholder="Enter your e-mail address..." required>
            <button type="submit" name="reset-request-submit">
                Receive new password by e-mail
            </button>
        </form>
        <?php
        if (isset($_GET["reset"]) && $_GET["reset"] == "success") {
            echo "<br>";
            echo '<p class="signupsuccess">Check your e-mail!</p>';
        }
        ?>
    </div>
</div>
</body>
</html>