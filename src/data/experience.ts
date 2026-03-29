export interface JobBlurb {
  title: string;
  description: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  dates: string;
  blurbs: JobBlurb[];
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

export const cvData = {
  name: 'Marty Cox',
  descriptors: ['Full stack developer', 'Problem solver', 'Mathematician'],
  statement:
    'TODO: update your personal statement here. I am a versatile and collaborative developer…',
  stats: [
    { label: 'Years experience', value: 5, suffix: '+' },
    { label: 'Projects delivered', value: 20, suffix: '+' },
  ] satisfies Stat[],
  jobs: [
    {
      id: 'aginic',
      company: 'AGINIC',
      role: 'Intern',
      dates: 'TODO',
      blurbs: [
        {
          title: 'TODO',
          description: 'Add project blurbs here.',
        },
      ],
    },
    {
      id: 'kpmg-intern',
      company: 'KPMG',
      role: 'Intern',
      dates: 'TODO',
      blurbs: [
        {
          title: 'TODO',
          description: 'Add project blurbs here.',
        },
      ],
    },
    {
      id: 'kpmg-ft',
      company: 'KPMG',
      role: 'TODO: update role title',
      dates: 'TODO',
      blurbs: [
        { title: 'TODO', description: 'Add project blurbs here.' },
        { title: 'TODO', description: 'Add another project here.' },
      ],
    },
  ] satisfies Job[],
  skills: [
    'React',
    'TypeScript',
    'Three.js',
    'GSAP',
    'Angular',
    '.NET',
    'Python',
    'SQL',
    'Java',
    'Figma',
    'Power BI',
    'Matlab',
  ],
  contact: {
    linkedin: 'https://www.linkedin.com/in/marty-cox-255887179',
    email: 'marty@marty99.com',
  },
};
