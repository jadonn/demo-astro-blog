---
title: "Fix Slow Docker DNS Lookups"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2022-01-12"
description: "Otherwise well performing applications in Docker containers can have slow performance once they are deployed. DNS lookups can be a cause for delays in applications that make any outbound connection to a remote domain, like an HTTP request. You can speed up Docker DNS requests by specifying DNS nameservers for Docker containers to use."
---
## TLDR Fix Slow DNS Lookups
1. Use `--dns` to define nameservers when you create Docker containers
2. Find `ResolvConfPath` in `docker container inspect` and edit `resolv.conf` for the running container.
3. Fix your Docker and host configuration so DNS lookups happen without using the Docker daemon.

## Docker and the Domain Name System
Domain Name System (DNS) lookups are a critical and underestimated part of deploying workloads. For the most part, if the application makes a request for external resources, the application is making a DNS lookup to get the IP address for the resource it is trying to request.\
\
Your Docker containers in many cases probably just use the DNS nameserver configuration for the host running the Docker daemon and the Docker container. If this is the case, and your host has DNS nameservers configured properly, you would probably never see delay from DNS lookups.\
\
If for whatever reason your containers cannot use the Docker daemon host's configuration, the Docker daemon itself will try to resolve DNS lookups on behalf of your individual containers. This is a great failsafe for ensuring your containers will work instead of fail mysteriously.

## The Problem Is Slow HTTP Commands
I had a problem with HTTP requests inside of Docker containers taking several seconds to complete instead of completing almost instantly when done on the physical host running the Docker daemon. I verified this by recording the time commands like `curl` and `wget` took to complete using the `time` command on Linux.\
\
Here is an example using the `wget` command:

```
docker exec -it my-container time wget https://www.google.com
Connecting to www.google.com (142.250.188.196:443)
saving to 'index.html'
index.html           100% |********************************************************************************************************************************| 15114  0:00:00 ETA
'index.html' saved
real	0m 4.07s
user	0m 0.00s
sys	0m 0.00s
```

This command makes Docker execute the CLI command `time wget https://www.google.com` inside of the Docker container named `my-container`. The output shows that `wget` connects to `www.google.com` and saves the page contents to a file named `index.html`. This information at the bottom of the output is the `time` command's measurements of how long the command took to run:

```
real	0m 4.07s
user	0m 0.00s
sys	0m 0.00s
```

`real` is the amount of actual time the given command (in this case `wget https://www.google.com`) took to complete. In this example, the command took 4.07 seconds to complete.\
\
`user` is the amount of CPU-seconds that the process used as the user in seconds. This is the number of seconds that the CPU actually spent working on your command.\
\
`sys` is the amount of CPU-seconds the system spent working on your time. This covers time the CPU spent using the operating system's functions on behalf of the command.\
\
Since the `real` time is 4.07s and the other times (user and sys) are 0.00s, this means that the command spent almost all of its time waiting for something and almost none of its time with the CPU doing work.

## Troubleshooting the Slow HTTP Requests
I ran through several steps to rule out possible causes for this slow HTTP request. I used the `ping` and `traceroute` commands to view the latency (i.e. the time data takes to go over the network) from the Docker container to `www.google.com` and other domains. All of the tests had latency lower than 100ms, which was very good latency for my needs.\
\
I also removed any resource limitations that were on the Docker container without any impact on performance. I had a feeling this would not make a difference since there was no evidence the container was running up against limitations. Also, the previous results from timing the command showed that the CPU was not doing any work, which means very little resources were used.\
\
I also ran the same test using `wget` on the physical host running the Docker daemon and the Docker container. The test looked like this:

```
time wget https://www.google.com
Connecting to www.google.com (172.253.122.103:443)
saving to 'index.html'
index.html           100% |********************************************************************************************************************************| 15111  0:00:00 ETA
'index.html' saved
real	0m 0.07s
user	0m 0.00s
sys	0m 0.00s
```

The command took only 0.07s to complete instead of 4.07s! So something definitely is wrong in the Docker container.

## It's Never DNS.... It was DNS
Since network was good, resource usage was good, and running the command on the physical host was good, that left DNS lookups as one of the possible causes.\
\
Now I own up that the evidence may not have clearly suggested DNS was the problem, but to me at the time it felt like that was a possible problem to rule out. I like testing DNS lookups especially because "It's Never DNS", except it's always DNS.\
\
So to test out the impact DNS had on the command inside of the Docker container, I modified `/etc/resolv.conf` for the Docker container to manually define nameservers the container can use to do DNS lookups. `resolv.conf` is the file in Linux that tells the operating system where to look to resolve domains.\
\
Docker mounts the `resolv.conf` file into the container separately from the rest of the container's filesystem and other mounts. You can find the path to a container's by using `docker container inspect <container-name>` (replacing `<container-name>` with the actual name of the container) and looking for `ResolvConfPath`. `ResolvConfPath` and its value will look like this line in the output from `docker container inspect`

```
"ResolvConfPath": "/var/lib/docker/containers/2922d5dbc82c7c6d7371f46f03776d8884c02eccbc9af2c5a6234d7611776017/resolv.conf",
```

You can also be extra fancy and use the `format` syntax for Docker commands to return just the vlue of `ResolvConfPath` like the following command:

```
docker container inspect my-container -f "{{.ResolvConfPath}}"
/var/lib/docker/containers/2922d5dbc82c7c6d7371f46f03776d8884c02eccbc9af2c5a6234d7611776017/resolv.conf
```

The `resolv.conf` file will look different depending on your system's configuration, but it probably will have one or more lines that look like this:

```
nameserver 127.0.0.11
```

Lines that start with `nameserver` define IP addresses that DNS lookup requests should be sent to. In this example, DNS lookup requests will be sent to `127.0.0.11`.\
\
I added two new lines starting with `nameserver` to the `resolv.conf` file for the Docker container I was testing to give the Docker container new DNS nameservers to use. I added the following lines to the top of the `resolv.conf` file to define new nameservers that should be tried first:

```
nameserver 8.8.8.8
nameserver 1.1.1.1
```

You can find the IP addresses of free-to-use DNS nameservers on the Internet. Google, Cloudflare, and other companies run nameservers that anyone can use for DNS lookups. `8.8.8.8` is one of Google's nameservers, and `1.1.1.1` is one of Cloudflare's nameservers.\
\
Using multiple nameservers from different providers is a good way to protect against outages at any one provider's DNS nameservers. Linux will try all of the nameservers in the `resolv.conf` file when making DNS lookups.\
\
After I made the change, I reran the test I did earlier to see how long an HTTP request using `wget` took. Here are results showing the change:

```
docker exec -it my-container time wget https://www.google.com
Connecting to www.google.com (172.253.122.103:443)
saving to 'index.html'
index.html           100% |********************************************************************************************************************************| 15111  0:00:00 ETA
'index.html' saved
real	0m 0.07s
user	0m 0.00s
sys	0m 0.00s
```

Defining DNS nameservers in `resolv.conf` caused the request to take 4 less seconds than before! The results from `time` show that the request now takes 0.07 seconds instead of 4.07 seconds.\
\
After making this change, I saw from application logs that the workload in the container was completing its work much more quickly. Tasks that took anywhere from 4-5 seconds up to 10 seconds to complete were now taking 700-800 milliseconds.

## The Better Fix for Slow DNS In Docker Containers
You can use Docker to manually define nameservers for your Docker containers when you create them. Both the `docker create` and `docker run` commands have an option, `--dns`, that you can use to pass in the addresses for nameservers. Here is an example of this usage:

```
docker run --dns 8.8.8.8 --dns 1.1.1.1
```
This command will tell Docker to configure the Docker container to use `8.8.8.8` and `1.1.1.1` as nameservers for DNS lookups done inside of the container instead of the host's DNS configuration or the Docker daemon's DNS lookup functionality.