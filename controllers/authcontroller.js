const User = require("../models/user");
let bcrypt = require("bcryptjs");
const config = require("../config/key");
let jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    const user = new User({
      prenom: req.body.prenom,
      nom: req.body.nom,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    try {
      await user.save();
      res.send({ message: "User was registered successfully!" });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erreur lors de la création de compte");
    }
};

exports.signin = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }
    const token = jwt.sign({ id: user.id,email:user.email },
      config.secret,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      });
    res.status(200).send({
      id: user._id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      accessToken: token,
    });
  };

  exports.signout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 }); // Deletes the cookie containing the token
    res.send({ message: 'Logged out successfully!' });
  }
  