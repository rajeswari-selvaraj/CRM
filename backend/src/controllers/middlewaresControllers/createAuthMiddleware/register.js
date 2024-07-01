const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const mongoose = require('mongoose');
const shortid = require('shortid');

const checkAndCorrectURL = require('./checkAndCorrectURL');
const sendMail = require('./sendMail');

const { loadSettings } = require('@/middlewares/settings');
const { useAppSettings } = require('@/settings');

const authUser = require('./authUser');

const register = async (req, res, { userModel }) => {
  const UserPasswordModel = mongoose.model(userModel + 'Password');
  const UserModel = mongoose.model(userModel);
  const { email, password,name } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: true } }).required(),
    password: Joi.string().required(),
  });
 //email({ tlds: { allow: false } })

  const { error, value } = objectSchema.validate({ email, password });
if (error) {
  return res.status(409).json({
    success: false,
    result: null,
    error: error,
    message: 'Invalid/Missing credentials.',
    errorMessage: error.message,
  });
}

  const user = await UserModel.findOne({ email: email, removed: false });

  // console.log(user);
  if (user){
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Account with this email has been registered.',
    });
  }

    const salt = shortid.generate();
    const hashedPassword = bcrypt.hashSync(salt + password);
    const emailToken = shortid.generate();

    const userData = {
      email:email,
      name:name,
    };

    const resultuser = await new UserModel(userData).save();

    if (!resultuser) {
      return res.status(409).json({
        success: false,
        result: null,
        error: error,
        message: 'Invalid email.',
        errorMessage: error.message,
      });
    }

    const passwordData = {
      user:resultuser._id,
      password:hashedPassword,
      salt:salt,
      emailToken:emailToken,
      resetToken:emailToken
    };

    // console.log(passwordData);

    const resultuserpass = await new UserPasswordModel(passwordData).save();

    // console.log(resultuserpass);

    // await UserPasswordModel.findOneAndUpdate(
    //   { user: resultuser._id },
    //   { passwordData },
    //   {
    //     new: true,
    //   }
    // ).exec();

    // const resultPassword = new UserPasswordModel({ user: user._id, removed: false }).save();

    const settings = useAppSettings();
    const idurar_app_email = settings['idurar_app_email'];
    const idurar_base_url = settings['idurar_base_url'];

    // console.log(idurar_app_email);
    // console.log(idurar_base_url);

    const url = checkAndCorrectURL(idurar_base_url);   

    const link = url + '/verify/' + resultuser._id + '/' + emailToken;

    
    const subjectEmail = 'Verify your email';
    const Emailtype = 'emailVerfication';

    //  console.log(idurar_app_email);
    // console.log(link);

    await sendMail({
      email,
      name: resultuser.name,
      link,
      idurar_app_email,
      subjectEmail,
      Emailtype,
      emailToken: emailToken,
    });

    return res.status(200).json({
      success: true,
      resultuser,
      message:'your email account is not verified , check your email inbox to activate your account',
    });
};

module.exports = register;
