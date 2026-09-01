import ForgotPasswordOtpController from './ForgotPasswordOtpController'
import ForceChangePasswordController from './ForceChangePasswordController'

const Auth = {
    ForgotPasswordOtpController: Object.assign(ForgotPasswordOtpController, ForgotPasswordOtpController),
    ForceChangePasswordController: Object.assign(ForceChangePasswordController, ForceChangePasswordController),
}

export default Auth