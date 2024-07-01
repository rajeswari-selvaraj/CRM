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

const eVerify = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');
  const User = mongoose.model(userModel);
  const userId = req.params.id;
  const eToken = req.params.eToken;

  const databasePassword = await UserPassword.findOne({ user: userId, removed: false });
  const user = await User.findOne({ _id: userId, removed: false }).exec();

  const isMatch = eToken === databasePassword.resetToken;

  if (!isMatch || databasePassword.resetToken === undefined || databasePassword.resetToken === null)
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid reset token',
    });

  // validate
  const objectSchema = Joi.object({
    userId: Joi.string().required(),
    eToken: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ userId, eToken });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid reset token object',
      errorMessage: error.message,
    });
  }

  await User.findOneAndUpdate(
    { _id: userId },
    {
      enabled: true,
    }
  ).exec();

  const token = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  await UserPassword.findOneAndUpdate(
    { user: userId },
    {
      $push: { loggedSessions: token },
      emailVerified: true,
    }
  ).exec();

  if (
    eToken === databasePassword.resetToken &&
    databasePassword.resetToken !== undefined &&
    databasePassword.resetToken !== null
  ) {
    return res
      .status(200)
      .cookie('token', token, {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Lax',
        httpOnly: true,
        secure: false,
        domain: req.hostname,
        path: '/',
        Partitioned: true,
      })
      .json({
        success: true,
        result: {
          _id: user._id,
          name: user.name,
          surname: user.surname,
          role: user.role,
          email: user.email,
          photo: user.photo,
        },
        message: 'Successfully verified your email-Id',
      });
  } else {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid reset token object',
      errorMessage: error.message,
    });
  }
};

module.exports = eVerify;


