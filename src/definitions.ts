export interface LineLoginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
