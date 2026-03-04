<?php

class DataBase{

    protected static $con;
    protected static $instance;
    protected static $table;
    protected $querry;
    protected $querry_type;
    protected $values = array();
    protected $columns = "*";

    public static function table($table){

        self::$table = $table;

        if(!self::$instance){

            self::$instance = new self();
            
        }
        
        if(!self::$con){

            try{

                $string = "mysql:host=".db_host.";dbname=".db_name;
                self::$con = new PDO($string, db_user, db_password);

                }catch(PDOException $e){

                    print "Error!: " . $e -> getMessage() . "<br>";
                    die;

                }
        }

        return self::$instance;
        
    }

    
    protected function run($values = array()){

        $stm = self::$con -> prepare ($this -> querry);
        $check = $stm -> execute ($values);

        //erro no statement
        if (!$check){
            return false;
        }

        switch($this -> querry_type){

            case 'select':
                //se não ocorrer nenhum erro no statement,
                //retorna o array de objetos gerado por fetchAll()
                return $stm->fetchAll(PDO::FETCH_OBJ);
                break;
            case 'update':
                return $stm->rowCount();
            case 'insert':
                return true;
            case 'delete':
                return $stm->rowCount();
            default:
            break;
        }

        return false;

    }

    public function where($where, $values = array()){

        switch ($this -> querry_type){
            case 'select':
                $this -> querry .= "WHERE " . $where;
                return $this -> run($values);
                break;
            case 'update':
                $values = array_merge($this -> values, $values);
                $this -> querry .= " WHERE " . $where;
                return $this -> run($values);
                break;
            case 'delete':
                $this -> querry .= "WHERE " . $where;
                return $this -> run($values);
        }

    }

    public function insert(array $values){

        $this -> querry_type = "insert";

        $this -> querry = "insert INTO " . self::$table . " (";

        foreach ($values as $key => $value){

            $this -> querry .= $key . ",";

        }

        $this -> querry = rtrim($this -> querry, ",");

        $this -> querry .= ") VALUES (";

        foreach ($values as $key => $value){

            $this -> querry .= ":" . $key . ",";

        }
        
        $this -> querry = rtrim($this -> querry, ",");

        $this -> querry .= ")";

        $this -> values = $values;

        return $this -> run($values);


    }

    public function columns($columns){

        $this -> columns = $columns;

        return self::$instance;
        
    }

    public function select(){

        $this -> querry_type = "select";

        $this -> querry = "select " . $this -> columns . " FROM " . self::$table . " ";

        return self::$instance;

    }

    public function update(array $values){

        $this -> querry_type = "update";

        $this -> querry = "update " . self::$table . " SET ";

        $placeholders = "";

        foreach($values as $key => $value){

            $placeholders .= $key . "= :" . $key . ", ";

        }

        $placeholders = rtrim($placeholders, ", ");

        $this -> querry .= $placeholders;

        $this -> values = $values;

        return self::$instance;

    }

    public function delete(){

        $this -> querry_type = "delete";

        $this -> querry = "delete FROM " . self::$table . " ";

        return self::$instance;
    }

}

?>