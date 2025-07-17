---
title: "Using Terraform and Juju"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2023-05-31"
description: "You can do neat and fancy things with Terraform and Juju thanks to the Terraform Juju provider. Deploy infrastructure and applications both through Terraform and Juju."
---

## What is Terraform
Terraform is software you can use to create infrastructure, applications, and other things using Terraform's declarative infrastructure-as-code configuration language. Terraform is made by HashiCorp, who makes a collection of software tools for managing and automating different aspects of using clouds.\
\
Terraform itself is a Golang program that wraps one or more plugins -- called providers -- that actually do the work of creating the things (or, resources as Terraform calls them) inside of your Terraform configuration files (called plans). Terraform uses the providers, many of which are written by 3rd parties, to execute the API calls, web requests, or other commands to create, update, or delete the resources you have defined in your Terraform plan.\
\
For example, a public cloud platform's provider might provide the functionality to request a new virtual machine instance on the public cloud platform. You could define a resource declaration in Terraform that describes the attributes the virtual machine instance should have and the information the public cloud platform requires. Then, when you run Terraform, Terraform will pass the information in the resource declaration to the public cloud platform's provider, which will execute the request for the new virtual machine instance using the information you put in the resource declaration. If everything is successful, Terraform will record information about the new resource in Terraform's own database. When you run Terraform again, Terraform will compare the record of the resource in its database with the public cloud platform's record of the instance; if there are any differences, Terraform will report the differences and will, depending on how the provider is written, update or recreate the virtual machine instance on the public cloud platform.\
\
If you are going to use Terraform to manage resources, you should generally only make changes to the resources through Terraform. Imagine you created a resource through Terraform, but then made a change to that resource outside of Terraform. The next time you run Terraform, Terraform will detect the difference, and, depending on the provider's behavior, Terraform might delete the resource and create a new resource so that the resource's configuration matches what is written in your Terraform plan. This can result in data loss or service downtime.

## Deploy applications with Terraform and Juju
Terraform originally started as a tool for managing infrastructure, like virtual machines, virtual networks, cloud storage volumes, security groups, IP addresses, and other similar types of resources. Since then, Terraform has grown to support many other kinds of resources.\
\
The Juju Terraform provider, for example, allows you to deploy applications through Juju. This means you can use a single Terraform plan to deploy your server infrastructure and then deploy your applications through Juju. You can also use Juju's deployment functionality to help streamline deploying applications.\
\
I do have a disclaimer I must share. At this time, the Juju Terraform provider does not support all of Juju's features and is still in early development. You can certainly do great things with the Juju Terraform provider, but you may run into limitations, bugs, or changes in the provider's behavior as development continues. I use the Juju Terraform provider to deploy OpenStack reliably and consistenly for testing purposes with good success.

## Why use Terraform and the Juju Terraform provider
I use Terraform and the Juju Terraform provider because I need a way to orchestrate the deployment of Canonical's Charmed OpenStack (that is, OpenStack deployed using Juju) repeatably and consistently for testing purposes. I also wanted to create as little new code as possible to save myself the burden of maintaining the code in the future. Instead of writing custom, one-off code to orchestrate the Juju API calls to deploy Charmed OpenStack, I use Terraform and the Juju Terraform provider to make those API calls. Terraform also takes care of all the boring boilerplate code I would have to write to move input and output around during the deployment.\
\
Instead of maintaining code, I can write considerably simpler Terraform plans. In addition, rather than putting my configuration into YAML files or some other machine-friendly format, I can use Terraform's configuration language and its powerful built-in functions, expressions, and other features to create dynamic configurations. I can also still use Terraform to support input variables and output as I need. Furthermore, others can build on the work I have done by copying my plans and customizing them to meet their needs. Finally, when I do need to write new code I can contribute the code to a larger project with a wider user base instead of something only I will ever use.