yolo-graphite
=============

A quick and dirty graphite dashboard using your browser's localStorage. It basically
provides a simple way to store and view sets of graphite graphs. You need to know
the graphite URL API, as it's mostly just an interface to help manage and view snippets
of graphite URLs.

You can have several dashboards, each with several graphs. These are all keyed by URL,
so it's simple to have several up at a time.

## Get started

There's a version on GH-page for this repo. You always need to provide your `host`.

http://mikerhodes.github.io/yolo-graphite/?host=your.graphite.host.com

This will take you to your `default` dashboard. You need to set your host approparitely.

## Graphs

Graphs are stored in localStorage within your browser. This is done automatically
as you add and remove graphs from a dashboard.

The top line of the page shows the graphite base URL. The text you enter in the 
box is appended to this to form the URL for the graph. It's then just shoved into
an image tag and dropped into the page. Therefore, you're likely to need at least
a `target` parameter and probably a `from`.

## Dashboards

You can have multiple dashboards. Simply add `dash=name` to the URL:

http://mikerhodes.github.io/yolo-graphite/?host=your.graphite.host.com&dash=mydash

Visiting a dashboard for the first time creates it in your local storage. It'll be
empty to start with, as you'd expect.

The footer of the page lists your dashboards.
