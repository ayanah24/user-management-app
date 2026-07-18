// test-security.js
function getUser(req, res) {
  const query = "SELECT * FROM users WHERE id = " + req.params.id;
  db.query(query);
}
