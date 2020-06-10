const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const Jwt = require("jsonwebtoken");
// const register=require('../models/')

const { validatationUser, validatationLogin } = require("../Routes/Validation");

  
router.get('/',async function(req,res,next){
  try{
      User.find((error,data)=>{
     if(error){
     return next(error)
     }else{
         res.json(data);
     }
  })
  }catch(e){
      res.send(400).json(err); 
  }
})

router.route('/register').post(async( req, res, next) => {
  const { error } = validatationUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // If Check user already  datebase
  const emailExits = await User.findOne({ email: req.body.email });
  if (emailExits) return res.status(400).send("Email Already Exits");

  const nameExits = await User.findOne({ name: req.body.name });
  if (nameExits) return res.status(400).send("UserName Already Exits");

  // Hash Password bcrypted password
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  User.create(user, (error, data) => {
try{
  
  if (error) {
    return next(error)
  } else {
    res.json({ message: "successfully Register", data });
      // const saveUser = await user.save();
      // res.json({ message: "successfully Register", saveUser });
  
      // res.send(400).json(err);
    
  }
}catch(e){
    res.send(400).json(err); 
}
  })
});



// login

router.post("/login", async function (req, res) {
  //  validation login fields
  const { error } = validatationLogin(req.body);
  if (error) return res.status(400).send({message:error.details[0].message});

  // checking for email exits
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send({message:"Email Not found"});

  // const username = await User.findOne(req.body.name ,user.name);
  // if (!username) return res.status(400).send({message:"user name already their"});

  // password is Correct
  const validPass = await bcryptjs.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send({message:"Invalid Password"});

  // create  and assgin a token
  try {
  const token = Jwt.sign({ _id: user._id }, process.env.TOKEN_SCERET, {expiresIn: 86400} /*24 hours*/   );
  res.header("auth-token", token).status(200).send({
    message:"Login success",
    _id: user._id,
    name: user.name,
    email: user.email,
    accessToken: token
  });
}catch(e){
    res.send(400).json(err); 
}
 
});



module.exports = router;
