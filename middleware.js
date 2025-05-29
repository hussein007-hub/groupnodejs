function auth(req, res, next) {
  const user = req.session.user;
  if (user) {
    next();
  } else {
    return res.status(401).send("Un authorised access to this route!");
  }
}

module.exports = auth;
