<?php
$servername = "127.0.0.1:40391";
$username = "root";
$password = "11111111";
$dbname = "my_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$query = $_POST['query'];
$type = $_POST['type'];
$db = mysqli_select_db($conn, "my_db"); // Selecting Database

if (!mysqli_query($conn,$query))
  {
  echo("Error description: " . mysqli_error($con));
  }

switch ($type) {
    case "1":
        $result = mysqli_query($conn, $query); //Insert Query
        if (!$result){
          echo("Error description: " . mysqli_error($conn));
        } else {
            echo 0;
        }
        break;
    case "0":
        $result = $conn->query($query);
        $result = mysqli_query($conn, $query); //Insert Query
        if (!$result){
             echo("Error description: " . mysqli_error($conn));
        } else {
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                 echo 1; // found
            }
        } else {
             echo 0; // not found
        }
        }

        break;
    default:
        echo "Invalid access type\n";
}
$conn->close();
?>