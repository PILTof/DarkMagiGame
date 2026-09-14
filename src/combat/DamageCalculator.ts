export const ARMOR_SCALE = 100;

export function calculateArmorReducedDamage(
  baseDamage: number,
  armor: number | undefined,
): number {
  const normalizedArmor = Math.max(armor ?? 0, 0);
  return baseDamage * (ARMOR_SCALE / (ARMOR_SCALE + normalizedArmor));
}
