export const statusLabel: Record<string, string> = {
  active: 'Active',
  complete: 'Complete',
  ongoing: 'Ongoing',
}

export interface Project {
  title: string
  description: string
  status: 'active' | 'complete' | 'ongoing'
  year: string
  tags: string[]
  /** For sorting on homepage (YYYY-MM-DD) */
  sortDate: string
}

export const projects: Project[] = [
  {
    title: 'Scaling Handshake India',
    description: 'Building the operations infrastructure to grow a 20-person Bangalore office to 80. Covers hiring, management structures, and cross-functional visibility.',
    status: 'active',
    year: '2025–present',
    tags: ['Operations', 'Team Building', 'Bangalore'],
    sortDate: '2025-01-01',
  },
  {
    title: 'Add your project here',
    description: 'Edit the projects array in lib/projects.ts to add your own projects.',
    status: 'ongoing',
    year: '2024',
    tags: ['Example'],
    sortDate: '2024-01-01',
  },
]

export function getRecentProjects(limit = 3) {
  return [...projects]
    .sort((a, b) => (a.sortDate < b.sortDate ? 1 : -1))
    .slice(0, limit)
}
