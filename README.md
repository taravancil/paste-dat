# PasteDat

PasteDat is a peer-to-peer gist-like tool. It uses the [Beaker browser's](https://beakerbrowser.com) [APIs](https://beakerbrowser.com/docs/apis/) to write files with the [Dat protocol](https://github.com/datproject/dat).

All file snippets created with PasteDat are hosted directly from your device and on a peer-to-peer network, and only people who know the secret URL can discover and download the files. [Learn more](https://beakerbrowser.com/docs/tutorials/share-files-secretly.html).

[Install Beaker](https://beakerbrowser.com/docs/install/), then try it out
at
`dat://b67dc95528a225086e4d0e8f0afce6e042796b1490999ee7fd9ca9d5c11bf48d`

![alt text](./demo.gif "PasteBin demo")

## Install

### With Beaker

Download the [Beaker browser](https://beakerbrowser.com/docs/install/), then open PasteDat at  `dat://b67dc95528a225086e4d0e8f0afce6e042796b1490999ee7fd9ca9d5c11bf48d`. To enable PasteDat while you're offline, save it to your Library in Beaker. 

To create your own instance of PasteDat, clone the source, build it with [npm](https://www.npmjs.com/), and then serve with the [Dat CLI](https://github.com/datproject/dat/):

```bash
git clone git@github.com:taravancil/paste-dat.git
cd paste-dat
npm install
npm run build
dat share
```

Finally, open the the Dat URL in [Beaker](https://beakerbrowser.com).
