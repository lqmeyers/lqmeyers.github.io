// Add real project content here as you develop each project page.
// Each object maps to the route: /#/projects/:slug

export const projects = [
  {
    slug: 'honeybee-reid',
    title: 'Honeybee Re-Identification',
    shortDescription:
      'Fine-grained re-identification of paint-marked honey bees using vision foundation models and representation learning.',
    overview: '',       // TODO: fill in
    methodology: '',    // TODO: fill in
    findings: '',       // TODO: fill in
    images: ['/assets/beesuit.JPEG', '/assets/frame_4980.jpg'],
    publicationIds: [1, 4, 6, 7],
    links: [
      { label: 'Checkout Recent WACV Poster', url: 'https://drive.google.com/file/d/1hC06kSi5L2CS9yT6h0OCUQrXwCzdttzv/view?usp=sharing' },
    ],
  },
  {
    slug: 'camera-trap-hawaii',
    title: 'Hawaiian Cloud Forest Camera Traps',
    shortDescription:
      'Tracking phenological status and ecological interactions in a Hawaiian cloud forest understory using low-cost camera traps and visual foundation models.',
    overview: '',
    methodology: '',
    findings: '',
    images: ['/assets/iiwi_image.png'],
    publicationIds: [2],
  },
  {
    slug: 'bee-edge-computing',
    title: 'Edge Computing for Bee Monitoring',
    shortDescription:
      'Real-time edge inference pipelines for monitoring bee behavior and flower interactions in the field.',
    overview: '',
    methodology: '',
    findings: '',
    images: [],
    publicationIds: [5],
  },
]
