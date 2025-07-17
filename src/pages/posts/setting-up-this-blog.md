---
title: "How I setup this blog"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - development
date: "2021-10-29"
description: "A simple post for testing and so that I do not forget the steps for how I setup this blog."
---
## Quick summary

I setup this blog using Astro.build. I had to update my Node.js version because I was using version 10. I updated to version 14 by downloading the new repo from Nodesource for the pre-built binaries they have. After that, I cleared out my old Astro directory for this project and used `npm init astro` to setup the new project. I had to not use any of the templates, though, since they just used Preact by default, and I wanted to use Svelte. I installed the minimal template and added the Svelte renderer (`@astrojs/renderer-svelte`). I did have to add `@astrojs/renderere-svelte` to `renderers` in `astro.config.mjs`. I also installed TailwindCSS (`tailwindcss`) as a devDependency, created a `tailwind.config.js` file, and added the file in my `astro.config.mjs` file following Astro's docs on this. I did also have to create a `styles` directory, a `global.css` file, and a `home.css` file as documented in the Astro docs on using TailwindCSS.