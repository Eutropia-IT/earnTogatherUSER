const express = require('express');

const userController = require('../controllers/userController');
const profileController = require('../controllers/profileController');
const idActivationController = require('../controllers/idActivationController');
const cashOutController = require('../controllers/cashOutController');
const statementController = require('../controllers/statementController');
const videoEarnController = require('../controllers/videoEarnController');



const router = express.Router();


router
    .route('/')
    .get(userController.publicPageAuth,
        userController.home);

router
    .route('/signup')
    .get(userController.publicPageAuth,
        userController.signupGetController)
    .post(userController.publicPageAuth,

        userController.chackUserInputs,
        userController.chackReferallId,
        userController.varifySignupEmail,
        userController.signupPostController);
router
    .route('/login')
    .post(userController.publicPageAuth,
        userController.loginPostController);
router
    .route('/logout')
    .get(userController.logoutGetController);
router
    .route('/package')
    .get(userController.publicPageAuth,
        userController.packageGetController);

router
    .route('/forgotPassword')
    .get(userController.publicPageAuth,
        userController.forgotPasswordGetController)
    .post(userController.publicPageAuth,
        userController.forgotPasswordPostController);

router
    .route('/resetPassword/:token')
    .get(userController.publicPageAuth,
        userController.resetPasswordGetController)
    .post(userController.publicPageAuth,
        userController.resetPasswordPostController);



router
    .route('/profile')
    .get(profileController.isLoggedInAuth,
        profileController.profileGetController)
    .post(profileController.isLoggedInAuth,
        profileController.updateProfilePostController);


router
    .route('/newIdActivation')
    .get(profileController.isLoggedInAuth,
        idActivationController.applyNewIdActivGetController)
    .post(profileController.isLoggedInAuth,
        idActivationController.applyNewIdActivPostController);

router
    .route('/upgradPackage')
    .get(profileController.isLoggedInAuth,
        idActivationController.upgradPackgGetController)
    .post(profileController.isLoggedInAuth,
        idActivationController.upgradPackgPostController);

router
    .route('/cashout')
    .get(profileController.isLoggedInAuth,
        cashOutController.cashOutGetController)
    .post(profileController.isLoggedInAuth,
        cashOutController.cashOutPostController);

router
    .route('/statement')
    .get(profileController.isLoggedInAuth,
        statementController.stamntGetController);
router
    .route('/activityLog')
    .get(profileController.isLoggedInAuth,
        profileController.activityLogGetController);

router
    .route('/watchVideo')
    .get(profileController.isLoggedInAuth,
        videoEarnController.videoEarnGetController)
    .post(profileController.isLoggedInAuth,
        videoEarnController.videoEarnPostController);




router
    .route('*')
    .get(userController.fof);


module.exports = router;