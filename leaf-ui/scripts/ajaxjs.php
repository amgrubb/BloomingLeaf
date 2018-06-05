<?php
$servername = "127.0.0.1:40391";
$username = "root";
$password = "11111111";
$dbname = "my_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$query = $_POST['insert_query'];
$type = $_POST['type'];
$query2  = $_POST['read_query']; // use only with type 0
$db = mysqli_select_db($conn, "my_db"); // Selecting Database

//if (!mysqli_query($conn,$query))
  //{
    //echo("Error description: " . mysqli_error($con));
  //}

switch ($type) {
    case "1":
        $result = $conn->query($query); //Insert Query
        if (!$result){
          echo("Error description: " . mysqli_error($conn));
        } else {
            echo 0;
        }
        break;
    case "0": // reading from the database before executing insert
        $result_1 = $conn->query($query2);
        echo "query2:\n";
        echo $query2;
        echo "query:\n";
        echo $query;

        if (!$result_1){
             echo("Error description: " . mysqli_error($conn));
        } else {
            if ($result_1->num_rows > 0){
                // do nothing
                echo "do nothing";
                //$ts_row = $result_1->fetch_assoc();
                //echo "(" . $ts_row['action'] . "%". $ts_row['timestamp'].")";
            } else{
                $result = mysqli_query($conn, $query);
                if (!$result){
                     echo("Error description: " . mysqli_error($conn));
                } else {
                     echo "inserted";
                }
            }


        }

        break;
    default:
        echo "Invalid access type\n";
}
$conn->close();
?>