/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

'use strict';

const jwt = require('jsonwebtoken');
/**
 * Verify token and return userId from token if token correct
 * @param token
 * @return {Promise}
 */
const jwtVerify = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, sails.config.jwtSecret, (error, user) => {
      if (error) reject(error);
      else resolve(user._id);
    });
  });
};

module.exports.http = {
  middleware: {
    logger: require('morgan')('dev'),
    expressValidator: require('express-validator')(),

    order: [
      'logger',
      'bodyParser',
      'expressValidator',
      'handleBodyParserError',
      'methodOverride',
      'decodedToken',
      'decodedAdminToken',
      'router',
      'favicon',
      '404',
      '500'
    ],

    decodedToken: async (req, res, next) => {
      try {
        const token = req.headers['x-access-token'];
        if (!token) return next();

        const userId = await jwtVerify(token);
        req.user = await User.findById(userId);
        next();
      } catch (error) {
        // Error when decode token, and req.user will be null
        //  -> requireLogin police with return 401
        sails.log.error('Error when decoded token');
        sails.log.error(error);
        next();
      }
    },

    decodedAdminToken: async (req, res, next) => {
      try {
        const adminToken = req.headers['admin-token'];
        if (!adminToken) return next();

        let adminId = await jwtVerify(adminToken);
        req.admin = await Admin.findById(adminId);
        next();
      } catch (error) {
        sails.log.error('Error when decoded token');
        sails.log.error(error);
        next();
      }
    }
  }
};
