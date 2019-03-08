import { describePage } from './../../dist-spec/index';
import { viewports } from './shared/viewports';

describePage('basic text page', defineScenario => {
  for (const viewport of viewports) {
    defineScenario(`${viewport.name} viewport`, async page => {
      await page.setViewport(viewport);

      await page.goto(`file:///${__dirname}/basic-text.html`);

      return await page.screenshot({ fullPage: true });
    });
  }
});
