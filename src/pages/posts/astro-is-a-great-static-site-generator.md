---
title: "Astro Is a Great Static Site Generator"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - development
date: "2021-11-17"
description: "Astro is a relatively new static site generator with compelling features and an exciting new approach. This site uses Astro and Svelte components to build a simple blog. Learn about how Astro is a terrific solution for those who need a static site generator."
---

## What Is Astro?
[Astro](https://astro.build/) is a static site generator from the makers of Snowpack, the popular, newer-generation JavaScript web bundler. Astro generates completely static HTML and CSS (with optional JavaScript) from templates written in Astro's own syntax and using popular front-end component libraries like React, Vue, and Svelte.

## Why Astro for Me?
For me, I really wanted a static site generator that let me use Svelte for my templates. I really like Svelte's approach to minimizing the JavaScript that is delivered to the end-user's browser. Incidentally, Astro also aims to minimize the amount of JavaScript delivered to visitors' browsers. Astro's philosophy also centers around the ["islands of interactivity" concept](https://jasonformat.com/islands-architecture/), which emphasizes rendering static content using HTML and treating dynamic parts of web pages as self-contained applications that load their data on the client side. This differs from applications written entirely in JavaScript that load in the user's browser and then dynamically generate the full page.

## How Astro Works Briefly
Astro uses components for its page templates. Astro has its own syntax for writing Astro components, but you can write components using React, Preact, Vue, or Svelte at this time. You do have to use Astro components for your page templates, however. Your components written using other libraries have to be embedded inside of Astro components.\
\
For routing, Astro has support for file-based routes and for dynamically generating routes using data you pull into Astro. For static routing, Astro files (ending in .astro) and Markdown files are treated as pages.\
\
You can actually define layouts and other information for your Markdown files inside of your Markdown files. Astro's Markdown files use frontmatter to add additional information to your Markdown.\
\
When you generate your site with Astro, you get a site that is completely static HTML and CSS. There is no JavaScript unless you specifically tell Astro to hydrate the component with JavaScript.


## Astro Is Changing Constantly
One thing to watch out for with Astro is that it is still in very active development. Since I first started working with Astro earlier this year, entire APIs have been dropped or reworked, and I have had to rewrite code after breaking changes.\
\
Seeing so much development is great! It means the tool has a really healthy community, and Astro will continue to receive support, fixes, and new features.

## Using Astro to Build Is Enjoyable
Overall, I have had a great time using Astro. The Astro syntax is relatively straightforward, and it is not too difficult to make Astro do what you need to do. Having the option of using a component library in page templates is great, especially for the instances where I needed to push data into a Svelte component for processing because Astro and Snowpack had issues building a static site.\
\
Routing is very straightforward. I have primarily used just static routing so far, but dynamic routing seems straightforward according to my testing.\
\
Sites that you create using Astro have great performance out of the box since they are static web sites. This site you are reading this post on loads well and also has good scores for Core Web Vitals and other assessments that test the load time, meaningful paint, and other performance indicators.\
\
I can strongly recommend Astro, especially if you want the performance and simplicity of a static website with some JavaScript mixed in for dynamic functionality. It is a pleasure for development, and it is a very flexible, powerful tool.
