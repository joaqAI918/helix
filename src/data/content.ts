// All copy for the page. Helix Orbital is fictional; every name, figure and date below is sample content.

const A = '/assets/';

export const photos = {
  sunrise: {
    src: A + 'an-orbital-sunrise-iss071e001425.webp',
    w: 1920,
    h: 1280,
    alt: 'The Sun breaking over the thin blue line of Earth’s atmosphere, seen from orbit',
  },
  sunriseOcean: {
    src: A + 'iss-65-orbital-sunrise-above-the-indian.webp',
    w: 1920,
    h: 1280,
    alt: 'An orbital sunrise above the Indian Ocean, seen from the International Space Station',
  },
  aurora: {
    src: A + 'iss072e147641-nov-9-2024-a-green-and.webp',
    w: 1920,
    h: 1280,
    alt: 'A green and red aurora curving along Earth’s horizon under star trails',
  },
  auroraSouth: {
    src: A + 'aurora-australis-from-iss.webp',
    w: 1600,
    h: 1065,
    alt: 'The southern aurora glowing green over the night side of Earth',
  },
  limb: {
    src: A + 'iss-51-moon-earth-s-limb-and.webp',
    w: 1920,
    h: 1278,
    alt: 'The Moon above the thin blue layer of Earth’s atmosphere',
  },
  cityNight: {
    src: A + 'melbourne-at-night-from-the-international-space.webp',
    w: 1920,
    h: 1278,
    alt: 'The grid of a city’s lights at night, seen from orbit',
  },
  launch: {
    src: A + 'kepler-mission-delta-ii-liftoff.webp',
    w: 1200,
    h: 1855,
    alt: 'A rocket lifting off its pad at night on a column of flame and smoke',
  },
  launchNight: {
    src: A + 'a-tiros-night-launch-on-a-thor.webp',
    w: 1000,
    h: 1507,
    alt: 'An archival black-and-white photograph of a rocket launching at night',
  },
} as const;

export const nav = [
  { label: 'The craft', href: '#craft' },
  { label: 'Orbits', href: '#orbits' },
  { label: 'Crew', href: '#crew' },
  { label: 'Season', href: '#season' },
];

export const hero = {
  title: 'Helix Orbital',
  sentence:
    'A zero-gravity racing team. Every race is one lap of Earth: 92 minutes, one sunrise and no brakes. Season 2089 opens 14 March at Tycho Ring.',
  action: 'Get race passes',
};

// The hero's scroll flies one lap. Each phase owns a stretch of the 92 minutes, its own footage from
// the space station and a band colour (a palette token, resolved to its value when the lap is built).
// The clips are cut from NASA footage at 1080p; looping ones crossfade their end into their start.
export type Phase = {
  name: string;
  from: number;
  to: number;
  text: string;
  band: string;
  ink: string;
  clip: { src: string; poster: string; loop: boolean };
};

export const lap: Phase[] = [
  {
    name: 'Night side',
    from: 0,
    to: 22,
    text: 'The lap starts in Earth’s shadow: 36 minutes with no sun, steering by the cities below.', // taste-skill-ignore
    band: '--surface',
    ink: '--ink',
    clip: { src: A + 'lap-night.mp4', poster: A + 'lap-night.webp', loop: true },
  },
  {
    name: 'Aurora',
    from: 22,
    to: 36,
    text: 'Over the high latitudes the sky turns green, and the field runs at its tightest.',
    band: '--field-1',
    ink: '--ink-black',
    clip: { src: A + 'lap-aurora.mp4', poster: A + 'lap-aurora.webp', loop: true },
  },
  {
    name: 'Sunrise',
    from: 36,
    to: 40,
    text: 'Four minutes of sunrise. Most races are decided by the burn fired here.',
    band: '--field-4',
    ink: '--ink-black',
    // Plays once and holds on the flare, the way a sunrise only happens once a lap.
    clip: { src: A + 'lap-sunrise.mp4', poster: A + 'lap-sunrise.webp', loop: false },
  },
  {
    name: 'Day side',
    from: 40,
    to: 92,
    text: 'Fifty-two minutes of daylight to defend a place, then one sunset to the line.',
    band: '--field-5',
    ink: '--ink-black',
    clip: { src: A + 'lap-day.mp4', poster: A + 'lap-day.webp', loop: true },
  },
];

export const intro = {
  slogan: ['No brakes.', 'Only burns.'],
  figure: '92 min',
  photo: photos.launch,
  caption: 'Every race leaves the gate together. Pictured: the Kepler mission’s Delta II leaving Cape Canaveral, 2009.',
  text: 'An orbital race has no corners and no brake pedal. Twelve craft leave the gate at Tycho Ring together, and one lap of Earth later the first one back wins. The only controls are burns. Fire your engine forward and you climb to a higher, slower orbit; fire it backwards and you drop, and speed up. To pass the craft ahead, you slow down. Every pilot carries the same 400 kilograms of xenon, so each burn trades a place now for a place at the line. Races start in Earth’s shadow and cross one sunrise. The pilot who reads that sunrise best usually wins.', // taste-skill-ignore
};

export type PartId = 'hull' | 'drive' | 'radiators' | 'cockpit' | 'tank';

export const craft = {
  heading: 'The HX-07',
  // The disc behind the craft: black space, with a candy disc on the two views where the orange hull
  // needs a cooler ground.
  parts: [
    {
      id: 'hull' as PartId,
      name: 'Hull',
      disc: 'var(--ink-black)',
      fact: '11.4 metres of carbon-boron lattice, 2.9 tonnes dry, painted sunrise orange so marshals can find it on the night side.',
    },
    {
      id: 'drive' as PartId,
      name: 'Ion drive',
      disc: 'var(--field-5)',
      fact: 'Twin gridded thrusters at 1.2 newtons each. Weak, but they never stop: a race-long burn adds 2.1 km/s.',
    },
    {
      id: 'radiators' as PartId,
      name: 'Radiators',
      disc: 'var(--ink-black)',
      fact: 'The swept wings are radiators: they shed 38 kW of engine heat into the dark on every lap.',
    },
    {
      id: 'cockpit' as PartId,
      name: 'Cockpit',
      disc: 'var(--field-1)',
      fact: 'One seat under a tinted canopy, with every burn plan for the race loaded before the gate opens.',
    },
    {
      id: 'tank' as PartId,
      name: 'Xenon tank',
      disc: 'var(--ink-black)',
      fact: 'Two belly pods carry 400 kilograms of xenon, the regulation limit. A good lap ends with less than three left.',
    },
  ],
};

export const stats = {
  claim: 'Lap speed at Round 4',
  figure: '7.8',
  unit: 'km/s',
  caption:
    'Mean speed of HX-07 across the 92-minute lap at Round 4 of the 2088 season, timed gate to gate by Tycho Ring traffic control.',
  source: 'Sample figure for a fictional team',
};

export const orbits = {
  headline: ['Eight orbits,', 'one helix'],
  sentence: 'Each round flies a different orbit, from the polar sprint over both auroras to the slingshot round the Moon.',
  prints: [photos.aurora, photos.limb, photos.launchNight],
};

export const crew = {
  heading: 'The crew',
  // Portraits are faces generated by StyleGAN2 (thispersondoesnotexist.com): people who do not exist.
  people: [
    { name: 'Noor Halvorsen', role: 'Pilot, car 07', photo: A + 'crew/noor.webp' },
    { name: 'Kofi Mensah', role: 'Reserve pilot', photo: A + 'crew/kofi.webp' },
    { name: 'Mei Okada', role: 'Flight director', photo: A + 'crew/mei.webp' },
    { name: 'Henrik Sauer', role: 'Team principal', photo: A + 'crew/henrik.webp' },
    { name: 'Tomás Achterberg', role: 'Orbital dynamics', photo: A + 'crew/tomas.webp' },
    { name: 'Saskia Brand', role: 'Propulsion chief', photo: A + 'crew/saskia.webp' },
    { name: 'Lucía Ferreira', role: 'Radiator and thermal', photo: A + 'crew/lucia.webp' },
    { name: 'Callum Reid', role: 'Gate and recovery', photo: A + 'crew/callum.webp' },
  ],
};

export const season = {
  heading: 'Season 2089',
  count: '8 rounds',
  rounds: [
    { name: 'Equatorial Sprint', orbit: 'Low orbit, 0°', date: '14 Mar', photo: photos.cityNight },
    { name: 'Polar Run', orbit: 'Over both poles, 90°', date: '11 Apr', photo: photos.auroraSouth },
    { name: 'Terminator Dash', orbit: 'Dawn to dusk', date: '9 May', photo: photos.sunriseOcean },
    { name: 'Aurora Loop', orbit: 'High latitude, 72°', date: '6 Jun', photo: photos.aurora },
    { name: 'Molniya Climb', orbit: 'Long ellipse, 63.4°', date: '18 Jul', photo: photos.limb },
    { name: 'Gate Start Classic', orbit: 'From the pad to orbit', date: '29 Aug', photo: photos.launch },
    { name: 'Lunar Slingshot', orbit: 'Earth to Moon and back', date: '3 Oct', photo: photos.launchNight },
    { name: 'Tycho Final', orbit: 'Low orbit, one sunrise', date: '21 Nov', photo: photos.sunrise },
  ].map((r) => ({ ...r, thumb: r.photo.src.replace(A, A + 'thumbs/') })),
};

export const contact = {
  rows: [
    { text: 'Tycho Ring, Dock 4' },
    { text: 'Earth–Moon point L4', href: '#orbits' },
    { text: 'Gate open 06:00 UTC' },
    { text: 'Every 92 minutes' },
    { text: 'Hail channel 07' },
  ],
  greeting: 'Hail us',
  mail:
    'mailto:passes@helix-orbital.example?subject=Race%20passes%2C%20season%202089&body=Hello%20Helix%20Orbital%2C%0A%0AI%27d%20like%20passes%20for%20round%3A%20%0ANumber%20of%20seats%3A%20%0A',
};

export const footer = {
  word: 'HELIX',
  columns: [
    [
      { label: 'The craft', href: '#craft' },
      { label: 'Orbits', href: '#orbits' },
      { label: 'Crew', href: '#crew' },
      { label: 'Season 2089', href: '#season' },
    ],
    [
      { label: 'Race passes', href: '#contact' },
      { label: 'Press kit', href: '#contact' },
      { label: 'Partners', href: '#contact' },
      { label: 'Careers', href: '#contact' },
    ],
  ],
  lines: ['Tycho Ring, Dock 4, Earth–Moon L4', 'passes@helix-orbital.example'],
};

// Every found picture and clip, with its source page. All public domain or CC0. The share image
// (public/og-image.jpg) is a 1200×630 crop of the first one.
const CC = 'https://commons.wikimedia.org/wiki/File:';
export const credits = [
  { title: 'An orbital sunrise', by: 'NASA Johnson Space Center', href: CC + 'An_orbital_sunrise_(iss071e001425).jpg' },
  { title: 'Orbital sunrise above the Indian Ocean', by: 'NASA', href: CC + 'ISS-65_Orbital_sunrise_above_the_Indian_Ocean.jpg' },
  {
    title: 'A green and red aurora',
    by: 'NASA Johnson Space Center',
    href: CC + 'Iss072e147641_(Nov_9,_2024)_--_A_green_and_red_aurora_streaks_through_Earth%27s_atmosphere_as_the_International_Space_Station_orbited_258_miles_above_Winnipeg.jpg',
  },
  { title: 'Aurora Australis from ISS', by: 'ISS Expedition 23 crew', href: CC + 'Aurora_Australis_From_ISS.JPG' },
  { title: 'Moon, Earth’s limb and the thin blue atmosphere', by: 'NASA', href: CC + 'ISS-51_Moon,_Earth%27s_limb_and_the_thin_blue_atmosphere.jpg' },
  { title: 'Melbourne at night from the ISS', by: 'European Space Agency (CC0)', href: CC + 'Melbourne_at_night_from_the_International_Space_Station.jpg' },
  { title: 'Kepler mission Delta II liftoff', by: 'NASA/Regina Mitchell-Ryall, Tom Farrar', href: CC + 'Kepler_mission_Delta_II_liftoff.jpg' },
  { title: 'A TIROS night launch on a Thor-Delta rocket', by: 'NOAA', href: CC + 'A_TIROS_night_launch_on_a_Thor-Delta_rocket_(2277-25).jpg' },
  { title: 'Ocean Moon Glint and City Night Lights (footage)', by: 'NASA', href: CC + 'Ocean_Moon_Glint_and_City_Night_Lights_in_4K.webm' },
  { title: 'Aurora Borealis from Space, 4K (footage)', by: 'NASA', href: CC + 'Aurora_Borealis_from_Space_(4K).webm' },
  {
    title: 'Ultra High Definition Video from the International Space Station, Reel 1 (footage)',
    by: 'NASA',
    href: CC + 'Ultra_High_Definition_Video_from_the_International_Space_Station_(Reel_1).webm',
  },
  { title: 'View of Planet Earth, 4K (footage)', by: 'NASA', href: CC + 'View_of_Planet_Earth_(4K).webm' },
];

// Everything on the page that is not a photograph or clip from the open collections.
export const otherCredits = [
  { text: 'The HX-07 is “Jet” by jeremy (CC BY 3.0), repainted, via Poly Pizza.', href: 'https://poly.pizza/m/6fyLMORhgGK' },
  {
    text: 'Crew portraits are faces generated by StyleGAN2 (Karras et al.) via thispersondoesnotexist.com: these people do not exist. Non-commercial use only.',
    href: 'https://thispersondoesnotexist.com/',
  },
];
