<?php

include __DIR__ . '/../../config/init.php';

if($_SERVER["REQUEST_METHOD"] == "POST"){

    //grabbing data
    $selector = $_POST["selector"];
    $validator = $_POST["validator"];
    $password = $_POST["pwd"];
    $passwordRepeat = $_POST["pwdRepeat"];

    //intantiating class ResetPasswordNovaSenhaControllerController
    $resetPassword = new NovaSenhaController($selector, $validator, $password, $passwordRepeat);

    $resetPassword -> novaSenha();

}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Password</title>
    <link rel="stylesheet" href="/login_test2/public/assets/css/pages/nova-senha.css">
</head>
<body>

<div class="container">
    <div class="card">
        <h1>Create New Password</h1>
        <?php
        $selector = $_GET["selector"] ?? '';
        $validator = $_GET["validator"] ?? '';
        if (empty($selector) || empty($validator)) {
            echo '<p class="errormsg">We could not validate your request.</p>';
        } else {
            if (ctype_xdigit($selector) && ctype_xdigit($validator)) {
        ?>
                <form action = "<?php htmlspecialchars($_SERVER["PHP_SELF"]) ?>" method="POST">
                    <input type="hidden" name="selector" value="<?php echo ($selector); ?>">
                    <input type="hidden" name="validator" value="<?php echo ($validator); ?>">
                    <input type="password" name="pwd" placeholder="Enter a new password..." required>
                    <input type="password" name="pwdRepeat" placeholder="Repeat new password..." required>
                    <button type="submit" name="reset-password-submit">Reset Password</button>
                </form>
        <?php
            } else {
                echo '<p class="errormsg">Invalid reset link.</p>';
            }
        }
        ?>
    </div>
</div>

</body>
</html>