const userModel = require('../modal/userModal');

const PAR_DAY_MAX_EARN_GA = 6; 
const PAR_DAY_MAX_EARN_GB = 25; 
const PAR_DAY_MAX_EARN_GC = 20; 
const PAR_DAY_MAX_EARN_GD = 100; 

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getUserMaxEarn(group_type) {
    if(group_type === 'A') return PAR_DAY_MAX_EARN_GA;
    else if(group_type === 'B') return PAR_DAY_MAX_EARN_GB;
    else if(group_type === 'C') return PAR_DAY_MAX_EARN_GC;
    else if(group_type === 'D') return PAR_DAY_MAX_EARN_GD;
}

exports.videoEarnGetController = (req, res) => {
    const getProfileID = req.session.result[0].user_id * 1;

    userModel.findUserByID(getProfileID, (error, result) => {
        if (error) {
            req.flash('videoPageErrMess', error.toString());
            return res.redirect('/watchVideo');
        }
        if(result[0].account_status === 'pending' || result[0].account_status === 'block'){
            req.flash('profileErrorFlash', 'For video watching earn, you have to need activate your account!');
            return res.redirect('/profile')
        }
        userModel.getVideoTabel(result[0].group_type, (error, getVideoTableRUS) => {
            if (error) {
                req.flash('videoPageErrMess', error.toString());
                return res.redirect('/watchVideo');
            }

            userModel.getDailyVidIncome(result[0].user_id, (error, getUserDailyIncome) => {
                if (error) {
                    req.flash('videoPageErrMess', error.toString());
                    return res.redirect('/watchVideo');
                }
                const randomNum = randomInteger(0, getVideoTableRUS.length - 1);
                const gpt = result[0].group_type;
                const dailyIncome = getUserDailyIncome[0].daily_video_income*1;
                
                return res.render('watchVideo', {
                    title: 'Watch Video',
                    user_id: result[0].user_id,
                    firstName: result[0].firstName,
                    lastName: result[0].lastName,
                    email: result[0].email,
                    phone: result[0].phone,
                    group_type: result[0].group_type,
                    account_status: result[0].account_status,
                    activationDate: result[0].activation_date,
                    packageUsed: result[0].package_used * 1,
                    

                    videoId: ()=>{
                        if(getVideoTableRUS.length === 0) return 0;
                        else return getVideoTableRUS[randomNum].video_Id;
                    },
                    
                    videoTile: ()=>{
                        if(getVideoTableRUS.length === 0) return 0;
                        else return getVideoTableRUS[randomNum].video_name.split('.mp4');
                    },
                    videoPrice: () => {
                        if(getVideoTableRUS.length === 0) return 0;
                        else if (gpt === 'A') return getVideoTableRUS[randomNum].A;
                        else if (gpt === 'B') return getVideoTableRUS[randomNum].B;
                        else if (gpt === 'C') return getVideoTableRUS[randomNum].C;
                        else if (gpt === 'D') return getVideoTableRUS[randomNum].D;
                        
                    },

                    todaysInc: dailyIncome,
                    earnBtnContlr: ()=>{
                        if(dailyIncome < getUserMaxEarn(gpt)) return 1;
                        else return 0;
                    },
    
                    videoPageSuccMess: req.flash('videoPageSuccMess'),
                    videoPageErrMess: req.flash('videoPageErrMess'),
                });
            });

        });
    });
};

exports.videoEarnPostController = (req, res) => {
    const { userID, vidEarn } = req.body;
    
    let data = [
        { video_earning: vidEarn, user_id: userID },
    ];
    userModel.insertUserVidoIncome(data, (error, result) => {
        if (error) {
            req.flash('videoPageErrMess', error.toString());
            return res.redirect('/watchVideo');
        } else {
            req.flash('videoPageSuccMess', `Congratulation! You have earned ৳${vidEarn}`);
            return res.redirect('/watchVideo');
        }
    });
};