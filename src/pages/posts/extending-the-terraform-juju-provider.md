---
title: "Extending the Terraform Juju Provider"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2023-01-23"
description: "Notes on my experience extending the Terraform Juju Provider to have more of the features of the Juju library."
---

## Terraform SDKv2

The Terraform Juju provider was written using the Terraform SDKv2. This is not the current version of the Terraform plugin development tooling. Terraform plugins should be written with the new Terraform plugin framework instead of the Terraform SDK.\
\
Hashicorp does provide instructions on how to migrate plugins from the Terraform SDKv2 to the Terraform plugin framework. The Terraform Juju provider will need to be migrated to the new Terraform plugin framework eventually.

## Testing Terraform Plugins

### Acceptance Tests

Terraform has acceptance tests that make sure the plugin works as expected and delivers the correct infrastructure.\
\
Terraform Plugins must provide acceptance tests that imitate applying configuration through Terraform. **Acceptance tests create real infrastructure.** The Terraform Juju provider executes Juju commands against a Juju controller, and the Juju will create infrastructure on the associated cloud. I configured a Juju controller locally using LXD on my local machine. When Terraform runs with the Juju provider, the configured infrastructure provisions into LXD containers on my local machine.\
\
HashiCorp runs nightly acceptance tests of providers found in the Terraform Providers GitHub organization to make sure they are working correctly, but only a small handful of providers for Oracle Cloud are in that organization. There are also very few followers for that organization.\
\
#### Implementing Acceptance Tests

Acceptance tests are defined for data sources and resources. They are files named like `data_source_name_test.go` or `resource_name_test.go`. They can be placed alongside the corresponding files named `data_source_name.go` and `resource_name.go` in the `provider` directory. In all of these cases `name` should be replaced with the name of the type of resource.\
\
For example, the new resource I defined was for a machine. This means the files would be named `data_source_machine_test.go`, `data_source_machine.go`, `resource_machine_test.go`, and `resource_machine.go`.\
\
The test file defines functions, and each function is an acceptance test. The naming convention for the functions appears to be `TestAcc_ResourceName_YourTestName`. You would name a basic acceptance test of the machine resource I mentioned previously as `TestAcc_ResourceMachine_Basic`.\
\
The function defintion should take a pointer to a `testing.T` struct from Golang's Testing package as its only argument.\
\
The function name and argument would look like:
```
func TestAcc_ResourceMachine_Basic(t *testing.T) {
    // the function body
}
```

The function body contains the code for configuring Terraform to run the acceptance test and for the checks you would like Terraform to run. **Terraform acceptance tests will run Terraform and create infrastructure. This will incur costs on metered platforms like public clouds if you use them to test your Terraform code. Use a local development environment or unmetered platform to test your Terraform code.***\
\
The Terraform SDKv2 libraries have some helper functions you can use in your tests. The Terraform Juju provider, for example, uses the `RandomWithPrefix` function from the `acctest` Terraform SDKv2 module to generate a random string with a given string attached to the front as a prefix. This function is used in the Terraform Juju provider code to generate unique while identifiable Juju model names for each acceptance test. Using unique model names will keep the tests from colliding and interfering with each other.\
\
The test itself is defined using the `Test` function from the `resource` module of the Terraform SDKv2. The Test function takes a pointer of the type `testing.T`, which is the argument that gets passed into your acceptance test function, and an instance of the type `resource.TestCase`.\
\
For my basic testing for the machine resource, I only passed arguments for the `PreCheck`, `ProviderFactories`, and `Steps` members of `resource.TestCase`. I did not need other members for this test.\
\
The `PreCheck` member defines checks to perform before the test steps are performed.\
\
The `ProviderFactories` indicates which Terraform `schema.Provider` to use for the tests. In the Terraform Juju provider, this is defined as `providerFactories` from the package `provider`, which is the name of the package containing the `schema.Provider` code for the Terraform Juju provider.\
\
The `Steps` member defines an instance of `[]resource.TestStep` with tests to perform. In the basic test for the machine resource, I defined two test steps. The first step defines a Config member that you can use to configure Terraform. I wrote another function that I modelled after the existing Terraform Juju provider code. The function takes a string for the Juju model name and returns a string literal containing a Terraform plan. The plan defines a simple Juju model resource and a simple Juju machine resource. The first step also defines a number of test checks you can run to verify the resource was created correctly. I used, for example, checks that compare the value of the `model` attribute of the machine resource and the `name` attribute of the machine resource to make sure they were what I expected.\
\
The second step I defined has Terraform perform an import on the created Terraform resource to verify that the resource imports correctly and the Terraform state matches what the external system (that is, Juju) reports. This step uses Terraform's `ImportStateVerify`, `ImportState`, and `ResourceName` test features.\
\
That should be everything for a basic test of the Terraform resource you define. You can define more complex tests using Golang's testing framework and Terraform's testing capabilities.\
\
**Remember, Terraform testing does create real world infrastructure that can cost money if you are using public cloud providers.** Since I was testing Juju, I could use LXD containers on my local development machine to simulate machines and infrastructure for applications.

### Unit Tests

Terraform has unit tests for providers, but it looks like the Terraform Juju provider does not have any unit tests. I did not have a chance to write unit tests.

## Root Resource Was Present But Now Absent

This error often means that Terraform is looking for a resource that was deleted from the Terraform graph during the resource lifecycle.\
\
In my case, the error was occurring because of a client-side issue with the Juju client that my Terraform plugin code was not passing back to the end user correctly. The issue was not an error; rather, it was invalid input to the Juju client. Invalid input is not an exception-causing error. I was not passing in storage volume configuration correctly for the machines I wanted to provision through Juju. I corrected that behavior to either pass in the value the user provides in the Terraform plan or to pass in a default empty string.

## Terraform Represents Resources as a Graph

One key thing I learned about how Terraform constructs its state is that Terraform represents resources as a graph. By graph, I mean like a network consisting of individual nodes connected by one or more edges to other nodes. The edges represent dependencies between individual resources. Terraform tries to infer dependencies from the configuration you define in your Terraform plan. You can manually define dependencies as well using Terraform meta directives like `depends_on`.