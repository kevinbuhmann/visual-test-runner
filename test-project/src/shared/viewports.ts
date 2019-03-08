import * as puppeteer from 'puppeteer';

export const viewports: (puppeteer.Viewport & { name: string })[] = [
  {
    name: 'xs',
    width: 320,
    height: 480
  },
  {
    name: 'sm',
    width: 480,
    height: 1024
  },
  {
    name: 'md',
    width: 720,
    height: 1024
  },
  {
    name: 'lg',
    width: 960,
    height: 1024
  },
  {
    name: 'xl',
    width: 1440,
    height: 1024
  }
];
