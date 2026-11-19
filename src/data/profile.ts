export const profile = {
  name: 'Rohith Katari',
  roles: 'FULL-STACK ENGINEER | SOFTWARE DEVELOPER | TECHNOLOGY ENTHUSIAST',
  headline: 'Building the Future, One Line of Code at a Time.',
  intro:
    "I'm a software developer passionate about designing, developing and delivering scalable applications. From backend architecture and microservices to modern user interfaces, I enjoy turning complex problems into practical software solutions.",
  aboutTitle: 'Java Full-Stack Developer | Spring Boot · Angular · React · AWS',
  about: [
    'I build cloud-native, event-driven microservices on Java 21 and Spring Boot 3, and the Angular and React front-ends that sit on top of them.',
    'Most of my recent work is in regulated healthcare: secure REST APIs, Kafka-based messaging, PostgreSQL and MongoDB, and Docker and Kubernetes deployments on AWS, with CI/CD behind all of it.',
    'I also work with testing and quality tooling, and I have integrated LLM and RAG features into Spring Boot services.',
  ],
  location: 'Columbus, Ohio',
} as const

export const mindset = [
  { word: 'Think', text: 'I like understanding how systems work internally before I change them.' },
  { word: 'Build', text: 'I enjoy working across frontend, backend, APIs, databases and cloud infrastructure.' },
  { word: 'Break', text: 'Solving challenging technical problems means finding where things fail, and why.' },
  { word: 'Learn', text: 'I continuously explore new tools and technologies.' },
  { word: 'Improve', text: 'Good engineering combines technical quality with real business value.' },
] as const

export const languages = ['English', 'French', 'Telugu', 'Hindi', 'Tamil'] as const

export const education = [
  { id: 'ud', degree: 'Master of Science – Computer Science', school: 'University of Dayton', period: 'January 2022 – August 2023' },
  { id: 'vit', degree: 'Bachelor of Technology – Computer Engineering', school: 'Vellore Institute of Technology', period: 'June 2017 – April 2021' },
] as const

export const certifications = [
  { name: 'AWS Solutions Architect – Associate', date: 'January 2026' },
  { name: 'Oracle Certified Professional – Java SE 17 Developer', date: 'April 2025' },
] as const
