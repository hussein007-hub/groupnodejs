const pool = require("./db");
const session = require("express-session");
const express = require("express");
const cors = require("cors");
const path = require("path");
const route = require("./authentication");
const auth = require("./middleware");

const app = express();

// configure express session
app.use(session({
  secret: "mykey-123",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set true only in HTTPS
}));

// CORS config
app.use(cors({
  origin: "http://localhost:5500", // change to your frontend port
  credentials: true
}));

app.use(express.json()); // handle JSON
app.use(express.urlencoded({ extended: true })); // handle form data

// Serve static HTML files from /public folder
app.use(express.static(path.join(__dirname, "public")));

// Routes for loading HTML pages (frontend)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// dashboard route (protected)
app.get("/dashboard", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// LOGOUT ROUTE - destroy session and redirect to login
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    // Redirect client to login after session destroyed
    res.redirect("/login");
  });
});

// connect auth routes (POST /login, /register, etc.)
app.use(route);

// API Routes (Books CRUD)
app.post("/book", async (req, res) => {
  try {
    const { title, author, genre, price, instock } = req.body;
    const sql = "INSERT INTO books (title, author, genre, price, instock) VALUES(?,?,?,?,?)";
    await pool.query(sql, [title, author, genre, price, instock]);
    res.json({ success: true, message: "New book created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create book" });
  }
});

app.get("/book", auth, async (req, res) => {
  try {
    const [books] = await pool.query("SELECT * FROM books");
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch books" });
  }
});

app.get("/book/:idx", async (req, res) => {
  try {
    const { idx } = req.params;
    const [[book]] = await pool.query("SELECT * FROM books WHERE id= ?", [idx]);
    if (!book) return res.status(404).json({ success: false, message: "No book available with specified id" });
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch book" });
  }
});

app.patch("/book/:id", async (req, res) => {
  try {
    const { title, author, genre, price, instock } = req.body;
    const { id } = req.params;
    const sql = "UPDATE books SET title = ?, author = ?, genre = ?, price = ?, instock = ? WHERE id = ?";
    await pool.query(sql, [title, author, genre, price, instock, id]);
    res.json({ success: true, message: "Book modified successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to modify book" });
  }
});

app.delete("/book/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[book]] = await pool.query("SELECT * FROM books WHERE id= ?", [id]);
    if (!book) return res.status(404).json({ success: false, message: "No book available with specified id" });
    await pool.query("DELETE FROM books WHERE id = ?", [id]);
    res.json({ success: true, message: "Book deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete book" });
  }
});

// fallback 404
app.use((req, res) => {
  console.log("Unmatched route:", req.method, req.url);
  res.status(404).json({ success: false, message: "Route not found in this application" });
});

// run server
app.listen(5000, () => console.log("server running on port 5000"));
