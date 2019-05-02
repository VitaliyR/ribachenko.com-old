module.exports = (posts, places) => ({
  locals: {
    lang: 'en',
    baseUrl: 'https://ribachenko.com/',
    settings: {
      title: 'Vitaliy Ribachenko',
      description: 'Personal website with my thoughts and ideas',
      logo: '/res/logo.jpg',
      icon: '/res/favicon/favicon-32x32.png'
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
        url: 'https://www.linkedin.com/in/vitaliy-ribachenko-5b94bb4a'
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
    projects: [
      {
        title: 'Sprut',
        description: 'Taxi ordering service in Ukraine. Available for iOS and Android, '
          + 'and also there are separate apps for drivers',
        image: '/res/projects/sprut.png',
        href: 'http://sprut.mobi'
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
