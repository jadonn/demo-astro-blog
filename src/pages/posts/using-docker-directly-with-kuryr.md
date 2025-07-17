---
title: "Using Docker Directly with Kuryr"
layout: "../../layouts/BlogPostLayout.astro"
tags:
   - post
   - engineering
date: "2021-10-22"
description: "OpenStack Kuryr gives you the ability to connect OpenStack networks into Docker's namespace. I used Docker directly with Kuryr instead of OpenStack Zun to streamline managing containers."
---

## The Commands and Input to Create the Docker Containers
I realized I could provision Docker containers directly with Docker and Kuryr instead of going through OpenStack Zun.

The workflow is more or less:

1. create a port in OpenStack
2. associate the floating IP with the port
3. create the container with the Docker network that corresponds to the OpenStack network (the OpenStack network ID is the name of the network in Docker)
4. start the container or perform any other tasks that are required

Make sure to add a delay in between starting more containers. Starting too many containers too quickly overwhelms the Docker daemon.

```Shell
while IFS=' ' read -r id name old_ip local_ip public_ip; \
do openstack port create --network <openstack-network-id> \
--fixed-ip subnet=<openstack-subnet-id>,ip-address=$local_ip $name; \
openstack -v floating ip set $public_ip --fixed-ip-address $local_ip --port $name; \
docker create --cpus 0.1 --memory 128000000 --network <your-kuryr-network-id> --ip $local_ip \
--name $name --restart on-failure -e KEY="$public_ip" <your-container-image> <your-container-commands>; \
docker start $name; sleep 30; done < input-file
```
\
The input file looks something like:

```
94d82ac5-3bd3-404b-988e-ef9b152bbe21 container-10-0-0-2 10.0.0.2 192.168.0.2
8e55a7be-e133-4709-94de-6430ab581793 container-10-0-0-3 10.0.0.3 192.168.0.3
b2394b97-5c1b-4a85-9e4d-ae7b05cf8ab7 container-10-0-0-4 10.0.0.4 192.168.0.4
```
\
and so on for hundreds of lines. Each container was named  with the IP address to easily identify which container was associated with each IP address. For the purposes of this example, only local IP addresses were used. The `192.168.0` IP addresses should be replaced with public IP addresses.

## Before You Run This Script

This script does have a few requirements before it can run. OpenStack needs a bit of setup before this script can run successfully.\
\
First, you must create a network and subnet in OpenStack that you will use for the containers. **It seems distributing your containers over multiple networks can help Docker manage the ports on the individual networks. Using multiple container networks is recommended.** Keep the network information nearby. You need to reference the network's information later in the script and when setting up the Docker network using the Kuryr driver.\
\
Second, create a Docker network using the OpenStack Kuryr driver. This command should create a network in Docker that uses the OpenStack Kuryr driver to map the Docker network space to the given OpenStack Neutron network:
```
docker network create -d kuryr --ipam-driver=kuryr --subnet=<sub-net-ip-range> --gateway=<subnet-gateway-ip-address> \
-o neutron.net.name=<the-openstack-network-name> <the-network-name-in-Docker>
```
\
Replace values inside of `<>` with the actual values you have for those arguments.

## What Does The Script Do?

The script reads the input line by line and takes several actions using the input from each line. The input is read in using a while loop and the read command from Bash.\
\
First, the script creates a new newtork port using the given OpenStack network and subnet with a fixed IP address. If the IP address does not exist in the IP range for the subnet, the command will fail.\
\
Second, the script assigns an **existing** floating IP address to the fixed IP address on the port with the given name. Assigning the floating IP address will make OpenStack Neutron forward traffic to the public floating IP address to the private fixed IP address.\
\
Third, the script uses Docker to create a container with a fixed set of CPU resources and memory resources. The container is also provisioned on the given network with a fixed IP address. The network should be a Docker network that uses the OpenStack Kuryr network driver. The container is given a custom name and environment variables. The container is also set to restart if Docker detects the container exits due to a failure. The last two arguments are the container image to use and the commands that should be passed to the container, if any.\
\
Fourth, the script starts the container. Any errors or mistakes in the container creation step will usually show up here as an error when Docker tries to start the container.\
\
Fifth, the script sleeps for 30 seconds before starting again. Starting too many containers at the same time can overwhelm Docker and result in errors during later container starts. In my experience, this seems to be a problem when I run more than 350 Docker containers on a single physical machine.\
\
That is the end of the script's actions. The last parts of the script are the end of the `while` loop - the `done` - and the input `< input-file`. The `< input-file` is the part of the `while` loop syntax that tells the loop what file to read in as input.