const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

db.serialize(() => {
  db.run(`
   CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    email TEXT,
    profile_picture TEXT,
    is_online INTEGER DEFAULT 0,
    last_active DATETIME
   )
  `);

  db.run(`
   CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    friend_id INTEGER
   )
 `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      user_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      user_id INTEGER,
      UNIQUE(post_id, user_id)
    )
  `);

  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});

app.get("/", (req, res) => {
  res.send("Server works!");
});

app.get("/users", (req, res) => {
  db.all("SELECT id, username, email FROM users", [], (err, rows) => {
    res.json(rows);
  });
});

app.post("/users", upload.single("profile_picture"), (req, res) => {
  const { username, password, email } = req.body;

  const profile_picture = req.file
    ? `http://localhost:3000/uploads/${req.file.filename}`
    : null;

  db.run(
    "INSERT INTO users (username, password, email, profile_picture) VALUES (?, ?, ?, ?)",
    [username, password, email, profile_picture],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ id: this.lastID, username });
    },
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT id, username, profile_picture FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!user) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      db.run(
        "UPDATE users SET is_online = 1, last_active = CURRENT_TIMESTAMP WHERE id = ?",
        [user.id],
      );
      res.json(user);
    },
  );
});

app.post("/posts", (req, res) => {
  const { user_id, content } = req.body;

  db.run(
    "INSERT INTO posts (user_id, content) VALUES (?, ?)",
    [user_id, content],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({
        id: this.lastID,
        user_id,
        content,
      });
    },
  );
});

app.get("/posts", (req, res) => {
  const userId = req.query.userId;
  const filterUserId = req.query.filterUserId;

  let query = `
    SELECT
      posts.id,
      posts.content,
      posts.created_at,
      users.username,
      COUNT(likes.id) as likes,

      EXISTS (
        SELECT 1 FROM likes l
        WHERE l.post_id = posts.id AND l.user_id = ?
      ) as likedByUser

    FROM posts
    JOIN users ON posts.user_id = users.id
    LEFT JOIN likes ON likes.post_id = posts.id
  `;

  const params = [userId];

  if (filterUserId) {
    query += " WHERE posts.user_id = ?";
    params.push(filterUserId);
  }

  query += `
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `;

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});

app.post("/comments", (req, res) => {
  const { post_id, user_id, content } = req.body;

  db.run(
    "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
    [post_id, user_id, content],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({
        id: this.lastID,
        post_id,
        user_id,
        content,
      });
    },
  );
});

app.get("/comments/:postId", (req, res) => {
  const postId = req.params.postId;

  db.all(
    `
    SELECT comments.id, comments.content, comments.created_at, users.username
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = ?
    ORDER BY comments.created_at
  `,
    [postId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json(rows);
    },
  );
});

app.post("/likes", (req, res) => {
  const { post_id, user_id } = req.body;

  db.get(
    "SELECT * FROM likes WHERE post_id = ? AND user_id = ?",
    [post_id, user_id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        db.run(
          "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
          [post_id, user_id],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({ liked: false });
          },
        );
      } else {
        db.run(
          "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
          [post_id, user_id],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({ liked: true });
          },
        );
      }
    },
  );
});

app.post("/friends", (req, res) => {
  const { user_id, friend_id } = req.body;

  db.run(
    "INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)",
    [user_id, friend_id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ success: true });
    },
  );
});

app.delete("/friends", (req, res) => {
  const { user_id, friend_id } = req.body;

  db.run(
    "DELETE FROM friends WHERE user_id = ? AND friend_id = ?",
    [user_id, friend_id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ success: true });
    },
  );
});

app.get("/friends/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    `
  SELECT 
    users.id, 
    users.username,
    CASE 
      WHEN users.last_active >= DATETIME('now', '-10 seconds') 
      THEN 1 
      ELSE 0 
    END as is_online
  FROM friends
  JOIN users ON users.id = friends.friend_id
  WHERE friends.user_id = ?
  `,
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json(rows);
    },
  );
});

app.post("/logout", (req, res) => {
  const { user_id } = req.body;

  db.run("UPDATE users SET is_online = 0 WHERE id = ?", [user_id]);

  res.json({ success: true });
});

app.post("/ping", (req, res) => {
  const { user_id } = req.body;

  db.run("UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?", [
    user_id,
  ]);

  res.json({ success: true });
});

app.put("/users/:id", upload.single("profile_picture"), (req, res) => {
  const userId = req.params.id;
  const { username, email, oldPassword, newPassword } = req.body;

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (!user) return res.status(404).json({ error: "User not found" });

    let finalPassword = user.password;

    if (oldPassword && newPassword) {
      if (user.password !== oldPassword) {
        return res.status(400).json({ error: "Wrong password" });
      }
      finalPassword = newPassword;
    }

    const profile_picture = req.file
      ? `http://localhost:3000/uploads/${req.file.filename}`
      : user.profile_picture;

    db.run(
      `UPDATE users 
       SET username = ?, email = ?, password = ?, profile_picture = ?
       WHERE id = ?`,
      [username, email, finalPassword, profile_picture, userId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          id: userId,
          username,
          profile_picture,
        });
      },
    );
  });
});
