---
title: "What Is The Maintenance Surface of a Program?"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2024-06-10"
description: "Just like a program has an attack surface where vulnerabilities can be found, a program also has a maintenance surface where regressions, faults, bugs, and other breaks in the program's intended functionality can be found."
---
The maintenance surface of a program is everything that could require maintenance at some point in the lifecycle of the program. It is analogous to the attack surface concept from the security field. The attack surface can be broadly defined as everything that is exposed such that an attacker can attempt to exploit vulnerabilities in the software, services, and other components that make up the attack surface.

Maintenance is broadly the work you must do to preserve the program's expected level of functionality over its lifecycle. It can include but is not limited to everything from remembering how the program works to rewriting a significant portion of the codebase to correct a serious vulnerability or regression. Maintenance is generally correcting any fault that prevents the program from working as expected.

The maintenance surface primarily is the code that you write and that you must maintain. All of the code the program requires to do what it is supposed to do is code that you must maintain. Even temporary patches and workarounds must be maintained if they are required for the program to function as expected.

The dependencies you pull into your codebase are also part of your maintenance surface. Maintaining dependencies includes but is not limited to ensuring they still function as you expect, keeping them up to date, validating the interfaces on which your code relies, and responsibly sourcing your dependencies to avoid security risks.

The external components your program requires to function are also part of the maintenance surface. These components can include but are not limited to the runtime or interpreter for your programming language; any web server, database server, messaging service, cache provider, or other service your program requires; and the platform on which you run your program. If your program cannot run without external components like these, they are part of your maintenance surface.

That is not to say you should never have dependencies or external services. In fact, you can often reduce your maintenance surface by using an existing outside library or service that is actively maintained by someone else. Using an externally developed component avoids implementing and maintaining all of the code yourself. In addition, you can reduce your maintenance from maintaining the entire component to sharing maintenance of the component and maintaining how your code interfaces with the external component.

Maintenance may be as complex as a full rewrite of the entire program or as simple as remembering what the different parts of a program do. Maintaining your mental model and memory of the program is maintenance that you must do in order to continue to service the codebase.

I believe software engineering teams should aim to decrease their maintenance surface as much as possible without compromising the functionality of their software or the maintainability of their software. I think much of the work of reducing the maintenance surface will come during planning the design, architecture, and overall shape of the software before it is developed. This is where [choosing boring technology](https://boringtechnology.club/) can save you significant maintenance over the long term. Choosing technology that allows you to write less code means you have less code you have to maintain over time. Choosing technology with large, active, well-established communities means you can benefit from the community's expertise and work with the chosen technology instead of doing that yourself.

I feel software engineering teams can also decrease their maintenance surface by using and contributing to community-driven, open source solutions instead of developing in-house workarounds, tools, and one-off scripts. Using and contributing to community projects allows you to enjoy the full benefits of the technology while sharing the maintenance across the community. In addition, if you have to write new code, building on top of existing code and making your code available to others will have a greater benefit to you than keeping the new code internal to your organization. You should be able to solve your immediate needs more quickly, and others who benefit from the code you write can contribute to improving and maintaining the code.
