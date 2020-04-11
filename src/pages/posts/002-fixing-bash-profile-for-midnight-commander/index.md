---
title: Fixing bash profile for Midnight Commander
image: ./res/featured.png
featured: false
published: true
published_at: 2016-02-24T07:47:00.000+00:00
updated_at: 2016-02-24T07:47:00.000+00:00
tags:
    - name: IT
      slug: it
    - name: Bash
      slug: bash
---
**Midnight Commander** is yet still popular terminal file manager. It has classical 2-panes design, and you can send it to background 
using *Ctrl+O* shortcut and do your stuff in currently selected directory. Too bad, that your favourite aliases and other functions defined 
in bash_profile are missing here. That's because the MC sub-shell starts with different args/profiles passed to it.

To fix this problem you need just to point correct profile file to MC:

```bash line-numbers
ln -s ~/.profile ~/.local/share/mc/bashrc
```

Of course, you can just create there an empty file and create some MC specific aliases, if you really need it, but why? 

I'm dunno why there is still no kind of postinstall script which would do it automatically.
