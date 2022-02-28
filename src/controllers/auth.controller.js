import createHttpError from 'http-errors'

import { sendToken } from '../utils/sendToken'
import UserModal from '../models/user.model'
import { catchAsync } from '../utils/catchAsync'
import { sendMail } from '../utils/mailer'

const signup = catchAsync(async (req, res, next) => {
    const user = await UserModal.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            user,
        },
    })
})
export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(createHttpError(400, 'Please provide email and password'))
    }
    const user = await UserModal.findOne({ email }).select('+password')
    // check whether user with provided email exists or not
    if (!user) return next(createHttpError('400', 'Invalid credentials'))
    // check whether user's password matches the one provided
    if (!(await user.comparePassword(password)))
        return next(createHttpError('400', 'Invalid credentials'))

    // if all the credentials are valid, login the user
    sendToken(user.id, 'Logged in successfully', res, next)
})
export const requestPasswordReset = catchAsync(async (req, res, next) => {
    const { email } = req.body
    // check whether user with provided email exists or not
    const user = await UserModal.findOne({ email })
    if (!user) return next(createHttpError(404, 'User not found'))
    // if the user exists create a password reset token
    // set the token to expire in 10 minutes
    // send the url to reset password to the user's email
    const token = await user.createPasswordResetToken()
    try {
        await sendMail({
            to: user.email,
            subject: 'Reset your Password',
            text: `
            Please send a patch request to following url to reset your password
            http://localhost:4000/api/v1/users/reset-password/${token}
        `,
        })
    } catch (error) {
        return next(createHttpError(500, error.message))
    }
    res.status(200).json({
        status: 'success',
        data: {
            message: 'Email sent to reset password',
        },
    })
})
export const resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params
    const { password, confirmPassword } = req.body

    const user = await UserModal.findOne({
        passwordResetToken: token,
        passwordResetTokenExpiresIn: { $gt: Date.now() },
    })
    if (!user) return next(createHttpError(404, 'Invalid or expired token'))
    if (password !== confirmPassword)
        return next(createHttpError(400, 'Passwords do not match'))
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetTokenExpiresIn = undefined

    await user.save({ validateModifiedOnly: true })
    res.json({
        data: { message: 'Password changed successfully' },
    })
})

export { signup }
