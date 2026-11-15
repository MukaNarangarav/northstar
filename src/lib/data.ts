// Loads the JSON data and gives it types.
import benefitsJson from '@/data/benefits.json';
import resourcesJson from '@/data/resources.json';
import stepsJson from '@/data/steps.json';

import type { Benefit, Resource, Step } from './types';

export const steps = stepsJson as Step[];
export const resources = resourcesJson as Resource[];
export const benefits = benefitsJson as Benefit[];

export const getStep = (id: string) => steps.find((s) => s.id === id);
export const getResource = (id: string) => resources.find((r) => r.id === id);
export const getBenefit = (id: string) => benefits.find((b) => b.id === id);
