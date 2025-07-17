---
title: "How Does Virtualizaton Work?"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-21"
description: "A short content stub that describes in basic detail what virtualization is and what function virtualization provides. This content was prepared as part of a series for training new team members to support OpenMetal.io's OpenStack cloud platform."
---
Virtualization technology uses special software called a hypervisor to emulate physical hardware and manage virtual machines. The hypervisor sits between the physical server and the virtual servers. Virtual servers communicate with the hypervisor for physical server resources. For the most part, the virtual servers cannot distinguish between interacting with the hypervisor and interacting with the physical machine. This means server operating systems largely function the same in a virtual server as they do on a physical server without virtualization.
