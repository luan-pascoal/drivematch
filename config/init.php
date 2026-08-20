<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

define ("db_host", "localhost");
define ("db_user", "root");
define ("db_password", "");
define ("db_name", "login_test");
define ("FIPE_TOKEN", "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3YWI2NTY3Ni0yYmRmLTQ4ZmItYTE5ZS0zMWVhZjI4MTA4NWQiLCJlbWFpbCI6Indvbmd0b21hczU2NEBnbWFpbC5jb20iLCJpYXQiOjE3ODA1MzkzMDN9.dhaoo-35BjhHh5pLdn1VvcTtLl-35mIqHUQctiwoJTg");

/* 

__DIR__ é o diretório atual do arquivo init.php (login_test2/config)
../app/core/ 
.. sobe uma pasta, logo: sai de config 
/app/core/ : entra em app/core
resultado final: login_test2/app/core/

e assim por diante, formando:
login_test2/app/controllers/
login_test2/app/model/

*/

spl_autoload_register(function ($classname) {

    $paths = [
        __DIR__ . '/../app/core/',
        __DIR__ . '/../app/controllers/',
        __DIR__ . '/../app/models/',
    ];

    //percorre todos os paths
    //ent ex: class UserController.php
    //vai tentar: 
    //app/core/UserController.php, n vai achar, n retorna nd
    //app/controllers/UserController.php, vai achar, e vai fazer include app/controllers/UserController.php;

    foreach ($paths as $path) {
        $file = $path . $classname . '.php';

        if (file_exists($file)) {
            include $file;
            return;
        }
    }

});

//$session = new Session();
//$session -> checkRememberMe();

?>