/**
 * Central site configuration. Everything that is personal or environment-specific is here.
 * Values come from Vite env vars (see .env.example); safe defaults come from the owner's own materials.
 */
import { contactInfo } from '../data/contactInfo'

const env = import.meta.env

export const site = {
  name: 'Rohith Katari',
  githubUsername: (env.VITE_GITHUB_USERNAME as string | undefined) || contactInfo.githubUsername,
  /** Repos to feature first (exact repo names). Leave empty to feature the most-starred / most-recent. */
  featuredRepos: ((env.VITE_FEATURED_REPOS as string | undefined) || '').split(',').map((s) => s.trim()).filter(Boolean),
  linkedin: (env.VITE_LINKEDIN_URL as string | undefined) || contactInfo.linkedin,
  /** Optional hero background image URL (e.g. '/images/background.jpg'). Empty = generated Matrix atmosphere only. */
  heroBackground: (env.VITE_HERO_BACKGROUND as string | undefined) || '',
  resumeUrl: '/resume/Rohith_Katari_Resume.pdf',
  email: contactInfo.email,
  phone: contactInfo.phone,
  phoneHref: 'tel:+19377723299',
  location: contactInfo.location,
  supabaseUrl: (env.VITE_SUPABASE_URL as string | undefined) || '',
  supabaseAnonKey: (env.VITE_SUPABASE_ANON_KEY as string | undefined) || '',
  /** Base URL for API routes. Empty = same origin (Vercel). */
  apiBase: (env.VITE_API_BASE as string | undefined) || '',
} as const

export const githubProfileUrl = `https://github.com/${site.githubUsername}`
