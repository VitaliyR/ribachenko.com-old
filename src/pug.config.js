module.exports = (posts, places) => ({
  locals: {
    lang: 'en',
    baseUrl: 'https://ribachenko.com/',
    settings: {
      title: 'Vitaliy Ribachenko',
      description: 'Personal website with my thoughts and ideas',
      logo: '/res/logo.jpg',
      icon: '/res/favicon/favicon-32x32.png',
      birthday: new Date(1993, 10, 21),
      careerStartDate: new Date(2010, 10, 1)
    },
    socials: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/sa1en'
      },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/vitaliy.ribachenko'
      },
      {
        name: 'Github',
        url: 'https://github.com/vitaliyr'
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/vitaliy-ribachenko'
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/sa1en/'
      },
      {
        name: 'Email',
        url: 'mailto:vit@ribachenko.com'
      }
    ],
    contacts: [
      {
        name: 'email-stroke',
        url: 'mailto:vit@ribachenko.com',
        text: 'vit@ribachenko.com'
      },
      {
        name: 'home-stroke',
        url: `https://www.google.com/maps/search/?api=1&query=${places.home.lat},${places.home.lng}`,
        text: `${places.home.city}, ${places.home.country}`
      },
      {
        name: 'pin-stroke',
        url: `https://www.google.com/maps/search/?api=1&query=${places.current.lat},${places.current.lng}`,
        text: `${places.current.city}, ${places.current.country}`
      },
      {
        name: 'phone-stroke',
        url: 'tel:+380632886003',
        text: '+380 63 288 6003'
      },
      {
        name: 'telegram-stroke',
        url: 'https://telegram.me/salen',
        text: 'salen'
      },
      {
        name: 'skype-stroke',
        url: 'skype:salen08',
        text: 'salen08'
      },
      {
        name: 'github-stroke',
        url: 'https://github.com/vitaliyr',
        text: 'github.com/VitaliyR'
      },
      {
        name: 'linkedin-stroke',
        url: 'https://www.linkedin.com/in/vitaliy-ribachenko',
        text: 'salen.dev/linkedin'
      },
      {
        name: 'globe-stroke',
        url: 'https://ribachenko.com',
        text: 'ribachenko.com'
      },
      {
        name: 'globe-stroke',
        url: 'https://salen.dev',
        text: 'salen.dev'
      }
    ],
    languages: [
      {
        name: 'English',
        level: 'Fluent'
      },
      {
        name: 'Ukrainian',
        level: 'Native'
      },
      {
        name: 'Russian',
        level: 'Free'
      }
    ],
    projects: [
      {
        title: 'Sprut',
        description: 'Taxi ordering service in Ukraine. Available for iOS and Android, '
          + 'and also there are separate apps for drivers',
        image: '/res/projects/sprut.png',
        href: 'https://sprut.ua'
      },
      {
        title: 'Open source contributions',
        description: 'My open source contributions on Github',
        image: '/res/projects/github.png',
        imageDark: '/res/projects/github-dark.png',
        href: 'https://github.com/vitaliyr?tab=repositories'
      }
    ],
    posts,
    places
  }
});
