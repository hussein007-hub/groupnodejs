const route = require("express").Router();
const pool = require("./db");
const auth = require("./middleware");
const bcrypt = require("bcrypt");

// user registration
route.post("/register", async (req, res) => {
  const { username, password, fullnames } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (username, password, fullnames) VALUES (?,?,?)",
    [username, hashedPassword, fullnames]
  );
  res.send("User created");
});

// user login
route.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const [[result]] = await pool.query(
    "SELECT * FROM users WHERE username = ? ",
    [username]
  );

  if (!result) {
    return res.status(400).json({ message: "Incorrect username" });
  }

  const isPasswordMatch = await bcrypt.compare(password, result.password);

  if (isPasswordMatch) {
    req.session.user = result; // store user in session

    return res.json({
      message: "Logged in successfully",
      redirect: "/dashboard"
    });
  } else {
    return res.status(400).json({ message: "Incorrect password" });
  }
});

// user logout
route.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logout Successfully");
});

// get logged in user
route.get("/user", auth, (req, res) => {
  res.send(req.session.user);
});

module.exports = route;
