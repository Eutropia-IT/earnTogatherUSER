const sendEmail = require('../utils/email');
const userModel = require('../modal/userModal');
const MOMENT = require('moment');



exports.cashOutGetController = (req, res) => {
    const getProfileID = req.session.result[0].user_id * 1;

    userModel.findUserByID(getProfileID, (error, result) => {
        if (error) {
            req.flash('cahsoutPageErrMess', error.toString());
            return res.redirect('/cashout');
        }

        userModel.userRefralLIST(getProfileID, (error, refListTable) => {
            if (error) {
                req.flash('cahsoutPageErrMess', error.toString());
                return res.redirect('/cashout');
            }

            userModel.userBalance(getProfileID, (error, userBal) => {
                if (error) {
                    req.flash('cahsoutPageErrMess', error.toString());
                    return res.redirect('/cashout');
                }
                const uBal = userBal[0].balance * 1;

                return res.render('cashout', {
                    title: 'Apply Cash Out',
                    user_id: result[0].user_id,
                    firstName: result[0].firstName,
                    lastName: result[0].lastName,
                    email: result[0].email,
                    phone: result[0].phone,
                    group_type: result[0].group_type,
                    account_status: result[0].account_status,
                    activationDate: result[0].activation_date,
                    packageUsed: result[0].package_used * 1,

                    refListData: refListTable,


                    bal: uBal,
                    balWithdrwBtnCtr180: () => { if (uBal >= 180) return 1; },
                    balWithdrwBtnCtr300: () => { if (uBal >= 300) return 1; },
                    balWithdrwBtnCtr600: () => { if (uBal >= 500) return 1; },
                    balWithdrwBtnCtr3000: () => { if (uBal >= 3000) return 1; },

                    withdrwListOptionABCD: refListTable.filter(abcd => abcd.withdraw_ticket === 'claim'),
                    withdrwListOptionBCD: refListTable.filter(bcd => bcd.ref_person_group !== 'A' && bcd.withdraw_ticket === 'claim'),
                    withdrwListOptionCD: refListTable.filter(cd => cd.ref_person_group !== 'A' && cd.ref_person_group !== 'B' && cd.withdraw_ticket === 'claim'),
                    withdrwListOptionD: refListTable.filter(d => d.ref_person_group !== 'A' && d.ref_person_group !== 'B' && d.ref_person_group !== 'C' && d.withdraw_ticket === 'claim'),



                    cahsoutPageSuccMess: req.flash('cahsoutPageSuccMess'),
                    cahsoutPageErrMess: req.flash('cahsoutPageErrMess')


                });
            });

        })

    });

};

exports.cashOutPostController = (req, res) => {
    const { userId, group_type, paymentMethod, payRecivNum, amount, refIDngp, email } = req.body

    if (!payRecivNum) {
        req.flash('cahsoutPageErrMess', 'Something have bad request!');
        return res.redirect('/cashout');
    }
    let data = [{
        complain_reason: 'withdraw balance',
        user_Id: userId.trim(),
        pay_method: paymentMethod.trim(),
        pay_number: payRecivNum.trim(),
        amount: amount.trim(),
        group_type: group_type,
        ref_id: refIDngp.split('n')[0] * 1,
        ref_group: refIDngp.split('n')[1],
        submit_date: MOMENT().format('YYYY-MM-DD HH:mm:ss')
    }];
    let subject = `Request for Chsh-Out [USER ID# ${userId}]`;
    let message =
        `You have successfully applied to withdraw your balance. Our team takes a little bit of time to activate your account process. Thanks for cooperating with us.
        Submited Information
    
        Payment Recive Method: ${paymentMethod}
        Payment Recive Number: ${payRecivNum}
        Amount: ${amount}
        Used Refer's ID: Referal User Id ${refIDngp.split('n')[0]}, Group ${refIDngp.split('n')[1]}`;

    userModel.applyWithBal(data, async (error, result) => {
        if (error) {
            req.flash('cahsoutPageErrMess', error.toString());
            return res.redirect('/cashout');
        } else {
            try {
                await sendEmail({
                    email,
                    subject,
                    message

                });
                req.flash('cahsoutPageSuccMess', 'You have successfully applied to withdraw your balance. Our team takes a little bit of time to activate your account process. Thanks for cooperating with us.');
                return res.redirect('/cashout');
            } catch (error) {
                req.flash('cahsoutPageErrMess', 'There was error sending the email!');
                return res.redirect('/cashout');
            }

        }
    });
};



