OS X El Capitan brought yet another feature from iOS to desktop operation system called **Picture in Picture**. This thing
allows you to run movie in a separate overlay window, which is always on top. The user can resize and move it around, toggle
play/pause state of the video, and, of course, close it. I found it really useful for watching & listening some interesting
videos, like replays of conferences, while continue working with stuff.

Looks nice? Indeed. But there is one big limitation - you can open a video in PIP mode only from Safari. Not from Chrome or any
other browser. I'm heavy Chrome user, and when I want to open a movie - I'm being too lazy to launch Safari, open that page 
and searching for that button for switching to PIP mode. That's why I've decided to create a simple utility which will do that
for me. I've called it **PIPGrabber**.

![Screenshot of the PIPGrabber](https://pipgrabber.ribachenko.com/res/screenshot-1.png)

The main idea was to create a simple utility, which will open PIP mode for a video by providing its link. I've created it in a 
day and tried to keep it as simple as possible, but still have few ideas how to improve it. 
*Maybe you have something either? Share it with me!*

![Screenshot of PIP window](https://pipgrabber.ribachenko.com/res/screenshot-2.png)

The main window contains a text field, where you can put a link to the video and press that *Open PIP* button. There is also a 
menu in tray panel, which contains a menu item called *Grab from clipboard* - it is handy when you are watching youtube and want
it to open in PIP mode. Just copy it to the clipboard and click on that menu item. By they way, did I told you that 
**PIPGrabber** works with youtube? Just provide a link to any youtube video and it will be opened in PIP mode. Nice, huh?

This utility also has built-in auto updater, so when I will release a new version of it, you will get a message. 

I know, that there are a lot of similar tools in *Chrome Extension Store*, but they're using a browser for achieving PIP mode, 
which uses a lot of resources for displaying it. Why we just can't use the built-in stuff? Actually, even Apple not allowing to 
use this PIP mode to developers, and I'm really not sure why. But I've found on the Internet an article, where some dude found 
this PIP framework deeply inside system files and run it through utility, which extracts header files from it. They need for 
investigation of framework's API and, actually, for use in your project. It is really a question to Apple, why the feature, 
which was presented in the previous version of the operation system, still yet not available for developers?

Anyway, I've solved this issue for me and want to share a solution to you :)

You can **download & use it for free at** [https://pipgrabber.ribachenko.com/](https://pipgrabber.ribachenko.com/)

**P.S.** By the way, recently I've switched this blog and all other related services to **HTTPS** using *CertBot*, which is 
using *Let's Encrypt* for generating SSL certificates. It is super easy, and if you have not done this yet - you should definitely 
give it a try. I've constantly postponed SSL switch for months until I've decided to release **PIPGrabber**. The thing is, that I'm
using *Sparkle* framework for auto updates, and it requires *(not actually requires, but really wants me to do it)* an SSL for 
securing updates, because half a year ago, or maybe even more, there were an incidents with different software using this framework.
When users tried to do an auto update of software, which is hosted at a non-encrypted website, malware attacked their computers via 
*man-in-the-middle* attacks. You never know where danger can come from, so even because of a small utility, I've switched to SSL.
