export interface Level { id: string; level: string; date: string; title: string; org: string; text: string }

/** Dates come from my resume. */
export const levels: Level[] = [
  { id: 'l1', level: 'Level 01', date: 'June 2017', title: 'The journey begins', org: 'Vellore Institute of Technology', text: 'Started a B.Tech in Computer Engineering, the foundation of my software development journey.' },
  { id: 'l2', level: 'Level 02', date: 'February 2020', title: 'Full Stack Developer', org: 'Dell Technologies', text: 'Java and Spring Boot microservices, React front-ends, and a move from legacy monoliths to OpenShift.' },
  { id: 'l3', level: 'Level 03', date: 'January 2021', title: 'Farm Companion', org: 'Project', text: 'A Python web platform with weather forecasts, crop recommendations and information on 70+ government schemes for farmers.' },
  { id: 'l4', level: 'Level 04', date: 'January 2022', title: 'Graduate study', org: 'University of Dayton', text: 'Began a Master of Science in Computer Science, completed August 2023.' },
  { id: 'l5', level: 'Level 05', date: 'August 2022', title: 'Finding Best Flight Deals', org: 'Project', text: 'A React app backed by Java and Spring Boot services that surfaces flight options by cost, layovers and travel time.' },
  { id: 'l6', level: 'Level 06', date: 'April 2023 – Present', title: 'Java Full Stack Developer', org: 'Eli Lilly and Company', text: 'Java 21 and Spring Boot 3 microservices, Angular, Kafka, and Kubernetes on AWS EKS.' },
  { id: 'l7', level: 'Level 07', date: 'April 2025', title: 'Oracle Java SE 17 certification', org: 'Oracle', text: 'Oracle Certified Professional – Java SE 17 Developer.' },
  { id: 'l8', level: 'Level 08', date: 'January 2026', title: 'AWS certification', org: 'Amazon Web Services', text: 'AWS Solutions Architect – Associate.' },
]
