---
title: "Better looping in bash: Use while syntax"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - development
date: "2021-10-21"
description: "Learn how to upgrade your loops in bash with while syntax. Use while loops to use multiple variables in a single command."
---
## The Problem I Faced
I am currently managing 1000 almost identical Docker containers for a customer with whom I work. I am using OpenStack and the OpenStack Zun project to manage these Docker containers. An update was released for the software these containers run, and I had to backup some data from every container, record some information about the current state of the containers, delete the containers, create the containers anew (without environment variables for registering them), reassign floating IP addresses to the containers, start the containers, copy data back into the containers, then restart the containers.

I did not want to do this manually. I used a `for in` loop to setup the containers in the beginning, but I could not do that now since most of the operations I needed to do required more than one piece of information to store as a variable. I needed, for example, to pass in the container ID and the container name I had assigned to certain commands. The container create command also needed the container name, the local private IP address, and the public IP address from a list I had saved.

## The Solution I Found
I found some examples on StackOverflow using a `while` loop in bash to read each line of input and split the line into different variables based on the given delimiter. I was able to use a `while` loop that split on the space `" "` character to divide up each line of input. The final command looked like this:

    while IFS=" " read -r id name local_ip public_ip; \
        do openstack appcontainer create --name $name \
        --cpu 0.1 --memory 128 --host host-name \
        --net network=private-network,v4-fixed-ip=$ip \
        --mount type=volume,source=$name,destination=/file/path/ \
        --security-groups group-id \
        --environment KEY=VALUE \
        container/image container commands; \
    done; < input-file

I tried splitting that up over multiple lines to make it look nicer, but I'm not sure if that is all valid syntax. In case it isn't valid, here is that command again without the new lines:

    while IFS=" " read -r id name local_ip public_ip; do openstack appcontainer create --name $name --cpu 0.1 --memory 128 --host host-name --net network=private-network,v4-fixed-ip=$ip --mount type=volume,source=$name,destination=/file/path/ --security-groups group-id --environment KEY=VALUE container/image container commands; done < input-file

## The Input I Used
I used OpenStack Zun to output the information I needed to manage the old containers and make new containers. I also manipulated that data further using the `while` loop syntax to build out more input.

To start, the following command will retrieve the data from OpenStack Zun:

    openstack appcontainer list

To filter for containers that are only on a given host, add the `--host` option like so:

    openstack appcontainer list --host host-name

To filter by status, use the `--status` flag:

    openstack appcontainer list --host host-name --status Created

This command will return a table of information. You can have the command return just the values by using the `-f` flag to format the result. There are other formatting options besides this, but returning the values is enough for this use.

    openstack appcontainer list --host host-name --status Created -f value

Finally, you can have the command return specific columns using the `-c` option and the name of the column if you do not need all of the information. I used the combination of all these options to get the container information like so:

    openstack appcontainer list --host host-name --status Created -f value -c uuid -c name -c addresses > containers.txt

That command will make a file with entries like this on each line:

    bbed86be-514c-4bc3-9a7f-22e29e9f895f container-name 10.0.0.2

I still had to get the floating IP addresses. However, I formatted the local IPs as the public IPs so all I needed to do was rewrite the first part of the IP address. I used a `while` loop with an environment variable to do this:

    while IFS=' ' read -r id name local_ip; do public_ip=$(echo "$local_ip" | cut -c6-); echo "$id $name $local_ip 192.168.$public_ip >> new-input; done < original-input

This `while` loop will make a new file - called `new-input` - that will have lines that look like the following:

    bbed86be-514c-4bc3-9a7f-22e29e9f895f container-name 10.0.0.2 192.168.0.2

The script uses the `cut` command with its character argument - `-c` - to take the 6th character and all characters after it - `-c 6-`. **Adjust the cut command to fit the number of characters that need to be clipped.**
