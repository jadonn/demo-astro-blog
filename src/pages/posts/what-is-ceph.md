---
title: "What is Ceph?"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-17"
description: "A short content stub introducing Ceph - an open source cloud storage software solution. This piece was written as part of a series I prepared to train new team members to support OpenMetal.io's OpenStack cloud platform."
---

## What is Ceph?

Ceph is an enterprise-level, open source software project for operating cloud storage platforms on top of physical machines. Ceph operates in clusters of services and machines to provide highly available, data redundant storage.\
\
OpenStack can use Ceph to provide cloud storage for virtual machine instances and object storage. OpenStack Cinder (storage volume service) can use Ceph as a storage backend using Ceph's block storage capabilities. OpenStack users can use Ceph for object storage if they deploy OpenStack Swift's (object storage service) web API component as a proxy frontend in front of Ceph.\
\
If using Ceph, when a user creates a virtual machine instances in OpenStack, OpenStack reserves a storage volume on the Ceph storage cluster. The virtual machine instance will use Ceph to hold the data stored on the virtual machine instance.\
\
For every piece of data saved to Ceph, Ceph will take extra steps to prevent the loss of data if a physical disk or physical machine fails. The default Ceph data protection strategy configures Ceph to maintain 3 copies of every piece of data saved into Ceph; these 3 copies are never stored on the same physical disk to protect against data loss. Ceph can keep different numbers of copies of data based on storage needs. Ceph can also use erasure coding to split data into chunks across multiple physical storage disks to protect against data loss while more efficiently using the storage capacity of the Ceph cluster.
