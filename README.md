# PasteDat

PasteDat is a peer-to-peer gist-like tool. It uses the [Beaker browser's](https://beakerbrowser.com) [APIs](https://beakerbrowser.com/docs/apis/) to write files with the [Dat protocol](https://github.com/datproject/dat).

All file snippets created with PasteDat are hosted directly from your device and on a peer-to-peer network, and only people who know the secret URL can discover and download the files. [Learn more](https://beakerbrowser.com/docs/tutorials/share-files-secretly.html).

[Install Beaker](https://beakerbrowser.com/docs/install/), then try it out
at
`dat://b67dc95528a225086e4d0e8f0afce6e042796b1490999ee7fd9ca9d5c11bf48d`

![alt text](./demo.gif "PasteBin demo")

## Install

To install your own instance of PasteDat, download the source code with [git](https://git-scm.com/), build it using [npm](https://www.npmjs.com/), and then serve with dat:

```bash
git clone git@github.com:taravancil/paste-dat.git
cd paste-dat
npm install
npm run build
dat share
```

Then, visit the dat address and you should see the app running.
