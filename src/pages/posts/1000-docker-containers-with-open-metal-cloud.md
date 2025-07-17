---
title: "1000 Docker Containers with Open Metal Cloud"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2021-10-27"
description: "I had the opportunity to deploy 1000 Docker Containers on a three-node OpenStack private cloud using Open Metal Cloud's platform. The containers were almost entirely identical and had low resource usage, which helped make this possible. However, I still ran into challenges with provisioning the containers without overwhelming Docker on the three hardware nodes. This post talks about the deployment and architecture from a high level; it is meant to serve as a record and retrospective for me in case I need to do this in the future. I had to complete the deployment in three days to meet the deployment's requirements. That's right. 1000 Docker containers deployed from scratch in 72 hours."
---
## The Physical Infrastructure

I did this deployment on three Supermicro MicroBlade MBI-6219B-T41N server nodes. Each server node had an Intel Xeon D-2141I processor with 8 cores and 16 threads. Each server node also had 128 GB of RAM, a 256GB Intel D1 P4101 NVMe SSD boot drive, and an Intel DC P4610 3.2TB NVMe SSD storage drive.

## The Software Infrastructure

I used an OpenStack private cloud running the Victoria release of OpenStack. The cloud also uses Ceph for storage for OpenStack's storage needs. All of the initial software setup was deployed in an automated fashion using the Open Metal Cloud platform's deployment system. OpenStack itself is deployed using Kolla-Ansible. After the initial cloud deployment, I used Kolla-Ansible to deploy the OpenStack Zun service for deploying Docker containers as you would KVM VM instances using OpenStack.\
\
Each of the physical hardware nodes was configured to have an instance of Ceph with a single Ceph OSD using the Intel DC P4610 3.2TB NVMe SSD drive. Each physical hardware node also had an instance of all the OpenStack control plane services. Each physical hardware node also was configured to function as a compute hypervisor for OpenStack.

### What is OpenStack?

If you are not familiar with OpenStack, it is an open source project for creating your own cloud on your own hardware. It has all the main features folks look for on public cloud platforms like Amazon Web Services (AWS), Google Cloud Platform (GCP), or Microsoft Azure (Azure). Introducing OpenStack is out of the scope of this particular piece; I recommend looking up other resources for a quick overview of OpenStack.\
\
For the purpose of this piece, one key thing to know about OpenStack is that its functionality is split up among several independent projects. You can customize the functionality your OpenStack cloud has by selecting certain projects and omitting other projects.

## What Is OpenStack Zun?

OpenStack Zun is a project for using Docker as your hypervisor effectively. With OpenStack Zun, you can provision and manage Docker conatiners the same way that you can manage VM instances. Each container provisioned through Zun uses OpenStack networking, OpenStack's resource tracking and management, and OpenStack's user system. Containers can also be managed through the OpenStack Zun API instead of the Docker API. There are also plugins for Horizon, OpenStack's web dashboard, and for the OpenStack CLI to manage containers through your web browser or through the CLI.

**Zun does deploy Docker containers directly to the baremetal physical machine that is configured to run as a compute node. This does mean that your Zun containers can deploy next to your Kolla containers if you used Kolla or Kolla-Ansible to deploy OpenStack.**

### Zun is not Kubernetes or Container Orchestration

One of the important things to understand about Zun is that it is not the same kind of solution as Kubernetes. Zun is not trying to solve that kind of problem or be the kind of solution. The main problem Zun seems to be solving is letting you easily leverage OpenStack's powerful features for managing your infrastructure to manage your Docker-based infrastructure.

## Zun Is Great for Enhancing Your Docker Containers

The main feature I needed from OpenStack Zun was using OpenStack for networking. Each of the 1000 Docker containers I deployed needed a public IPv4 address. I had considered a one-Docker-container-per-VM model, but research one of my co-workers did showed that using KVM would never give us the container density we needed to meet the deployment's cost requirements. KVM simply had too much overhead running each VM to make this work. I had also considered putting multiple Docker containers in a single VM, but I did not have any idea how routing the traffic from multiple public IPv4 addresses to the appropriate container would work.\
\
With Zun, each Docker container I created was assigned to an OpenStack network. I assigned every container to a private OpenStack network and assigned a floating IP from OpenStack to the container through Zun. The experience was relatively straightforward and easy to use.\
\
Zun is a great project. It is great if you have a multi-tenant environment or multiple users who need to deploy their Docker workloads through OpenStack. It is integrated with OpenStack's resource tracking, user quotas, and other tools you would use to manage users' ability to deploy other OpenStack resources.

## I Actually Stopped Using Zun, Though

However, I was deploying 1000 containers into a single-tenant environment, and I actually only needed OpenStack's networking management features, which Zun relies on another project - OpenStack Kuryr - to map Docker's networking to OpenStack's networking.\
\
I realized I could use the networks Zun had setup using Kuryr inside of Docker's network space to create containers directly through Docker. All I had to do was setup a port on the OpenStack side with the IP address I wanted to give the container and setup forwarding for the public IP address to that port. With those pieces in place, I could tell Docker to use the Kuryr network and the specific IP address of the port I had created.

## Why I Stopped Using Zun

The main struggle I had with Zun was that if I tried performing too many actions too closely together I experienced timeouts and service errors from Zun, from OpenStack networking, or from Docker itself. Some of the containers that were created were also corrupted or caused errors in Docker even though Zun reported them as running containers. This problem grew worse as the number of deployed containers increased. I eventually had to only deploy a single container every 30 seconds to give Zun enough time to complete its operations, and some containers would still fail.\
\
To be clear, these things were not Zun's fault. Zun hides a great deal of complexity behind a single simple API. I was likely pushing Zun beyond what it was intended to do in terms of the rate at which I was deploying Docker containers and how many containers I was deploying to each hypervisor node.\
\
But I did not need Zun to hide that complexity. And this deployment was going to be static; I was never going to change the IP addresses of the Docker containers, for example. I was able to significantly speed up the deployment of Docker containers by using the networking setup I configured through OpenStack (the ports and forwarding I mentioned earlier). In addition, making the containers through Docker was incredibly fast. Creating a couple hundred containers took about a few minutes, which previously had taken hours to complete through Zun with the 30 second delay in between each container creation.
\
I found, though, that starting the containers too quickly would overwhelm Docker and cause containers to fail to start with different error codes like the Docker daemon being overwhelmed or the network virtual device adapter failing to connect. I still had to start the containers with a 30 second delay between each container. Unfortunately, starting all of the containers still took a couple hours. But, the 30 second delay was enough to start the containers with a small error rate of 1-2% of containers.\
\
Finally, I had an issue with Zun early on with Zun thinking there were not enough vCPUs for me to deploy more containers when there clearly were enough vCPUs available. It seemed like Zun did not respect any configuration for oversubscribing/overallocation physical CPU resources. I dug through the source code for Zun and found I could edit a line in the `host_state.py` file inside of the scheduler code for Zun to force Zun to provision more containers than it thought there were vCPUs. I think part of the problem may also be that Nova, the OpenStack Compute service, tells OpenStack how many vCPUs there are and Zun was deferring to Nova. Changing the source code and changing Nova's allocation ratios seemed to help. I do not recommend changing the source code, though, since the changes may get erased if you ever redeploy Zun using Kolla-Ansible.

## Important Considerations for Deploying 1000 Docker Containers

One of the most important factors of this deployment was that the Docker containers were all almost identical, were relatively small, and were almost always idle. Had they been very busy or big containers, I would not have been able to fit as many containers within this footprint. I would have needed more powerful servers or more servers overall.\
\
Even with these factors, 1000 Docker containers turned out to be near the ceiling of what this cloud could deploy without threatening Docker's stability. One thing I did not take into consideration was that each of the physical machines was already running between 60 and 70 Docker containers for all of the OpenStack services running on each machine. So I was actually deploying over 400 Docker containers on each physical machine for Docker to manage.\
\
Another struggle I had was corrupting the Docker daemon's ability to function in one way or another. I found that if I deployed too quickly the Docker daemon became corrupted in some way. For example, the Docker daemon became unresponsive on one machine. In order to restore Docker, all of the containers had to be deleted, Docker re-installed and configured, and the containers remade. Another machine consistently had issues with `/dev/shm` running out of space around container 250 even though the other two machines in the cluster supported a much higher number of containers without having this issue.

## Final Summary

This deployment was an excellent engineering challenge for me. No one in my company had tried doing a deployment like this before. OpenStack Zun made the deployment possible and gave me an excellent education in how to integrate Docker with OpenStack features like OpenStack networking using the OpenStack Kuryr project.