---
title: "What Are Ceph's Main Features?"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-17"
description: "Ceph at its core is a highly available, data redundant cloud storage platform. Ceph's primary purpose is providing storage. Ceph has three main types of storage that it can provide: block storage, object storage, and shared filesystems."
---

## Block Storage
Block storage is one of the most popular forms of storage Ceph provides. Block storage is the type of storage used for virtual machine instances and for storage that needs to behave like a physical disk. Block storage stores data in larger blocks instead of small pieces.\
\
Ceph is a popular choice for providing block storage for virtual machine instances on cloud platforms like OpenStack.

## Object Storage
Object storage is the second most popular form of storage Ceph provides. Object storage stores data as individual small objects instead of large blocks. Amazon's S3 object storage platform defined and popularized object storage. Object storage is great for storing application data thanks to its convenient REST API. Ceph provides an object storage API that is compatible with S3-compatible tools and software.\
\
Ceph users can configure Ceph to have its object storage API available, but OpenStack users should use OpenStack's object storage service - OpenStack Swift - instead of interacting directly with Ceph. OpenStack Swift's web APIs can be deploy as a proxy frontend for Ceph's object storage API.

## Shared Filesystems
Shared filesystems are the last kind of storage Ceph provides. Ceph provides shared filesystems primarily as a tool for supporting legacy applications that cannot work using block storage or object storage. Ceph's shared filesystem storage gives users the ability to mount Ceph storage volumes as filesystems on their local servers similar to NFS, Samba, and other file sharing protocols.


