
import { api } from '@/lib/api'
import { redirect } from 'next/navigation'

export async function registerUser(formData: { name: string; email: string; password: string }) {
    try {
        // 1️⃣ Register
        await api.post('/auth/signup', formData);

    } catch (err: any) {
        const status = err?.response?.status
        const msg = err?.response?.data?.message as string

        // Already exists → nudge to login
        if (status === 409 || msg?.toLowerCase().includes('already exists')) {
            return redirect('/auth/login?notice=account-exists')
        }

        console.error('registerUser error:', err?.response?.data || err.message)
        return redirect('/auth/signup?error=failed')
    }

    // Success → show “check your email” banner
    redirect('/auth/signup?notice=check-your-email')
}

export async function verifyEmail(token: string) {
    try {
        await api.post('/auth/verify-email', { verifyEmailToken: token })
    } catch (err: any) {
        console.error('verifyEmail error:', err)
        redirect('/auth/signup?error=invalid-token')
    }
}

export async function loginUser(formData: { email: string; password: string }) {
    let at: string, ae: number, rt: string, re: number

    try {
        const res = await api.post('/auth/login', formData)

        // Common approach: declare and destructure in one step
        const {
            accessToken: { token: accessToken, expiry: accessExpiry },
            refreshToken: { token: refreshToken, expiry: refreshExpiry },
        } = res.data

        at = accessToken
        ae = accessExpiry
        rt = refreshToken
        re = refreshExpiry

    } catch (err: any) {
        console.error('loginUser error:', err)
        return redirect('/auth/login?error=invalid')
    }

    // Success → pass tokens via query
    redirect(
        `/auth/login?token=${encodeURIComponent(at)}&refresh=${encodeURIComponent(
            rt
        )}&accessExpiry=${ae}&refreshExpiry=${re}`
    )
}

// 📩 Request Password Reset
export async function requestPasswordReset(formData: { email: string }) {
    try {
        await api.post('/auth/request-password-reset', formData.email)
    } catch (err: any) {
        console.error('requestPasswordReset error:', err?.response?.data || err.message)
        return redirect('/auth/forgot-password?error=failed')
    }
    // Show “check your inbox” on the same page
    redirect('/auth/forgot-password?notice=check-email')
}

// 🔒 Reset Password
export async function resetPasswordAction(formData: { resetToken: string; newPassword: string }) {
    try {
        await api.post('/auth/reset-password', {
            resetToken: formData.resetToken,
            newPassword: formData.newPassword,
        })
    } catch (err: any) {
        console.error('resetPassword error:', err?.response?.data || err.message)
        // Bounce back to the same reset form, showing an error
        return redirect(`/auth/reset-password/${formData.resetToken}?error=failed`)
    }
    // On success, send user to login with a notice
    redirect('/auth/login?notice=password-reset')
}