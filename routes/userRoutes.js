const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailValidator = require("email-validator");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const upload = multer({
  dest: __dirname + "/public",
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const baseUrl = require("../constants/baseUrl");
let fs = require("fs");

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
  if(!user) return res.json({ status: 400, message: "Geçersiz Token" });
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
    console.log(decodedToken);
    const updatedUser = await User.findOneAndUpdate(
      { _id: decodedToken.user._id },
      {
        firstName: body.firstName ? body.firstName : "",
        middleName: body.middleName ? body.middleName : "",
        lastName: body.lastName ? body.lastName : "",
      },
      { new: true }
    );
    if (!updatedUser)
      return res.json({
        status: 500,
        message: "Bilgileri güncellerken hata oluştu",
      });
    res.json({ status: 200, message: "Güncelleme başarılı", updatedUser });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, error });
  }
});

/* 
  get profile. requires token in headers
*/

router.get("/get-profile", async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers.token);
    if (!decodedToken)
      return res.json({ status: 400, message: "Yetkisiz işlem" });
    const user = await User.findOne({ email: decodedToken.user.email });
    return res.json({ status: 200, user });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, error });
  }
});

// get cvs
router.get("/get-cvs", async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers.token);
    if (!decodedToken)
      return res.json({ status: 400, message: "Yetkisiz işlem" });
    const user = await User.findOne({ email: decodedToken.user.email });
    res.json({ status: 200, cvs: user.cvs });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, error });
  }
});

//add cv
router.post("/add-cv", async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers.token);
    if (!decodedToken)
      return res.json({ status: 400, message: "Yetkisiz işlem" });
    const cv = req.body;
    const user = await User.findOne({ email: decodedToken.user.email });
    const newCv = {
      id: String(new Date().getTime()),
      name: cv.name ? cv.name : "Untitled",
      jobTitle: cv.jobTitle ? cv.jobTitle : "",
      personalDescription: cv.personalDescription ? cv.personalDescription : "",
      email: cv.email ? cv.email : "",
      phone: cv.phone ? cv.phone : "",
      address: cv.address ? cv.address : "",
      educations: cv.educations ? cv.educations : [],
      experiences: cv.experiences ? cv.experiences : [],
      projects: cv.projects ? cv.projects : [],
      skills: cv.skills ? cv.skills : [],
      languages: cv.languages ? cv.languages : [],
      socialPlatforms: cv.socialPlatforms ? cv.socialPlatforms : [],
    };
    console.log("user", user);
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { cvs: [...user.cvs, newCv] },
      { new: true }
    );
    if (!updatedUser)
      return res.json({ status: 500, message: "CV eklerken hata oluştu" });
    console.log("updated", updatedUser);
    res.json({
      status: 200,
      message: "CV Ekleme Başarılı.",
      cvs: updatedUser.cvs,
    });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, error });
  }
});

//edit cv
router.post("/edit-cv/:id", async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers.token);
    if (!decodedToken)
      return res.json({ status: 400, message: "Yetkisiz işlem" });
    const cv = req.body;
    const { id } = req.params;
    const user = await User.findOne({ _id: decodedToken.user._id });
    let willEditCv = user.cvs.find((item) => item.id === id);
    console.log("willEditCv", willEditCv);
    willEditCv = {
      ...willEditCv,
      name: cv.name ? cv.name : "Untitled",
      jobTitle: cv.jobTitle ? cv.jobTitle : "",
      personalDescription: cv.personalDescription ? cv.personalDescription : "",
      email: cv.email ? cv.email : "",
      phone: cv.phone ? cv.phone : "",
      address: cv.address ? cv.address : "",
      educations: cv.educations ? cv.educations : [],
      experiences: cv.experiences ? cv.experiences : [],
      projects: cv.projects ? cv.projects : [],
      skills: cv.skills ? cv.skills : [],
      languages: cv.languages ? cv.languages : [],
      socialPlatforms: cv.socialPlatforms ? cv.socialPlatforms : [],
    };
    const editedCvs = user.cvs.filter((item) => item.id !== id);
    editedCvs.push(willEditCv);
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { cvs: editedCvs },
      { new: true }
    );
    if (!updatedUser)
      return res.json({ status: 500, message: "CV güncellerken hata oluştu" });
    console.log("updated", updatedUser);
    res.json({
      status: 200,
      message: "CV Güncelleme Başarılı.",
      cvs: updatedUser.cvs,
    });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, error });
  }
});

// delete cv
router.post("/delete-cv/:id", async (req,res)=>{
  try {
    const decodedToken = jwt.decode(req.headers.token);
    if (!decodedToken)
      return res.json({ status: 400, message: "Yetkisiz işlem" });
    const { id } = req.params;
    const user = await User.findOne({ _id: decodedToken.user._id });
    const filteredCvs=user.cvs.filter(item=>item.id !== id)
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { cvs: filteredCvs },
      { new: true }
    );
    if (!updatedUser)
      return res.json({ status: 500, message: "CV silerken hata oluştu" });
    console.log("updated", updatedUser);
    res.json({
      status: 200,
      message: "CV Silme Başarılı.",
      cvs: updatedUser.cvs,
    });

  } catch (error) {
    console.log(error);
    res.json({ status: 500, error });
  }
})

//upload profile photo
router.post(
  "/upload-profile-photo",
  upload.single("file"),
  async (req, res) => {
    try {
      const decodedToken = jwt.decode(req.headers.token);
      if (!decodedToken)
        return res.json({ status: 400, message: "Yetkisiz işlem" });
      const tempPath = req.file.path;
      const targetPath = path.join(
        __dirname,
        `../public/${decodedToken.user._id}.png`
      );

      fs.rename(tempPath, targetPath, async (err) => {
        if (err) {
          console.log(err);
          res.json({ status: 500, error });
        }
        console.log(baseUrl);
        const updatedUser = await User.findOneAndUpdate(
          { _id: decodedToken.user._id },
          { profileImage: `${baseUrl}/${decodedToken.user._id}.png` },
          { new: true }
        );
        res.json({
          status: 200,
          profileImage: `${baseUrl}/${decodedToken.user._id}.png`,
          updatedUser
        });
      });
    } catch (error) {
      console.log(error);
      res.json({ status: 500, error });
    }
  }
);

module.exports = router;
