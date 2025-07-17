---
title: "What are OpenStack's Main Features?"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-17"
description: "OpenStack has all the great features and functionality cloud users need. Learn about the core functions OpenStack provides to OpenStack users. This piece was written as part of a series for preparing new team members to support OpenMetal.io's OpenStack cloud platform."
---

## What are OpenStack's main features?

OpenStack's main features are for providing cloud computing using virtual machine instances. These are the primary features in a basic OpenStack cloud:

1. Provisioning virtual machine instances
2. Creating and managing virtual networks
3. Managing cloud storage volumes
4. Built-in cloud management and automation tools
5. Support for popular cloud management and automation software

## Provisioning Virtual Machine Instances

OpenStack's main purpose is giving you the ability to create virtual machine instances on top of your physical servers. Virtual machine instances are the basic unit of cloud computing whether you are in a private cloud or a public cloud.\
\
Virtual machine instances are completely isolated server environments that have been allocated CPU, RAM, and storage resources. Virtual machine instances can be rapidly created, deleted, or migrated to different physical machines. OpenStack users can define flavors that give virtual machine instances preset amounts of CPU, RAM, and storage resources.\
\
You can use OpenStack to create custom operating system images to deploy virtual machine instances with specific software installed. Flex Metal Cloud provides a set of popular operating system images by default to speed up getting started with OpenStack.

## Create and Manage Virtual Networks

One of the most important features of OpenStack is managing network connections between cloud resources. OpenStack gives users, both administrator and non-administrator, the ability to create private and public networks and define how virtual machine instances are attached to those networks.\
\
Traditionally, in a non-cloud environment, network traffic must travel over the public internet or require manual, time-consuming configuration or physical changes to networking gear. OpenStack virtualizes networking configuration and manages networking between virtual machine instances for you so you do not have to worry about the underlying details of your physical networking infrastructure.\
\
The ability to manage your networking enables you to setup more private, more secure access for your internal applications and services. Sensitive resources do not have to be available to the public internet. They can exist on networks that provide limited access to machines that re authorized for access.\
\
OpenStack users can also define security groups at the networking level that act like firewalls for networking traffic. Security groups are critical for building secure networks and protecting virtual machine instances from unauthorized access. Unlike many public cloud providers, OpenStack configures security groups by default to restrict access as much as possible to prevent accidentally making resources public. Users must explicitly grant public access to virtual machine instances.

## Automation and Cloud Management

OpenStack has all the functionality and features to enable modern cloud architectures and approaches to managing cloud infrastructure. One of the main advantages to cloud infrastructure is automating and streamlining the management of server resources.\
\
OpenStack has built in tools for automating the creation of virtual machine instances and other OpenStack resources through the OpenStack Heat service. OpenStack Heat template files give you the ability to define your infrastructure in special text files and let OpenStack take care of creating all of your cloud resources.\
\
Popular tools like Terraform and Ansible also have support for provisioning and configuring infrastructure on OpenStack. These tools are popular among cloud users for managing their cloud computing resources across multiple cloud providers.

## Open source software, open source values

One of the best features of OpenStack is that OpenStack is completely open source. It has a thriving community of developers, engineers, and users who contribute to the ongoing success and improvement of OpenStack.\
\
Unlike big public cloud providers or proprietary private cloud software, OpenStack is free to use and free to modify to meet your needs. There are no restrictive licenses or per-CPU fees.