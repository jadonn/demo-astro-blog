---
title: "Populate Docker Volumes Quickly"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2021-11-04"
description: "Avoid time-consuming Docker container restarts by using a dummy container to mount your Docker volumes when you need to copy data into the volumes."
---
## Why I Was Populating Docker Volumes

I recently had to populate **1000 Docker containers** with data as quickly as possible. The 1000 Docker containers were identical to one another except for two files that I had to copy into each container's file system. I had previously created the containers, started the containers so the file system exists, copied the files into the containers, and restarted the containers.\
\
This process required about a minute for each container since the three physical machines I was using to run the Docker containers could not manage starting and restarting Docker containers more quickly than that without Docker experiencing errors. Each of these machines was running approximately 333 of the workload Docker containers and another approximately 70 Docker containers powering an OpenStack deployment that was also running on the hardware.\
\
Thanks to some quick searching and a [helpful answer on Stack Overflow](https://stackoverflow.com/a/55683656) I was able to create all of the volumes ahead of time and copy the two files into each volume without having to create, start, and restart the Docker containers for my workload.

## Create the Docker Storage Volumes

Docker storage volumes are filesystems that Docker manages internally to persist container data. They are great when you need to delete a Docker container and create the Docker container again, such as when you are updating a Docker container's image.\
\
Creating Docker storage volumes was very simple. I used the Docker CLI commands and a loop in a simple **bash** script to create all of the volumes I needed in a single go:
```
    while IFS=" " read -r name public_ip local_ip; do docker volume create $name; done < input-file
```
This command 1) reads every single line of the `input-file` line by line; 2) divides each line at each space `" "` character into separate values; 3) gives variable names to the separate values - `name, public_ip, and local_ip`; and uses the **docker** command to create a new volume with the `name` read from the `input-file`. (The `public_ip` and `local_ip` variables are not used in this script. I used them in other work deploying the 1000 Docker containers.)\
\
The `input-file` is a file I prepared ahead of time that looks like this:
```
    container-10 192.168.0.10 10.0.0.10
    container-11 192.168.0.11 10.0.0.11
    container-12 192.168.0.12 10.0.0.12
    container-13 192.168.0.13 10.0.0.13
    container-14 192.168.0.14 10.0.0.14
```
I know `192.168.0` is a private IP address range. I replaced the public IP address range I used in the example to anonymize that input.\
\
With this input, the **while loop** reads the whole line, such as `container-10 192.168.0.10 10.0.0.10`, splits the line into parts and assigns them to variables - `name=container-10`, `public_ip=192.168.0.10`, `local_ip=10.0.0.10`. The Docker command that runs looks like this then:
```
    docker create volume container-10
```
And then this process repeats for every line of the `input-file`, which in this case was 333 or so lines for every single physical machine.\
\
If Docker creates the container successfully, you should see the name of the volume output on a new line for every volume that is created. The output looks like this:
```
    container-10
    container-11
    container-12
    container-13
    container-14
```
And so on until the **bash** script reaches the end of the `input-file`. If Docker encounters any errors while creating a volume, Docker will show an error message instead of the volume name.\
\
Creating all of the volumes took a minute or two to complete. Docker in my experience is relatively quick when creating containers and volumes, even when you are creating hundreds of containers or volumes.

## Use a Dummy Container to Mount the Volume and Copy Data

(You can technically copy data directly into volumes by looking up the place in the local filesystem where Docker stores the volume's data, but I like doing things through Docker to make sure everything copies properly.)\
\
Before you can copy data into a volume using the **docker cp** command, you have to mount the volume inside of a running container. The first time I populated data into my 1000 Docker containers, I created the containers and started them so I could copy data into the containers. This took several hours to complete since I had to wait 30 seconds between starting each container to avoid overwhelming Docker.\
\
After searching how to solve this problem, I found a [solution on Stack Overflow](https://stackoverflow.com/a/55683656) that used the `hello-world` Docker container image to create a container with a volume mounted so you can copy data into the volume.\
\
I used that technique in another **while loop** inside of a **bash** script to create a Docker container using the `hello-world` Docker image, to use **docker cp** to copy the files into the container to where the volume is mounted, and to remove the container after the files are copied into the Docker volume inside of the `hello-world` container. The command I ran to do that was:
```
    while IFS=' ' read -r name public_ip local_ip; \
    do docker create --name temp-$name -v $name:/app/data hello-world; \
    docker cp volume-files/$name/file_to_copy temp-$name:/app/data/file_to_copy; \
    docker rm temp-$name; done < input-file
```
I used the same `input-file` as discussed above for input into this command. This command took only a few minutes to complete copying all of the files into the Docker volumes and removing the `hello-world` containers. At this point, my Docker volumes had all of the data they needed for me to create and start up my production containers.

## Now You Are Ready to Go

If you followed along in this post, you should be ready to start deploying your workload's Docker containers using Docker volumes without having to first start the container, populate the volume with data, then restart the container. This should save significant amounts of time when you are working with containers that take several seconds each to start, stop, and start again.\
\
Check out my other posts for more information about my 1000 Docker container deployment and how I deployed large quantities of Docker containers.