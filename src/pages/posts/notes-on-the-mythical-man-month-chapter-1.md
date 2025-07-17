---
title: "Notes on - Chapter 1 of The Mythical Man-Month by Fred Brooks"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - leadership
date: "2024-02-13"
description: "My thoughts and notes on the preface and first chapter of book The Mythical Man-Month by Fred Brooks."
---
## Why am I reading this book?
I picked up The Mythical Man-Month because multiple writers, bloggers, and other tech professionals have praised this book and held it in high regard. It seems like one of the more popular and perhaps important books on tech management and project management.\
\
I hope I can learn how to better manage software projects and avoid wasting time on doomed projects.

## Why just one chapter at a time?
Each chapter has a bunch of notes and interesting bits. I've been taking notes by chapter, and I wanted to keep that structure to avoid having a huge blog post.

## Chapter 1: The Tar Pit
Brooks compares "large-system programming" to the tar pits that trapped prehistoric animals. In the comparison, both the animals and the teams of developers become more and more enmeshed in tar the more they struggle. Brooks does note many teams do survive the struggle to produce running systems, but they do not meet goals, schedule, or budgets.\
\
He also interestingly says:

> No one thing seems to cause the difficulty—any particular paw can be pulled away. But the accumulation of simultaneous and interacting factors brings slower and slower motion.

I think it's interesting that it's the accumulation of many things that slows the project down instead of any single factor. I feel folks usually look for a single/root cause even though there are usually a nexus of causes that make things fail.

### The Programming System Product
Brooks identifies four programming outputs, you could say, and maps them as quadrants in a 2x2 graph. The upper left quadrant is a Program. Brooks say this is what most programmers use to judge effort and cost of programming. He says when you move down across the x-axis you produce a Programming Product, which is a generalized, thoroughly tested, and documented program. Brooks says that Programming Products are more useful, but more costly objects than Programs. He estimates a Programming Product to cost 3x as much as a Program. Across the y-axis, you produce a Programming System, which is a collection of interacting Programs working together to facilitate a larger task. Brooks also estimates creating a Programming System costs 3x as much as a Program. Finally, the bottom right quadrant is a Programming System Product, which combines the Programming Product and Programming System. It has 9x the cost of a Program. Brooks says is it the most useful object of the four and is usually the true intended outcome of a development project.

### The Joys of the Craft
Brooks identifies the following reasons for why people do programming:
1. Sheer joy of making things
2. Making things that are useful to others
3. The joy of fashioning complex systems
4. The joy of always learning
5. The delight of working in a tractable medium
Brooks compares programming to the work a poet does
We make big, monumental things from air

Brooks summarizes things thusly:
> Programming then is fun because it gratifies creative longings built deep within us and delights sensibilities we have in common with all men.

### The Woes of the Craft

Brooks identifies these woes of programming;

1. You must perform perfectly or things fail
2. You don't have control over what you are doing, how you do it, or why
3. Having to depend on others' poorly produced, documented, supported work and fixing others' gaps yourself
4. Tedious parts of programming
5. Debugging difficult bugs
6. Your work seems obsolete or unnecessary by the time you complete it
