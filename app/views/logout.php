<?php

include __DIR__ . '/../../config/init.php';

$session = new Session();
//remove sessão USER
$session -> remove('USER');
//fecha a sessão
$session -> flush();
//redireciona para index.php
header("location:/login_test/app/views/index.php?error=none");
die;

?>