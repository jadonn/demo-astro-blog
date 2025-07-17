---
title: "Notes on - Choose Boring Technology by Dan McKinley"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - engineering
date: "2024-02-13"
description: "My notes and thoughts from reading Choose Boring Technology by Dan McKinley on his blog. His post is at https://mcfunley.com/choose-boring-technology."
---
I've read this post before. I appreciate what the author discusses about how introducing new technology can be more expensive than you anticipate and can consume the energy and resources you have for innovation.\
\
McKinley introduced the notion of innovation tokens as a way to capture the idea that teams and orgs have a limited number of innovative things they can really accomplish. While that may seem pessimistic, I think it is an accurate assessment of doing software development.\
\
McKinley argues that teams should use boring technology in order to save innovation for where it really makes a difference to the success of the business. Boring technology, in his usage, is technology that is familiar, well-established, well-tested, and widely adopted. McKinley cited MySQL, PostgreSQL, PHP, Python, Memcached, Cron, and Squid as examples of boring technology. He contrasts these against using Node.js to build your website, using a NoSQL database like MongoDB, or trying out some other relatively complicated tech that has only been out for a year. Now, McKinley doesn't say those not-boring things are bad; rather, they will probably cost unfamiliar teams more time and effort than they are worth adopting. In addition, new technology simply has more unknown unknowns than older, more established technology.\
\
He goes on to discuss how choosing new technology is often a local optimization. Sure, a new programming language may be better suited than Python to a particular task, but Python is probably good enough to get the job done more quickly and more cheaply. He says that teams need to look for the solution that is the "least worst" at doing all of the jobs a business needs because this will enable teams to get the most done with the least overhead.\
\
He does caution that sometimes you do need to consider a new technology, but you must have very good reasons for why that is and very good plans for managing the migration. He also specifically says to watch out for people who are advocating adopting a new technology for the sake of adopting the new technology; this kind of thinking does not have any connection to whether or not the new technology is beneficial.\
\
Overall, though, McKinley says that the choice of technology should free up engineers to contemplate larger, more important issues instead of bogging down in how to use new tech or reconcile multiple technology stacks in a single org or team.\
\
I have been guilty of choosing new tech myself and incurring a good deal of unnecessary baggage. I have even produced software that was probably largely unmaintainable because I picked technology that only one or two people in the entire company knew. I probably could have had a better result had I picked different technology. I definitely fell into the trap of "picking the best tool for the job" instead of picking the best tool for the team. Jobs don't use tools. People use tools.
