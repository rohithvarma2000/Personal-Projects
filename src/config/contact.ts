/** Shared (browser + server) limits for the contact form. */
export const contactLimits = { name: 100, email: 254, company: 150, subject: 150, message: 4000, minMessage: 10 } as const
