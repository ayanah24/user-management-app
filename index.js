const { faker, da } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const  path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method")); //to use PUT and DELETE methods
app.use(express.urlencoded({extended:true})); //to parse the body of the request
app.set("view engine", "ejs");
app.set("views", path.join(__dirname , "/views"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "delta_app",
    password: "@24Ap2004",

});

let getRandomUser = () => {
    return [
         faker.string.uuid(),
         faker.internet.username(), // before version 9.1.0, use userName()
        faker.internet.email(),
     faker.internet.password(),
    ];
};
//inserting new data
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let data=[];
// for (let i = 0; i < 100; i++) {
//     data.push(getRandomUser()); //100 fake users
// }

//home page that let you know how many users are there
//Home Route
app.get("/",(req,res)=>{
   let q=`SELECT count(*) FROM user`;
   try {
    connection.query(q, (err, result) => {
        if (err) throw err;
        let count=result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
} catch (err) {
    console.log(err);
    res.send("Error occurred while fetching data");
}
});
//users route to access the users data
app.get("/users",(req,res)=>{
    let q=`SELECT * FROM user`;
   try {
    connection.query(q, (err, users) => {
        if (err) throw err;
        res.render("showusers.ejs",{users});
    });
} catch (err) {
    console.log(err);
    res.send("Error occurred while fetching data");
}
});
//it leads to the new edit page via the edit button and it will show email and when you enter password it will update the user
app.get("/user/:id/edit",(req,res)=>{
 let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
     try {
    connection.query(q, (err, result) => {
        if (err) throw err;
     let user= result[0];
        res.render("edit.ejs",{user})
    });
} catch (err) {
    console.log(err);
    res.send("Error occurred while fetching data");
}
});
//update route pass match kerke username update karega
app.patch("/user/:id",(req,res)=>{
let {id} = req.params;
let {password: formPass, username: newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
     try {
    connection.query(q, (err, result) => {
        if (err) throw err;
     let user= result[0];
     if(formPass != user.password){
        res.send("Password is incorrect");
     }else{
    let q2=`UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
connection.query(q2, (err, result) => {
        if (err) throw err;
        res.redirect("/users");
    });
     }
    });
} catch (err) {
    console.log(err);
    res.send("Error occurred while fetching data")
}
});
//this will render the new user page
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});
//with this post request it will insert the new user data into the database
app.post("/user", (req, res) => {
  const { username, email, password } = req.body;
  const id = faker.string.uuid();
  const q = "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";
  connection.query(q, [id, username, email, password], (err, result) => {
    if (err) throw err;
    res.redirect("/users");
  });
});

//this will acces to delete page when clicking the delete button
app.get("/user/:id/delete", (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM user WHERE id = ?";
  connection.query(q, [id], (err, result) => {
    if (err) throw err;
    const user = result[0];
    res.render("delete.ejs", { user });
  });
});

//this will delete the user from the database
app.delete("/user/:id", (req, res) => {
  const { id } = req.params;
  const { password: inputPass } = req.body;

  const q = "SELECT * FROM user WHERE id = ?";
  connection.query(q, [id], (err, result) => {
    if (err) throw err;

    const user = result[0];
    if (!user) return res.send("User not found");

    if (user.password !== inputPass) {
      return res.send("❌ Incorrect password. Deletion denied.");
    }

    const deleteQ = "DELETE FROM user WHERE id = ?";
    connection.query(deleteQ, [id], (err2) => {
      if (err2) throw err2;
      res.redirect("/users");
    });
  });
});


app.listen("8080",()=>{ console.log("Server is running on port 8080")});



