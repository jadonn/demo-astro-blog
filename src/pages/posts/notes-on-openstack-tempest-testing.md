---
title: "Notes on OpenStack Tempest Testing"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2023-02-16"
description: "Notes on my experience using OpenStack Tempest to perform tests against OpenStack."
---

## What is OpenStack Tempest?
OpenStack Tempest is the official integration testing framework for OpenStack. Tempest validates that the OpenStack cloud under testing accepts and responds to OpenStack API requests as expected. Tempest creates, manages, and deletes real OpenStack resources on OpenStack clouds.

## Tempest Plugins
Tempest has a core set of tests for OpenStack's core services, but the tests for many services are packaged separately in plugins. Installing a Tempest plugin into your Python environment will automatically add the tests into Tempest's default configuration. You can see the tests Tempest runs by default by running `tempest run --list-tests`.

## Configuring Tempest
The Tempest configuration file defines several values Tempest needs in order to run its tests. The values include but are not limited to authentication credentials, network names, flavor names, operating system images to use, and service configuration.