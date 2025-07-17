---
title: "What is LXC?"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-20"
description: "A short content stub that describes in basic detail what Linux Containers (LXC) is and how it works. This content was prepared as part of a series for training new team members to support OpenMetal.io's OpenStack cloud platform."
---

LXC (Linux Containers) is a virtualization technology for Linux similar to KVM. LXC provides a similar virtualization functionality as Linux KVM, but LXC uses different mechanisms to create isolated virtual environments called containers. LXC containers are smaller and less isolated than the virtual machine instances created using Linux KVM. LXC containers are a great choice for when you need to isolate individual applications from one another on the same server and do not need a full isolated server environment. You still can use LXC containers to run full server environments; however, these server environments usually all must share the same operating system as the physical machine running the LXC containers.
