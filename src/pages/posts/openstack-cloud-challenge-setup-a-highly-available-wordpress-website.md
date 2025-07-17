---
title: "OpenStack Cloud Challenge: Setup a Highly-Available WordPress Website"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2021-10-29"
description: "Real world deployments offer great examples of how to use technology. Use OpenStack to setup cloud infrastructure to support a highly-available WordPress website."
---

## What Is This Challenge?

This is a request I received for my work with OpenMetal OpenStack private cloud. I designed the infrastructure plan for a WordPress website that needed to be able to sustain huge amounts of traffic without any downtime or degradation in performance. The deployment also had strict security and privacy requirements, for which OpenStack was a perfect fit.

This post summarizes the deployment's requirements without discussing how the deployment was implemented. It is meant to provide a blueprint for someone who is learning OpenStack and wants a real-world challenge to use to practice deploying cloud infrastructure with OpenStack.

## Requirements and Considerations

The WordPress website has to support traffic from a user base of 500 million users. There are no precedents or data for how much simultaneous traffic can be expected given this website is for something entirely new and unknown.

The WordPress website will accept file uploads from users that will be stored on the WordPress servers. Other user data will be stored inside the WordPress website database.

The deployment must have as few hosts as possible accessible to the public Internet.

Any host that stores user data must not be accessible from the public Internet.

Access between hosts inside of the deployment must have limited access to each other. Hosts must only have access to the minimum number of ports and services they require to complete their operations.

## You Are Not Responsible For What Is Inside the Hosts

One key part of this challenge is that you are not responsible for setting up WordPress, a web server, a database server, or any other software inside of the hosts you create. You are responsible for *using OpenStack* to create the infrastructure only.

## Bonus Challenges

Use Terraform to manage creating the infrastructure inside of OpenStack.