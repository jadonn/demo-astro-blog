---
title: "What Is Virtualization?"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-19"
description: "A short content stub that describes in basic detail what virtualization. This content was prepared as part of a series for training new team members to support OpenMetal.io's OpenStack cloud platform."
---
Virtualization is a collection of technologies that enable you to run one or more fully functional virtual environments within a single physical server environment. Each virtual environment can be given access to the resources, devices, and interfaces on the physical server in a secure, isolated fashion.

A physical server providing virtual environments runs software called a hypervisor. The hypervisor manages all the interactions between the virtual environments and the physical hardware. There are different types of hypervisors that provide different levels of access to the physical hardware, but that is not as important for our purposes. OpenStack uses KVM for its hypervisor, which is a hypervisor capable of provisioning fully functional virtual machine instances.