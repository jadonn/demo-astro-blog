---
title: "Why Use Virtualization?"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-22"
description: "Learn about the main benefits of virtualization and understand why virtualization is so important to technology professionals, systems administrators, and cloud engineers. This content was prepared as part of a series for training new team members to support OpenMetal.io's OpenStack cloud platform."
---
Virtualization makes physical hardware much more flexible and useful than it is on its own. With virtualization you can achieve greater utilization of your physical hardware, and you can use virtual machines to create multiple distinct environments on a single physical server without them interfering with each other or the underlying physical environment.

## Greater utilization

A given physical server is probably only seeing use 15% to 25% of the time. Virtualization gives you the ability to share a physical server with multiple users or people on your team through creating virtual environments. This is much more cost effective and efficient than giving each of the teams or users their own physical server.

## Separate environments

One of the biggest benefits to virtualization is quickly and flexibly creating and destroying distinct, unique server environments for each project, user, or team. One of the challenges in development is keeping your projects' dependencies from interfering with each other. A single physical server environment can quickly have conflicting packages installed, incompatible configurations, and other problems with multiple teams attempting to complete their work.\
\
Using virtualization, each team can have a virtual machine instance that is more or less indistinguishable from the physical server for each project or application in development. The same approach can be used to create distinct environments tailored to meet the unique needs of each application when it is time to deploy.