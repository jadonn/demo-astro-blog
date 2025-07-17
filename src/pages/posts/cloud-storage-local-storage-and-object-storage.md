---
title: "Cloud storage, local storage, and object storage? Oh my!"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-03-17"
description: "Learn the differences between the main types of cloud storage. Cloud storage is a critical part of running applications in the cloud, but not all types of cloud storage are the same or provide the same functionality."
---
## Introduction
If you have any amount of data, you need storage. But what kind of storage do you really need for your virtual machines or servers? Public clouds and private clouds have more types of storage available than ever before. Learn about the main differences between the most common types of storage and when to use them.

## Cloud storage
Cloud storage is the unsung hero of public clouds and private clouds. Cloud storage is storage a server uses that does not exist on the same physical hardware as the server. Like the name says, cloud storage is storage that is served over the network.\
\
Cloud storage is a great choice for use cases that need really high reliability and high availability. If you have servers and applications that just must be available as much as possible, cloud storage is usually the option because you decrease your risk of data loss or service outages when you separate your storage from the physical machine running your workloads or applications. Many cloud storage solutions also support high availability or redundant data protection to prevent data loss or to prevent service outages if you lose a hard drive or server in your storage cluster.\
\
Cloud storage is also great when you need large amounts of storage capacity at an affordable cost. When storage is separated from the servers running your applications, you can optimize the storage servers for high capacity. Server hardware manufacturers commonly make servers with dozens of slots for hard drives for extremely high storage density at a lower cost than if you purchased more smaller servers with fewer hard drives. \
\
One key consideration for using cloud storage is performance and latency. Data stored on cloud storage does have to travel over the network any time data is retrieved or saved. For most cases this is not a problem; however, these extra milliseconds can have a big impact on high performance workloads or workloads that are sensitive to latency. Cloud storage can also easily run into problems if the servers or network do not have enough bandwidth to move the data. Some cloud storage solutions with high availability and redundancy can also use up the available bandwidth because they are constantly copying and shuffling data between the physical servers and disks in the storage cluster.

## Cloud storage technologies
There are several technologies for providing cloud storage for everything from test labs to massive enterprise deployments.

### Proprietary cloud storage
Major public cloud providers like Amazon AWS, Google Cloud Platform, Microsoft Azure, and IBM Cloud use cloud storage for the virtual machines they provide to their users. They generally use their own internally developed proprietary cloud storage solution for providing cloud storage quickly, conveniently, and across multiple data centers around the world.\
\
Public cloud storage can provide reasonably good cost for small users and use cases, but storage costs can easily become quite expensive as you scale up your business and data needs. Sure those gigabytes of storage may cost fractions of a penny each, but when you start generating and storing terabytes (1000s of gigabytes) those fractions of pennies turn into tens, hundreds, and thousands of dollars every month.

### Ceph
While there are several open source projects for providing different types of cloud or network attached storage, Ceph is the leading, if not the only, open source solution for enterprise-grade, highly available, redundant cloud storage for virtual machines and servers. Ceph is open source software that allows you to create a cloud storage cluster from one or more servers and hard drives.\
\
Ceph dynamically balances and copies data to ensure no data is ever lost in the event of an outage. This data protection is highly customizable and can be tailored to meet a wide range of use cases and business needs.\
\
Ceph can be more difficult and expensive to deploy, configure, and operate for a small cluster than public clouds. However, as your cloud needs go, hosted private clouds offering Ceph are often more cost effective and efficient than using the large public cloud providers' storage platforms.\
\
Running your own Ceph deployment does mean, unlike in the public clouds, that your data is entirely private. Ceph can even be configured to encrypt your data when it is saved to the hard drive for additional protection.
