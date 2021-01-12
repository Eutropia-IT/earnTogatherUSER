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
    .route('/aboutUs')
    .get(userController.aboutUsGetController);
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
    .route('/publicCusEmail')
    .post(userController.publicCustomerEmail);


router
    .route('/profile')
    .get(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        profileController.accRenewMiddleware,
        profileController.profileGetController)
    .post(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        profileController.accRenewMiddleware,
        profileController.updateProfilePostController);


router
    .route('/newIdActivation')
    .get(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        idActivationController.applyNewIdActivGetController)
    .post(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        idActivationController.applyNewIdActivPostController);

router
    .route('/upgradPackage')
    .get(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        idActivationController.upgradPackgGetController)
    .post(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        idActivationController.upgradPackgPostController);

router
    .route('/cashout')
    .get(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        cashOutController.cashOutGetController)
    .post(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        cashOutController.cashOutPostController);

router
    .route('/statement')
    .get(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        statementController.stamntGetController);
router
    .route('/activityLog')
    .get(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        profileController.activityLogGetController);

router
    .route('/watchVideo')
    .get(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        profileController.accRenewMiddleware,
        videoEarnController.videoEarnGetController)
    .post(profileController.isLoggedInAuth,
        profileController.findUserMiddleware,
        profileController.accRenewMiddleware,
        videoEarnController.videoEarnPostController);




router
    .route('*')
    .get(userController.fof);


module.exports = router;