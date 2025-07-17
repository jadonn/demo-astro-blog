---
title: "Deploy OpenStack Kuryr in 2022"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-01-12"
description: "OpenStack Kuryr is an OpenStack service for bridging OpenStack networking and Docker networking together. With OpenStack Kuryr you can use OpenStack to manage networking for Docker containers. Learn how I deployed OpenStack Kuryr using Kolla-Ansible in 2022."
---
**This post assumes that you have knowledge of Ansible, OpenStack, and Kolla-Ansible. You do not have to be a master, but you do have to be able to use these tools.**
## What is OpenStack Kuryr?
OpenStack Kuryr (and Kuryr libnetwork) is a project that integrates Docker networking and OpenStack networking. The OpenStack Kuryr service syncs the configuration you set in Docker's networking with OpenStack's networking configuration. This means you can do things like put your Docker containers on an OpenStack network and configure your Docker containers to communicate over the network.\
\
When you can use OpenStack networking, you can do really useful things like use OpenStack's security groups to manage access, setup floating IP addresses to enable external traffic, and any of the other things you can use OpenStack networking for just like you can with virtual machine instances.

## How to Deploy OpenStack Kuryr Using Kolla and Kolla-Ansible to an Existing Cloud
OpenStack Kuryr can fortunately be deployed using Kolla Docker containers and Kolla-Ansible orchestration. Kolla is an OpenStack project that provides containerized versions of OpenStack services using Docker. Kolla-Ansible is a set of tools and Ansible playbooks for using Ansible and the Kolla project's Docker containers to deploy OpenStack services for you.\
\
**The following instructions assume you are using Kolla-Ansible to deploy OpenStack. If you deployed OpenStack by some other means these instructions will probably not work for you.**

### Add Kuryr Configuration to Your Kolla-Ansible Configuration
Kolla-Ansible uses an Ansible variable configuration file to define all of the services that should be installed and configured when you run Kolla-Ansible. **These instructions assume you have an OpenStack cloud that was deployed using Kolla-Ansible with a binary installation.** Here is the following configuration that I used to enable OpenStack Kuryr on my OpenStack cloud:

```
enable_etcd: "yes"
enable_kuryr: "yes"
docker_configure_for_zun: "yes"
containerd_configure_for_zun: "yes"
kolla_install_type: "source"
```
This configuration tells Kolla-Ansible to deploy `etcd`, a key-value cluster software (`enable_etcd: "yes"`), and `kuryr`, the actual Kuryr project (`enable_kuryr: "yes"`).\
\
The configuration also tells Kolla-Ansible to reconfigure the Docker daemon for use with the OpenStack Zun project, a project for using OpenStack to manage the complete lifecycle for deploying a Docker container. OpenStack Zun relies on OpenStack Kuryr to integrate OpenStack networking and Docker networking, but you do not have to deploy OpenStack Zun if you just need to the networking integration. **The Kolla-Ansible documentation does not include adding the OpenStack Zun configuration, but I found I needed it to have Docker run in Swarm mode. I got errors when I tried using OpenStack Kuryr without this additional configuration.**\
\
The final line of configuration - `kolla_install_type: "source"` - tells Kolla-Ansible to pull the source Kolla Docker images instead of the binary Kolla Docker images. The Kolla project maintains Docker images built using binary versions of the OpenStack services or the source code of the OpenStack services. The core OpenStack services have binary images, but some of the less common extra services like OpenStack Kuryr only have source images. **As long as you use tags and caution when running Kolla-Ansible, you can mix binary and source images; however, if you do not use tags, you can easily accidentally overwrite your existing Kolla containers.**

## Reconfigure Docker to Support OpenStack Kuryr

Before you can use OpenStack Kuryr, I found that Docker's configuration had to be changed. If you follow Kolla-Ansible's OpenStack Kuryr documentation you can install OpenStack Kuryr without any errors; however, when you try to use OpenStack Kuryr to setup a Docker network, Docker outputs errors like Docker needing to be in Swarm mode. To fix this, I borrowed from OpenStack Zun's documentation to setup Docker to work with OpenStack Kuryr. I had a feeling this would work since I have previously used OpenStack Zun, which relies on OpenStack Kuryr to manage networking between OpenStack and Docker.

Kolla-Ansible will take care of the configuration changes for you with the configuration listed above. To change Docker's configuration to support using OpenStack Kuryr, run Kolla-Ansible's `bootstrap-servers` command:

```
kolla-ansible bootstrap-servers -i my-inventory
```

This command will use Kolla-Ansible to execute the Ansible playbooks to reconfigure Docker. **Do take care when running this command. It is best to run this on a new OpenStack deployment. Any problems Docker experiences can cause issues with your OpenStack installation, which when using Kolla-Ansible is deployed using Docker.**

If the Ansible playbooks run successfully without reporting any errors you can move on to deploying OpenStack Kuryr using Kolla-Ansible.

## Deploy OpenStack Kuryr with Kolla-Ansible

Deploying OpenStack Kuryr is very easy with Kolla-Ansible. Run the following command to deploy OpenStack Kuryr:

```
kolla-ansible deploy -i my-inventory --tags etcd,kuryr
```

This command will execute Kolla-Ansible's `deploy` playbooks that are identified with the tags `etcd` and `kuryr`. This means that Kolla-Ansible will run only the playbooks for deploying and configuring `etcd` and `kuryr`. This command comes from the official OpenStack documentation for deploying OpenStack Kuryr using Kolla-Ansible.\
\
If everything works succesfully, you are ready to start creating networks with OpenStack Kuryr.

### If The Deploy Process Fails
I have encountered issues when deploying OpenStack Kuryr. The most common one was that the deploy process gets stuck on creating the projects for OpenStack Kuryr and times out. When this has happened, I was able to finish the deployment by running Kolla-Ansible's database recovery playbooks. You can run Kolla-Ansible's database recovery playbooks with following command:

```
kolla-ansible mariadb_recovery -i my-inventory
```

This command will run all of Kolla-Ansible's checks for the MariaDB Galera cluster that stores all of OpenStack's data. Kolla-Ansible will also take any steps required to recover or repair any issues the database cluster has.

## Create an OpenStack Kuryr Network through Docker
You can create networks directly through Docker using OpenStack Kuryr as the network driver. To create a network through Docker directly, use the `docker` command to create a network and pass in `kuryr` as the driver Docker can use. The following command will create a Docker network using OpenStack Kuryr:

```
docker network create -d kuryr --ipam-driver=kuryr --subnet=10.0.0.0/24 --gateway=10.0.0.1 kuryr-network
```
This command will create a network in the Docker networking space with the name `kuryr-network`, with the subnet `10.0.0.0/24` and the gateway `10.0.0.1`. The OpenStack Kuryr service will create a network in OpenStack behind the scenes with the subnet `1.0.0.0/24` and the gateway `10.0.0.1` under the `service` project inside of OpenStack.\
\
I am not a huge fan of this approach because resources, like networks, created under the `service` project are difficult to use and to manage. I prefer creating networks inside of a user's project and mapping those onto the Docker network with OpenStack Kuryr.

## Recommended: Use an Existing OpenStack Network with OpenStack Kuryr
You can also use existing networks in OpenStack with OpenStack Kuryr. This approach allows you to easily use all of OpenStack's network management features to control networking for Docker containers. You can pass in information about your existing network to OpenStack Kuryr when creating a new Docker network to tell OpenStack Kuryr to map the new Docker network onto the existing OpenStack network. This is an example command to create a new Docker network using OpenStack Kuryr as the network driver and to tell OpenStack Kuryr to associate the new Docker network with the existing OpenStack network:

```
docker network create -d kuryr --ipam-driver=kuryr --subnet=10.0.0.1/24 --gateway=10.0.0.1 -o "neutron.net.uuid=40714499-d791-4f09-bc40-9cf96cb86393" -o "neutron.subnet.uuid=aa4e66ff-336b-4045-b7ae-2c37e239d186" --ipam-opt "neutron.subnet.uuid=aa4e66ff-336b-4045-b7ae-2c37e239d186" my-network
```

Replace the value for `neutron.net.uuid` with the ID of the OpenStack network and the value for `neutron.subnet.uuid` with the ID of the OpenStack subnet on the network. The values for subnet and gateway should match the actual subnet and gateway for the existing OpenStack network.\
\
This command will create a Docker network named `my-network` using OpenStack Kuryr as the network driver with the subnet `10.0.0.1/24` and the gateway `10.0.0.1`. The command also tells OpenStack Kuryr to use the existing OpenStack network with the given ID and the existing OpenStack subnet with the given ID instead of creating a new network.\
\
You can now do everything you would normally do with an OpenStack network and have your containers use the OpenStack networking configuration. I created fixed ports in OpenStack to use with my Docker containers. I also use OpenStack's security groups to manage access (like a firewall), and I have setup floating IPs to allow traffic from the public Internet to reach Docker containers.

## Configure Your Docker Container to Use an OpenStack Port
All you have to do to have your Docker container use an OpenStack port is pass in the name of your network and an IP address for the container to use when you create or run the container. The following command will create a Docker container with an IP address of `10.0.0.5` on the network named `my-network`:

```
docker run --network my-network --ip 10.0.0.5 hello-world
```
As long as the IP address is within the subnet of `my-network` and is not occupied, Docker will attach the container to the network with the IP address `10.0.0.5`. OpenStack Kuryr will create a port with IP address `10.0.0.5` on the corresponding OpenStack network if one does not currently exist. If a port does exist with the IP address `10.0.0.5` and is not currently in use, OpenStack Kuryr will attach the Docker container to the port.\
\
**You can use all of your other Docker arguments and options as normal. The example command above just illustrates the specific networking-related options you should use.**\
\
I like creating all of my ports ahead of time so that I do not have to wait for OpenStack Kuryr to do all the work of setting up ports when I create containers. I also like to be able to define my security groups once and setup my floating IP configuration once for each port. I do not ever have to change the ports, but I am frequently removing and recreating the Docker containers I attach to the ports.

## Summary
With OpenStack Kuryr, you can use OpenStack as the platform to manage your Docker containers' networking. This is a great solution for provisioning Docker containers that need IPv4 floating IP addresses or other networking features like OpenStack provides. I am a fan of this solution because I can do more with Docker without having to leap to a container orchestration solution like Kubernetes. I do not have anything against Kubernetes, of course, but it would be seriously overpowered for the workload I manage with OpenStack Kuryr.
