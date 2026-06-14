import fullManualMd from '../../training-system/01-full-training-manual.md?raw';
import courseOutlineMd from '../../training-system/02-course-outline.md?raw';
import slidesMd from '../../training-system/03-presentation-slides-content.md?raw';
import quickGuideMd from '../../training-system/04-employee-quick-guide.md?raw';
import supervisorMd from '../../training-system/05-supervisor-handbook.md?raw';
import sopMd from '../../training-system/06-sop-library.md?raw';
import checklistMd from '../../training-system/07-daily-checklist-pack.md?raw';
import incidentsMd from '../../training-system/08-incident-templates-pack.md?raw';
import kpiMd from '../../training-system/09-kpi-tracking-guide.md?raw';

export type TrainingSection = {
  title: string;
  body: string;
};

export type TrainingModule = {
  id: string;
  number: number;
  title: string;
  department: string;
  difficulty: 'Foundation' | 'Operator' | 'Supervisor' | 'Advanced';
  duration: string;
  sections: TrainingSection[];
  raw: string;
};

export type SopItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: 'High' | 'Medium' | 'Normal';
};

export type ChecklistItem = {
  id: string;
  title: string;
  body: string;
};

export type TrainingDocument = {
  id: string;
  title: string;
  markdown: string;
};

export const trainingDocuments: TrainingDocument[] = [
  { id: 'full-manual', title: 'Full Training Manual', markdown: fullManualMd },
  { id: 'course-outline', title: 'Course Outline', markdown: courseOutlineMd },
  { id: 'slides', title: 'Presentation Slides Content', markdown: slidesMd },
  { id: 'quick-guide', title: 'Employee Quick Guide', markdown: quickGuideMd },
  { id: 'supervisor', title: 'Supervisor Handbook', markdown: supervisorMd },
  { id: 'sop', title: 'SOP Library', markdown: sopMd },
  { id: 'checklists', title: 'Daily Checklist Pack', markdown: checklistMd },
  { id: 'incidents', title: 'Incident Templates Pack', markdown: incidentsMd },
  { id: 'kpi', title: 'KPI Tracking Guide', markdown: kpiMd },
];

const moduleDepartments = [
  'All Staff',
  'Reception',
  'Tracking',
  'Production',
  'Washing',
  'Blanket Team',
  'Drying',
  'Pressing',
  'Packaging',
  'Storage',
  'Delivery',
  'Reception',
  'Supervisors',
  'Customer Service',
  'All Staff',
  'All Staff',
  'Supervisors',
  'All Staff',
  'All Staff',
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const splitByHeading = (markdown: string, headingLevel: string) => {
  const regex = new RegExp(`^${headingLevel}\\s+(.+)$`, 'gm');
  const matches = [...markdown.matchAll(regex)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const next = matches[index + 1]?.index ?? markdown.length;
    return {
      title: match[1].trim(),
      raw: markdown.slice(start, next).trim(),
    };
  });
};

const sectionize = (markdown: string): TrainingSection[] => {
  const parts = splitByHeading(markdown, '###');
  return parts.map((part) => ({
    title: part.title,
    body: part.raw.replace(/^###\s+.+\n?/, '').trim(),
  }));
};

export const parseTrainingModules = (): TrainingModule[] => {
  const moduleBlocks = splitByHeading(fullManualMd, '##').filter((block) => block.title.startsWith('Module '));
  return moduleBlocks.map((block, index) => {
    const titleMatch = block.title.match(/^Module\s+(\d+)\s+-\s+(.+)$/);
    const number = titleMatch ? Number(titleMatch[1]) : index + 1;
    const title = titleMatch?.[2] ?? block.title;
    const difficulty: TrainingModule['difficulty'] =
      number <= 3 ? 'Foundation' : number <= 12 ? 'Operator' : number <= 17 ? 'Supervisor' : 'Advanced';
    return {
      id: `module-${String(number).padStart(2, '0')}-${slugify(title)}`,
      number,
      title,
      department: moduleDepartments[number - 1] ?? 'Operations',
      difficulty,
      duration: number <= 3 ? '25 min' : number <= 12 ? '35 min' : '30 min',
      sections: sectionize(block.raw),
      raw: block.raw,
    };
  });
};

export const parseSops = (): SopItem[] =>
  splitByHeading(sopMd, '##')
    .filter((block) => block.title.startsWith('SOP '))
    .map((block, index) => {
      const cleanTitle = block.title.replace(/^SOP\s+\d+\s+-\s+/, '');
      return {
        id: `sop-${index + 1}-${slugify(cleanTitle)}`,
        title: cleanTitle,
        body: block.raw.replace(/^##\s+.+\n?/, '').trim(),
        category: cleanTitle.includes('Delivery')
          ? 'Delivery'
          : cleanTitle.includes('Storage')
            ? 'Storage'
            : cleanTitle.includes('POS') || cleanTitle.includes('Reception')
              ? 'Reception'
              : cleanTitle.includes('Safety') || cleanTitle.includes('Emergency')
                ? 'Safety'
                : 'Production',
        priority: cleanTitle.includes('Emergency') || cleanTitle.includes('Lost') || cleanTitle.includes('Safety') ? 'High' : 'Normal',
      };
    });

export const parseChecklists = (): ChecklistItem[] =>
  splitByHeading(checklistMd, '##').map((block, index) => ({
    id: `checklist-${index + 1}-${slugify(block.title)}`,
    title: block.title,
    body: block.raw.replace(/^##\s+.+\n?/, '').trim(),
  }));

export const parseIncidentTemplates = (): ChecklistItem[] =>
  splitByHeading(incidentsMd, '##').map((block, index) => ({
    id: `incident-${index + 1}-${slugify(block.title)}`,
    title: block.title,
    body: block.raw.replace(/^##\s+.+\n?/, '').trim(),
  }));

export const parseSlideSections = (): ChecklistItem[] =>
  splitByHeading(slidesMd, '##').map((block, index) => ({
    id: `slide-${index + 1}-${slugify(block.title)}`,
    title: block.title,
    body: block.raw.replace(/^##\s+.+\n?/, '').trim(),
  }));

export const academyData = {
  modules: parseTrainingModules(),
  sops: parseSops(),
  checklists: parseChecklists(),
  incidents: parseIncidentTemplates(),
  slides: parseSlideSections(),
  documents: trainingDocuments,
  quickGuide: quickGuideMd,
  supervisor: supervisorMd,
  kpi: kpiMd,
  courseOutline: courseOutlineMd,
};

export const progressStorageKey = 'training-academy-progress';

export type TrainingProgress = {
  completedModules: string[];
  completedTasks: string[];
  favoriteSops: string[];
  recentlyViewed: string[];
  certificates: string[];
  streak: number;
};

export const defaultTrainingProgress: TrainingProgress = {
  completedModules: [],
  completedTasks: [],
  favoriteSops: [],
  recentlyViewed: [],
  certificates: ['Safety Starter'],
  streak: 4,
};

export const readTrainingProgress = (): TrainingProgress => {
  if (typeof window === 'undefined') return defaultTrainingProgress;
  try {
    return { ...defaultTrainingProgress, ...JSON.parse(window.localStorage.getItem(progressStorageKey) || '{}') };
  } catch {
    return defaultTrainingProgress;
  }
};

export const writeTrainingProgress = (progress: TrainingProgress) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
};
