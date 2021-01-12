const userModel = require('../modal/userModal');
const bcrypt = require('bcryptjs');

const GA_MAX_EARN_LIMT = 900;
const GB_MAX_EARN_LIMT = 1500;
const GC_MAX_EARN_LIMT = 3000;
const GD_MAX_EARN_LIMT = 15000;

function maxEarnLimite(group_type) {
    if (group_type === 'A') return GA_MAX_EARN_LIMT;
    else if (group_type === 'B') return GB_MAX_EARN_LIMT;
    else if (group_type === 'C') return GC_MAX_EARN_LIMT;
    else if (group_type === 'D') return GD_MAX_EARN_LIMT;

}

exports.findUserMiddleware = (req, res, next) => {
    const getProfileID = req.session.result[0].user_id * 1;
    userModel.findUserByID(getProfileID, (error, result) => {
        if (error) return error;
        if (result.length === 0) {
            req.session.destroy(error => {
                if (error) {
                    console.log(error);
                } else {
                    return res.redirect('/404');
                }
            });
        }
        else next();
    });
};
exports.accRenewMiddleware = (req, res, next) => {
    user_id = req.session.result[0].user_id * 1;
    userModel.findUserByID(user_id, (error, result) => {
        if (error) return error;
        userModel.totalIncomeFromActivPkg(user_id, result[0].activation_date, (error, incResult) => {
            if (error) return error;
            else {
                if (incResult[0].total_inc >= maxEarnLimite(result[0].group_type)) {
                    data = [
                        { account_status: 'renew needed'},
                        { user_id: user_id }
                    ];
                    userModel.updateProfileInfo(data, (error, result) => {
                        if (error) {
                            req.flash('reNewAccMess', error.toString());
                            return next();
                        } else {
                            req.flash('reNewAccMess', incResult[0].total_inc);
                            return next();
                        }
                    });
                }else next();

            }
        });
    });
};
// 1.0 user profile [GET]
exports.profileGetController = (req, res) => {
    const getProfileID = req.session.result[0].user_id * 1;

    userModel.findUserByID(getProfileID, (error, result) => {
        if (error) return error;

        return res.render('profile', {
            title: 'Profle',
            user_id: result[0].user_id,
            firstName: result[0].firstName,
            lastName: result[0].lastName,
            email: result[0].email,
            phone: result[0].phone,
            group_type: result[0].group_type,
            account_status: result[0].account_status,
            activationDate: result[0].activation_date,
            packageUsed: result[0].package_used * 1,
            xyz: result[0].password,
            

            successfullMess: req.flash('profileSueccFlash'),
            unSuccessfullMess: req.flash('profileErrorFlash'),
            reNewAccMess: req.flash('reNewAccMess')[0]


        });

    });

};
// 1.1 user profile [POST]
exports.updateProfilePostController = (req, res) => {
    const { user_id, fName, lName, email, phoneNumber, xyz,
        currentPass, newPass, confPass } = req.body;

    //name update
    if (fName) {
        data = [
            { firstName: fName.trim(), lastName: lName.trim() },
            { user_id: user_id }
        ];
        userModel.updateProfileInfo(data, (error, result) => {
            if (error) {
                req.flash('profileErrorFlash', error.toString());
                res.redirect('/profile');
            } else {
                req.flash('profileSueccFlash', 'Name Changed  Sucessfully!');
                res.redirect('/profile');
            }
        });
    }
    // email update
    else if (email) {
        data = [
            { email: email.trim() }, { user_id: user_id }
        ];
        userModel.varifyEmail(email.trim(), (error, result) => {
            if (error) {
                req.flash('profileErrorFlash', error.toString());
                res.redirect('/profile');
            } else if (result.length > 0) {
                req.flash('profileErrorFlash', 'Already used this email!');
                res.redirect('/profile');
            } else {
                userModel.updateProfileInfo(data, (error, result) => {
                    if (error) {
                        req.flash('profileErrorFlash', error.toString());
                        res.redirect('/profile');
                    } else {
                        req.flash('profileSueccFlash', 'Email Changed  Sucessfully!');
                        res.redirect('/profile');
                    }
                });
            }
        });
    }
    // phone update
    else if (phoneNumber) {
        data = [
            { phone: phoneNumber.trim() }, { user_id: user_id }
        ];
        userModel.updateProfileInfo(data, (error, result) => {
            if (error) {
                req.flash('profileErrorFlash', error.toString());
                res.redirect('/profile');
            } else {
                req.flash('profileSueccFlash', 'Phone Number Changed Sucessfully!');
                res.redirect('/profile');
            }
        });
    }
    // reset password
    else if (currentPass) {
        if (newPass !== confPass) {
            req.flash('profileErrorFlash', `Password didn't match`);
            res.redirect('/profile');
        } else {
            bcrypt.compare(currentPass, xyz, async (e, r) => {
                if (e) {
                    req.flash('profileErrorFlash', e.message);
                    res.redirect('/profile');
                }

                if (r === true) {
                    let hashedPasswword = await bcrypt.hash(newPass.trim(), 8);
                    data = [
                        { password: hashedPasswword }, { user_id: user_id }
                    ];
                    userModel.updateProfileInfo(data, (error, result) => {
                        if (error) {
                            req.flash('profileErrorFlash', error.toString());
                            res.redirect('/profile');
                        } else {
                            req.flash('profileSueccFlash', 'Password Changed Sucessfully!');
                            res.redirect('/profile');
                        }
                    });
                } else {
                    req.flash('profileErrorFlash', 'Current password not match');
                    res.redirect('/profile');
                }
            });
        }
    }
    else {
        req.flash('profileErrorFlash', 'Invalied Input Formate!');
        return res.redirect('/profile');
    }
};

// 2.0 load data from [USER_LOG TABLE]
exports.activityLogGetController = (req, res) => {
    const getProfileID = req.session.result[0].user_id * 1;

    userModel.findUserByID(getProfileID, (error, result) => {
        if (error) return error;

        userModel.userActivityLogTable(getProfileID, (error, logTableRus) => {
            if (error) return error;

            return res.render('activitylog', {
                title: 'Activity Logs',
                user_id: result[0].user_id,
                firstName: result[0].firstName,
                lastName: result[0].lastName,
                account_status: result[0].account_status,
                logTableData: logTableRus
            });
        })
    });
};

// Utilites
exports.isLoggedInAuth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
};
