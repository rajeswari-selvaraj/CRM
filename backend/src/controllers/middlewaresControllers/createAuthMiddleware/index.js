const isValidAuthToken = require('./isValidAuthToken');
const register = require('./register');
const login = require('./login');
const logout = require('./logout');
const forgetPassword = require('./forgetPassword');
const resetPassword = require('./resetPassword');
const eVerify = require('./eVerify');

const createAuthMiddleware = (userModel) => {
  let authMethods = {};

  authMethods.isValidAuthToken = (req, res, next) =>
    isValidAuthToken(req, res, next, {
      userModel,
    });

  authMethods.register = (req, res) =>
    register(req, res, {
      userModel,
  });

  authMethods.eVerify = (req, res) =>
    eVerify(req, res, {
        userModel,
  });

  authMethods.login = (req, res) =>
    login(req, res, {
      userModel,
    });

  authMethods.forgetPassword = (req, res) =>
    forgetPassword(req, res, {
      userModel,
    });

  authMethods.resetPassword = (req, res) =>
    resetPassword(req, res, {
      userModel,
    });

  authMethods.logout = (req, res) =>
    logout(req, res, {
      userModel,
    });
  return authMethods;
};

module.exports = createAuthMiddleware;
