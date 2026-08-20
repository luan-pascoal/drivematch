<?php

use Pusher\Pusher;

class PusherService{

    // Cria uma propriedade $instancia
    // ?Pusher = Signifca que $instancia ou é um objeto Pusher, ou é null
    // Começa como null
    private static ?Pusher $instancia = null;

    // Cria uma função getInstance(), a qual retorna um objeto Pusher
    // : Pusher => Tipo de retorno
    public static function getInstance(): Pusher{

        if(self::$instancia === null){
            self::$instancia = new Pusher(

                //$_ENV['NOME_DA_CHAVE'] => Pega os valores de uma determinada chave presente no arquivo .env
                $_ENV['PUSHER_KEY'],
                $_ENV['PUSHER_SECRET'],
                $_ENV['PUSHER_APP_ID'],
                [
                    'cluster' => $_ENV['PUSHER_CLUSTER'],
                    'useTLS' => true
                ]

            );

        }

        return self::$instancia;

    }

}

?>