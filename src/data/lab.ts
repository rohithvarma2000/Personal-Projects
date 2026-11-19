/**
 * kind:
 *  - experience: appears in my work experience or projects
 *  - toolkit:    listed in my technical skills
 *  - learning:   an interest I'm developing (not currently used)
 */
export type SkillKind = 'experience' | 'toolkit' | 'learning'
export interface Skill { name: string; kind: SkillKind; note: string }
export interface LabCategory { id: string; label: string; icon: string; blurb: string; skills: Skill[] }

const tk = (name: string, note = 'Part of my technical toolkit.'): Skill => ({ name, kind: 'toolkit', note })
const ex = (name: string, note: string): Skill => ({ name, kind: 'experience', note })
const L = 'Eli Lilly'
const D = 'Dell'

export const labCategories: LabCategory[] = [
  {
    id: 'languages', label: 'Programming Languages', icon: 'code', blurb: 'The languages I write.',
    skills: [
      ex('Java 17/21', `Java 21 microservices at ${L}; Java and Spring Boot at ${D}. Oracle Certified Professional, Java SE 17 (April 2025).`),
      ex('Python', 'Machine-learning work at BHEL and the Farm Companion web platform.'),
      ex('TypeScript', `Angular at ${L} and React at ${D}. This portfolio is written in it too.`),
      tk('JavaScript'),
      ex('SQL', `Queries and index tuning across PostgreSQL at ${L} and relational data at ${D}.`),
    ],
  },
  {
    id: 'backend', label: 'Backend Development', icon: 'server', blurb: 'Services, APIs and business logic.',
    skills: [
      ex('Spring Boot 3', `Cloud-native microservices and REST APIs at ${L}.`),
      ex('Spring Security', `OAuth 2.0 and JWT-based authentication and authorization at ${L}.`),
      ex('Spring Batch', `20+ batch workflows for high-volume healthcare data at ${L}; about 30% faster processing.`),
      ex('Spring WebFlux / R2DBC', `Reactive REST APIs at ${D}; about 60% better concurrent request handling.`),
      tk('Spring Cloud Gateway'), tk('Spring Data JPA'), tk('Spring Data MongoDB'), tk('Hibernate'), tk('gRPC'),
    ],
  },
  {
    id: 'frontend', label: 'Frontend Development', icon: 'layout', blurb: 'Interfaces and interaction.',
    skills: [
      ex('Angular', `Enterprise apps with reusable components, RxJS services and NgRx at ${L}. Angular 15 is listed in my skills.`),
      ex('React', `React.js and TypeScript apps with hooks and reusable components at ${D}, and the Finding Best Flight Deals project.`),
      ex('RxJS', `Reactive services in Angular apps at ${L}.`),
      ex('NgRx', `State management in Angular apps at ${L}.`),
      ex('TypeScript', 'Used across Angular and React work.'),
    ],
  },
  {
    id: 'apis', label: 'APIs & AI', icon: 'file', blurb: 'Contracts, security and AI integration.',
    skills: [
      ex('REST APIs', `Designed and built REST APIs at both ${L} and ${D}.`),
      ex('OpenAPI / Swagger', `Contract-first API design at ${D}; about 35% fewer integration defects.`),
      ex('OAuth 2.0 & JWT', `Securing enterprise healthcare APIs at ${L}.`),
      ex('WebSocket', `Real-time communication between Angular and Spring Boot at ${L}.`),
      ex('LLM Integration', `REST-based AI services and prompt orchestration inside Spring Boot at ${L}.`),
      ex('RAG', `Document retrieval and RAG workflows connected to Angular apps at ${L}.`),
      tk('GraphQL'),
    ],
  },
  {
    id: 'messaging', label: 'Microservices & Messaging', icon: 'server', blurb: 'Distributed systems that stay reliable.',
    skills: [
      ex('Microservices', `Built at ${L}, and modernized from legacy monoliths at ${D}.`),
      ex('Kafka & Kafka Streams', `Event-driven services for high-volume healthcare data at ${L}.`),
      ex('Schema Registry', `Used with Kafka at ${L}, alongside dead-letter queues.`),
      ex('Event-Driven Systems', `Asynchronous communication between services at ${L}.`),
      ex('Saga Patterns', `Used at ${D} to improve transaction reliability across distributed workflows.`),
    ],
  },
  {
    id: 'cloud', label: 'Cloud & DevOps', icon: 'cloud', blurb: 'Where it runs and how it ships.',
    skills: [
      ex('AWS', `EKS, S3 and API Gateway at ${L}; EC2 is also in my skills. AWS Solutions Architect – Associate (January 2026).`),
      ex('Kubernetes', `Spring Boot microservices on AWS EKS at ${L}.`),
      ex('Docker', `Containerized services at ${L}.`),
      ex('Jenkins', `CI/CD pipelines at ${D}, with SonarQube and Checkmarx.`),
      ex('OpenShift & Istio', `Microservices on OpenShift with Istio traffic management for canary releases at ${D}.`),
      tk('Terraform'), tk('Helm'),
    ],
  },
  {
    id: 'data', label: 'Databases', icon: 'database', blurb: 'Relational, document and cache.',
    skills: [
      ex('PostgreSQL', `Queries, indexes and Spring Data repositories at ${L}.`),
      ex('MongoDB', `Document workloads at ${L} and ${D}.`),
      ex('Redis', `Caching at ${D}; about 55% lower query latency together with query optimization.`),
      tk('SQL Server'),
    ],
  },
  {
    id: 'testing', label: 'Testing & Quality', icon: 'wrench', blurb: 'Confidence before release.',
    skills: [
      ex('JUnit 5 & Mockito', `Unit and integration tests at both ${L} and ${D}.`),
      ex('REST Assured', 'API test automation.'),
      ex('Selenium', `End-to-end workflow validation at ${L}.`),
      ex('Cypress', `Frontend testing at ${D}.`),
      ex('Pact', `Contract testing at ${D}.`),
      ex('SonarQube & Checkmarx', `Automated code-quality and security analysis in Jenkins pipelines at ${D}.`),
    ],
  },
  {
    id: 'ops', label: 'Observability & Practices', icon: 'wrench', blurb: 'Seeing the system and shipping it well.',
    skills: [
      tk('Prometheus'), tk('Grafana'), tk('OpenTelemetry'), tk('ELK'), tk('GitOps'), tk('TDD'),
      ex('CI/CD', `Pipelines and automated releases at ${L} and ${D}.`),
      ex('Agile / Scrum', `Day-to-day way of working at ${L}.`),
    ],
  },
]

export const kindLabel: Record<SkillKind, string> = {
  experience: 'Used in my roles',
  toolkit: 'In my toolkit',
  learning: 'Developing',
}
