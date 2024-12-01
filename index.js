import express from "express";
import bodyparser from "body-parser";
import pg from "pg";

const app = express();
const port=3000;
const db = new pg.Client({
  user:"postgres",
  host: "localhost",
  database:"world",
  password: "root",
  port: 5432,
});
db.connect();
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("assets"));
app.set("view engine", "ejs");

let students =[];
app.get("/", (req, res) => {
  res.render("index", { students });
});

app.get("/student", (req, res) => {
  res.render("student");  
});
app.get("/faculty", (req, res) => {
  res.render("faculty");  
});
app.get("/contact", (req, res) => {
  res.render("contact");  
});

app.post("/get", async (req, res) =>{
  const username = req.body.rollno;
  const password = req.body.name;
  let student = null;
  let error = null;
  const result = await db.query(
      "SELECT * FROM students JOIN result ON students.roll_no = result.roll_no WHERE students.roll_no = $1 AND students.name = $2",
      [username, password]
  );

  if (result.rows.length > 0) {
      student = result.rows[0]; // Found the student
  } else {
      error = "No student found with the provided roll number.";
  }
  res.render("get", { student, error });
});

app.post("/add", async (req, res) =>{
    const username = req.body.id;
    const password = req.body.name;
    let error = null;
    let faculty=null;
    const result= await db.query("select * from faculty where id = $1 and name = $2" , [username, password]);
    if (result.rows.length > 0) {
      faculty = result.rows[0];
    }else{
      error="faculty not found";
    }
    res.render("add", {error, faculty});
});
app.post("/check" , async(req,res) =>{
  const username = req.body.rollno;
  const password = req.body.name;
  let student =null;
  let error= null;
  const result = await db.query("Select * from students where roll_no = $1 and name = $2" , [username, password]);
  if (result.rows.length>0){
    student=result.rows[0];
  }else{
    error="student not found";
  }
  res.render("marks" , {error , student});
});

app.post("/final" , async(req, res) =>{
  const roll = req.body.rollno;
  const name = req.body.name;
  const father = req.body.father;
  const phone = req.body.phone;
  const social = req.body.social;
  const comp = req.body.comp;
  const maths = req.body.maths;
  const english = req.body.english;
  const science = req.body.science;
try{
  const result= await db.query("select * from students where roll_no = $1 and name = $2" , [roll, name]);
  if (result.rows.length >0){
    
    await db.query("Insert into result (roll_no , social_science, computer_science, maths, english, science) values($1 ,$2 , $3, $4, $5, $6) ", [roll, social, comp, maths, english, science]);
    res.status(200).send("Student and marks added successfully.");
  }else{
  await db.query("Insert into students (roll_no, name, father_name, phone_no) values ($1 ,$2 , $3, $4)" , [roll, name, father, phone]);
  const done = await db.query("Insert into result (social_science, computer_science , maths, english, science, roll_no) values($1 ,$2 , $3, $4, $5 , $6) ", [social, comp, maths, english, science , roll]);
  res.status(200).send("Student and marks added successfully.");
  }}catch (err){
    res.status(500).send("Server error. Please try again.");
  }

});


app.listen(port , () =>{
    console.log(`Server running on http://localhost:${port}`);
});
