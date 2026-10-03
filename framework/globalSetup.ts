import { writeRunMeta } from './runMeta';

export default async function globalSetup(): Promise<void> {
  writeRunMeta();
}
