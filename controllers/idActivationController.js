const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/email');
const userModel = require('../modal/userModal');
const pool = require('../config/database');
const MOMENT = require('moment');

const dynamicContPath = path.join(__dirname, '../dynamicCont/pay.json')


// 3.0 new id active [GET]
exports.applyNewIdActivGetController = (req, res) => {
    const getProfileID = req.session.result[0].user_id * 1;

    userModel.findUserByID(getProfileID, (error, result) => {
        if (error) return error;
        let data = JSON.parse(fs.readFileSync(dynamicContPath));
        //with ref_id
        if (result[0].ref_id !== 0) {
            pool.query(
                'SELECT group_type FROM `users` WHERE user_id = ?',
                [result[0].ref_id],
                (e, rus) => {
                    if (e) return e;

                    return res.render('applyNewIdActive', {
                        title: 'Apply New ID Activation',
                        user_id: result[0].user_id,
                        firstName: result[0].firstName,
                        lastName: result[0].lastName,
                        ref_id: result[0].ref_id,
                        account_status: result[0].account_status,
                        activation_date: result[0].activation_date,
                        email: result[0].email,
                        ref_group: rus[0].group_type,

                        bKashNum: data[0].bKash,
                        rocketNum: data[1].rocket,

                        disPackg: 'd-none',
                        disNewIDAply: 'd-block'

                    });
                }
            );
        }
        //without ref_id
        else {
            return res.render('applyNewIdActive', {
                title: 'Apply New ID Activation',
                user_id: result[0].user_id,
                firstName: result[0].firstName,
                lastName: result[0].lastName,
                ref_id: result[0].ref_id,
                account_status: result[0].account_status,
                activation_date: result[0].activation_date,
                email: result[0].email,
                ref_group: '',

                bKashNum: data[0].bKash,
                rocketNum: data[1].rocket,

                disPackg: 'd-none',
                disNewIDAply: 'd-block'
            });
        }

    });
};

// 3.1 new id active [POST]
exports.applyNewIdActivPostController = (req, res) => {
    const { user_id, ref_id, ref_group, paymentMethod, paymentNumber, trnx_id, amount, package_group, email } = req.body;
    let subject = `Apply for New ID Activation [USER ID# ${user_id}]`;
    let message =
        `Congratulation! You have successfully applied to activated your new account. Our team takes a little bit of time to activate your account process. Thanks for cooperating with us.
    Submited Information

    Payment Method: ${paymentMethod}
    bKash/Rocket Number: ${paymentNumber}
    Transection ID: ${trnx_id}
    Amount: ${amount}
    Desired Package Group: ${package_group}`;

    pool.query(
        'INSERT INTO application SET ?',
        {
            complain_reason: 'new account activation',
            user_Id: user_id.trim(),
            pay_method: paymentMethod.trim(),
            pay_number: paymentNumber.trim(),
            trnx_id: trnx_id.trim(),
            amount: amount.trim(),
            group_type: package_group.trim(),
            ref_id: ref_id.trim(),
            ref_group: ref_group,
            submit_date: MOMENT().format('YYYY-MM-DD HH:mm:ss')
        },
        async (error, result) => {
            if (error) {
                req.flash('profileErrorFlash', error.toString());
                res.redirect('/profile');
            }
            else {
                try {
                    await sendEmail({
                        email,
                        subject,
                        message

                    });
                    req.flash('profileSueccFlash', 'Congratulation! You have successfully applied to activated your new account. Our team takes a little bit  of time to activate your account process. Thanks for cooperating with us.');
                    res.redirect('/profile');
                } catch (error) {
                    req.flash('profileErrorFlash', 'There was error sending the email!');
                    return res.redirect('/profile');
                }

            }
        }
    );

};

// 4.1 upgrad package [GET]
exports.upgradPackgGetController = (req, res) => {

    const getProfileID = req.session.result[0].user_id * 1;

    userModel.findUserByID(getProfileID, (error, result) => {
        if (error) return error;

        let data = JSON.parse(fs.readFileSync(dynamicContPath));

        return res.render('applyUpgradPackg', {
            title: 'Apply Upgrad Package',
            user_id: result[0].user_id,
            firstName: result[0].firstName,
            lastName: result[0].lastName,
            account_status: result[0].account_status,
            group_type: result[0].group_type,
            email: result[0].email,

            bKashNum: data[0].bKash,
            rocketNum: data[1].rocket,

            disPackg: 'd-none',
            disNewIDAply: 'd-block'

        });
    });
};
// 4.2 upgrad package [POST]
exports.upgradPackgPostController = (req, res) => {
    const { user_id, paymentMethod, paymentNumber, trnxId, amount, packageGroup, email } = req.body;
    let subject = `Apply for Upgrad Package [USER ID# ${user_id}]`;
    let message =
        `You have successfully applied to upgrade your package. Our team takes a little bit of time to activate your account process. Thanks for cooperating with us.
        Submited Information

        Payment Method: ${paymentMethod}
        bKash/Rocket Number: ${paymentNumber}
        Transection ID: ${trnxId}
        Amount: ${amount}
        Desired Package Group: ${packageGroup}`;

    pool.query(
        'INSERT INTO application SET ?',
        {
            complain_reason: 'upgrade account',
            user_Id: user_id.trim(),
            pay_method: paymentMethod.trim(),
            pay_number: paymentNumber.trim(),
            trnx_id: trnxId.trim(),
            amount: amount.trim(),
            group_type: packageGroup.trim(),
            submit_date: MOMENT().format('YYYY-MM-DD HH:mm:ss')
        },
        async (error, result) => {

            if (error) {
                req.flash('profileErrorFlash', error.toString());
                res.redirect('/profile');
            } else {
                try {
                    await sendEmail({
                        email,
                        subject,
                        message

                    });
                    req.flash('profileSueccFlash', 'You have successfully applied to upgrade your package. Our team takes a little bit of time to activate your account process. Thanks for cooperating with us.');
                    res.redirect('/profile');
                } catch (error) {
                    req.flash('profileErrorFlash', 'There was error sending the email!');
                    return res.redirect('/profile');
                }

            }
        }
    );
};

