---
title: "How to Get Line Breaks In Markdown"
layout: "../../layouts/BlogPostLayout.astro"
tags:
  - post
  - development
date: "2021-11-07"
description: "You might be surprised, like I was, to find your line breaks in your Markdown file do not show up when you render the page. Apparently, you need to use either two spaces at the end of the preceding paragraph or a backslash (\\) at the end of the preceding paragraph and a backslash (\\) on the next new line."
---
## Without Spaces or Backslashes

If you do not use spaces or backslashes, your line break will not render in the HTML output even though you have a line break inside of your raw text.\
\
The next two lines of text will render without a line break even though there is a line break for them in the raw Markdown.\
\
This is the first line.

This line renders immediately below the first line even though there is a gap in the raw Markdown.\
\
The raw Markdown for the preceding two lines looks like this:

    This is the first line.

    This line renders immediately below the first line even though there is a gap in the raw Markdown.
\
Even though there is a new line between the two lines of text, there is not a new line in the rendered Markdown in some Markdown renderers. You must use two spaces or a backslash `\` character to force the renderer to insert a line break.

## Use Two Spaces to Render a Line Break

The first way to make a line break is to add two spaces to the end of the line preceding the line break.\
\
Here is an example with the two spaces at the end:

    This line has two spaces at the end.  <---- spaces are right here

    Can you see the two spaces?
\
I cannot actually show you how the example with two spaces looks since they are apparently either being stripped at some point or they are not being rendered by Astro's Markdown renderer.

## Use Backslashes

I have had good success using backslashes to insert line breaks in my text. Backslashs are not always honored by Markdown parsers, though.\
\
Here is an example with backslashes for line breaks:

    This is the first line.\\
    \\
    This is the second line.
\
This is how the example renders to HTML:\
\
This is the first line.\
\
This is the second line.

You should be able to see an empty line between the first line and the second line.