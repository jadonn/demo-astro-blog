---
title: "Notes on - Friday Deploy Freezes are Exactly Like Murdering Puppies by Charity Majors"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - leadership
date: "2024-02-13"
description: "My notes and thoughts on a blog post by Charity Majors about how Friday deploy freezes are actually a sign of an unhealthy culture. The original post is at https://charity.wtf/2019/05/01/friday-deploy-freezes-are-exactly-like-murdering-puppies/."
---

Majors writes in response to a Twitter post she saw that advised against deploying to production of Fridays. The general thinking is that deploying on Fridays is unwise because if you have failures you will not have people in the office over the weekend to deal with the failures. These folks think it's safer to deploy early in the week so you have people to address any issues during normal work hours.\
\
Majors harshly criticizes this thinking as a sign that your team is afraid of your deployment process and that your team should reassign all available resources to fix your deployment pipeline.\
\
Much of the rest of the post elaborates on this idea and discusses how bans on Friday deploys are usually a code smell. This means you are not familiar enough with your code, you are not confident enough in your code, or your code is fundamentally broken in some way that should be fixed.\
\
Majors is sympathetic to people who feel this way, but she does, rightly I think, point out that this is not a badge of pride. In fact, Majors asserts that when this practice takes on a moral dimension, you will never be able to fix this problem. I think that's an accurate summation since maintaining the status quo takes on extra value when it becomes virtue signaling.\
\
Majors says teams should strive to push to production on every commit. When you do this, you push small, easily understandable, easily reversible bits of code into production instead of batching up multiple changes into a single large change. Majors also recommends making the person who did the change responsible for responding to any outages resulting from the change instead of paying whoever is on call. I appreciate how she emphasizes that your on call rotation should never seriously impact folks' lives. In my experience, I feel like on call is often very disruptive.\
\
I agree with Majors that teams should be able to push on every commit. The challenge I face is how to do that for the software I work on. As Majors discusses, testing and instrumenting the code is critical to evaluating changes for any regressions or issues before pushing them to production. We have some degree of unit testing and functional testing, but we suffer on integration testing. We often have failures because of issues with the infrastructure we use for running our tests. I own up though that these problems are strictly engineering problems, and they likely could be solved with enough time and attention. I also recognize I may not be the one to solve them.\
\
I probably don't have to instrument everything if I can instrument the single point through which all errors must pass for a given application. I could also look at instrumenting the critical path in the application, assuming there is a clearly identifiable critical path.\
\
We could also benefit from much better mocking if that is possible with the software we deploy. We deploy OpenStack, Ceph, and Open Virtual Network (OVN) – three projects that are reasonably complicated in their own right. Can we mock or substitute in for all the parts of the deployment we don't care about? We do this in some degree within Juju, but I feel we can break this down more to test parts of the system more quickly.\
\
Overall, I agree with Majors that teams should be able to push changes to production pretty much immediately and should be able to reverse changes immediately if there are any noticeable issues.\
\
One final thing that stood out to me from the post is when Majors asserts that anxiety related to deploys is the single largest source of tech debt in many orgs. She goes on to make the distinction that tech debt is not bad code; rather, tech debt is what hurts your people. I had never considered anxiety as tech debt or that what tech debt really is is what hurts your people. I understand how anxiety and hurt can be tech debt because they will keep people from doing good work. I connect strongly with this because tech debt has hurt me and hurt my coworkers. This feels like an important framing of tech debt to me, especially since I think it will make highlighting what is actually tech debt and what isn't. That is, if something is poorly done but doesn't hurt anyone yet, it's probably better to leave it alone and focus on something that is actively hurting someone. I will pay closer attention to where people are hurting or anxious on my team in the future.
