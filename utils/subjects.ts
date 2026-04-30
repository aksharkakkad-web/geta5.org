export interface SubjectUnit {
  number: number
  name: string
}

export interface Subject {
  slug: string
  name: string
  examDate: string  // ISO date: "YYYY-MM-DD"
  units: SubjectUnit[]
}

const SUBJECTS: Subject[] = [
  {
    slug: 'ap-psychology',
    name: 'AP Psychology',
    examDate: '2026-05-12T12:00:00',
    units: [
      { number: 1, name: 'Biological Bases of Behavior' },
      { number: 2, name: 'Cognition' },
      { number: 3, name: 'Development and Learning' },
      { number: 4, name: 'Social Psychology and Personality' },
      { number: 5, name: 'Mental and Physical Health' },
    ],
  },
  {
    slug: 'ap-world-history',
    name: 'AP World History',
    examDate: '2026-05-07T08:00:00',
    units: [
      { number: 1, name: 'The Global Tapestry' },
      { number: 2, name: 'Networks of Exchange' },
      { number: 3, name: 'Land-Based Empires' },
      { number: 4, name: 'Transoceanic Interconnections' },
      { number: 5, name: 'Revolutions' },
      { number: 6, name: 'Consequences of Industrialization' },
      { number: 7, name: 'Global Conflict' },
      { number: 8, name: 'Cold War and Decolonization' },
      { number: 9, name: 'Globalization' },
    ],
  },
  {
    slug: 'ap-government',
    name: 'AP Government',
    examDate: '2026-05-05T12:00:00',
    units: [
      { number: 1, name: 'Foundations of American Democracy' },
      { number: 2, name: 'Interactions Among Branches of Government' },
      { number: 3, name: 'Civil Liberties and Civil Rights' },
      { number: 4, name: 'American Political Ideologies and Beliefs' },
      { number: 5, name: 'Political Participation' },
    ],
  },
  {
    slug: 'ap-calculus-ab',
    name: 'AP Calculus AB',
    examDate: '2026-05-11T08:00:00',
    units: [
      { number: 1, name: 'Limits and Continuity' },
      { number: 2, name: 'Differentiation: Definition and Fundamental Properties' },
      { number: 3, name: 'Differentiation: Composite, Implicit, and Inverse Functions' },
      { number: 4, name: 'Contextual Applications of Differentiation' },
      { number: 5, name: 'Analytical Applications of Differentiation' },
      { number: 6, name: 'Integration and Accumulation of Change' },
      { number: 7, name: 'Differential Equations' },
      { number: 8, name: 'Applications of Integration' },
    ],
  },
  {
    slug: 'ap-precalculus',
    name: 'AP Precalculus',
    examDate: '2026-05-12T08:00:00',
    units: [
      { number: 1, name: 'Polynomial and Rational Functions' },
      { number: 2, name: 'Exponential and Logarithmic Functions' },
      { number: 3, name: 'Trigonometric and Polar Functions' },
    ],
  },
  {
    slug: 'ap-csp',
    name: 'AP Computer Science Principles',
    examDate: '2026-05-14T12:00:00',
    units: [
      { number: 1, name: 'Creative Development' },
      { number: 2, name: 'Data' },
      { number: 3, name: 'Algorithms and Programming' },
      { number: 4, name: 'Computer Systems and Networks' },
      { number: 5, name: 'Impact of Computing' },
    ],
  },
  {
    slug: 'ap-calculus-bc',
    name: 'AP Calculus BC',
    examDate: '2026-05-11T08:00:00',
    units: [
      { number: 1, name: 'Limits and Continuity' },
      { number: 2, name: 'Differentiation: Definition and Fundamental Properties' },
      { number: 3, name: 'Differentiation: Composite, Implicit, and Inverse Functions' },
      { number: 4, name: 'Contextual Applications of Differentiation' },
      { number: 5, name: 'Analytical Applications of Differentiation' },
      { number: 6, name: 'Integration and Accumulation of Change' },
      { number: 7, name: 'Differential Equations' },
      { number: 8, name: 'Applications of Integration' },
      { number: 9, name: 'Parametric Equations, Polar Coordinates, and Vector-Valued Functions' },
      { number: 10, name: 'Infinite Sequences and Series' },
    ],
  },
  {
    slug: 'ap-chemistry',
    name: 'AP Chemistry',
    examDate: '2026-05-05T08:00:00',
    units: [
      { number: 1, name: 'Atomic Structure and Properties' },
      { number: 2, name: 'Molecular and Ionic Compound Structure and Properties' },
      { number: 3, name: 'Intermolecular Forces and Properties' },
      { number: 4, name: 'Chemical Reactions' },
      { number: 5, name: 'Kinetics' },
      { number: 6, name: 'Thermodynamics' },
      { number: 7, name: 'Equilibrium' },
      { number: 8, name: 'Acids and Bases' },
      { number: 9, name: 'Applications of Thermodynamics' },
    ],
  },
  {
    slug: 'ap-comparative-government',
    name: 'AP Comp Gov',
    examDate: '2026-05-05T12:00:00',
    units: [
      { number: 1, name: 'Political Systems, Regimes, and Governments' },
      { number: 2, name: 'Political Institutions' },
      { number: 3, name: 'Political Culture and Participation' },
      { number: 4, name: 'Party and Electoral Systems and Citizen Organizations' },
      { number: 5, name: 'Political and Economic Changes and Development' },
    ],
  },
]

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find(s => s.slug === slug)
}

export function getAllSubjects(): Subject[] {
  return SUBJECTS
}

const FORMULA_SUBJECT_SLUGS = new Set([
  'ap-calculus-ab',
  'ap-calculus-bc',
  'ap-precalculus',
])

export function getVocabLabel(slug: string): 'Vocab' | 'Formulas' {
  return FORMULA_SUBJECT_SLUGS.has(slug) ? 'Formulas' : 'Vocab'
}
