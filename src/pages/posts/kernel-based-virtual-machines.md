---
title: "Kernel-based virtual machine"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-17"
description: "A short content stub that describes in basic detail what a kernel-based virtual machine is. This content was prepared as part of a series for training new team members to support OpenMetal.io's OpenStack cloud platform."
---

Kernel-based virtual machine (or KVM) is Linux's primary virtualization tool for providing virtual machines. KVM allows the Linux kernel to function as a hypervisor for virtual machines. Each virtual machine instance provisioned through KVM has its own instance of the Linux kernel.

**OpenStack uses KVM by default for its virtualization technology.**
