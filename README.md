# react-timeline-editor

`@cyca/react-timeline-editor` is a React-based component for quickly building timeline editing capabilities.

This is a fork of the original [@xzdarcy/react-timeline-editor](https://github.com/xzdarcy/react-timeline-editor)

It can be mainly used to build animation editors, video editors, etc.

## ✨ Features

- 🛠 Supports drag and scale modes, with convenient control hooks.
- 🔗 Provides grid snapping, auxiliary line snapping, and other interactive capabilities.
- 🏷 Automatically recognizes action length and infinite scrolling.
- 🎨 Easy and quick style customization.
- ❌ Removed Runner from the original library.

## Changes from the original library

- Replaced react-virtualized with @tanstack/virtual
- Replaced Interact.js with @use-gesture/react
- Uses React-19 as a base
- Compiled with react-compiler enabled
- Modern bundling via latest `vite` and docs powered by storybook

## Quick Start

```
npm install @cyca/react-timeline-editor
```

```js
import React from "react";
import { Timeline } from "@cyca/react-timeline-editor";

export const TimelineEditor = () => {
  return <Timeline editorData={[]} effects={{}} />;
};
```
