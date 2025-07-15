import { WebPlugin } from '@capacitor/core';

import type { LineLoginPlugin } from './definitions';

export class LineLoginWeb extends WebPlugin implements LineLoginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
