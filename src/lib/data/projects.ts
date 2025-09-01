export type Project = {
  name: string;
  description: string;
  link: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    name: "Personal Website",
    description: "Minimalist website built with SvelteKit and TailwindCSS.",
    link: "https://ricardojose.com.br",
    featured: true,
  },
  {
    name: "Clock-in Helper",
    description: "Chrome extension to streamline hour logging on Beefor.",
    link: "https://github.com/your-username/clock-in-helper",
    featured: false,
  },
  {
    name: "Project Alpha",
    description: "A brief description of Project Alpha, highlighting its key features and technologies used.",
    link: "#",
    featured: true, // Assuming this is also featured
  },
  {
    name: "Project Beta",
    description: "A brief description of Project Beta, highlighting its key features and technologies used.",
    link: "#",
    featured: false,
  },
  {
    name: "Project Gamma",
    description: "A brief description of Project Gamma, highlighting its key features and technologies used.",
    link: "#",
    featured: false,
  },
];
