/**
 * Optional write-ups keyed by exact GitHub repo name. Only add facts you can verify.
 * Repos without a write-up show their live GitHub description and metadata only.
 */
export interface ProjectWriteup {
  problem: string
  approach: string
  details: string[]
  tech?: string[]
  diagram?: string   // path to an image in /public, e.g. '/images/my-repo-architecture.png'
  demo?: string
}
export const projectWriteups: Record<string, ProjectWriteup> = {
  // 'my-repo-name': { problem: '...', approach: '...', details: ['...'], tech: ['...'] },
}
