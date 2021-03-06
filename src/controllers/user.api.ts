import * as async from "async";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import * as passport from "passport";
import * as _ from "lodash";
import { default as User, UserModel, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { LocalStrategyInfo } from "passport-local";
import { WriteError } from "mongodb";
const request = require("express-validator");

/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password cannot be blank").notEmpty();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    const newObj = _.map(errors, "msg");
    return res.status(500).send({
      message: newObj
    });
  }

  passport.authenticate("local", (err: Error, user: UserModel, info: LocalStrategyInfo) => {
    if (err) {
      return res.status(500).send({
        message: err
      });
    }
    if (!user) {
      return res.status(500).send({
        message: info.message
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).send({
          message: info.message
        });
      }
      return res.send(user);
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
  req.logout();
  return res.send({
    message: "Success"
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
export let postSignup = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    const newObj = _.map(errors, "msg");
    return res.status(500).send({
      message: newObj
    });
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    profile: {
      name: req.body.name
    }
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      return res.status(500).send({
        message: "Account with that email address already exists."
      });
    }
    user.save((err) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).send({
            message: err
          });
        }
        return res.send({ message: "Success" });
      });
    });
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export let postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.user.id, (err, user: UserModel) => {
    if (err) {
      return res.status(500).send({
        message: err
      });
    }

    delete req.body.password;
    console.log("profile", req.body.profile);
    user = _.extend(user, req.body);

    user.save((err: WriteError) => {
      if (err) {
        if (err.code === 11000) {
          return res.status(500).send({
            message: "The email address you have entered is already associated with an account."
          });
        }

        return res.status(500).send({
          message: err
        });
      }
      return res.send({ message: "Profile information has been updated."});
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
export let postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    const newObj = _.map(errors, "msg");
    return res.status(500).send({
      message: newObj
    });
  }

  User.findById(req.user.id, (err, user: UserModel) => {
    if (err) {
      return res.status(500).send({
        message: err
      });
    }
    user.password = req.body.password;
    user.save((err: WriteError) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
       }
      return res.send({
        message: "Password has been changed."
      });
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
export let postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) {
      return res.status(500).send({
        message: err
      });
    }
    return res.send({
      message: "Your account has been deleted."
    });
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export let getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user: any) => {
    if (err) {
      return res.status(500).send({
        message: err
      });
    }
    user[provider] = undefined;
    user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
    user.save((err: WriteError) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
      }
      return res.send({
        message: `${provider} account has been unlinked.`
      });
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export let getReset = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.status(500).send({
      message: "Not Authenticated"
    });
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where("passwordResetExpires").gt(Date.now())
    .exec((err, user) => {
      if (err) {
        return res.status(500).send({
          message: err
        });
       }
      if (!user) {
        return res.status(500).send({
          message: "Password reset token is invalid or has expired."
        });
      }
      return res.send({
        message: "Password Reset"
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export let postReset = (req: Request, res: Response, next: NextFunction) => {
  req.assert("password", "Password must be at least 4 characters long.").len({ min: 4 });
  req.assert("confirm", "Passwords must match.").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    const newObj = _.map(errors, "msg");
    return res.status(500).send({
      message: newObj
    });
  }

  async.waterfall([
    function resetPassword(done: Function) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where("passwordResetExpires").gt(Date.now())
        .exec((err, user: any) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash("errors", { msg: "Password reset token is invalid or has expired." });
            return res.redirect("back");
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err: WriteError) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function sendResetPasswordEmail(user: UserModel, done: Function) {
      const transporter = nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: "express-ts@starter.com",
        subject: "Your password has been changed",
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash("success", { msg: "Success! Your password has been changed." });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect("/");
  });
};

// Get users
export let list = (req: Request, res: Response) => {
  User.find((err, data: UserModel[]) => {
    if (err) {
      return res.status(500).send({
        message: `Error getting users.`
      });
    }
    return res.send(data);
  });
};

export let show = (req: Request, res: Response) => {
  const id = req.params.id;
  User.findOne({ _id: id })
  // .populate("company")
  .exec((err, data: UserModel) => {
    if (err) {
      return res.status(500).send({
        message: `Error getting user.`
      });
    }
    if (!data) {
      return res.status(404).send({
        message: `No such user.`
      });
    }
    return res.send(data);
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export let postForgot = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Please enter a valid email address.").isEmail();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/forgot");
  }

  async.waterfall([
    function createRandomToken(done: Function) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    function setRandomToken(token: AuthToken, done: Function) {
      User.findOne({ email: req.body.email }, (err, user: any) => {
        if (err) { return done(err); }
        if (!user) {
          req.flash("errors", { msg: "Account with that email address does not exist." });
          return res.redirect("/forgot");
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err: WriteError) => {
          done(err, token, user);
        });
      });
    },
    function sendForgotPasswordEmail(token: AuthToken, user: UserModel, done: Function) {
      const transporter = nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: "hackathon@starter.com",
        subject: "Reset your password on Hackathon Starter",
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect("/forgot");
  });

};

export let getUsers = (req: Request, res: Response) => {
  const id = req.params.id;
  User.find({ "profile.company": id}, (err, data: UserModel[]) => {
    if (err) {
      return res.status(500).send({
        message: `Error getting users.`
      });
    }
    return res.send(data);
  });
};

export let remove = (req: Request, res: Response) => {
  const id = req.params.id;
  User.findByIdAndRemove(id, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: `Error getting user.`
      });
    }
    return res.send(data);
  });
};
