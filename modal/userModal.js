const pool = require('../config/database');


// B.0 User Login [USER TABLE]
exports.findUser = (tables, data, callBack) => {
    pool.query(
        `SELECT ${tables} FROM users WHERE ?`,
        data,
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// B.1 varufy email address [USER TABLE]
exports.varifyEmail = (email, callBack) => {
    pool.query('SELECT email FROM users WHERE email= ?', [email], (error, result) => {
        if (error) {
            return callBack(error);
        }
        return callBack(null, result);
    });
};
// D.1 inset data into [USER TABLE]
exports.insertUserData = (data, callBack) => {
    pool.query(
        'INSERT INTO users SET ?', data,
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};



// 1.0  Find User By Id [USER TABLE]
exports.findUserByID = (id, callBack) => {
    pool.query(
        'SELECT *,DATEDIFF(CURRENT_TIMESTAMP(), `activation_date`) package_used FROM `users` WHERE user_id=?',
        [id],
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// 1.1 Find User by Id [USER TABLE]
exports.findUserByEmail = (email, callBack) => {
    pool.query(
        'SELECT user_id FROM `users` WHERE email=?',
        [email],
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// 1.2 Update Profile Info [USER TABLE]
exports.updateProfileInfo = (data, callBack) => {
    pool.query(
        'UPDATE users SET ? WHERE ?', data, (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }

    );
};
// 2.0 Activaty Log [USER_LOG TABLE]
exports.userActivityLogTable = (id, callBack) => {
    pool.query('SELECT `user_id`, `time`, `subject`,`message`,UNIX_TIMESTAMP(`time`) AS DATE FROM `user_log` WHERE `user_id`= ? ORDER BY DATE DESC',
        [id], (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        });
};

exports.findUserIdByResetTOKN = (token, callBack) => {
    pool.query(
        'SELECT `user_id` FROM `forgot_password` WHERE `reset_token` = ?', [token],
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
}

exports.userActivityLogTable = (id, callBack) => {
    pool.query('SELECT `user_id`, `time`, `subject`,`message`,UNIX_TIMESTAMP(`time`) AS DATE FROM `user_log` WHERE `user_id`= ? ORDER BY DATE DESC',
        [id], (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        });
}
exports.forgotPassword = (data, callBack) => {
    pool.query(
        'INSERT INTO forgot_password SET ?', data,
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};

// get video list form suggest by user group [VIDEO TABLE]
exports.getVideoTabel = (group, callBack) => {
    pool.query(
        `SELECT * FROM video WHERE ${group} !=0`, [], (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// insert user video income [USER INCOME TABLE]
exports.insertUserVidoIncome = (data, callBack) => {
    pool.query(
        'INSERT INTO user_income SET ?', data,
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// get daily viseo income [USER INCOME TABLE]
exports.getDailyVidIncome = (userId, callBack) => {
    pool.query(
        'SELECT SUM(video_earning) AS daily_video_income FROM user_income WHERE DATE(`time`) = CURRENT_DATE AND user_id = ?', [userId],
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// find user income withdraw balance
exports.userBalance = (id, callBack) => {
    const sqlquery =
        `SELECT
        user_id,
        SUM(user_income.active_mony_back) atcIncome,
        SUM(user_income.video_earning) vdIncome,
        SUM(user_income.ref_earning) refIncome,
        IFNULL(
            (
            SELECT
                SUM(application.amount)
            FROM
                application
            WHERE
                application.user_Id = ? AND application.complain_reason = 'withdraw balance' AND application.conplain_status = 'solved'
        ),
        0
        ) wBal,
        SUM(user_income.active_mony_back) + SUM(user_income.video_earning) + SUM(user_income.ref_earning) - IFNULL(
            (
            SELECT
                SUM(application.amount)
            FROM
                application
            WHERE
                application.user_Id = ? AND application.complain_reason = 'withdraw balance' AND application.conplain_status = 'solved'
        ),
        0
        ) balance
    FROM
        user_income
    WHERE
        user_income.user_id = ?`;

    pool.query(sqlquery, [id, id, id], (error, result) => {
        if (error) {
            return callBack(error);
        }
        return callBack(null, result);
    });

};

// find user referall list
exports.userRefralLIST = (userID, callBack) => {
    pool.query(
        `SELECT user_id, ref_earning, ref_candidates_Id, ref_person_group, withdraw_ticket
         FROM user_income WHERE ref_earning != 0 AND user_id = ?`,
        [userID], (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};

// request for withdraw balance [APPICATION TABEL]
exports.applyWithBal = (data, callBack) => {
    pool.query(
        'INSERT INTO application SET ?', data,
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};


