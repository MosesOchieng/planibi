import { createTransport } from 'nodemailer'
import { prisma } from './prisma'
import { randomBytes } from 'crypto'

const transporter = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: true,
})

export async function sendVerificationEmail(email: string) {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Store the verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email address',
    html: `
      <div>
        <h1>Welcome to True Travel AI!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  })
}

export async function verifyEmail(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    throw new Error('Invalid verification token')
  }

  if (verificationToken.expires < new Date()) {
    throw new Error('Verification token has expired')
  }

  // Update user's email verification status
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  })

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token },
  })

  return true
} 