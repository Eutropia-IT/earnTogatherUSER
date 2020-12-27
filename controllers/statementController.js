const userModel = require('../modal/userModal');
const pool = require('../config/database');

exports.stamntGetController = (req, res) => {
    const getProfileID = req.session.result[0].user_id * 1;

    userModel.findUserByID(getProfileID, (error, result) => {

        userModel.userBalance(getProfileID, (error, balResult) => {
            if (error) return (error);

            pool.query('SELECT `user_id`,`active_mony_back`,`time` FROM `user_income` WHERE `user_id`= ? AND `active_mony_back` !=0', [getProfileID], (error, getActivationMTable) => {
                if (error) return error;

                pool.query('SELECT `user_id`,`video_earning`, `time` FROM user_income WHERE `user_id` = ? AND `video_earning` !=0', [getProfileID], (error, getVideoErnTable) => {
                    if (error) return error;

                    pool.query('SELECT `user_id`,`ref_earning`,`time` FROM user_income WHERE `user_id` = ? AND `ref_earning`!=0', [getProfileID], (error, getRefIncomeTable) => {
                        if (error) return error;

                        pool.query(`SELECT user_Id, amount, solve_date FROM application WHERE user_Id = ? AND complain_reason = 'withdraw balance' AND conplain_status ='solved'`, [getProfileID], (error, getWithdrawTable) => {
                            if (error) return error;
                            
                            return res.render('statement', {
                                title: 'Income Statement',
                                user_id: result[0].user_id,
                                firstName: result[0].firstName,
                                lastName: result[0].lastName,
                                account_status: result[0].account_status,
                                totalEarnBal: balResult[0].atcIncome + balResult[0].vdIncome + balResult[0].refIncome,
                                atcIncome: balResult[0].atcIncome*1,
                                vdIncome: balResult[0].vdIncome*1,
                                refIncome: balResult[0].refIncome*1,
                                wBal: balResult[0].wBal,
                                balance: balResult[0].balance*1,
                                activationMonBack: getActivationMTable,
                                videoEarning: getVideoErnTable,
                                refEarning: getRefIncomeTable,
                                withdrawBal: getWithdrawTable
                            });
                        });

                    });

                });

            });
        });

    });
};




