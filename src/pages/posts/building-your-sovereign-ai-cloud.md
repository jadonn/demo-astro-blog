---
title: "Build your own proof-of-concept sovereign AI cloud"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2025-02-28"
description: "Build your own demo sovereign AI cloud using OpenStack Sunbeam, Microk8s, MAAS, Juju, and LXC!"
---
## Summary
Building a sovereign AI cloud for running your AI workloads is simpler than ever thanks to advancements in several open-source, private cloud software projects. You can even deploy a proof-of-concept for research and development within a single day if you have the hardware resources available.

This deployment uses Ubuntu, Metal-as-a-Service (MAAS), OpenStack Sunbeam, and the Canonical Data Science Stack to deploy a private cloud with support for traditional virtual machines and for running containers in Kubernetes.

**Haven’t heard about sovereign AI clouds before? A sovereign AI cloud is a private cloud you run on your own infrastructure to provide a secure, private place for running AI workloads. The idea is that you can guarantee control over all of your data and compliance with any regulations in your local jurisdiction.**

## Proof-of-concept Requirements
1. Machine with 16 CPUs, 64GB of RAM,and 500GB of storage
2. Ubuntu Jammy or later LTS
3. Shell/CLI access
4. Sudo privileges
5. jq

## High-level architecture
- Ubuntu hypervisor host
	- LXD Container
		- Single-node Metal-as-a-Service (MAAS) server
		- LXD VM Host configuration
	- LXD VM with 12 vCPUs, 32GB of RAM, and 100 GB of storage
		- Single-node OpenStack Sunbeam deployment
			- Microk8s
				- OpenStack control plane services
				- Canonical Data Science Stack
			- OpenStack hypervisor snap

## Deploy your own sovereign AI cloud
1. Prepare LXD
	- Install LXD
	- Initialize LXD
	- Configure LXD
	- Provision LXD networks
	- Create LXD profiles
2. Deploy Metal-as-a-Service (MAAS)
	- Create LXD container
	- Install MAAS snap
	- Install MAAS test database snap
	- Initialize MAAS region and rack controllers
	- Create MAAS admin user
	- Generate MAAS API key
	- Login to the MAAS server
	- Configure MAAS
	- Register LXD VM Host
3. Deploy OpenStack private cloud
	- Commission a VM Host
	- Install OpenStack Sunbeam snap
	- Bootstrap OpenStack Sunbeam cluster
4. Deploy Canonical Data Science Stack
	- Install the Canonical Data Science Stack
	- Bootstrap the Canonical Data Science Stack

### Prepare LXD
This proof-of-concept build uses LXD to provision containers and virtual machines to host sovereign AI cloud.

LXD is not a hard requirement for deploying MAAS, OpenStack Sunbeam, and the Canonical Data Science Stack. You can provision machine resources by some other means and continue with the later steps of this guide.

#### Install LXD
This guide uses the snap version of LXD. Recent versions of Ubuntu come with Snapd and LXD installed, but you can install the LXD snap by running the following command:

```
sudo snap install lxd
```

This command installs LXD and enables the LXD daemon. LXD is not ready for you to use yet, though.

If LXD is already installed, you will see something like:

```
snap "lxd" is already installed, see 'snap help refresh'
```

That is OK! This means LXD is installed already, and you can move on with the guide.

#### Initialize LXD
You must initialize LXD before you can start using it to provision virtual networks, containers, and machines. LXD has a useful auto-initialization feature that is sufficient for running the demo. More advanced LXD configuration is outside of the scope of this guide.

To initialize LXD, run the following command:

```
sudo lxd init --auto
```

This command will configure LXD with its recommended default settings. This configuration is suitable for running workloads locally on a single physical machine. While LXD is ready to provision resources at this time, there are still a few other LXD configuration changes you must make.

#### Configure LXD
While LXD should be ready for provisioning resources if you ran the auto-initialization process, the sovereign AI cloud proof-of-concept requires two more configuration changes to LXD. The first configuration change is to disable IPv6 networking on LXD's main network bridge. In my experience, LXD inconsistently assigns IPv4 and IPv6 addresses to containers, and I think this has caused networking issues between containers.

To disable IPv6 networking in LXD, run the following command:

```
lxc network set lxdbr0 ipv6.address none
```

This command will configure LXD to only use IPv4 addresses.

The last configuration change to make to LXD is configuring the LXD daemon to listen for API requests over HTTPS. This configuration change enables the Metal-as-a-Service (MAAS) server to communicate with the LXD daemon later in this guide.

To set the LXD daemon's listening port for HTTPS connections run the following command:

```
lxc config set core.https_address [::]:8443
```

This command will set LXD to listen for requests using HTTPS to port 8443. **This command will make the LXD daemon listen for requests originating from any IP address. You should only use this configuration in non-production environments in which you do not plan to store data.**

In a production environment, you would ideally limit LXD daemon access to the localhost or to the specific IP addresses of the machines that need to communicate with the LXD daemon.

#### Provision LXD Networks
This proof-of-concept build uses two LXD networks to simulate a basic network topology you might find in a data center. One network is for the MAAS server to use for provisioning traffic, and the other network is for the deployed tenant machine's networking.

Run the following commands to create a LXD network called `maas-ctrl` and to update the LXD network with the configuration you need:

```
lxc network create maas-ctrl
cat << __EOF | lxc network edit maas-ctrl
config:
  dns.domain: maas-ctrl
  ipv4.address: 10.10.0.1/24
  ipv4.dhcp: "true"
  ipv4.dhcp.ranges: 10.10.0.16-10.10.0.31
  ipv4.nat: "true"
  ipv6.address: none
description: ""
name: maas-ctrl
type: bridge
used_by: []
managed: true
status: Created
locations:
- none
__EOF
```

These two commands will create the `maas-ctrl` LXD network and configure the network to have a DNS domain named `maas-ctrl`, an IP address range of `10.10.0.1/24`, enable DHCP with a DHCP range of `10.10.0.16-10.10.0.31`, enable NAT, disable IPv6, configure the network to function as a bridge, and tell LXD to manage the network (that is, setup dnsmasq and NAT). The `maas-ctrl` network is ready to use for provisioning traffic later in this guide, but you must create the `maas-kvm` network before you can provision any machines.

Run the following commands to create the `maas-kvm` LXD network:

```
lxc network create maas-kvm
cat << __EOF | lxc network edit maas-kvm
config:
  ipv4.address: 10.20.0.1/24
  ipv4.dhcp: "false"
  ipv4.nat: "true"
  ipv6.address: none
description: ""
name: maas-kvm
type: bridge
used_by: []
managed: true
status: Created
locations:
- none
__EOF
```

These commands will create a LXD network called `maas-kvm` and configure the network to use the IP address block `10.20.0.1/24`, to disable DHCP, to use NAT, to disable IPv6, to operate as a bridge network, and to have LXD manage dnsmasq and NAT for the network. Disabling DHCP is required for the network MAAS will use to deploy machines because MAAS will function as the DHCP server on this network.

If both of these commands ran successfully, you should have the networking configuration in place to deploy a MAAS server and provision LXD VMs through MAAS as described later in this guide.

#### Create LXD Profiles
This proof-of-concept uses a LXD profile to ensure that the LXD container for MAAS is assigned network interfaces on the `maas-ctrl` and `maas-kvm` networks when the container is created. A LXD profile defines reusable configuration for LXD containers.

Run the following commands to create a LXD profile for the MAAS container:

```
lxc profile create maas
cat << __EOF | lxc profile edit maas
config:
  raw.idmap: |
    uid 1000 1000
    gid 1000 1000
  user.vendor-data: |
    #cloud-config
    packages:
    - jq
description: Container for running MAAS server
devices:
  eth0:
    type: nic
    name: eth0
    network: maas-ctrl
  eth1:
    type: nic
    name: eth1
    network: maas-kvm
__EOF
```

These two commands will create a LXD profile called `maas` and define user and group IDs, cloud-init configuration, and networking devices for LXD containers provisioned using the profile.

At this point, the LXD environment should be ready for you to start provisioning a MAAS server in a LXD container.

### Deploy Metal-as-a-Service (MAAS)
This proof-of-concept uses Metal-as-a-Service (MAAS) to demonstrate machine management similar to how you would manage machines in a production data center. While **the single-node MAAS deployment in this guide is not suitable for production**, the proof-of-concept uses the same features, functionality, and workflows as you would in production.

If you are not familiar with MAAS, this software helps you manage the physical machines in your data center. You can configure MAAS with information about your networking topology and with access credentials to your physical machines and then use MAAS to deploy operating systems, configure networking devices, and configure storage disks/partitions on those physical machines. MAAS also has many features for automating management of physical machines and for integrating with other tools to automagically deploy the resources those tools need for their own workloads.

#### Create LXD container
MAAS usually runs on its own servers inside of your data center with access to your physical machines. This proof-of-concept build uses a LXD container to simulate running MAAS on its own server and using MAAS to provision remote resources. Even though the machines MAAS provisions in this demo will run on the same physical machine as the MAAS LXD container, the physical machine will appear to MAAS as a remote LXD VM host.

To create a LXD container for MAAS using the LXD profile you defined previously, run the following command:

```
lxc launch ubuntu:jammy maas -p default -p maas
```

This command will launch a LXD container named `maas` using the configuration defined in the `default` and `maas` LXD profiles with the 22.04 Jammy Jellyfish release of Ubuntu source from the public Ubuntu archieves. You could probably use a different release of Ubuntu if you wished; 22.04 Jammy Jellyfish was the most recent LTS release available at the time I originally did this work.

#### Add a static IP address for the maas-ctrl network interface
I prefer to configure a static IP address for the network interfaces in the MAAS container to simplify later configuration steps in the proof-of-concept deployment. Specifying a static IP address saves the trouble of trying to figure out what IP address gets assigned to the LXD container when you launch the container.

Run the following commands to add a static IP address to the MAAS container's network interface on the `maas-ctrl` network:

```
lxc config device add maas eth0 nic name=eth0 nictype=bridged parent=maas-ctrl
lxc config device set maas eth0 ipv4.address 10.10.0.2
lxc restart maas
```

These commands will manually add the eth0 network interface to the `maas` container if it is not configured yet, will set the IP address of the eth0 network interface to `10.10.0.02`, and will restart the `maas` container to put the networking configuration changes into effect. Restarting the container is usually fairly quick and should complete within a minute or so.

#### Configure a container network interface for the maas-kvm network
After configuring a static IP address for the `maas-ctrl` network, the next step is to configure a network interface in the `maas` LXD container for the `maas-kvm` network. This demo uses netplan to configure a simple network interface with a static IP address.

Run the following commands to add configuration to netplan for another network interface and apply the changes:

```
cat << __EOF | lxc exec maas -- tee /etc/netplan/99-maas-kvm-net.yaml
network:
    version: 2
    ethernets:
        eth1:
            addresses:
                - 10.20.0.2/24
__EOF
lxc exec maas -- chmod 0600 /etc/netplan/99-maas-kvm-net.yaml
lxc exec maas -- netplan apply
```

These commands use the `lxc exec` command to execute shell commands inside the `maas` LXD container without having to login to the `maas` container. You can login to the `maas` container using `lxc shell maas` if you would like to run these commands from within the container.

These commands will add a new netplan configuration file at `/etc/netplan/99-maas-kvm-net.yaml`, set the file permissions on the file, and apply the changes in netplan. If everything runs successfully, the `maas` container will have a second network interface with the IP address `10.20.0.2/24`. The `maas` container will use this interface to communicate with the machines attached to the `maas-kvm` network.

#### Install MAAS snap
At this time the `maas` container is ready for you to install the MAAS server software. For simplicity, this build uses the MAAS snap to install MAAS. To install the latest stable version of the MAAS snap, run the following command:

```
lxc exec maas -- snap install maas
```

This command uses the `lxc exec` command to issue the shell command `snap install maas` inside of the `maas` LXD container similar to running the command from within the LXD container. This will install the MAAS software, but you must install a database and initialize MAAS before the software is running.

#### Install MAAS test database snap
This proof-of-concept demonstration uses the `MAAS` test database snap to provide a database backend for MAAS without having to provision a full database server or cluster. **The MAAS test database is not suitable for production use. If you want to run MAAS in production you should set up a PostgreSQL server or cluster for the database backend for MAAS**.

To install the MAAS test database snap, run the following command:

```
lxc exec maas -- snap install maas-test-db
```

This command uses the `lxc exec` command to execute the shell command `snap install maas-test-db` inside of the `maas container`. As before with `lxc exec`, you could login to the LXD container using `lxc shell maas` and run `snap install maas-test-db` if you preferred. This command installs and starts a test database for MAAS. You can use the test database as the data storage backend for MAAS.

#### Initialize MAAS region and rack controllers
Before you can use MAAS, you must initialize region and rack controllers. These controllers provide the functionality you would need to manage an entire data center and the individual server racks contained within the data center. The default configuration for them is sufficient for this proof-of-concept build. Advanced controller configuration is outside of the scope of this post.

To initialize a region and rack controller with default configuration, run the following command:

```
lxc exec maas -- maas init region+rack --maas-url="http://10.10.0.2:5240/MAAS" --database-uri maas-test-db:///
```

This command uses `lxc exec` to execute the MAAS initialization command inside of the `maas` container. MAAS will initialize a region and rack controller with the MAAS test database snap as the database backend and with the MAAS URL at `10.10.0.2:5240/MAAS`. You will use `10.10.0.2:5240/MAAS` to access this single-node MAAS server.

At this point the MAAS server will start all of its services and you can start provisioning user credentials for communicating with MAAS.

#### Create MAAS admin user
Before you can use MAAS you must create an admin user. You can do this using the `maas` CLI command. To create an admin user, run the following command:

```
lxc exec maas -- maas createadmin --username admin --password admin --email admin@example.com
```

This command uses `lxc exec` to execute the `maas createadmin` command inside of the `maas` LXD container. This command will create a MAAS user with admin privileges with the username `admin`, the password `admin`, and the email address `admin@example.com`. You can change the username, password, and email address as you need, but that is not necessary for the purposes of this demonstration. Most of the interactions with MAAS use a MAAS API key instead of the username and password.

If you successfully created your admin user, you are ready to provision a MAAS API key for authenticating with the MAAS API.

#### Generate MAAS API key
The MAAS API key is the credential this demo uses to communicate with MAAS throughout the rest of the demonstration. To create a MAAS API key, run the following command:

```
lxc exec maas -- bash -c "maas apikey --username=admin | tee ./api-key"
```

This command uses `lxc exec` to generate an API key for the `admin` user using the MAAS CLI tool and outputs the key to `/root/api-key` inside of the `maas` container. Since `lxc exec` executes commands as simple single-line shell scripts, you must wrap your command in something like `bash -c` in order to use Bash features. This guide uses this approach when necessary.

You do not need to save the API key. The rest of the commands in the guide read the API key as needed, and after you login to the MAAS server you can reuse the same session throughout the rest of the guide.

#### Login to the MAAS server
Before you can make the changes in MAAS this proof-of-concept requires, you must login to the MAAS server using the API key you generated before. To login to MAAS, run the following command:

```
lxc exec maas -- bash -c 'maas login admin http://10.10.0.2:5240/MAAS/api/2.0/ $(cat api-key)'
```

This command uses `lxc exec` to execute the MAAS login command using Bash in order to embed reading the API key inside of the MAAS login command. When you run this command, MAAS will start a client session for you, cache the login locally, and expose several options for you under the `admin` argument in the `maas` CLI.

**You may see HTTP 500 errors when attempting to login to MAAS immediately after initializing MAAS. This can happen if the MAAS services are not fully up and running. If this does happen, wait a minute or so and try again.**

You should only need to login once if you continue on through this guide.

#### Configure MAAS
After logging into MAAS, you must provide the minimum amount of configuration MAAS requires in order to function, such as setting the upstream DNS server for MAAS, importing UEFI, PXE, and operating system images, and configuring networks in MAAS.

##### Configure the upstream DNS server for MAAS
Configuring the upstream DNS server for MAAS helps ensure that MAAS and the servers you deploy will be able to resolve IP addresses for important resources like package repositories and software archives. You can configure any upstream DNS server you want to use, but this demonstration uses Google's free `8.8.8.8` DNS server as an upstream DNS server in MAAS.

To configure the upstream DNS server for MAAS, run the following command:

```
lxc exec maas -- maas admin maas set-config name=upstream_dns value=8.8.8.8
```

This command uses `lxc exec` to run the `maas` CLI using your logged in client session to update the MAAS server's configuration for the `upstream_dns` key to the value `8.8.8.8`. Replace `8.8.8.8` with an alternative IP address for an upstream DNS server if you prefer. You can also set this configuration through the MAAS web UI, usually upon first login, if you accessed MAAS through the web UI. Configuring this setting through the MAAS web UI is outside of the scope of this guide.

##### Import boot resources (UEFI, PXE, OS images, etc.)
MAAS by default does not come with the resources MAAS requires to commission and to provision servers. You must tell MAAS to download these resources before you can work with machines registered in MAAS. To import the default resources, run the following command:

```
lxc exec maas -- maas admin boot-resources import
```

This command uses `lxc exec` to run the `maas` CLI using your logging in client session to start the import process for boot resources. This should be good enough to get all of the resources MAAS needs to commission and to provision machines using the latest LTS release of Ubuntu as the target operating system.

The resource import process can take some time to complete since operating system images and similar resources are hundreds or thousands of megabytes in size. The time this process takes can vary greatly depending on your available network bandwidth and storage speed.

##### Configure networking for virtual machines (VMs) in MAAS

Before you can provision machines in MAAS you must tell MAAS about the networks you have available for provisioning machines. MAAS will attempt to detect the available networks automatically based on the networks connected to its host machine, but sometimes MAAS cannot find all of the information for registering the connected networks. You will need to manually configure the `maas-kvm` network in MAAS since MAAS cannot detect enoguh information about the network from its available network interface. All of this can be done through the MAAS CLI. To configure MAAS to use the `maas-kvm` LXD network for virtual machines, run the following commands:

```
rack_controllers=$(lxc exec maas -- maas admin rack-controllers read)
target_rack_controller=$(echo $rack_controllers | jq --raw-output .[].system_id)
target_fabric_id=$(echo $rack_controllers | jq '.[].interface_set[].links[] | select(.subnet.name | startswith('\"10.20.0.\"')) | .subnet.vlan.fabric_id')
lxc exec maas -- maas admin subnet update 10.20.0.0/24 gateway_ip=10.20.0.1
export ip_range=$(lxc exec maas -- maas admin ipranges create type=dynamic start_ip=10.20.0.99 end_ip=10.20.0.254 comment='To enable dhcp')
lxc exec maas -- maas admin vlan update $target_fabric_id untagged dhcp_on=True primary_rack=$target_rack_controller
```

These commands gather information about the registered rack controllers in MAAS and the network fabrics MAAS has automatically detected. Then the commands use the MAAS CLI with your logged in client session to update the gateway, IP ranges, and VLAN configuration for the network resources in MAAS corresponding to the `maas-kvm` network.

If these commands ran successfully, the `maas-kvm` network is ready to use in MAAS, and you can move on with registering a LXD VM host in MAAS for provisioning LXD VMs through MAAS.

#### Register LXD VM Host
A LXD VM host in MAAS is a LXD daemon MAAS can use to provision LXD VMs in a fashion similar to how MAAS provision physical machines. This proof-of-concept uses this approach to simulate machine management in MAAS without needing additional physical machines. In addition, this proof-of-concept uses the same physical machine running the MAAS LXD container as the LXD VM host to reduce the hardware requirements. **This is not a production-ready architecture. In production, you ideally would use a separate physical machine dedicated to runnning LXD VMs or you would use actual physical machines registered in MAAS.**

Run the following commands to register the LXD daemon on your physical machine as a VM host for MAAS:

```
token=$(lxc config trust add --name maas | tail -1)
lxc exec maas -- maas admin vm-hosts create type=lxd power_address=10.10.0.1 project=maas name=maas-host password="$token"
```

These commands generate a trust token within LXD that you can use to register a remote client with LXD and use that token to register the LXD daemon in MAAS as a VM host for provisioning LXD VMs. MAAS will create its LXD VMs in the `maas` LXD project and will register the VM host in MAAS under the name `maas-host`. MAAS will also use the IP address `10.10.0.1` as the address to communicate with the LXD API. If you were using a remote machine for LXD you would replace `10.10.0.1` with the IP address of the remote LXD daemon.

If this command is successful, MAAS can create LXD VMs using the LXD daemon on your physical machine.

### Deploy OpenStack private cloud
At this point if everything executed successfully, you are ready to deploy an OpenStack private cloud on a LXD VM managed through MAAS.

#### Compose a LXD VM
Compose a LXD VM through MAAS will create a LXD VM using the LXD daemon on the physical machine you registered in the previous step. The following command will attempt to compose a LXD VM through MAAS:
```
lxc exec maas -- maas admin vm-host compose 1 cores=12 memory=32000 storage=0:80 hostname=openstack
```
This command uses the LXD `exec` command to run the MAAS CLI command for composing a LXD VM with 12 vCPUs, 32GB of memory, 80GB of storage, and the hostname `openstack` using the LXD VM host with the ID `1`, which should be the LXD VM host you registered in the previous step. **If you receive an error about MAAS failing to find the LXD VM host, double check the ID of the LXD VM host in MAAS and adjust the command to use the ID you find in MAAS.**

You should ensure your machine has enough resources to compose this VM. 12 vCPUs, 32GB of memory, and 80GB of storage are recommended for running the proof-of-concept OpenStack cloud deployment.


After the compose command runs, you should see output with metadata and information about the LXD VM. Find the `system_id` key and copy its value. This `system_id` is the LXD VM's ID in MAAS. **You will need the system ID to continue deploying the LXD VM.**

When you compose a LXD VM through MAAS, the LXD daemon will provision resources and configure the LXD VM, but the LXD VM will not start. You must deploy the LXD VM in order to start using the LXD VM. After the LXD VM reaches "Ready" status, you can deploy the LXD VM.

You can check on the status of the LXD VM through the MAAS CLI using the following command:

```
lxc exec maas -- maas admin machine read <system_id>
```

Replace `<system_id>` with the value of the system ID you saved after you ran the compose command. Once the LXD VM has reached "Ready" status, you can move on to deploying the LXD VM.

#### Deploy the LXD VM
When the LXD VM reaches "Ready" status, you can deploy the LXD VM with an operating system, storage, and networking configuration. **Before you can deploy the LXD VM, you must have the LXD VM's system ID from MAAS.**

To deploy the LXD VM you composed earlier in this guide, run the following command:
```
lxc exec maas -- maas admin machine deploy <system_id>
```
Replace `<system_id>` with the real system ID of the LXD VM you composed earlier. This command starts the deploy process. MAAS will start the LXD VM through the LXD daemon and will configure the LXD VM for your use.

You can check on the status of the LXD VM using the following command:

```
lxc exec maas -- maas admin machine read <system_id>
```
Replace `<system_id>` with the real system ID of the LXD VM you deployed. This is the same command for checking the status and retrieving information about the given LXD VM as referenced in this guide when composing a LXD VM through MAAS.

When the LXD VM has reached "Deployed" status, the LXD VM is ready for you to deploy OpenStack and other software.

#### Install OpenStack Sunbeam snap
This proof-of-concept uses the OpenStack Sunbeam project to deploy a single-node OpenStack cluster for demonstration and evaluation purposes. OpenStack Sunbeam is a new deployment and orchestration tool for OpenStack built on top of Snaps, Microk8s, Terraform, and Juju.

Run the following command to install the OpenStack Sunbeam snap in your deployed LXD VM:

```
lxc exec sunbeam-one --project maas -- snap install openstack --channel 2024.1/edge
```
This command uses the `lxc exec` command to run `snap install openstack --channel 2024.1/edge` inside of the LXD VM named `sunbeam-one`. Replace `2024.1/edge` with the channel you need.

#### Bootstrap OpenStack Sunbeam cluster
Bootstrapping the OpenStack Sunbeam cluster requires preparing the node for OpenStack Sunbeam and running OpenStack Sunbeam's bootstrap command. The following command will use `lxc exec` to dump OpenStack Sunbeam's prepare node script to a file and execute the file:
```
lxc exec sunbeam-one --project maas --user 1000 --group 1000 --cwd /home/ubuntu/ -- bash -c 'sunbeam prepare-node-script | tee /home/ubuntu/prepare-node.sh'
lxc exec sunbeam-one --project maas --user 1000 --group 1000 --cwd /home/ubuntu/ --env HOME=/home/ubuntu/ -- bash /home/ubuntu/prepare-node.sh
```

These commands are written to work with the limitations of the `lxc exec` command. The prepare node script sets up user groups, installs dependencies, and makes other adjustments to your system to meet OpenStack Sunbeam's needs.

To bootstrap OpenStack Sunbeam using the OpenStack Sunbeam snap, run the following command:

```
lxc exec sunbeam-one --project maas --user 1000 --group 584788 --cwd /home/ubuntu/ -- sunbeam cluster bootstrap --accept-defaults
```

This command uses `lxc exec` to run the `sunbeam cluster bootstrap` command with default values. The `user`, `group`, and `cwd` arguments help the bootstrap process work within the limitations of `lxc exec`.

This command will install Microk8s to the LXD VM, deploy the OpenStack control plane, and deploy the OpenStack hypervisor.

### Deploy Canonical Data Science Stack
Once OpenStack Sunbeam has finished deploying you can deploy the Canonical Data Science Stack. You can deploy the Data Science Stack onto Kubernetes in a VM or using the same Microk8s instance powering OpenStack Sunbeam. For simplicity, this demonstration proof-of-concept deploys the Data Science Stack to Microk8s alongside OpenStack Sunbeam.


#### Install the Canonical Data Science Stack

The Data Science Stack is delivered using a snap. Run the following command to install the Data Science Stack snap:
```
lxc exec sunbeam-one --project maas --user 1000 --group 584788 --cwd /home/ubuntu/ -- sudo snap install data-science-stack --channel latest/stable
```

This command uses `lxc exec` to install the `data-science-stack` using the `snap` command.

#### Initialize the Canonical Data Science Stack

After the snap finishes installing you can move on to initializing the Data Science Stack. Run the following command to initialize the Data Science Stack:
```
lxc exec sunbeam-one --project maas --user 1000 --group 584788 --cwd /home/ubuntu/ -- bash -c 'dss initialize --kubeconfig="$(sudo microk8s config)"'
```
This command initializes the Data Science Stack using the Kubernetes configuration from the Micro8ks deployment OpenStack Sunbeam created for simplicity and for demonstration purposes. The Data Science Stack snap will install several popular software components for data science work into Microk8s.

#### Create a Notebook
You can use the Data Science Stack snap to create an example notebook to test the initialization process. Run the following command to create a notebook using the Data Science Stack snap:
```
lxc exec sunbeam-one --project maas --user 1000 --group 584788 --cwd /home/ubuntu/ -- dss create my-notebook --image=kubeflownotebookswg/jupyter-scipy:v1.8.0
```

## The resulting deployment
If you were able to successfully follow the deployment guide, you should have a single-node private cloud deployment with Microk8s, OpenStack, and data science software like Jupyter Notebooks. While **this deployment is not suitable for production**, this deployment has all of the technology components you would use to deploy production-ready private cloud infrastructure. How to do that is outside of the scope of this guide, but each of the software projects in use have guides and information on how to deploy them for production use.

You should be able to access Microk8s, OpenStack, and the Data Science Stack from the machine hosting the LXD VM, but the exact way to access these resources will vary based on your environment.

## A note on the software components
For the most part you should be able to swap out pieces of the sovereign AI cloud stack if you prefer using other tools. For example, you could use something other than LXD and MAAS to orchestrate provisioning virtual machines. You could provision directly to physical hardware. You could use something else to deploy OpenStack, Kubernetes, and the data science software. You may have to spend more time integrating the different pieces together, though, if you replace one part of the infrastructure stack with something else.

