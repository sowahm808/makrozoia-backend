import { z } from 'zod';

const optionalText = (max = 500) => z.string().trim().max(max).optional();
const requiredText = (name: string, max = 1000) => z.string().trim().min(1, `${name} is required`).max(max);
const email = z.string().trim().email().max(254).toLowerCase();
const textArray = z.array(z.string().trim().min(1).max(120)).max(25);

export const contactSchema = z.object({
  name: requiredText('name', 120),
  email,
  phone: optionalText(40),
  companyName: optionalText(160),
  message: requiredText('message', 3000),
  source: optionalText(120),
}).strict();

export const consultationRequestSchema = z.object({
  name: requiredText('name', 120),
  email,
  phone: optionalText(40),
  companyName: optionalText(160),
  companySize: optionalText(80),
  servicesInterestedIn: textArray.default([]),
  projectStage: optionalText(120),
  preferredTimeline: optionalText(120),
  budgetRange: optionalText(120),
  message: optionalText(3000),
}).strict();

export const pocStatusSchema = z.enum(['submitted', 'accepted', 'in_progress', 'deployed', 'delivered']);

export const projectDiscoverySchema = z.object({
  companyName: requiredText('companyName', 160),
  businessProblem: requiredText('businessProblem', 3000),
  currentSystem: optionalText(3000),
  desiredOutcome: requiredText('desiredOutcome', 3000),
  servicesNeeded: textArray.default([]),
  budgetRange: optionalText(120),
  timeline: optionalText(120),
  currentTechStack: textArray.default([]),
  cloudProvider: optionalText(120),
  integrationNeeds: optionalText(3000),
  securityRequirements: optionalText(3000),
  complianceRequirements: optionalText(3000),
  aiUseCases: optionalText(3000),
  additionalNotes: optionalText(3000),
}).strict();

export type ContactInput = z.infer<typeof contactSchema>;
export type ConsultationRequestInput = z.infer<typeof consultationRequestSchema>;
export const pocStatusUpdateSchema = z.object({
  pocStatus: pocStatusSchema,
  note: optionalText(1000),
}).strict();

export type ProjectDiscoveryInput = z.infer<typeof projectDiscoverySchema>;
export type PocStatusUpdateInput = z.infer<typeof pocStatusUpdateSchema>;
