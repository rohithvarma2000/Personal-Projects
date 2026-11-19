import { contactLimits as L } from '../config/contact.js'

export interface ContactInput { name: string; email: string; company: string; subject: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactInput, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Shared by the browser form and the serverless handler. Pure, no DOM. */
export function validateContact(i: ContactInput): ContactErrors {
  const e: ContactErrors = {}
  if (!i.name.trim()) e.name = 'Please enter your name.'
  else if (i.name.length > L.name) e.name = `Name must be ${L.name} characters or fewer.`
  if (!i.email.trim()) e.email = 'Please enter your email address.'
  else if (i.email.length > L.email || !EMAIL.test(i.email.trim())) e.email = 'Please enter a valid email address.'
  if (i.company.length > L.company) e.company = `Company must be ${L.company} characters or fewer.`
  if (!i.subject.trim()) e.subject = 'Please add a subject.'
  else if (i.subject.length > L.subject) e.subject = `Subject must be ${L.subject} characters or fewer.`
  if (i.message.trim().length < L.minMessage) e.message = `Please write at least ${L.minMessage} characters.`
  else if (i.message.length > L.message) e.message = `Message must be ${L.message} characters or fewer.`
  return e
}
