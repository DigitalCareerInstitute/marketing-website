``;
exports.menulocations = [
  {
    name: "header"
  },
  {
    name: "footer"
  }
];

exports.adminUser = {
  email: "admin@example.com",
  username: "admin",
  admin: true,
  password: "$2a$10$.D.ObRTjFkv4X0zyLCOE3ui9FKU1GveILRgvhQMWlIl2q3jbgnNoi", //password
  verifiedAt: new Date()
};

exports.partners = [
  {
    title: "Sofatutor",
    link: "http://duckduckgo.com",
    partnerlogo: "example_image_1.jpg",
    order: 1
  },
  {
    title: "Trivago",
    link: "http://duckduckgo.com",
    partnerlogo: "example_image_2.jpg",
    order: 2
  },
  {
    title: "ebay",
    link: "http://duckduckgo.com",
    partnerlogo: "example_image_3.jpg",
    order: 3
  }
];
exports.employees = [
  {
    name: "Dr. Steffen Zoller",
    position: "Co-Founder",
    avatar: "example_image_1.jpg",
    content:
      "Steffen loves digital, serial entrepreneur in the digital scene. Among others, he co-founded Care.com. He studied business and is an entrepreneur by heart. Currently, he serves as well as Managing Director at kununu.com - European’s leading employer rating platform."
  },
  {
    name: "Carl Neuberger",
    position: "Administration",
    avatar: "example_image_2.jpg",
    content: "Lorem ipsum dolor sit amed"
  },
  {
    name: "Laura Pietryga",
    position: "Educational counselling",
    avatar: "example_image_3.jpg",
    content: "Lorem ipsum dolor sit amed"
  }
];
exports.pages = [
  {
    title: "Devugees",
    content: `The Digital Career Institute operates the Devugees training program for refugees who are interested in technical qualifications for the German job market. We are convinced that Devugees will help integrate refugees more effectively into German society. In our opinion, education is the most important key to a successful life anywhere.

`,
    order: 0
  },
  {
    title: "Jobcenter/AA",
    content: {
      ops: [
        { insert: "DCI Digital Career Institute gGmbH" },
        { attributes: { header: 1 }, insert: "\n" },
        {
          attributes: { height: "150", width: "150" },
          insert: {
            image:
              "https://www.digitalcareerinstitute.org/wp-content/uploads/2017/04/AZAV_schwarz-wei%C3%9F-ICG-300x274-1-150x150.png"
          }
        },
        { attributes: { header: 1 }, insert: "\n" },
        {
          insert:
            "\nZugelassener Träger für die Förderung der Beruflichen Weiterbildung nach dem Recht der Arbeitsförderung.\n \nMaßnahmen"
        },
        { attributes: { header: 2 }, insert: "\n" },
        { insert: "\nERPROBUNGSCENTER DIGITALE BERUFE\n" },
        {
          attributes: { bold: true },
          insert: "Berlin Maßnahmenummer:      922/0108/16"
        },
        { insert: "\n" },
        {
          attributes: { bold: true },
          insert: "Düsseldorf Maßnahmenummer:  337/31/17"
        },
        { insert: "\n" },
        {
          attributes: { bold: true },
          insert: "Hamburg Maßnahmenummer:   123/7195/18"
        },
        {
          insert:
            "\n \nDauer: 4 Wochen Vollzeit (160 UE)\n \nDiese Aktivierungs- und Vermittlungsmaßnahme nach §45 Abs. 1 Satz 1 Nr. 2 SGB III soll einen Einblick in den Bereich der digitalen Berufe gewähren. Hierbei ist die individuelle Betreuung und Förderung der Teilnehmer sowie der direkte Kontakt und Dialog mit Unternehmen maßgeblich. Um einen transparenten Eindruck der digitalen Arbeitswelt zu vermitteln, stehen unter anderem verschiedene, außergewöhnliche Exkursionen zu regionalen IT-Firmen im Fokus. Dadurch soll das persönliche Engagement und Leistungsbestreben der Teilnehmer gesteigert werden. Die praktischen und theoretischen Vermittlungseinheiten werden durch verschiedene Lehrkräfte und Dozenten aus regionalen ITUnternehmen realisiert. Bei Bedarf erhalten diese Unterstützung von einem Dolmetscher (Arabisch und Farsi), um sprachliche Barrieren abzubauen. Unsere Analyse der Teilnehmer arbeitet ihr Potential heraus, sodass aufbauend auf ihrem Persönlichkeitsprofil eine individuelle Selbstvermarktungs- und Bewerbungsstrategie entworfen werden kann.\n \n \nDIE WEITERBILDUNG ZUM WEB-PROGRAMMIERER (W/M)"
        },
        { attributes: { list: "bullet" }, insert: "\n" },
        {
          attributes: { bold: true },
          insert: "Berlin Maßnahmenummer:      922/0360/16"
        },
        { insert: "\n" },
        {
          attributes: { bold: true },
          insert: "Düsseldorf Maßnahmenummer:  337/1314/17"
        },
        {
          insert:
            "\n \nUnsere Weiterbildung nach §81 SGB III ist modular aufgebaut und dauert maximal 13 Monate. Die Anzahl der Module richtet sich nach der persönlichen Vorerfahrung, sodass sich bei entsprechenden Vorkenntnissen die Ausbildungsdauer verkürzt. Die Module umfassen Grundlagen, Frontend-, Backend- und Datenbank-Entwicklung sowie QuellcodeVerwaltung, Entwicklungsverfahren und Projektmanagement.\nHaben Sie noch Fragen?\n\nIch erkläre mich mit der Speicherung meiner Daten einverstanden und stimme zu, den Newsletter zu erhalten.\nIch habe die "
        },
        {
          attributes: {
            color: "#007aff",
            link: "https://www.digitalcareerinstitute.org/datenschutz/"
          },
          insert: "Datenschutzerklärung"
        },
        {
          insert:
            '\ngelesen und akzeptiere sie."]\nSenden\n \nDCI Digital Career Institute gGmbH (Devugees)\nGrünberger Str. 54, 10245 Berlin\nTel.: +49 30 – 364286190\ninfo@devugees.org\nGeschäftsführer: Steffen Zoller\nEingetragen: Amtsgericht Berlin Charlottenburg HRB 177854 B\nBankinstitute: Deutsche Bank\nIBAN: DE88 8607 0024 0314 9507 00\nSWIFT-BIC: DEUTDEDBLEG\n'
        }
      ]
    },
    order: 1
  },
  {
    title: "Support us",
    content: {
      ops: [
        { insert: "At Digital Career Institute you learn the most relevant technology skills of today from Web Development, Digital Marketing, Product Management to Data.\n\nWe train and provide the necessary hardware and digital learning aids as well as a relevant mentoring and buddy system needed to get the digital skills of today’s age.\n" },
      ]
    },
    order: 2
  },
  {
    title: "Become a buddy",
    content: {
      ops: [
        {
          insert:
            "Digital Career Institute doesn’t only qualify refugees but also helps to integrate them. To keep ambitions and motivation of the participants high, we want to place a spiritual coach, a buddy, at their sides – you!\n"
        },
        { attributes: { bold: true }, insert: "Become a buddy" },
        {
          insert:
            "\nBecome part of the integration process. Take them by the hand. Light their path and keep them focused on their goals.\n"
        },
        { attributes: { bold: true }, insert: "What you bring with you" },
        {
          insert:
            "\nSome practical experience in one or more of the following technologies or programming languages:\nHTML"
        },
        { attributes: { list: "bullet" }, insert: "\n" },
        { insert: "CSS" },
        { attributes: { list: "bullet" }, insert: "\n" },
        { insert: "Bootstrap" },
        { attributes: { list: "bullet" }, insert: "\n" },
        { insert: "jQuery" },
        { attributes: { list: "bullet" }, insert: "\n" },
        { insert: "Ruby on Rails" },
        { attributes: { list: "bullet" }, insert: "\n" },
        { insert: "Javascript" },
        { attributes: { list: "bullet" }, insert: "\n" },
        {
          insert:
            "Regardless of how much time you can commit, we are happy about everyone who can support our participants technically. Whether as a regular available buddy or hourly for questions in between.\n"
        }
      ]
    },
    order: 3
  },
  {
    title: "Teach at DCI",
    content: {
      ops: [
        { insert: "Become an Instructor" },
        { attributes: { header: 2 }, insert: "\n" },
        { insert: "EMPOWER PEOPLE TO PURSUE THE DIGITAL CAREERS THEY LOVE." },
        { attributes: { header: 6 }, insert: "\n" },
        { insert: "Teach when you want" },
        { attributes: { header: 3 }, insert: "\n" },
        { insert: "FULL-TIME" },
        { attributes: { header: 5 }, insert: "\n" },
        {
          insert:
            "Join a talented team of instructors that teach daily.\nPART-TIME"
        },
        { attributes: { header: 5 }, insert: "\n" },
        { insert: "Lead a multi-week course.\nIN YOUR SPARE-TIME" },
        { attributes: { header: 5 }, insert: "\n" },
        {
          insert:
            "Share your knowledge in a class or workshop whenever it fits your schedule.\n \n"
        },
        {
          attributes: {
            color: "#007aff",
            link: "https://dci-jobs.personio.de"
          },
          insert: "Check out our open Positions"
        },
        { insert: "\n" }
      ]
    },
    order: 3
  }
];

exports.stories = [
  {
    title: "Voluptatem sunt similique non ",
    subtitle: "Daniela",
    workPosition: "Ikea, Full-Stack Developer",
    excerpt:
      "Daniela is one of our best students and an important part of the student community here at DCI campus.",
    content:
      "The story of Jenny which has a super cool job as a Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum. Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum. Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.",
    order: 1,
    avatar: "example_image_1.jpg",
    companylogo: "example_image_2.jpg"
  },
  {
    title: "Volsggdsg sytyt sgfdhgfhgjg ",
    subtitle: "Jürgen",
    workPosition: "Zalando, Full-Stack Developer",
    excerpt:
      "Jürgen recently landed a job as a Junior Front-End Engineer at streaming provider Loots here in Berlin.",
    content:
      "Back in the days she was a bit introvert but now she can handle a lot of strange situations with her colleagues without any problem. Talking in front of many people Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum. Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum. Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.",
    order: 2,
    avatar: "example_image_3.jpg",
    companylogo: "example_image_2.jpg"
  },
  {
    title:
      "Qui mollt itia sit animi quisquam et nostrud consequatur Facilis dignissimo",
    subtitle: "Manny",
    workPosition: "Amazon, Front-end Developer",
    excerpt:
      "Manny recently landed a job as a Junior Full-Stack Engineer at streaming provider Loots here in Berlin.",
    content:
      "Stuart bit introvert but now she can handle a lot of strange situations with her colleagues without any problem. Talking in front of many people Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum. Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum. Porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.",
    order: 3,
    avatar: "example_image_3.jpg",
    companylogo: "example_image_2.jpg"
  }
];

exports.courses = [
  {
    headline: "Digital Marketing / E-Commerce",
    order: 2,
    icon: "example_image_1.jpg",
    subheading: "Write here something...",
    title:
      "Take 4 weeks to find out what digital jobs suits you best by visiting the best tech companies and learning the basics.",
    subtitle:
      "Take special one to one 40 hours of coaching to find out what digital jobs suits you best. We learn hands-on from people working in the tech scene",
    archivements: [
      {
        icon: "example_image_1.jpg",
        description: "Write here something..."
      },
      {
        icon: "example_image_2.jpg",
        description: "Write here something..."
      },
      {
        icon: "example_image_3.jpg",
        description: "Write here something..."
      }
    ],
    features: [
      {
        title: "Write here something...",
        subtitle: "Write here something...",
        icon: "example_image_3.jpg"
      },
      {
        title: "Write here something...",
        subtitle: "Write here something...",
        icon: "example_image_3.jpg"
      },
      {
        title: "Write here something...",
        subtitle: "Write here something...",
        icon: "example_image_3.jpg"
      },
      {
        title: "Write here something...",
        subtitle: "Write here something...",
        icon: "example_image_3.jpg"
      }
    ],
    timeline: [
      {
        title: "Coffee & Code",
        subtitle: "Self paced learning session",
        time: "09:00"
      },
      {
        title: "Lesson",
        subtitle: "Teacher summary + Group discussion + Quick test",
        time: "10:30"
      },
      {
        title: "Lunch & Buddy Meetupe",
        subtitle: "Lunch, buddy lunch once a week",
        time: "12:00"
      },
      {
        title: "Project Work",
        subtitle:
          "Work on assignments to develop practical skills in a structured and supportive environment",
        time: "12:30"
      },
      {
        title: "Language Course",
        subtitle:
          "Learn and improve your German and English with Expert instructors",
        time: "16:00"
      }
    ]
  },
  {
    headline: "Orientation Course",
    order: 1,
    icon: "example_image_2.jpg",
    subheading: "Find out what tech job are you passionate about",
    title:
      "In this immersive 12 month course you will acquire the skills to become a job-ready Full stake developer.   ",
    subtitle:
      "Take 4 weeks and find out which digital jobs suits you best. We visit the best tech companies and learn hands-on from people working there.",
    archivements: [
      {
        icon: "example_image_1.jpg",
        description: "Introduction to Tech"
      },
      {
        icon: "example_image_2.jpg",
        description: "Company Tours"
      },
      {
        icon: "example_image_3.jpg",
        description: "Soft Skills"
      }
    ],
    features: [
      {
        title: "Technical Introduction",
        subtitle: "Internet, Browser, Coding Languages and Web Development",
        icon: "example_image_3.jpg"
      },
      {
        title: "Soft skills",
        subtitle:
          "Discover and Measure one’s Personality, Behaviour as Employee and Teamwork",
        icon: "example_image_3.jpg"
      },
      {
        title: "Company Tours",
        subtitle:
          "Take a tour of a local startup and see what the work environment is all about",
        icon: "example_image_3.jpg"
      },
      {
        title: "Find your passion",
        subtitle:
          "Figure out which career path you want to take to achieve your dreams",
        icon: "example_image_3.jpg"
      }
    ],
    timeline: [
      {
        title: "Coffee & Code",
        subtitle: "Self paced learning session",
        time: "09:00"
      },
      {
        title: "Lesson",
        subtitle: "Teacher summary + Group discussion + Quick test",
        time: "10:00"
      },
      {
        title: "Lunch & Buddy Meetupe",
        subtitle: "Lunch, buddy lunch once a week",
        time: "13:00"
      },
      {
        title: "Project Work",
        subtitle:
          "Work on assignments to develop practical skills in a structured and supportive environment",
        time: "14:00"
      },
      {
        title: "Office Hours & Homework",
        subtitle:
          "Get one to one time with instructors. Students often stay late to work together and solve problems before heading home. Make the most of your 9 months!",
        time: "17:00"
      }
    ]
  },
  {
    headline: "Web Development Course",
    order: 3,
    icon: "example_image_3.jpg",
    subheading: "Become a web developer in 12 months",
    title: "Start Your Career in Web Development",
    subtitle:
      "Want to become a professional web developer? This is how it’s done. In this intensive, fully immersive 12-months course with 11-months of learning and 3-months internship, we’ll teach you everything you need to know to unlock your spot in one of the fastest-growing industries.",
    archivements: [
      {
        icon: "example_image_1.jpg",
        description: "Learn from professional developers"
      },
      {
        icon: "example_image_2.jpg",
        description: "Develop your own project"
      },
      {
        icon: "example_image_3.jpg",
        description: "Ongoing career placement support"
      }
    ],
    features: [
      {
        title: "Programming basics",
        subtitle:
          "Learn the core skills of development – a beginner-friendly stack HTML, CSS and JavaScript",
        icon:
          "https://digitalcarlearnedeerinstitute.org/wp-content/uploads/2017/04/javascript-hand-drawn-file.png"
      },
      {
        title: "Specialisation",
        subtitle:
          "Specialise in technologies like Angular, Node.js and Databases",
        icon: "example_image_1.jpg"
      },
      {
        title: "Team Work in Development",
        subtitle: "Learn to work on a project with other developers",
        icon: "example_image_2.jpg"
      },
      {
        title: "Project Management",
        subtitle: "Learn agile project management and tools like scrum",
        icon: "example_image_3.jpg"
      },
      {
        title: "Internship",
        subtitle:
          "your steps into the job, do an internship in a tech company to apply what you have learned",
        icon: "example_image_3.jpg"
      }
    ],
    timeline: [
      {
        title: "Coffee & Code",
        subtitle: "Self paced learning session",
        time: "09:00"
      },
      {
        title: "Lesson",
        subtitle: "Teacher summary + Group discussion + Quick test",
        time: "10:30"
      },
      {
        title: "Lunch & Buddy Meetupe",
        subtitle: "Lunch, buddy lunch once a week",
        time: "12:00"
      },
      {
        title: "Project Work",
        subtitle:
          "Work on assignments to develop practical skills in a structured and supportive environment",
        time: "12:30"
      },
      {
        title: "Language Course",
        subtitle:
          "Learn and improve your German and English with Expert instructors",
        time: "16:00"
      }
    ]
  }
];

const date = new Date().getTime();
exports.contacts = [
  {
    name: "Brian Willson",
    email: "fijiwypoh@mailinator.net",
    phone: "01741832134231",
    body:
      "Fugit quia excepteur ipsam anim molestiae est elit animi ut ad est ut",
    createdAt: new Date(date - 86400000).toISOString(),
    updatedAt: new Date()
  },
  {
    name: "Jasper Wynn",
    email: "blablu@gmail.com",
    phone: "01741832134231",
    body:
      "Fugit quia excepteur ipsam anim molestiae est elit animi ut ad est ut",
    createdAt: new Date(date - 86400000).toISOString(),
    updatedAt: new Date()
  },
  {
    name: "Sonia Romero",
    email: "fritz@gmx.com",
    phone: "01741832134231",
    body:
      "Quidem dolorum ex qui quis rerum culpa laboriosam doloremque excepturi voluptatum blanditiis cum",
    createdAt: new Date(date - 86400000).toISOString(),
    updatedAt: new Date()
  }
];
