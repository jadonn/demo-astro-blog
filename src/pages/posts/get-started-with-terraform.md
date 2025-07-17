---
title: "Get Started with Terraform"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2023-06-01"
description: "Provision infrastructure, applications, and resources with Terraform today! Learn how to install Terraform and the basics of using Terraform."
---

## What you need to follow along with this post
- Some familiarity using Linux
- Basic command line comfort
- A computer or server with Ubuntu 22.04 installed

## What is Terraform
Terraform is a tool made by HashiCorp for automating the deployment of servers, applications, virtual machines, cloud resources, and many other things you might need to run a workload. It is written in the Golang programming language, but Terraform has its own configuration language for telling Terraform what to do.

## How to install Terraform
The Terraform website has [a web page with instructions for all the ways to install Terraform](https://developer.hashicorp.com/terraform/downloads). For this post, I'm installing Terraform onto Ubuntu (the 22.04 release) with Snapd using the Terraform snap. Ubuntu is a Linux distribution, 22.04 is the version of Ubuntu released in April of 2022, and Snapd is software for running applications in self-contained units called snaps.\
\
You can install Terraform on Ubuntu using the Terraform snap by running the following command:
```
sudo snap install terraform --classic
```

This command will use superuser/root privileges to install the Terraform snap from the Snapstore, which is the official source of software packaged as snaps. The `--classic` part of the command means the snap will use Snapd's "classic confinement" configuration for the snap; this means the snap will have more access to the system to which the snap is installed compared to newer snaps. Snapd and newer snaps in general try to limit the access applications have to your system in order to prevent unauthorized access to your system. If you run this command, you should see output like the following:

```
ubuntu@terraform-install:~$ sudo snap install terraform --classic
terraform 1.4.5 from Jon Seager (jnsgruk) installed
ubuntu@terraform-install:~$
```

You can confirm Terraform is installed by running the following command:
```
terraform -v
```

If you run this command, you should see the following output:
```
ubuntu@terraform-install:~$ terraform -v
Terraform v1.4.5
on linux_amd64
```
## Choose your provider
Terraform on its own does not do anything. Terraform relies on plugins called providers to actually do the things you want Terraform to do. Before you can get started with Terraform you have to select a provider. You can find providers on [Terraform's official registry of providers](https://registry.terraform.io). The registry has a wide variety of providers for provisioning many different kinds of resources through Terraform. You can find providers from HashiCorp and the Terraform project, from major cloud providers like Google, Amazon, Microsoft, and Oracle, and from major software projects like Docker and Kubernetes.\
\
This post will use the Juju Terraform provider to demonstrate Terraform's basics and to provide a starting point for later posts about more complex use cases for the Juju Terraform provider.

## What is Juju
Juju, also known as the Charmed Operator Framework, is software for deploying and managing cloud infrastructure an applications. Juju uses Charmed Operators (often shortened to just "Charms") that wrap the installation, configuration, and management of applications or collections of applications for ease of use.\
\
For full disclosure's sake, I'm a software engineer at Canonical on the OpenStack team at the time I'm writing this post; however, I don't work on Juju. I have contributed to the Juju Terraform provider, and I use the Juju Terraform provider quite a bit to manage deploying OpenStack.

### Install Juju
You can install Juju from the Snapstore much like you installed Terraform earlier if you are following along with this post. The following command will install the Juju snap from the Snapstore:
```
sudo snap install juju --classic
```

This command will use superuser/root privileges to download the Juju snap from the Snapstore and install Juju. As with the Terraform snap, the Juju snap uses Snapd's "classic confinement" because it requires additional access to the system running Snapd than newer snaps.\
\
If you run the above command to install the Juju snap, you should see output like the following after the install process finishes:
```
ubuntu@terraform-install:~$ sudo snap install juju --classic
juju (2.9/stable) 2.9.42 from Canonical✓ installed
```

You can check that Juju installed correctly by running the following command:
```
juju --version
```

This command will output the version of Juju in use. If this is the first time you have run the Juju command, you will also see a message about Juju downloading the latest public cloud information. Juju uses this information when Juju users want to deploy applications onto public clouds. If you are not going to do that, you can ignore that message.\
\
Here is what the output from the above command will look like:
```
ubuntu@terraform-install:~$ juju --version
Since Juju 2 is being run for the first time, it has downloaded the latest public cloud information.
2.9.42-ubuntu-amd64
```

There may be a small amount of variation if you are using a different version of Juju.

## We still need an infrastructure platform
Terraform can use Juju to deploy applications for us, but we still need somewhere to deploy those applications. You can use a cloud platform if you have access to a cloud platform, but this tutorial will use Juju's built-in LXD cloud configuration to deploy applications on your local computer or server running Terraform and Juju.\
\
[LXD](https://linuxcontainers.org/lxd/) (commonly pronounced "lex-dee") is software for running containers and virtual machines. Running software in containers and virtual machines can help prevent you from accidentally making changes to your computer or server and is a common way to test out software. When you use the LXD cloud configuration, Juju will make LXD containers and install the applications you choose inside of the LXD containers. When you delete the applications from Juju, the LXD containers will be deleted as well.

### How to install LXD
You can install LXD using snaps like you did with Terraform and Juju if you have been following this post. You can use the following command to install LXD:
```
sudo snap install lxd
```

This command will use superuser/root privileges to download and install the LXD snap from the Snapstore. Unlike the Terraform and Juju snaps, the LXD snap does not require any special privileges. The LXD snap may already be installed by default on your Ubuntu installation.\
\
If the LXD snap is already installed, you may see output that looks like the following:
```
ubuntu@terraform-install:~$ sudo snap install lxd
snap "lxd" is already installed, see 'snap help refresh'
```

If the LXD snap is not installed, you should see output like the following:
```
ubuntu@terraform-install:~$ sudo snap install lxd
lxd 3.9 from Canonical✓ installed
```

### Initialize LXD
Before you can use LXD, you have to initialize LXD's configuration. The initialization process gives you a chance to tell LXD how it should behave for things like what types of storage or networking LXD should use for containers. You can go through the initialization step by step or you can auto-initialize LXD with its default configuration. For the purposes of this post, I'm going to use the auto-initialization. The default values are generally safe to use for simple workloads and configurations.\
\
You can run LXD with auto-initialization with the following command:
```
lxd init --auto
```

If the command runs successfully, you will not see any output, and you can proceed with the next steps of getting started with Terraform.

### Bootstrap a Juju controller
Before you can deploy resources using Juju, you must bootstrap a Juju controller. The Juju controller is software that Juju uses to keep track of the resources you deploy through Juju. You can bootstrap a Juju controller using an LXD container on your computer or server by running the following command:
```
juju bootstrap localhost
```

This command will bootstrap the controller using the "localhost" cloud, which is the LXD cloud configuration built into Juju. You should see output like the following as the bootstrap process occurs:
```
ubuntu@terraform-install:~$ juju bootstrap localhost
Creating Juju controller "localhost-localhost" on localhost/localhost
Looking for packaged Juju agent version 2.9.42 for amd64
Located Juju agent version 2.9.42-ubuntu-amd64 at https://streams.canonical.com/juju/tools/agent/2.9.42/juju-2.9.42-linux-amd64.tgz
To configure your system to better support LXD containers, please see: https://linuxcontainers.org/lxd/docs/master/explanation/performance_tuning/
Launching controller instance(s) on localhost/localhost...
 - juju-d01247-0 (arch=amd64)                 
Installing Juju agent on bootstrap instance
Fetching Juju Dashboard 0.8.1
Waiting for address
Attempting to connect to fd42:296b:d876:b31b:216:3eff:feed:cee0:22
Attempting to connect to 10.101.83.216:22
Connected to 10.101.83.216
Running machine configuration script...
Bootstrap agent now started
Contacting Juju controller at 10.101.83.216 to verify accessibility...

Bootstrap complete, controller "localhost-localhost" is now available
Controller machines are in the "controller" model
Initial model "default" added
```

At this stage, you can now use Juju to deploy applications into LXD containers on your local computer or server.

## Deploy an application with Terraform and the Juju Terraform provider
Let's try deploying an application through Juju using Terraform and the Juju Terraform provider. Terraform organizes your configuration info files called plans. A Terraform plan can consist of a single file containing your entire configuration or multiple files describing your configuration when you combine them together. To keep things simple, we will look at a single-file Terraform plan.\
\
It may be helpful to create a new directory to hold your work if you have not done so. While the Terraform plan will only be a single file, Terraform will create directories and files in the directory in which you run Terraform. These files and directories hold the data Terraform needs to function.\
\
To get started with writing your Terraform plan, create a single file in the current directory called `main.tf`. When you run Terraform, it will look for a file called `main.tf` to contain the main declarations for your deployment. Even when you spread your plan out over multiple files and folders, you must still have a file called `main.tf` as the starting point for your Terraform plan. Once you have created the file, you can open the file and start writing your Terraform plan.

### Define your providers
The first thing you must do in your Terraform plan is define the providers Terraform will use. Remember, Terraform providers are plugins Terraform uses to actually create, inspect, update, and delete the resources you want. The `terraform` block tells Terraform the providers your plan requires and the versions of those providers. Here is an example `terraform` block that tells Terraform this plan will require the Juju Terraform provider with version `0.7.0`.

```
terraform {
    required_providers {
        juju = {
            version = "~> 0.7.0"
            source = "juju/juju"
        }
    }
}
```

Copy this configuration to the top of your Terraform plan. This configuration will make Terraform download the providers listed in the `required_providers` block with the given versions from the given sources. By default, Terraform will try to download the provider from the registry. In this case, Terraform will try to download the provider from the registry at https://registry.terraform.io/providers/juju/juju. You can download providers from alternative sources, but that is outside the scope of this post.

### Define your provider configuration
Many providers require additional information before they will function properly. Refer to the providers' documentation for what information they need. You can define the provider configuration for Juju using a `provider` block. Copy the following `provider` block into your Terraform plan below the `terraform` block:

```
provider "juju" {}
```

In many cases you would define configuration that is specific for the provider in this block. In this case, however, Juju can use the configuration information Juju saved to your computer or server when you ran the Juju bootstrap process earlier in these instructions. Juju will automatically pull the information from the Juju files saved in your home directory at `~/.local/share/juju/`.

### Define a Juju model
Juju organizes workloads inside of models. A single model is supposed to contain all the applications, machines, storage, and other components a workload needs in order to run. We have to define a model to hold the workload we are going to deploy. We can tell Terraform to create a model by declaring [a Juju model resource block](https://registry.terraform.io/providers/juju/juju/latest/docs/resources/model). Here is an example Juju model resource block:

```
resource "juju_model" "example_model" {
    name = "hello-juju"

    cloud {
        name = "localhost"
        region = "localhost"
    }
}
```

Copy this resource block into your Terraform plan below the `provider` block you added to your plan in the previous step. When Terraform processes this resource block, Terraform will create a record in its internal state for a resource of the "juju_model" type with the internal Terraform name "example_model". Terraform will also use the Juju Terraform provider to create a model named "hello_juju" and configured to use a cloud named "localhost" from Juju's configuration.

### Define an application
Now that we have a model defined, we are ready to define an application for Juju to deploy into the model. To keep things simple, we will deploy a simple example application that says "Hello, Juju!" and does nothing else. Simple applications like this are commonly used to demonstrate the core examples of a given technology. Here is an example Juju application resource block:

```
resource "juju_application" "hello_juju" {
    model = juju_model.example_model.name

    name = "hello-juju"

    charm {
        name = "hello-juju"
    }

    units = 2
}
```

Copy this resource block beneath the `juju_model` resource block. When Terraform processes this resource block, Terraform will create a record of a `juju_application` resource with the internal Terraform name `hello_juju`. Terraform will also tell Juju to deploy an application in the model with the name given at `juju_model.example_model.name`. When Terraform sees something like `juju_model.example_model.name`, Terraform knows it should refer to the record it has for the `juju_model` resource with the internal Terraform name `example_model` to find the configuration the resource has associated with the term `name`. In this case, `juju_model.example_model.name` will turn into "hello_juju" when Terraform processes this plan. Terraform will also know it has to create the `juju_model` resource with the internal Terraform name `example_model` before it can create the `juju_application` resource with the internal Terraform name `hello_juju` because the `juju_application` resource needs information from the `juju_model` resource. Terraform will also tell Juju to deploy an application with the name "hello-juju" using the Charm called "hello-juju" from Charmhub, the official repository for charms. Finally, Terraform will tell Juju to make two units (that is, copies) of the `hello-juju` application inside of Juju; Terraform will still see the two copies of the `hello-juju` application as a single entity in its own internal state.\
\
At this stage, we have a complete, simple Terraform plan. You are ready to initialize and run Terraform.

## Initalize Terraform
Before you can run Terraform to create and manage infrastructure, you must initialize Terraform. You can initialize Terraform with the following command:

```
terraform init
```

When you run this command, Terraform will process the configuration in the `terraform` block in your Terraform plan. Terraform will download any of the providers you have defined in your plan. It will also create the local files and directories it needs to keep track of the state of the resources you deploy through Terraform. You should see output like the following after you run this command:

```
ubuntu@terraform-install:~/terraform-learning$ terraform init

Initializing the backend...

Initializing provider plugins...
- Finding juju/juju versions matching "~> 0.7.0"...
- Installing juju/juju v0.7.0...
- Installed juju/juju v0.7.0 (self-signed, key ID DCB840461E1A9816)

Partner and community providers are signed by their developers.
If you'd like to know more about provider signing, you can read about it here:
https://www.terraform.io/docs/cli/plugins/signing.html

Terraform has created a lock file .terraform.lock.hcl to record the provider
selections it made above. Include this file in your version control repository
so that Terraform can guarantee to make the same selections by default when
you run "terraform init" in the future.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

After you initialize Terraform, you can start using Terraform to create and manage resources.

## Let's deploy your workload with Terraform and Juju!
You should be ready at this point to deploy the simple workload defined in your Terraform plan using Terraform and Juju. To deploy your workload, run the following command:

```
terraform apply
```

This command will make Terraform refresh the information it has for the resources you defined in your Terraform plan. The refresh process usually involves Terraform using the providers you defined in the `terraform` block in your plan to pull information from the services you use to deploy your workload, such as Juju. If this is the first time you run `terraform apply`, Terraform will see that it does not have records for any of the resources defined in your Terraform plan, and Terraform will show you output that shows what changes it will make on your behalf when you run the Terraform plan. When you run `terraform apply`, you should see output that looks like the following:

```
ubuntu@terraform-install:~/terraform-learning$ terraform apply

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # juju_application.hello_juju will be created
  + resource "juju_application" "hello_juju" {
      + constraints = (known after apply)
      + id          = (known after apply)
      + model       = "hello-juju"
      + name        = "hello-juju"
      + placement   = (known after apply)
      + principal   = (known after apply)
      + trust       = false
      + units       = 2

      + charm {
          + channel  = (known after apply)
          + name     = "hello-juju"
          + revision = (known after apply)
          + series   = (known after apply)
        }
    }

  # juju_model.example_model will be created
  + resource "juju_model" "example_model" {
      + credential = (known after apply)
      + id         = (known after apply)
      + name       = "hello-juju"
      + type       = (known after apply)

      + cloud {
          + name = "localhost"
        }
    }

Plan: 2 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

juju_model.example_model: Creating...
juju_model.example_model: Creation complete after 1s [id=2cc78250-0502-4294-8aa0-c8148489e536]
juju_application.hello_juju: Creating...
juju_application.hello_juju: Creation complete after 6s [id=hello-juju:hello-juju]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.
```

This output has a good deal of information, and it may seem a bit overwhelming at first! First, Terraform shows you the resources that will be created when Terraform processes the plan. Everything you see with a green plus + sign next to it is something new that Terraform will try to create. You may also see `(known after apply)` for most of the values. That is normal for values that you did not define or that Terraform will get from Juju. Next, Terraform shows you a total of the new resources that will be created, the existing resources that will be updated, and the existing resources that will be deleted. After this, Terraform shows you a prompt to confirm the changes. By default, Terraform will not make any changes unless you confirm the changes by exactly typing `yes` into the prompt. After you type `yes` into the prompt, Terraform executes your plan. You will see output like `juju_model.example_model: Creating...` while Terraform submits the requests to Juju. When Juju says it has received the request and queued the request for completion, Terraform will show output like `juju_model.example_model: Creation complete after 1s [id=2cc78250-0502-4294-8aa0-c8148489e536]`.\ Depending on how complex your plan is you may see a good deal of output about creating resources. Finally, when Terraform is complete, it will output a summary of what it did or any errors it encountered while processing your plan.
\
**One important thing to remember about Terraform is that it will mark a resource as completed if the external service (in this case Juju) with which Terraform is communicating says that it accepted the request. Even though the external service receives and accepts the request your external service provider may fail to complete the request. Terraform will not know about the failure until the next you run Terraform, and Terraform refreshes its state.** So to be clear, even though Terraform asks Juju to make a model and deploy an application, Juju could fail at either or both tasks. Many of the Terraform providers (not just Juju) have similar behavior, but this kind of problem is relatively rare.\
\
At this stage you can see the changes Juju is working on after you ran Terraform. You can see the status of the Juju model by running the following command:

```
juju status -m hello-juju
```

This command tells Juju to report the status on the model named `hello-juju`. The argument `-m` gives Juju a model name against which to execute the command (in this case, `status`) that you gave to Juju. If the command runs successfully, you should see output like the following:

```
ubuntu@terraform-install:~/terraform-learning$ juju status -m hello-juju
Model       Controller           Cloud/Region         Version  SLA          Timestamp
hello-juju  localhost-localhost  localhost/localhost  2.9.42   unsupported  14:57:47-04:00

App         Version  Status   Scale  Charm       Channel  Rev  Exposed  Message
hello-juju           unknown    0/2  hello-juju  stable     8  no       

Unit          Workload  Agent       Machine  Public address  Ports  Message
hello-juju/0  waiting   allocating                                  waiting for machine
hello-juju/1  waiting   allocating                                  waiting for machine
```

This is the status output for Juju. You can see that Juju has created a single application called `hello-juju` with two units `hello-juju/0` and `hello-juju/1` that correspond to the two units you defined in your `juju_application` resource block. Juju will continue to provision the application and its two units, and you can run `juju status -m hello-juju` again after a minute or two to see the status.\
\
At this point, you can manage the application and its units through Juju the same as you would any other application deployed through Juju. Juju has [extensive documentation on how to use Juju on the Juju website](https://juju.is/docs/olm). If you have issues with Juju, or the application does not deploy successfully, please refer to the Juju documentation for how to troubleshoot further. Juju usage and troubleshooting is outside of the scope of these instructions.

## See what Terraform can do - the terraform plan command
You can use the `terraform plan` command to preview the changes Terraform will make on your infrastructure, deployments, and other resources managed through Terraform without making any actual changes. Run the following example to see the changes Terraform will make and save the changes to a file:

```
terraform plan
```

This command will show you the changes Terraform expects from running the `terraform apply` command.\
\
If you would like to save the expected changes to a file for later review, you can run the `terraform plan` command with the `-out` flag like in the following example:

```
terraform plan -out hello-juju.plan`
```

This command will make Terraform show you the changes it expects and save the detected changes to a file named `hello-juju.plan` in the current directory. You do not have to save the changes to a file, but saving the changes to a file helps guarantee that Terraform will make the changes it detected when you ran `terraform plan`. You can give the file to Terraform when you run the `terrafrom apply` command to make Terraform run only the changes it saw when you ran `terraform plan`.

## Change your deployment by changing your Terraform plan
When you are ready to update your infrastructure, workloads, or other things deployed through Terraform, make changes to your Terraform plan and rerun the `terraform apply` command. Terraform will detect the changes and issue requests to Juju to make the changes you have put in your Terraform plan. For example, replace your `juju_application` resource block with the two `juju_application` resource blocks below:

```
resource "juju_application" "one" {
    model = juju_model.example_model.name

    name = "hello-juju-one"

    charm {
        name = "hello-juju"
    }

    units = 1
}

resource "juju_application "two" {
    model = juju_model.example_model.name

    name = "hello-juju-two"

    charm {
        name = "hello-juju"
    }

    units = 1
}
```

Save the change and run `terraform apply` again. Terraform will process the plan, refresh its state with Juju, and determine the changes that Terraform will make. You should see output that looks like the following:

```
ubuntu@terraform-install:~/terraform-learning$ terraform apply
juju_model.example_model: Refreshing state... [id=2cc78250-0502-4294-8aa0-c8148489e536]
juju_application.hello_juju: Refreshing state... [id=hello-juju:hello-juju]

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the
following symbols:
  + create
  - destroy

Terraform will perform the following actions:

  # juju_application.hello_juju will be destroyed
  # (because juju_application.hello_juju is not in configuration)
  - resource "juju_application" "hello_juju" {
      - constraints = "arch=amd64" -> null
      - id          = "hello-juju:hello-juju" -> null
      - model       = "hello-juju" -> null
      - name        = "hello-juju" -> null
      - placement   = "0,1" -> null
      - principal   = true -> null
      - trust       = false -> null
      - units       = 2 -> null

      - charm {
          - channel  = "stable" -> null
          - name     = "hello-juju" -> null
          - revision = 8 -> null
          - series   = "focal" -> null
        }
    }

  # juju_application.one will be created
  + resource "juju_application" "one" {
      + constraints = (known after apply)
      + id          = (known after apply)
      + model       = "hello-juju"
      + name        = "hello-juju-one"
      + placement   = (known after apply)
      + principal   = (known after apply)
      + trust       = false
      + units       = 1

      + charm {
          + channel  = (known after apply)
          + name     = "hello-juju"
          + revision = (known after apply)
          + series   = (known after apply)
        }
    }

  # juju_application.two will be created
  + resource "juju_application" "two" {
      + constraints = (known after apply)
      + id          = (known after apply)
      + model       = "hello-juju"
      + name        = "hello-juju-two"
      + placement   = (known after apply)
      + principal   = (known after apply)
      + trust       = false
      + units       = 1

      + charm {
          + channel  = (known after apply)
          + name     = "hello-juju"
          + revision = (known after apply)
          + series   = (known after apply)
        }
    }

Plan: 2 to add, 0 to change, 1 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

juju_application.hello_juju: Destroying... [id=hello-juju:hello-juju]
juju_application.hello_juju: Destruction complete after 1s
juju_model.example_model: Modifying... [id=2cc78250-0502-4294-8aa0-c8148489e536]
juju_model.example_model: Modifications complete after 0s [id=2cc78250-0502-4294-8aa0-c8148489e536]
juju_application.two: Creating...
juju_application.one: Creating...
juju_application.two: Creation complete after 2s [id=hello-juju:hello-juju-two]
juju_application.one: Creation complete after 3s [id=hello-juju:hello-juju-one]

Apply complete! Resources: 2 added, 0 changed, 1 destroyed.
```

Terraform should plan to add two new resources and destroy one existing resource. When you remove the `juju_application` resource block with the internal Terraform name `hello_juju` from your Terraform plan, Terraform understands that change to mean you are removing the resource from your deployment. Terraform will execute a request to destroy the resource with Juju. Terraform will also execute requests to create new applications with Juju since it does not have any record of the applications in its internal database.\
\
When you are using Terraform to manage your infrastructure, resources, or deployments, you make changes to them by making changes to your Terraform plan and rerunning Terraform. Be careful when you make changes to your Terraform plan. Some changes to your plan's resources can result in the resources being deleted and recreated; this depends on the behavior programmed into the Juju Terraform provider for the resources. Make sure to carefully review the changes Terraform has detected before you allow Terraform to perform the actions it describes to you.

## Remove your workload entirely using Terraform
You can also use Terraform to remove all of your infrastructure, resources, or deployments managed through Terraform at once using the `terraform destroy` command. This command is helpful for when you need to redeploy your resources or when you are cleaning up unneeded resources. Run the following command to destroy your deployment:

```
terraform destroy
```

When you run this command, Terraform will refresh its internal state of the resources it is currently managing, and Terraform will show you output containing all of the changes Terraform will make. You should see output like the following:

```
ubuntu@terraform-install:~/terraform-learning$ terraform destroy
juju_model.example_model: Refreshing state... [id=2cc78250-0502-4294-8aa0-c8148489e536]
juju_application.one: Refreshing state... [id=hello-juju:hello-juju-one]
juju_application.two: Refreshing state... [id=hello-juju:hello-juju-two]

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the
following symbols:
  - destroy

Terraform will perform the following actions:

  # juju_application.one will be destroyed
  - resource "juju_application" "one" {
      - constraints = "arch=amd64" -> null
      - id          = "hello-juju:hello-juju-one" -> null
      - model       = "hello-juju" -> null
      - name        = "hello-juju-one" -> null
      - placement   = "3" -> null
      - principal   = true -> null
      - trust       = false -> null
      - units       = 1 -> null

      - charm {
          - channel  = "stable" -> null
          - name     = "hello-juju" -> null
          - revision = 8 -> null
          - series   = "focal" -> null
        }
    }

  # juju_application.two will be destroyed
  - resource "juju_application" "two" {
      - constraints = "arch=amd64" -> null
      - id          = "hello-juju:hello-juju-two" -> null
      - model       = "hello-juju" -> null
      - name        = "hello-juju-two" -> null
      - placement   = "2" -> null
      - principal   = true -> null
      - trust       = false -> null
      - units       = 1 -> null

      - charm {
          - channel  = "stable" -> null
          - name     = "hello-juju" -> null
          - revision = 8 -> null
          - series   = "focal" -> null
        }
    }

  # juju_model.example_model will be destroyed
  - resource "juju_model" "example_model" {
      - config     = {} -> null
      - credential = "localhost" -> null
      - id         = "2cc78250-0502-4294-8aa0-c8148489e536" -> null
      - name       = "hello-juju" -> null
      - type       = "iaas" -> null

      - cloud {
          - name   = "localhost" -> null
          - region = "localhost" -> null
        }
    }

Plan: 0 to add, 0 to change, 3 to destroy.

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes

juju_application.two: Destroying... [id=hello-juju:hello-juju-two]
juju_application.one: Destroying... [id=hello-juju:hello-juju-one]
juju_application.one: Destruction complete after 1s
juju_application.two: Destruction complete after 1s
juju_model.example_model: Destroying... [id=2cc78250-0502-4294-8aa0-c8148489e536]
juju_model.example_model: Destruction complete after 0s

Destroy complete! Resources: 3 destroyed.
```

When you run `terraform destroy`, Terraform will tell Juju to delete the applications and the model you deployed through Terraform. If you want to redeploy your applications through Terraform, run `terraform apply` again like you did earlier in these instructions.

## Now you can deploy stuff with Terraform
If you followed along with this post, you should have learned about the very basics of deploying stuff using Terraform. Most Terraform plans are one or more resource blocks and some configuration inside of each resource block. You can learn more about the configuration for resources by consulting the documentation for the providers you are using. For example, you can do much more configuration with the `juju_application` resource than what the examples in this post use. You can find those more advanced options and some examples at [the Terraform registry's page for the juju_application resource](https://registry.terraform.io/providers/juju/juju/latest/docs/resources/application). The Juju Terraform provider also has support for other resources that correspond to other things Juju can create, like machine resources for managing the machine resources Juju provisions.\
\
More advanced deployments with Terraform (and Juju!) are outside of the scope of these instructions and will be in other posts.