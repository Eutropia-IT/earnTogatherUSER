personalEmail = require('../utils/personalEmail');
const userModel = require('../modal/userModal');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


// A) Root
exports.home = (req, res) => {
    res.render('index', {
        title: 'Home',

        homePageSuccMess: req.flash('homePageSuccMess'),
        homePageErrMess: req.flash('homePageErrMess')
    });
};

// B) login page [POST]
exports.loginPostController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email.trim() || !password.trim()) {
            req.flash('homePageErrMess', 'Please fill up all filds!');
            return res.redirect('/');
        }
        let data = [
            { email: email.trim() }
        ];
        userModel.findUser('*', data, async (error, result) => {
            if (error) {
                req.flash('homePageErrMess', error.toString());
                return res.redirect('/');
            } else if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
                req.flash('homePageErrMess', 'Email or Password is Incorrect!');
                return res.redirect('/');
            } else {
                req.session.isLoggedIn = true;
                req.session.result = result;
                res.redirect("/profile");
            }

        });

    } catch (error) {
        req.flash('homePageErrMess', error.toString());
        return res.redirect('/');
    }

};

// C) logout page [GET]
exports.logoutGetController = (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/');
        }
    });
};

// D.0) signup page controller [GET]
exports.signupGetController = (req, res) => {
    res.render('signup', {
        title: 'SignUp',

        signUpPageErrMess: req.flash('signUpPageErrMess')
    });
};
// D.2.M1 valediation data middleware
exports.chackUserInputs = (req, res, next) => {
    const {
        referralID,
        firstName,
        lasttName,
        email,
        contNumber,
        password,
        confirmPassword,
        sq1,
        sq2
    } = req.body;

    if (referralID.trim(),          // optional
        !firstName.trim(),           // require
        lasttName.trim(),           // optional
        !email.trim().toLowerCase(), // require & uniqe
        !contNumber.trim(),          // require
        !password.trim(),            // require
        !confirmPassword.trim(),     // both W'll be same
        !sq1.trim(),                 // require
        !sq2.trim()
    ) {
        req.flash('signUpPageErrMess', 'Pleade provide require all infromation!');
        return res.redirect('/signup');
    } else if (password.trim() !== confirmPassword.trim()) {
        req.flash('signUpPageErrMess', 'Password do not match!');
        return res.redirect('/signup');
    }
    next();
};
// D.2.M2) signup middleware
exports.chackReferallId = (req, res, next) => {
    const { referralID } = req.body;
    if (referralID.trim()) {
        let refIdData = [{ user_id: referralID.trim() }]
        userModel.findUser('*', refIdData, (error, result) => {
            if (error) {
                req.flash('signUpPageErrMess', error.toString());
                return res.redirect('/signup');
            }

            if (result.length === 0) {
                req.flash('signUpPageErrMess', `This  "${referralID}" referral id not found`);
                return res.redirect('/signup');
            }
            if (result[0].account_status === 'pending') {
                req.flash('signUpPageErrMess', `This  "${referralID}" referral id person is not an Active member!`);
                return res.redirect('/signup');
            }
            next();
        });
    } else {
        next();
    }
};
// D.2.M3) varify email middelware
exports.varifySignupEmail = (req, res, next) => {
    const { email } = req.body;
    userModel.varifyEmail(email.trim(), (error, result) => {
        if (error) {
            req.flash('signUpPageErrMess', error.toString());
            return res.redirect('/signup');
        }
        if (result.length > 0) {
            req.flash('signUpPageErrMess', 'Already used this email!')
            return res.redirect('/signup');
        }
        next();
    });
    
};
// D.3) signup page [POST]
exports.signupPostController = async (req, res) => {
    const {
        referralID,
        firstName,
        lasttName,
        email,
        contNumber,
        password,
        sq1,
        sq2
    } = req.body;

    let hashedPasswword = await bcrypt.hash(password.trim(), 8);
    let data = [{
        ref_id: referralID.trim(),
        firstName: firstName.trim(),
        lastName: lasttName.trim(),
        email: email.trim().toLowerCase(),
        phone: contNumber.trim(),
        password: hashedPasswword,
        SQ1: sq1.trim(),
        SQ2: sq2.trim(),
        account_status: 'pending'
    }];
    userModel.insertUserData(data, (error, result) => {
        if (error) {
            req.flash('signUpPageErrMess', error.toString());
            return res.redirect('/signup');
        } else {
            req.flash('homePageSuccMess', 'Congratulation! You have successfully created an account. Please login with your Email address.');
            return res.redirect('/');
        }
    });
};

// E.0)forgot password [GET]
exports.forgotPasswordGetController = (req, res) => {
    res.render('forgotPassword', {
        title: 'Forgot Password',

        forgotPassSuccMess: req.flash('forgotPassSuccMess'),
        forgotPassErrMess: req.flash('forgotPassErrMess')
    });
};
// E.2)forgot password [POST]
exports.forgotPasswordPostController = (req, res) => {
    userModel.findUserByEmail(req.body.email, (error, result) => {
        if (error) {
            req.flash('errorPageMess', error.toString());
            return res.redirect('/fof');
        }
        else if (result.length === 0) {
            req.flash('errorPageMess', `Email doesn't exists`);
            return res.redirect('/fof');
        }
        else {
            const resetTokenStr = crypto.randomBytes(32).toString('hex');
            passResetToken = crypto.createHash('sha256').update(resetTokenStr).digest('hex');
            data = [{
                user_id: result[0].user_id,
                reset_token: passResetToken
            }];

            userModel.forgotPassword(data, async (error, result) => {
                if (error) {
                    req.flash('errorPageMess', error.toString());
                    return res.redirect('/fof');
                } else {
                    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetTokenStr}`;
                    const message = `Forgot your password? Please click this url ${resetURL} to reset your password.`;
                    try {
                        await personalEmail({
                            email: req.body.email,
                            subject: 'Your password reset token (valid for 10 minutes.)',
                            message

                        });
                        req.flash('forgotPassSuccMess', `A password recovery mail sends your email address. Please check out your email!`)
                        return res.redirect('/forgotPassword');
                    } catch (error) {
                        req.flash('forgotPassErrMess', 'There was error sending the email.Try again later!');
                        return res.redirect('/forgotPassword');

                    }
                }
            });
        }

    });

};

// F.0) reset password [GET]
exports.resetPasswordGetController = (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    userModel.findUserIdByResetTOKN(hashedToken, (error, result) => {
        if (error) {
            req.flash('errorPageMess', error.toString());
            return res.redirect('/fof');
        }
        else if (result.length === 0) {
            req.flash('errorPageMess', `Token is invalied or expired!`)
            return res.redirect('/fof');
        } else {
            res.render('resetPassword', {
                title: 'Reset Password',
                postURL: req.protocol + "://" + req.headers.host + req.originalUrl,

                resetPassErrMess: req.flash('resetPassErrMess')
            });
        }
    });
};
// F.1) reset password [POST]
exports.resetPasswordPostController = (req, res) => {
    const { password, cPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    userModel.findUserIdByResetTOKN(hashedToken, async (error, result) => {
        if (error) {
            req.flash('errorPageMess', error.toString());
            return res.redirect('/fof');
        }
        if (!password || !cPassword) {
            req.flash('errorPageMess', `Please fillup all filds!`)
            return res.redirect('/fof');
        }
        if (password !== cPassword) {
            req.flash('resetPassErrMess', `Passward didn't match!`)
            return res.redirect(req.originalUrl);
        }
        else if (result.length === 0) {
            req.flash('errorPageMess', `Token is invalied or expired!`)
            return res.redirect('/fof');
        } else {
            //console.log(result[0].user_id);
            let hashedPasswword = await bcrypt.hash(password.trim(), 8);
            data = [
                { password: hashedPasswword }, { user_id: result[0].user_id }
            ];
            userModel.updateProfileInfo(data, (error, result) => {
                if (error) {
                    req.flash('errorPageMess', error);
                    return res.redirect('/fof');
                } else {
                    //req.flash('profileSueccFlash', 'Password Changed Sucessfully!');
                    return res.redirect('/');
                }
            });

        }
    });
};

//G
exports.packageGetController = (req, res) => {
    res.render('package', {
        title: 'Package Pricing',
        disPackg: 'd-block',
        disNewIDAply: 'd-none'
    });
};


/// Utilies
exports.publicPageAuth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/profile');
    }
    next();
};

// 404 controller
exports.fof = (req, res) => {
    res.render('404', {
        title: 'Error',
        errorPageMess: req.flash('errorPageMess')
    });
};

