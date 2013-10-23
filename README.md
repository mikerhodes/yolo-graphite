yolo-graphite
=============

A quick and dirty graphite dashboard using your browser's localStorage.

You can have several dashboards, each with several graphs.

## Get started

There's a version on GH-page for this repo:

http://mikerhodes.github.io/yolo-graphite/?host=your.graphite.host.com

This will take you to your default dashboard. You need to set your host approparitely.

## Graphs

Graphs are stored in localStorage within your browser. This is done automatically
as you add and remove graphs from a dashboard.

## Dashboards

You can have multiple dashboards. Simply add `dash=name` to the URL:

http://mikerhodes.github.io/yolo-graphite/?host=your.graphite.host.com&dash=mydash

The footer of the page lists your dashboards.
