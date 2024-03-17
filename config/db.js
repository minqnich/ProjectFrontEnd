const mysql = require("mysql2");

const config = {
  host: "localhost",
  user: "root", 
  password: "", 
  database: "project_frontend"
};

const connection = mysql.createConnection(config);
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = connection