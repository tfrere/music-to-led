<!--

  # FOR V1

    FEATURES

    - Create a configuration file creator
    - - 3D Shape editor
    - - Testeur de midi et de audio

    FRONT

    - Beautiful gif for GUI
    - Fix cannot rename a state that is already taken
    - Change "audio channels" by their log frequency reference
    - Change "audio gain" by his real value
    OK - Change spectrograph by having bass at bottom
    - Fix AudioViz auto width sizeMe

    BACK

    - Piano note chunked has to be reverse / mirrorable
    - Rendre le spectrum et fire generique à color ?

    SERIAL TO LED
    - Windows handling
    - Packshot photo

 -->

<p align="center">
  <a href="https://github.com/tfrere/music-to-led" title="haxe.org"><img src="images/logo.svg" width="400"></a>
</p>
<p align="center">
<a href="https://github.com/tfrere/music-to-led#licence"><img src="https://img.shields.io/badge/licence-MIT-green" alt="Licence"></a>
<a href="https://github.com/tfrere/music-to-led"><img src="https://img.shields.io/badge/platform-osx--64%20%7C%20linux--64-lightgrey" alt="Platform support"></a>
<a href="https://github.com/tfrere/music-to-led"><img src="https://img.shields.io/github/last-commit/tfrere/music-to-led" alt="Last update"></a>
<a href="https://github.com/tfrere/music-to-led"><img src="https://img.shields.io/github/v/tag/tfrere/music-to-led" alt="Current version"></a>
</p>

#

**Music 2 Led** is an **open source program** that allows you to create **real-time audio and midi visualizations on led strips** using Arduino and Python. It was designed for **DJ**'s, **music groups** or **artists** who want to add some **automated lighting effects** to their shows.

All you need is a **computer** _( works on Raspi 4 )_, an **arduino** and a **ws2812b led strip**.

### Showcase

![showcase-abstract-one](images/showcase-grid.gif)

### How it works ?

![software-architecture](images/archi.png)

### What do i need to do to use it ?

1. [Install the program](#python-program)
2. [Build an arduino case](#arduino-part)
3. [Update the CONFIG.yml](#configuration)
4. [Setup your show with the effects and mods documentation](#effects---modes)
5. Enjoy !

# License

This project was developed by Thibaud FRERE and is released without any licence for the moment.
