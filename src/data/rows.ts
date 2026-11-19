export interface RowCard {
  id: string
  title: string
  tag: string
  desc: string
  tech: string[]
  details: string[]
  note?: string
  links?: { label: string; href: string }[]
}
export interface ContentRow { id: string; title: string; subtitle: string; cards: RowCard[] }

export const rows: ContentRow[] = [
  {
    id: 'featured',
    title: 'Featured Projects',
    subtitle: 'Highlights from my resume. Employer systems stay confidential.',
    cards: [
      { id: 'f1', title: 'Event-Driven Microservices', tag: 'Eli Lilly', desc: 'Kafka and Kafka Streams services for reliable, high-volume healthcare data.', tech: ['Kafka', 'Kafka Streams', 'Schema Registry', 'Spring Boot 3'],
        details: ['Schema Registry and dead-letter queues for reliable asynchronous communication.', 'Java 21 and Spring Boot 3 services.'] },
      { id: 'f2', title: 'Spring Batch Workflows', tag: 'Eli Lilly', desc: '20+ batch workflows for inbound and outbound healthcare data.', tech: ['Spring Batch', 'Java', 'PostgreSQL'],
        details: ['Configurable job flows with validation, transformation and error handling.', 'About 30% faster processing and fewer manual file-handling errors.'] },
      { id: 'f3', title: 'AI & RAG Services', tag: 'Eli Lilly', desc: 'REST-based AI services inside the Spring Boot architecture, connected to Angular apps.', tech: ['Spring Boot', 'LLM', 'RAG', 'Angular'],
        details: ['Prompt orchestration and document retrieval.', 'Context-aware answers from enterprise healthcare data.'] },
      { id: 'f4', title: 'Monolith to Microservices', tag: 'Dell Technologies', desc: 'Legacy monoliths modernized into Spring Boot microservices on OpenShift.', tech: ['Spring Boot', 'OpenShift', 'Istio'],
        details: ['Service-to-service communication and Istio traffic management.', 'Canary deployments and faster release cycles.'] },
      { id: 'f5', title: 'Finding Best Flight Deals', tag: 'Project · Aug–Dec 2022', desc: 'A React web app that surfaces flight options by cost, layovers and travel duration.', tech: ['React', 'Java', 'Spring Boot', 'REST'],
        details: ['RESTful backend services in Java and Spring Boot aggregate and manage flight data from multiple sources.'] },
      { id: 'f6', title: 'Farm Companion', tag: 'Project · Jan–May 2021', desc: 'A Python web platform for farmers.', tech: ['Python', 'BeautifulSoup'],
        details: ['Weather forecasts, crop recommendations and information on 70+ government schemes.', 'A scraping pipeline over public government sources that saved 15+ hours per week.'] },
    ],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Development',
    subtitle: 'Backend, APIs, data and the interfaces on top.',
    cards: [
      { id: 'fs1', title: 'Backend Services', tag: 'Java + Spring', desc: 'Java 17/21 with Spring Boot 3, Security, Data, Batch and WebFlux.', tech: ['Java', 'Spring Boot 3', 'Spring Security', 'Spring Data'], details: ['Cloud-native microservices at Eli Lilly.', 'Reactive APIs on Spring WebFlux and R2DBC at Dell.'] },
      { id: 'fs2', title: 'Angular Front-Ends', tag: 'Frontend', desc: 'Enterprise Angular and TypeScript apps.', tech: ['Angular', 'TypeScript', 'RxJS', 'NgRx'], details: ['Reusable components, RxJS services and NgRx state management at Eli Lilly.'] },
      { id: 'fs3', title: 'React Front-Ends', tag: 'Frontend', desc: 'React.js and TypeScript apps.', tech: ['React', 'TypeScript', 'Hooks'], details: ['Reusable components, hooks and state management at Dell.', 'The Finding Best Flight Deals project.'] },
      { id: 'fs4', title: 'APIs & Real-Time', tag: 'Integration', desc: 'REST, contract-first OpenAPI and WebSocket communication.', tech: ['REST', 'OpenAPI', 'WebSocket', 'OAuth 2.0', 'JWT'], details: ['Secured with OAuth 2.0 and JWT at Eli Lilly.', 'About 35% fewer integration defects from contract-first design at Dell.'] },
      { id: 'fs5', title: 'Data Layer', tag: 'Databases', desc: 'PostgreSQL, MongoDB and Redis.', tech: ['PostgreSQL', 'MongoDB', 'Redis', 'SQL'], details: ['Query and index optimization at both companies.', 'Redis caching at Dell; about 55% lower query latency.'] },
    ],
  },
  {
    id: 'enterprise',
    title: 'Enterprise Engineering',
    subtitle: 'Reliability, security and quality at scale.',
    cards: [
      { id: 'e1', title: 'Security', tag: 'AuthN / AuthZ', desc: 'Spring Security with OAuth 2.0 and JWT.', tech: ['Spring Security', 'OAuth 2.0', 'JWT'], details: ['Securing enterprise healthcare workflows at Eli Lilly.'] },
      { id: 'e2', title: 'Resilience Patterns', tag: 'Reliability', desc: 'Rate limiting, throttling, circuit breakers and async processing.', tech: ['Circuit breakers', 'Rate limiting', 'Saga'], details: ['Kept services stable during peak traffic and downstream failures at Dell.', 'Saga patterns for distributed transactions.'] },
      { id: 'e3', title: 'Test Automation', tag: 'Quality', desc: 'Unit, integration, API and frontend testing.', tech: ['JUnit 5', 'Mockito', 'REST Assured', 'Selenium', 'Cypress', 'Pact'], details: ['40–50% more test coverage at Eli Lilly.', 'About 85% coverage at Dell.'] },
      { id: 'e4', title: 'Code Quality in CI', tag: 'DevOps', desc: 'Jenkins pipelines with SonarQube and Checkmarx.', tech: ['Jenkins', 'SonarQube', 'Checkmarx'], details: ['Automated code-quality and security analysis at Dell.'] },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud & DevOps',
    subtitle: 'Where the software runs and how it ships.',
    cards: [
      { id: 'c1', title: 'AWS', tag: 'Certified', desc: 'AWS Solutions Architect – Associate, January 2026.', tech: ['EKS', 'S3', 'API Gateway', 'EC2'], details: ['EKS, S3 and API Gateway at Eli Lilly.'] },
      { id: 'c2', title: 'Containers', tag: 'Docker + Kubernetes', desc: 'Spring Boot services containerized and deployed on AWS EKS.', tech: ['Docker', 'Kubernetes', 'EKS'], details: ['Rollbacks and production releases at Eli Lilly.'] },
      { id: 'c3', title: 'OpenShift & Istio', tag: 'Platform', desc: 'Microservices on OpenShift with Istio traffic management.', tech: ['OpenShift', 'Istio'], details: ['Canary deployments at Dell.'] },
      { id: 'c4', title: 'CI/CD', tag: 'Delivery', desc: 'Pipelines, automated releases and infrastructure deployment.', tech: ['Jenkins', 'CI/CD', 'Terraform', 'Helm'], details: ['Jenkins pipelines at Dell; CI/CD automation at Eli Lilly.', 'Terraform and Helm are in my skills list.'] },
    ],
  },
]
