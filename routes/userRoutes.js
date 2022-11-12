const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailValidator = require("email-validator");
const User = require("../models/User");

//register
router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { body } = req;
    //validation
    //todo: add other required fields
    if (!body.email || !body.password) {
      return res.json({
        status: 400,
        message: "Lütfen zorunlu alanları doldurun",
      });
    }
    if (body.password.length < 6) {
      return res.json({
        status: 400,
        message: "Şifre en az 6 haneli olmalıdır",
      });
    }
    if (!emailValidator.validate(body.email)) {
      return res.json({
        message: "Geçerli bir email formatı girin. Ör: abc@abc.com",
        status: 400,
      });
    }
    //checking if user exist
    const userExist = await User.findOne({ email: body.email });
    if (userExist) {
      return res.json({
        message: "Email adresi ile kayıtlı bir kullanıcı mevcut.",
        status: 400,
      });
    }
    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //saving user
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    return res.json({
      status: 200,
      message: "Kayıt işlemi başarılı",
      savedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, error });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const { body } = req;
    //validation
    if (!body.email || !body.password) {
      return res.json({
        status: 400,
        message: "Email ve Şifre alanları boş bırakılamaz",
      });
    }
    if (body.password.length < 6)
      return res.json({
        status: 400,
        message: "Şifre 6 karakterden kısa olamaz",
      });
    if (!emailValidator.validate(body.email))
      return res.json({
        status: 400,
        message: "Geçerli bir email formatı girin",
      });
    //check user exist
    const hasUser = await User.findOne({ email: body.email });
    if (!hasUser)
      return res.json({ status: 400, message: "Email ya da Şifre hatalı" });
    if (!hasUser.isActive)
      return res.json({
        status: 400,
        message:
          "Hesabınız pasif konumdadır. mernmania@gmail.com adresinden yardım alabilirsiniz.",
      });
    //check password
    const isPassword = await bcrypt.compare(body.password, hasUser.password);
    if (!isPassword)
      return res.json({ status: 400, message: "Email ya da Şifre hatalı" });
    //login success, sign jwt
    const token = jwt.sign(
      {
        user: {
          _id: hasUser._id,
          email: hasUser.email,
          firstName: hasUser.firstName,
          middleName: hasUser.middleName,
          lastName: hasUser.lastName,
        },
      },
      process.env.JWT_SECRET
    );
    return res.json({
      status: 200,
      message: "Giriş işlemi başarılı",
      userId: hasUser._id,
      token,
      firstName: hasUser.firstName,
      middleName: hasUser.middleName,
      lastName: hasUser.lastName,
      email: hasUser.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, error });
  }
});

//check token
router.get("/verify-token/:token", async (req, res) => {
  console.log(req.params);
  const { token } = req.params;
  if (!token) return res.json({ status: 400, message: "Token yok" });
  const decodedToken = jwt.decode(token);
  console.log(decodedToken);
  if (!decodedToken)
    return res.json({ status: 400, message: "Geçersiz Token" });
  const user = await User.findOne({ email: decodedToken.user.email });
  return res.json({
    status: 200,
    message: "Token geçerli, login başarılı",
    userId: user._id,
    token,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
  });
});

//update user infos (without img)
router.post("/update-profile", async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers.token);
    if (!decodedToken)
      return res.json({ status: 400, message: "Yetkisiz işlem" });
    const { body } = req;
    console.log(decodedToken)
    const updatedUser = await User.findOneAndUpdate({_id:decodedToken.user._id}, {
      firstName: body.firstName ? body.firstName : "",
      middleName: body.middleName ? body.middleName : "",
      lastName: body.lastName ? body.lastName : ""
    },
    {new: true});
    if(!updatedUser) return res.json({status: 500, message: "Bilgileri güncellerken hata oluştu"})
    res.json({status:200,message: "Güncelleme başarılı", updatedUser})
  } catch (error) {
    console.log(error);
    res.json({ status: 500, error });
  }
});

/* 
  get profile. requires token in headers
*/

router.get("/get-profile",async (req,res)=>{
  try {
    const decodedToken = jwt.decode(req.headers.token);
    if (!decodedToken)
      return res.json({ status: 400, message: "Yetkisiz işlem" });
    const user=await User.findOne({email: decodedToken.user.email})
    return res.json({status:200,user})
  } catch (error) {
    console.log(error);
    res.json({ status: 500, error });
  }
})

module.exports = router;
